import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const createColoredIcon = (color) => {
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="28" height="42">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="${color}" stroke="#fff" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="5" fill="#fff"/>
    </svg>`;
  return L.divIcon({
    html: svgIcon,
    className: '',
    iconSize: [28, 42],
    iconAnchor: [14, 42],
    popupAnchor: [0, -42],
  });
};

const droppedIcon = createColoredIcon('#f59e0b');   // Sarı/Turuncu
const collectedIcon = createColoredIcon('#22c55e');  // Yeşil
const damagedIcon = createColoredIcon('#ef4444');    // Kırmızı
const defaultIcon = createColoredIcon('#3b82f6');    // Mavi

const getBoxIcon = (status) => {
  switch (status) {
    case 'dropped': return droppedIcon;
    case 'collected': return collectedIcon;
    case 'damaged': return damagedIcon;
    default: return defaultIcon;
  }
};

// ---------- Status Badge ----------
const StatusBadge = ({ durum }) => {
  const map = {
    'Bekliyor/Aktif': 'bg-green-50 text-green-700 ring-green-600/20',
    'Toplandı': 'bg-blue-50 text-blue-700 ring-blue-600/20',
    'Hasarlı': 'bg-red-50 text-red-700 ring-red-600/20',
    'Bakımda': 'bg-amber-50 text-amber-700 ring-amber-600/20',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${map[durum] || map['Aktif']}`}>
      {durum}
    </span>
  );
};

// ---------- Fullness Bar ----------
const FullnessBar = ({ percent }) => {
  let color = 'bg-primary-500';
  if (percent >= 90) color = 'bg-red-500';
  else if (percent >= 70) color = 'bg-amber-500';

  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="flex-1 h-2 rounded-full bg-surface-100 overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-xs font-medium text-surface-600 w-8 text-right">{percent}%</span>
    </div>
  );
};

