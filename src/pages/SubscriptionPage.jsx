import { subscriptionInfo, planlar } from '../data/mockData';

// ---------- Usage Meter ----------
const UsageMeter = ({ label, used, max, unit }) => {
  const percent = Math.round((used / max) * 100);
  let barColor = 'bg-primary-500';
  if (percent >= 90) barColor = 'bg-red-500';
  else if (percent >= 75) barColor = 'bg-amber-500';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-surface-700">{label}</span>
        <span className="text-sm text-surface-500">
          <span className="font-semibold text-surface-800">{used}</span> / {max} {unit}
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-surface-100 overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-700`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-xs text-surface-400 text-right">%{percent} kullanılıyor</p>
    </div>
  );
};

// ---------- Plan Card ----------
const PlanCard = ({ plan, isPopular }) => (
  <div className={`
    relative rounded-2xl border-2 p-6 transition-all duration-300
    ${plan.aktif
      ? 'border-primary-500 bg-primary-50/30 shadow-lg shadow-primary-500/10'
      : 'border-surface-200 bg-white hover:border-surface-300 hover:shadow-md'
    }
  `}>
    {/* Current Plan Badge */}
    {plan.aktif && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-600 text-white text-xs font-semibold shadow-md">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Mevcut Plan
        </span>
      </div>
    )}

    {isPopular && !plan.aktif && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-semibold shadow-md">
          ⭐ Popüler
        </span>
      </div>
    )}

    <div className="text-center mt-2">
      <h3 className="text-lg font-bold text-surface-800">{plan.ad}</h3>
      <div className="mt-3 flex items-baseline justify-center gap-1">
        <span className="text-4xl font-extrabold text-surface-900">₺{plan.fiyat}</span>
        <span className="text-sm text-surface-400">/ay</span>
      </div>
    </div>

    <ul className="mt-6 space-y-3">
      {plan.ozellikler.map((oz, i) => (
        <li key={i} className="flex items-center gap-2.5 text-sm text-surface-600">
          <svg className={`w-4 h-4 flex-shrink-0 ${plan.aktif ? 'text-primary-500' : 'text-surface-400'}`} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          {oz}
        </li>
      ))}
    </ul>

    <button className={`
      mt-6 w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer
      ${plan.aktif
        ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/20 hover:bg-primary-700'
        : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
      }
    `}>
      {plan.aktif ? 'Mevcut Planınız' : 'Plana Geç'}
    </button>
  </div>
);

// ============================================================
//  SUBSCRIPTION PAGE
// ============================================================
const SubscriptionPage = () => {
  const { mevcutPlan, planBaslangic, planBitis, odemeDurumu, sonOdeme, aylikUcret, limitler } = subscriptionInfo;

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-surface-900">Abonelik & Finans</h2>
        <p className="text-sm text-surface-400 mt-0.5">Abonelik planınızı, kullanım limitlerini ve ödeme durumlarınızı yönetin</p>
      </div>

      {/* Current Plan Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plan Info Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-surface-200 p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-surface-800">Mevcut Abonelik</h3>
              <p className="text-sm text-surface-400 mt-0.5">Plan detayları ve durum bilgisi</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold ring-1 ring-inset ring-green-600/20">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              {odemeDurumu}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-surface-50 rounded-xl p-4">
              <p className="text-xs text-surface-400">Plan</p>
              <p className="mt-1 text-lg font-bold text-surface-900">{mevcutPlan}</p>
            </div>
            <div className="bg-surface-50 rounded-xl p-4">
              <p className="text-xs text-surface-400">Aylık Ücret</p>
              <p className="mt-1 text-lg font-bold text-surface-900">₺{aylikUcret}</p>
            </div>
            <div className="bg-surface-50 rounded-xl p-4">
              <p className="text-xs text-surface-400">Başlangıç</p>
              <p className="mt-1 text-lg font-bold text-surface-900">{planBaslangic}</p>
            </div>
            <div className="bg-surface-50 rounded-xl p-4">
              <p className="text-xs text-surface-400">Bitiş</p>
              <p className="mt-1 text-lg font-bold text-surface-900">{planBitis}</p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="mt-6 flex items-center justify-between p-4 rounded-xl bg-primary-50/50 border border-primary-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-surface-700">Son Ödeme Tarihi</p>
                <p className="text-xs text-surface-400">{sonOdeme} • ₺{aylikUcret} ödendi</p>
              </div>
            </div>
            <button className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors cursor-pointer shadow-sm">
              Fatura Geçmişi
            </button>
          </div>
        </div>

        {/* Usage Limits Card */}
        <div className="bg-white rounded-2xl border border-surface-200 p-6">
          <h3 className="text-base font-semibold text-surface-800 mb-6">Kullanım Limitleri</h3>
          <div className="space-y-5">
            <UsageMeter
              label="Bağış Kutuları"
              used={limitler.kullanilanKutu}
              max={limitler.maxKutu}
              unit="kutu"
            />
            <UsageMeter
              label="Personel"
              used={limitler.kullanilanPersonel}
              max={limitler.maxPersonel}
              unit="kişi"
            />
            <UsageMeter
              label="Depolama"
              used={limitler.kullanilanDepo}
              max={limitler.maxDepo}
              unit="GB"
            />
          </div>
        </div>
      </div>

      {/* Plan Comparison */}
      <div>
        <div className="mb-6">
          <h3 className="text-lg font-bold text-surface-900">Planları Karşılaştır</h3>
          <p className="text-sm text-surface-400 mt-0.5">İhtiyaçlarınıza en uygun planı seçin</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {planlar.map((plan, i) => (
            <PlanCard key={i} plan={plan} isPopular={i === 1} />
          ))}
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-gradient-to-r from-surface-800 to-surface-900 rounded-2xl p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold">Plan değişikliği veya sorularınız mı var?</p>
            <p className="text-sm text-surface-300 mt-0.5">Destek ekibimiz size yardımcı olmaktan mutluluk duyar.</p>
          </div>
        </div>
        <button className="px-5 py-2.5 rounded-xl bg-white text-surface-900 text-sm font-semibold hover:bg-surface-100 transition-colors cursor-pointer shadow-sm">
          Destek Ekibine Ulaş
        </button>
      </div>
    </div>
  );
};

export default SubscriptionPage;
