import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getBoxesByKurum, 
  getStaffByKurum, 
  getActivitiesByKurum, 
  getMonthlyCollectionsByKurum 
} from '../services/firestoreService';

// ---------- Stat Card ----------
const StatCard = ({ title, value, suffix, change, changeType, icon, color }) => {
  const colorMap = {
    green: { bg: 'bg-primary-50', icon: 'text-primary-600', ring: 'ring-primary-100' },
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', ring: 'ring-blue-100' },
    red: { bg: 'bg-red-50', icon: 'text-red-600', ring: 'ring-red-100' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600', ring: 'ring-amber-100' },
  };
  const c = colorMap[color] || colorMap.green;

  return (
    <div className="bg-white rounded-2xl border border-surface-200 p-6 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-surface-500">{title}</p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-surface-900">{value}</span>
            {suffix && <span className="text-sm text-surface-400">{suffix}</span>}
          </div>
          {change !== undefined && (
            <div className={`mt-2 inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${changeType === 'up' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {changeType === 'up' ? (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" /></svg>
              ) : (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25" /></svg>
              )}
              {change}
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl ${c.bg} ring-1 ${c.ring} flex items-center justify-center ${c.icon} group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// ---------- Mini Bar Chart ----------
const MiniBarChart = ({ data }) => {
  const max = data.length ? Math.max(...data.map(d => d.toplama)) : 100;
  return (
    <div className="bg-white rounded-2xl border border-surface-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-surface-800">Aylık Toplama</h3>
          <p className="text-sm text-surface-400 mt-0.5">Son 6 ay</p>
        </div>
        <select className="text-xs border border-surface-200 rounded-lg px-3 py-1.5 text-surface-600 bg-surface-50 focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option>Son 6 ay</option>
          <option>Son 12 ay</option>
        </select>
      </div>
      <div className="flex items-end gap-3 h-44">
        {data.length === 0 ? (
          <div className="flex w-full h-full items-center justify-center">
            <span className="text-sm text-surface-400">Veri bulunamadı.</span>
          </div>
        ) : (
          data.map((item, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs font-semibold text-surface-700">{item.toplama}</span>
              <div className="w-full relative rounded-t-lg overflow-hidden bg-surface-100" style={{ height: '100%' }}>
                <div
                  className="absolute bottom-0 w-full rounded-t-lg bg-gradient-to-t from-primary-600 to-primary-400 transition-all duration-700 hover:from-primary-700 hover:to-primary-500"
                  style={{ height: `${(item.toplama / max) * 100}%` }}
                />
              </div>
              <span className="text-xs text-surface-400 font-medium">{item.ay}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ---------- Donut Chart (CSS only) ----------
const DonutChart = ({ data }) => {
  const total = data.reduce((s, d) => s + d.sayi, 0);
  let cumulative = 0;

  // Build conic gradient
  const segments = total > 0 ? data.map((d) => {
    const start = (cumulative / total) * 360;
    cumulative += d.sayi;
    const end = (cumulative / total) * 360;
    return `${d.renk} ${start}deg ${end}deg`;
  }) : ['#cbd5e1 0deg 360deg'];
  const gradient = `conic-gradient(${segments.join(', ')})`;

  return (
    <div className="bg-white rounded-2xl border border-surface-200 p-6">
      <div className="mb-6">
        <h3 className="text-base font-semibold text-surface-800">Kutu Durumları</h3>
        <p className="text-sm text-surface-400 mt-0.5">Toplam {total} kutu</p>
      </div>
      <div className="flex items-center justify-center gap-8">
        {/* Donut */}
        <div className="relative w-36 h-36">
          <div
            className="w-full h-full rounded-full transition-all duration-700"
            style={{ background: gradient }}
          />
          <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
            <div className="text-center">
              <span className="text-2xl font-bold text-surface-900">{total}</span>
              <p className="text-[10px] text-surface-400">Toplam</p>
            </div>
          </div>
        </div>
        {/* Legend */}
        <div className="space-y-3">
          {data.map((d, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.renk }} />
              <div>
                <span className="text-sm font-medium text-surface-700">{d.durum}</span>
                <span className="text-xs text-surface-400 ml-2">({d.sayi})</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ---------- Activity Feed ----------
const ActivityFeed = ({ activities }) => {
  const iconMap = {
    box: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
      </svg>
    ),
    user: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    alert: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
    doc: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  };

  const tipColors = {
    toplama: 'bg-primary-100 text-primary-600',
    personel: 'bg-blue-100 text-blue-600',
    hasar: 'bg-red-100 text-red-600',
    sistem: 'bg-surface-100 text-surface-600',
  };

  return (
    <div className="bg-white rounded-2xl border border-surface-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-semibold text-surface-800">Son Aktiviteler</h3>
        <button className="text-xs font-medium text-primary-600 hover:text-primary-700 cursor-pointer">
          Tümünü Gör →
        </button>
      </div>
      <div className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-sm text-surface-400">Henüz aktivite bulunmuyor.</p>
        ) : (
          activities.map((a) => (
            <div key={a.id} className="flex items-start gap-3 group">
              <div className={`w-8 h-8 rounded-lg ${tipColors[a.tip] || 'bg-surface-100 text-surface-600'} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                {iconMap[a.ikon] || iconMap.info}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-surface-700 leading-snug">{a.mesaj}</p>
                <p className="text-xs text-surface-400 mt-1">{a.zaman}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ============================================================
//  DASHBOARD PAGE
// ============================================================
const DashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // Stats States
  const [stats, setStats] = useState({
    toplamKutu: 0,
    aktifPersonel: 0,
    hasarliKutu: 0,
    aylikGelir: 0,
    gecenAyGelir: 1 // div by zero exception guard
  });
  const [activities, setActivities] = useState([]);
  const [boxStatus, setBoxStatus] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      if (!user?.kurum_id) return;
      setLoading(true);
      try {
        const [kutuData, personelData, aktiviteData, toplamaData] = await Promise.all([
          getBoxesByKurum(user.kurum_id),
          getStaffByKurum(user.kurum_id),
          getActivitiesByKurum(user.kurum_id),
          getMonthlyCollectionsByKurum(user.kurum_id)
        ]);

        if (isMounted) {
          // Kutular üzerinden aggregation
          const aktif = kutuData.filter(b => b.durum === 'Aktif').length;
          const dolu = kutuData.filter(b => b.durum === 'Dolu').length;
          const hasarli = kutuData.filter(b => b.durum === 'Hasarlı').length;
          const bakimda = kutuData.filter(b => b.durum === 'Bakımda').length;
          
          setBoxStatus([
             { durum: 'Aktif', sayi: aktif, renk: '#22c55e' },
             { durum: 'Dolu', sayi: dolu, renk: '#3b82f6' },
             { durum: 'Hasarlı', sayi: hasarli, renk: '#ef4444' },
             { durum: 'Bakımda', sayi: bakimda, renk: '#f59e0b' },
          ]);

          const aktifPers = personelData.filter(p => p.durum === 'Aktif').length;

          // Abonelik veya toplama işlemlerinden gelir bulunabilir (Mock: Gelir şimdilik sabit)
          setStats({
            toplamKutu: kutuData.length,
            aktifPersonel: aktifPers,
            hasarliKutu: hasarli,
            aylikGelir: 0, // Henüz Firestore'da yok 
            gecenAyGelir: 1 
          });

          setActivities(aktiviteData);
          setMonthlyData(toplamaData);
        }
      } catch (error) {
        console.error("Dashboard verileri yüklenirken hata:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [user]);

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

  const userFirstName = user?.isim?.split(' ')[0] ?? 'Yönetici';
  // Gelir değişimi hesaplaması (gelecekte kullanılabilir)
  let gelirDegisim = 0;
  if (stats?.gecenAyGelir > 0) {
    gelirDegisim = (((stats.aylikGelir - stats.gecenAyGelir) / stats.gecenAyGelir) * 100).toFixed(1);
  }

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-500 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute right-16 bottom-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative z-10">
          <h2 className="text-xl font-bold">Hoş Geldiniz, {userFirstName}! 👋</h2>
          <p className="mt-1 text-primary-100 text-sm">İşte kurumunuzun bugünkü durumu</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Toplam Kutu"
          value={stats?.toplamKutu ?? 0}
          suffix="adet"
          change="+12 bu ay"
          changeType="up"
          color="green"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>}
        />
        <StatCard
          title="Aktif Personel"
          value={stats?.aktifPersonel ?? 0}
          suffix="kişi"
          change="+3 bu ay"
          changeType="up"
          color="blue"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>}
        />
        <StatCard
          title="Hasarlı Kutu"
          value={stats?.hasarliKutu ?? 0}
          suffix="adet"
          change="-2 bu ay"
          changeType="down"
          color="red"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>}
        />
        <StatCard
          title="Aylık Gelir"
          value={`₺${(stats?.aylikGelir ?? 0).toLocaleString('tr-TR')}`}
          change={`%${gelirDegisim} artış`}
          changeType="up"
          color="amber"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MiniBarChart data={monthlyData ?? []} />
        <DonutChart data={boxStatus ?? []} />
      </div>

      {/* Activity Feed */}
      <ActivityFeed activities={activities ?? []} />
    </div>
  );
};

export default DashboardPage;
