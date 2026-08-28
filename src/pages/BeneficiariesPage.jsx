import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBeneficiariesByKurum, addBeneficiary } from '../services/firestoreService';
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

const acilIcon = createColoredIcon('#ef4444');      // Kırmızı
const bekliyorIcon = createColoredIcon('#f59e0b');   // Sarı
const tamamlandiIcon = createColoredIcon('#22c55e'); // Yeşil
const devamIcon = createColoredIcon('#3b82f6');      // Mavi

const getBeneficiaryIcon = (needStatus) => {
  switch (needStatus) {
    case 'Acil': return acilIcon;
    case 'Bekliyor': return bekliyorIcon;
    case 'Tamamlandı': return tamamlandiIcon;
    case 'Devam Ediyor': return devamIcon;
    default: return bekliyorIcon;
  }
};

// ---------- Status Badge ----------
const StatusBadge = ({ durum }) => {
  const map = {
    'Acil': 'bg-red-50 text-red-700 ring-red-600/20',
    'Bekliyor': 'bg-amber-50 text-amber-700 ring-amber-600/20',
    'Tamamlandı': 'bg-green-50 text-green-700 ring-green-600/20',
    'Devam Ediyor': 'bg-blue-50 text-blue-700 ring-blue-600/20',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${map[durum] || map['Bekliyor']}`}>
      {durum}
    </span>
  );
};

// ---------- Real Leaflet Map View ----------
const BeneficiaryMapView = ({ data }) => {
  const validPins = data.filter(d => d?.lat && d?.lng);
  const center = validPins.length > 0
    ? [validPins[0].lat, validPins[0].lng]
    : [37.066, 37.383]; // Gaziantep default

  return (
    <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-surface-800">Harita Görünümü</h3>
          <p className="text-sm text-surface-400 mt-0.5">{data.length} ihtiyaç sahibi gösteriliyor</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Acil</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Bekliyor</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Tamamlandı</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Devam Ediyor</span>
        </div>
      </div>

      <div className="h-[480px]">
        <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {data.map((item, index) => {
            const lat = Number(item?.lat);
            const lng = Number(item?.lng);
            if (!lat || !lng || isNaN(lat) || isNaN(lng)) return null;

            return (
              <Marker key={item?.id || index} position={[lat, lng]} icon={getBeneficiaryIcon(item?.needStatus)}>
                <Popup>
                  <div className="text-sm">
                    <p className="font-bold text-surface-800">{item?.fullName || 'Bilinmiyor'}</p>
                    <p className="text-surface-500 mt-1">Durum: <strong>{item?.needStatus || 'Bekliyor'}</strong></p>
                    <p className="text-surface-500">{item?.address || 'Adres bilgisi yok'}</p>
                    {item?.phone && <p className="text-surface-400 text-xs mt-1">Tel: {item.phone}</p>}
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

// ---------- Add Beneficiary Modal ----------
const AddBeneficiaryModal = ({ isOpen, onClose, user, onAdded }) => {
  const [formData, setFormData] = useState({
    ad_soyad: '', adres: '', telefon: '', ihtiyac_durumu: 'Bekliyor',
    lat: '', lng: '', notlar: ''
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!formData.ad_soyad) {
      return alert('Lütfen Ad Soyad alanını doldurun.');
    }
    const activeKurumId = user?.kurum_id || 'merkez_kurum';
    setLoading(true);
    try {
      await addBeneficiary({
        ...formData,
        kurum_id: activeKurumId,
        lat: formData.lat ? parseFloat(formData.lat) : null,
        lng: formData.lng ? parseFloat(formData.lng) : null,
        son_teslimat: null,
      });
      onAdded();
      onClose();
      setFormData({ ad_soyad: '', adres: '', telefon: '', ihtiyac_durumu: 'Bekliyor', lat: '', lng: '', notlar: '' });
    } catch (err) {
      console.error(err);
      alert('İhtiyaç sahibi eklenirken hata: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-surface-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-[scaleIn_0.2s_ease-out]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
          <h3 className="text-lg font-semibold text-surface-900">Yeni İhtiyaç Sahibi</h3>
          <button onClick={onClose} disabled={loading} className="p-1.5 rounded-lg text-surface-400 hover:bg-surface-100 transition-colors cursor-pointer">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-surface-700">Ad Soyad *</label>
              <input value={formData.ad_soyad} onChange={e => setFormData({...formData, ad_soyad: e.target.value})} type="text" placeholder="Ahmet Yılmaz" className="w-full px-3.5 py-2.5 rounded-xl border border-surface-300 text-sm bg-white text-surface-800 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
            </div>
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-surface-700">Telefon</label>
              <input value={formData.telefon} onChange={e => setFormData({...formData, telefon: e.target.value})} type="tel" placeholder="0532 111 2233" className="w-full px-3.5 py-2.5 rounded-xl border border-surface-300 text-sm bg-white text-surface-800 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-surface-700">Adres</label>
            <input value={formData.adres} onChange={e => setFormData({...formData, adres: e.target.value})} type="text" placeholder="Mahalle, Cadde, İl/İlçe" className="w-full px-3.5 py-2.5 rounded-xl border border-surface-300 text-sm bg-white text-surface-800 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-surface-700">Enlem (Lat)</label>
              <input value={formData.lat} onChange={e => setFormData({...formData, lat: e.target.value})} type="text" placeholder="37.0662" className="w-full px-3.5 py-2.5 rounded-xl border border-surface-300 text-sm bg-white text-surface-800 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-surface-700">Boylam (Lng)</label>
              <input value={formData.lng} onChange={e => setFormData({...formData, lng: e.target.value})} type="text" placeholder="37.3833" className="w-full px-3.5 py-2.5 rounded-xl border border-surface-300 text-sm bg-white text-surface-800 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-surface-700">İhtiyaç Durumu</label>
            <select value={formData.ihtiyac_durumu} onChange={e => setFormData({...formData, ihtiyac_durumu: e.target.value})} className="w-full px-3.5 py-2.5 rounded-xl border border-surface-300 text-sm bg-white text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all">
              <option value="Bekliyor">Bekliyor</option>
              <option value="Acil">Acil</option>
              <option value="Devam Ediyor">Devam Ediyor</option>
              <option value="Tamamlandı">Tamamlandı</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-surface-700">Notlar</label>
            <textarea value={formData.notlar} onChange={e => setFormData({...formData, notlar: e.target.value})} rows="2" placeholder="Ek bilgi..." className="w-full px-3.5 py-2.5 rounded-xl border border-surface-300 text-sm bg-white text-surface-800 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-surface-100">
          <button onClick={onClose} disabled={loading} className="px-4 py-2.5 rounded-xl text-sm font-medium text-surface-600 hover:bg-surface-100 transition-colors cursor-pointer disabled:opacity-50">
            İptal
          </button>
          <button onClick={handleSubmit} disabled={loading} className="px-5 py-2.5 rounded-xl text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 shadow-sm shadow-primary-500/20 transition-all cursor-pointer disabled:opacity-50">
            {loading ? 'Ekleniyor...' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
//  BENEFICIARIES PAGE
// ============================================================
const BeneficiariesPage = () => {
  const { user } = useAuth();
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table');
  const [search, setSearch] = useState('');
  const [filterDurum, setFilterDurum] = useState('Tümü');
  const [showModal, setShowModal] = useState(false);

  const fetchData = async () => {
    const activeKurumId = user?.kurum_id || 'merkez_kurum';
    setLoading(true);
    try {
      const data = await getBeneficiariesByKurum(activeKurumId);
      setBeneficiaries(data);
    } catch (error) {
      console.error("İhtiyaç sahipleri yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const filteredData = (beneficiaries || []).filter((b) => {
    const sAd = b?.fullName || '';
    const sAdres = b?.address || '';
    const matchesSearch =
      sAd.toLowerCase().includes(search.toLowerCase()) ||
      sAdres.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterDurum === 'Tümü' || b?.needStatus === filterDurum;
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
          <h2 className="text-xl font-bold text-surface-900">İhtiyaç Sahipleri</h2>
          <p className="text-sm text-surface-400 mt-0.5">Yardımların ulaştırılacağı kişileri yönetin</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 shadow-sm shadow-primary-500/20 transition-all duration-200 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Yeni İhtiyaç Sahibi
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-surface-200 p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-purple-50 ring-1 ring-purple-100 flex items-center justify-center text-purple-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-surface-900">{beneficiaries?.length || 0}</p>
            <p className="text-sm text-surface-400">Toplam</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-surface-200 p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-red-50 ring-1 ring-red-100 flex items-center justify-center text-red-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-surface-900">{beneficiaries?.filter(b => b?.needStatus === 'Acil')?.length || 0}</p>
            <p className="text-sm text-surface-400">Acil</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-surface-200 p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-50 ring-1 ring-amber-100 flex items-center justify-center text-amber-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-surface-900">{beneficiaries?.filter(b => b?.needStatus === 'Bekliyor')?.length || 0}</p>
            <p className="text-sm text-surface-400">Bekliyor</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-surface-200 p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-green-50 ring-1 ring-green-100 flex items-center justify-center text-green-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-surface-900">{beneficiaries?.filter(b => b?.needStatus === 'Tamamlandı')?.length || 0}</p>
            <p className="text-sm text-surface-400">Tamamlandı</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-surface-200 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Ad, adres ile ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-surface-200 bg-surface-50 text-sm text-surface-700 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
          />
        </div>
        <select
          value={filterDurum}
          onChange={(e) => setFilterDurum(e.target.value)}
          className="px-3 py-2 rounded-lg border border-surface-200 bg-surface-50 text-sm text-surface-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option>Tümü</option>
          <option>Acil</option>
          <option>Bekliyor</option>
          <option>Devam Ediyor</option>
          <option>Tamamlandı</option>
        </select>
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
                  <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-6 py-4">Ad Soyad</th>
                  <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-6 py-4">Adres</th>
                  <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-6 py-4">Telefon</th>
                  <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-6 py-4">İhtiyaç Durumu</th>
                  <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-6 py-4">Son Teslimat</th>
                  <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-6 py-4">Notlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <svg className="w-12 h-12 text-surface-300" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                        </svg>
                        <p className="text-sm text-surface-400">Henüz ihtiyaç sahibi kaydı bulunmuyor.</p>
                        <button onClick={() => setShowModal(true)} className="text-sm text-primary-600 font-medium hover:text-primary-700 cursor-pointer">+ Yeni ekle</button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((b) => (
                    <tr key={b.id} className="hover:bg-surface-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                            {(b?.fullName || '?').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                          </div>
                          <p className="text-sm font-medium text-surface-800">{b?.fullName || 'Bilinmiyor'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-surface-600 max-w-[200px] truncate">{b?.address || '—'}</td>
                      <td className="px-6 py-4 text-sm text-surface-600">{b?.phone || '—'}</td>
                      <td className="px-6 py-4"><StatusBadge durum={b?.needStatus || 'Bekliyor'} /></td>
                      <td className="px-6 py-4 text-sm text-surface-500">{b?.son_teslimat || '—'}</td>
                      <td className="px-6 py-4 text-sm text-surface-500 max-w-[150px] truncate">{b?.notes || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-surface-100 flex items-center justify-between">
            <p className="text-sm text-surface-400">
              Toplam <span className="font-medium text-surface-700">{filteredData.length}</span> kayıt gösteriliyor
            </p>
          </div>
        </div>
      ) : (
        <BeneficiaryMapView data={filteredData} />
      )}

      {/* Modal */}
      <AddBeneficiaryModal isOpen={showModal} onClose={() => setShowModal(false)} user={user} onAdded={fetchData} />
    </div>
  );
};

export default BeneficiariesPage;
