import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBoxesByKurum } from '../services/firestoreService';

// ---------- Status Badge ----------
const StatusBadge = ({ durum }) => {
  const map = {
    Aktif: 'bg-green-50 text-green-700 ring-green-600/20',
    Dolu: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    Hasarlı: 'bg-red-50 text-red-700 ring-red-600/20',
    Bakımda: 'bg-amber-50 text-amber-700 ring-amber-600/20',
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

// ---------- Map Placeholder ----------
const MapView = ({ data }) => {
  return (
    <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
      {/* Map Header */}
      <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-surface-800">Harita Görünümü</h3>
          <p className="text-sm text-surface-400 mt-0.5">{data.length} kutu gösteriliyor</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Aktif</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Dolu</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Hasarlı</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Bakımda</span>
        </div>
      </div>

      {/* Map Area */}
      <div className="relative h-[480px] bg-surface-100 overflow-hidden">
        {/* Simulated Map Background with Grid */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(135deg, #e8f5e9 0%, #f1f5f9 50%, #e3f2fd 100%)
            `,
          }}
        />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* City Label */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border border-surface-200">
          <p className="text-sm font-semibold text-surface-700">📍 Gaziantep</p>
          <p className="text-xs text-surface-400">Türkiye</p>
        </div>

        {/* Simulated Pin Markers */}
        {data.map((kutu, index) => {
          const dotColor = {
            Aktif: 'bg-green-500 ring-green-500/30',
            Dolu: 'bg-blue-500 ring-blue-500/30',
            Hasarlı: 'bg-red-500 ring-red-500/30',
            Bakımda: 'bg-amber-500 ring-amber-500/30',
          };
          
          let latVal = 37.10;
          let lngVal = 37.34;
          if (kutu.lat && kutu.lng) {
             latVal = kutu.lat; lngVal = kutu.lng;
          }

          const x = ((lngVal - 37.34) / 0.15) * 80 + 10;
          const y = ((37.10 - latVal) / 0.16) * 80 + 10;

          return (
            <div
              key={kutu.id}
              className="absolute group cursor-pointer"
              style={{ left: `${Math.min(Math.max(x, 5), 92)}%`, top: `${Math.min(Math.max(y, 5), 90)}%` }}
            >
              <div className={`absolute w-6 h-6 rounded-full ${dotColor[kutu.durum]?.split(' ')[0] || 'bg-green-500'} opacity-30 animate-ping`} />
              <div className={`relative w-6 h-6 rounded-full ${dotColor[kutu.durum] || 'bg-green-500 ring-green-500/30'} ring-4 flex items-center justify-center shadow-lg transition-transform group-hover:scale-125`}>
                <span className="text-[8px] text-white font-bold">{index + 1}</span>
              </div>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-surface-900 text-white rounded-lg px-3 py-2 text-xs whitespace-nowrap shadow-xl">
                  <p className="font-semibold">{kutu.id} — {kutu.konum}</p>
                  <p className="text-surface-300 mt-0.5">Doluluk: {kutu.doluluk}% • {kutu.durum}</p>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-surface-900" />
                </div>
              </div>
            </div>
          );
        })}

        {/* Info overlay */}
        <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-3 shadow-sm border border-surface-200 flex items-center justify-between">
          <p className="text-xs text-surface-500">
            <span className="font-semibold text-surface-700">İpucu:</span> Harita üzerindeki pinlerin üzerine gelerek detaylı bilgi görebilirsiniz. Leaflet entegrasyonu Adım 5'te yapılacaktır.
          </p>
        </div>
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
    const fetchBoxes = async () => {
      if (user?.kurum_id) {
        setLoading(true);
        try {
          const data = await getBoxesByKurum(user.kurum_id);
          if (isMounted) setBoxes(data);
        } catch (error) {
          console.error("Kutular yüklenirken hata oluştu:", error);
        } finally {
          if (isMounted) setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    
    fetchBoxes();
    return () => { isMounted = false; };
  }, [user]);

  const filteredBoxes = boxes.filter((b) => {
    const sId = b.id || '';
    const sKonum = b.konum || '';
    const sPersonel = b.atananPersonel || '';

    const matchesSearch =
      sId.toLowerCase().includes(search.toLowerCase()) ||
      sKonum.toLowerCase().includes(search.toLowerCase()) ||
      sPersonel.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterDurum === 'Tümü' || b.durum === filterDurum;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <svg className="animate-spin h-10 w-10 text-primary-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
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
          <option>Aktif</option>
          <option>Dolu</option>
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m0-8.25a1.125 1.125 0 01-1.125 1.125M9 6.75a1.125 1.125 0 001.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.875v2.25M9 3.75c-2.623 0-5.138.784-7.286 2.212m0 0A14.896 14.896 0 0012 21c3.9 0 7.489-1.5 10.18-3.96m.106-1.578A14.891 14.891 0 0012 3.75c-2.623 0-5.138.784-7.286 2.212" />
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
                  <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-6 py-4">İlçe</th>
                  <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-6 py-4">Durum</th>
                  <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-6 py-4">Doluluk</th>
                  <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-6 py-4">Personel</th>
                  <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-6 py-4">Son Toplama</th>
                  <th className="text-right text-xs font-semibold text-surface-500 uppercase tracking-wider px-6 py-4">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filteredBoxes.map((kutu) => (
                  <tr key={kutu.id} className="hover:bg-surface-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-primary-600">{kutu.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-surface-800">{kutu.konum}</p>
                      <p className="text-xs text-surface-400">{kutu.il}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-surface-600">{kutu.ilce}</td>
                    <td className="px-6 py-4"><StatusBadge durum={kutu.durum} /></td>
                    <td className="px-6 py-4"><FullnessBar percent={kutu.doluluk} /></td>
                    <td className="px-6 py-4 text-sm text-surface-600">{kutu.atananPersonel}</td>
                    <td className="px-6 py-4 text-sm text-surface-500">{kutu.sonToplama}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1.5 rounded-lg text-surface-400 hover:bg-surface-100 hover:text-surface-600 transition-colors cursor-pointer">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
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