// ---------- Real Leaflet Map ----------
const MapView = ({ data }) => {
  const validPins = data.filter(k => k?.latitude && k?.longitude);
  const center = validPins.length > 0
    ? [validPins[0].latitude, validPins[0].longitude]
    : [37.066, 37.383]; // Gaziantep default

  return (
    <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
      {/* Map Header */}
      <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-surface-800">Harita Görünümü</h3>
          <p className="text-sm text-surface-400 mt-0.5">{data.length} kutu gösteriliyor</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Aktif (Dropped)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Toplandı</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Hasarlı</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Diğer</span>
        </div>
      </div>

      {/* Leaflet Map */}
      <div className="h-[480px]">
        <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {data.map((kutu) => {
            const lat = Number(kutu?.latitude);
            const lng = Number(kutu?.longitude);
            if (!lat || !lng || isNaN(lat) || isNaN(lng)) return null;

            const uiStatus = kutu?.status === 'dropped' ? 'Bekliyor/Aktif'
              : kutu?.status === 'collected' ? 'Toplandı'
              : kutu?.status === 'damaged' ? 'Hasarlı'
              : (kutu?.status || 'Bilinmiyor');

            return (
              <Marker key={kutu.id} position={[lat, lng]} icon={getBoxIcon(kutu?.status)}>
                <Popup>
                  <div className="text-sm">
                    <p className="font-bold text-surface-800">{kutu?.shopName || 'Bilinmiyor'}</p>
                    <p className="text-surface-500 mt-1">Durum: <strong>{uiStatus}</strong></p>
                    {kutu?.donationAmount && <p className="text-surface-500">Miktar: ₺{kutu.donationAmount}</p>}
                    <p className="text-surface-400 text-xs mt-1">ID: {kutu?.id?.substring(0, 8)}</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

// ============================================================
//  BOXES PAGE
// ============================================================
const BoxesPage = () => {
  const { user } = useAuth();
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [viewMode, setViewMode] = useState('table'); // 'table' | 'map'
  const [search, setSearch] = useState('');
  const [filterDurum, setFilterDurum] = useState('Tümü');

  useEffect(() => {
    let isMounted = true;

    if (!user?.kurum_id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(collection(db, 'boxes'), where('kurum_id', '==', user.kurum_id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (isMounted) {
        setBoxes(data);
        setLoading(false);
      }
    }, (error) => {
      console.error("Kutular dinlenirken hata:", error);
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [user?.kurum_id]);

  const filteredBoxes = (boxes || []).filter((b) => {
    const sId = b?.id || '';
    const sKonum = b?.shopName || '';
    const sPersonel = b?.droppedBy || b?.collectedBy || '';

    const matchesSearch =
      sId.toLowerCase().includes(search.toLowerCase()) ||
      sKonum.toLowerCase().includes(search.toLowerCase()) ||
      sPersonel.toLowerCase().includes(search.toLowerCase());
      
    const bDurumUI = b?.status === 'dropped' ? 'Bekliyor/Aktif' : b?.status === 'collected' ? 'Toplandı' : (b?.status || 'Bilinmiyor');
    const matchesStatus = filterDurum === 'Tümü' || bDurumUI.includes(filterDurum) || (filterDurum === 'Aktif' && bDurumUI.includes('Bekliyor/Aktif'));
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <svg className="animate-spin h-10 w-10 text-primary-600 mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-surface-500 font-medium text-lg">Yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-surface-900">Bağış Kutuları</h2>
          <p className="text-sm text-surface-400 mt-0.5">Sahadaki tüm kutuları görüntüleyin ve yönetin</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 shadow-sm shadow-primary-500/20 transition-all duration-200 cursor-pointer">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Yeni Kutu Ekle
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-surface-200 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Kutu ID, konum veya personel ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-surface-200 bg-surface-50 text-sm text-surface-700 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
          />
        </div>

        {/* Status Filter */}
        <select
          value={filterDurum}
          onChange={(e) => setFilterDurum(e.target.value)}
          className="px-3 py-2 rounded-lg border border-surface-200 bg-surface-50 text-sm text-surface-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option>Tümü</option>
          <option>Bekliyor/Aktif</option>
          <option>Toplandı</option>
          <option>Hasarlı</option>
          <option>Bakımda</option>
        </select>

        {/* View Toggle */}
        <div className="flex rounded-lg border border-surface-200 overflow-hidden">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${viewMode === 'table' ? 'bg-primary-600 text-white' : 'bg-surface-50 text-surface-500 hover:bg-surface-100'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 0v1.5c0 .621-.504 1.125-1.125 1.125" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${viewMode === 'map' ? 'bg-primary-600 text-white' : 'bg-surface-50 text-surface-500 hover:bg-surface-100'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-100">
                  <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-6 py-4">Kutu ID</th>
                  <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-6 py-4">Konum</th>
                  <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-6 py-4">Durum</th>
                  <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-6 py-4">Doluluk / Miktar</th>
                  <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-6 py-4">Personel</th>
                  <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-6 py-4">Son İşlem (Toplama)</th>
                  <th className="text-right text-xs font-semibold text-surface-500 uppercase tracking-wider px-6 py-4">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filteredBoxes.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <p className="text-sm text-surface-400">Kutu bulunamadı.</p>
                    </td>
                  </tr>
                ) : (
                  filteredBoxes.map((kutu) => {
                    const uiStatus = kutu?.status === 'dropped' ? 'Bekliyor/Aktif' : kutu?.status === 'collected' ? 'Toplandı' : kutu?.status;
                    const uiMiktar = kutu?.donationAmount ? `₺${kutu.donationAmount}` : '—';
                    const uiDate = kutu?.collectedAt?.toDate 
                        ? kutu.collectedAt.toDate().toLocaleDateString('tr-TR') 
                        : kutu?.collectedAt ? new Date(kutu.collectedAt).toLocaleDateString('tr-TR') : '—';
                        
                    return (
                    <tr key={kutu.id} className="hover:bg-surface-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-primary-600">{kutu.id.substring(0, 8)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-surface-800">{kutu?.shopName || 'Bilinmiyor'}</p>
                        <p className="text-xs text-surface-400">{kutu?.il || ''} {kutu?.ilce || ''}</p>
                      </td>
                      <td className="px-6 py-4"><StatusBadge durum={uiStatus} /></td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-surface-700">{uiMiktar}</p>
                        {typeof kutu?.doluluk === 'number' && <FullnessBar percent={kutu.doluluk} />}
                      </td>
                      <td className="px-6 py-4 text-sm text-surface-600">{kutu?.collectedBy || kutu?.droppedBy || '—'}</td>
                      <td className="px-6 py-4 text-sm text-surface-500">{uiDate}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => alert('Geliştirme aşamasında')} className="p-1.5 rounded-lg text-surface-400 hover:bg-surface-100 hover:text-surface-600 transition-colors cursor-pointer">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-4 border-t border-surface-100 flex items-center justify-between">
            <p className="text-sm text-surface-400">
              Toplam <span className="font-medium text-surface-700">{filteredBoxes.length}</span> kutu gösteriliyor
            </p>
            <div className="flex items-center gap-1">
              <button className="px-3 py-1.5 rounded-lg text-sm text-surface-500 hover:bg-surface-100 transition-colors cursor-pointer">Önceki</button>
              <button className="px-3 py-1.5 rounded-lg text-sm bg-primary-600 text-white cursor-pointer">1</button>
              <button className="px-3 py-1.5 rounded-lg text-sm text-surface-500 hover:bg-surface-100 transition-colors cursor-pointer">Sonraki</button>
            </div>
          </div>
        </div>
      ) : (
        <MapView data={filteredBoxes} />
      )}
    </div>
  );
};

export default BoxesPage;
