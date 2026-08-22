// ============================================================
// MOCK DATA — Tüm sayfalar için geçici/dummy veriler
// Firebase bağlantısı yapıldığında bu dosya kaldırılacak.
// ============================================================

// ---------- Dashboard İstatistikleri ----------
export const dashboardStats = {
  toplamKutu: 128,
  aktifPersonel: 24,
  hasarliKutu: 7,
  toplamaTamamlanma: 86, // yüzde
  aylikGelir: 45230,
  gecenAyGelir: 41800,
};

// ---------- Son Aktiviteler ----------
export const recentActivities = [
  { id: 1, tip: 'toplama', mesaj: 'Ahmet Yılmaz, Kutu #K-0042\'yi topladı', zaman: '12 dk önce', ikon: 'box' },
  { id: 2, tip: 'personel', mesaj: 'Yeni personel Fatma Kaya sisteme eklendi', zaman: '1 saat önce', ikon: 'user' },
  { id: 3, tip: 'hasar', mesaj: 'Kutu #K-0017 hasarlı olarak işaretlendi', zaman: '3 saat önce', ikon: 'alert' },
  { id: 4, tip: 'toplama', mesaj: 'Mehmet Demir, 5 kutuyu topladı', zaman: '5 saat önce', ikon: 'box' },
  { id: 5, tip: 'sistem', mesaj: 'Aylık rapor oluşturuldu', zaman: '1 gün önce', ikon: 'doc' },
];

// ---------- Aylık Toplama Grafiği (son 6 ay) ----------
export const monthlyCollectionData = [
  { ay: 'Mar', toplama: 42 },
  { ay: 'Nis', toplama: 56 },
  { ay: 'May', toplama: 61 },
  { ay: 'Haz', toplama: 48 },
  { ay: 'Tem', toplama: 73 },
  { ay: 'Ağu', toplama: 68 },
];

// ---------- Kutu Durum Dağılımı (pasta grafik) ----------
export const boxStatusDistribution = [
  { durum: 'Aktif', sayi: 98, renk: '#22c55e' },
  { durum: 'Dolu', sayi: 15, renk: '#3b82f6' },
  { durum: 'Hasarlı', sayi: 7, renk: '#ef4444' },
  { durum: 'Bakımda', sayi: 8, renk: '#f59e0b' },
];

// ---------- Bağış Kutuları ----------
export const boxes = [
  { id: 'K-0001', konum: 'Şahinbey Merkez Camii', il: 'Gaziantep', ilce: 'Şahinbey', durum: 'Aktif', doluluk: 72, sonToplama: '2026-08-15', atananPersonel: 'Ahmet Yılmaz', lat: 37.0662, lng: 37.3833 },
  { id: 'K-0002', konum: 'Şehitkamil AVM Girişi', il: 'Gaziantep', ilce: 'Şehitkamil', durum: 'Aktif', doluluk: 45, sonToplama: '2026-08-14', atananPersonel: 'Mehmet Demir', lat: 37.0765, lng: 37.3721 },
  { id: 'K-0003', konum: 'Üniversite Hastanesi Lobisi', il: 'Gaziantep', ilce: 'Şahinbey', durum: 'Dolu', doluluk: 98, sonToplama: '2026-08-10', atananPersonel: 'Fatma Kaya', lat: 37.0580, lng: 37.3500 },
  { id: 'K-0004', konum: 'NikCity Outlet Giriş', il: 'Gaziantep', ilce: 'Şehitkamil', durum: 'Aktif', doluluk: 30, sonToplama: '2026-08-16', atananPersonel: 'Ali Şen', lat: 37.0830, lng: 37.3600 },
  { id: 'K-0005', konum: 'Gaziantep Otogarı', il: 'Gaziantep', ilce: 'Şahinbey', durum: 'Hasarlı', doluluk: 55, sonToplama: '2026-08-12', atananPersonel: 'Veli Can', lat: 37.0500, lng: 37.3900 },
  { id: 'K-0006', konum: 'Karagöz Parkı Yanı', il: 'Gaziantep', ilce: 'Şahinbey', durum: 'Aktif', doluluk: 15, sonToplama: '2026-08-17', atananPersonel: 'Zeynep Ak', lat: 37.0620, lng: 37.3750 },
  { id: 'K-0007', konum: 'Forum Gaziantep AVM', il: 'Gaziantep', ilce: 'Şehitkamil', durum: 'Bakımda', doluluk: 0, sonToplama: '2026-08-05', atananPersonel: '-', lat: 37.0900, lng: 37.3550 },
  { id: 'K-0008', konum: 'Şahinbey Belediyesi Önü', il: 'Gaziantep', ilce: 'Şahinbey', durum: 'Aktif', doluluk: 62, sonToplama: '2026-08-18', atananPersonel: 'Hasan Öz', lat: 37.0650, lng: 37.3810 },
  { id: 'K-0009', konum: 'Alleben Strolling Park', il: 'Gaziantep', ilce: 'Şehitkamil', durum: 'Dolu', doluluk: 95, sonToplama: '2026-08-11', atananPersonel: 'Ahmet Yılmaz', lat: 37.0780, lng: 37.3680 },
  { id: 'K-0010', konum: 'Gaziantep Havalimanı Giriş', il: 'Gaziantep', ilce: 'Oğuzeli', durum: 'Aktif', doluluk: 28, sonToplama: '2026-08-19', atananPersonel: 'Mehmet Demir', lat: 36.9500, lng: 37.4700 },
];

// ---------- Personeller ----------
export const staff = [
  { id: 'P-001', ad: 'Ahmet Yılmaz', email: 'ahmet@yesevi.org', telefon: '0532 111 2233', rol: 'Saha Personeli', durum: 'Aktif', atananKutu: 12, sonAktivite: '2026-08-19' },
  { id: 'P-002', ad: 'Mehmet Demir', email: 'mehmet@yesevi.org', telefon: '0533 222 3344', rol: 'Saha Personeli', durum: 'Aktif', atananKutu: 8, sonAktivite: '2026-08-19' },
  { id: 'P-003', ad: 'Fatma Kaya', email: 'fatma@yesevi.org', telefon: '0534 333 4455', rol: 'Saha Personeli', durum: 'Aktif', atananKutu: 5, sonAktivite: '2026-08-18' },
  { id: 'P-004', ad: 'Ali Şen', email: 'ali@yesevi.org', telefon: '0535 444 5566', rol: 'Saha Sorumlusu', durum: 'Aktif', atananKutu: 15, sonAktivite: '2026-08-19' },
  { id: 'P-005', ad: 'Veli Can', email: 'veli@yesevi.org', telefon: '0536 555 6677', rol: 'Saha Personeli', durum: 'Pasif', atananKutu: 3, sonAktivite: '2026-08-10' },
  { id: 'P-006', ad: 'Zeynep Ak', email: 'zeynep@yesevi.org', telefon: '0537 666 7788', rol: 'Saha Personeli', durum: 'Aktif', atananKutu: 6, sonAktivite: '2026-08-17' },
  { id: 'P-007', ad: 'Hasan Öz', email: 'hasan@yesevi.org', telefon: '0538 777 8899', rol: 'Saha Personeli', durum: 'Aktif', atananKutu: 9, sonAktivite: '2026-08-18' },
  { id: 'P-008', ad: 'Elif Yıldız', email: 'elif@yesevi.org', telefon: '0539 888 9900', rol: 'Yönetici', durum: 'Aktif', atananKutu: 0, sonAktivite: '2026-08-19' },
];

// ---------- Abonelik / SaaS Bilgileri ----------
export const subscriptionInfo = {
  mevcutPlan: 'Profesyonel',
  planBaslangic: '2026-01-15',
  planBitis: '2027-01-15',
  odemeDurumu: 'Aktif',
  sonOdeme: '2026-08-01',
  aylikUcret: 299,
  limitler: {
    maxKutu: 200,
    kullanilanKutu: 128,
    maxPersonel: 50,
    kullanilanPersonel: 24,
    maxDepo: 5, // GB
    kullanilanDepo: 1.8,
  },
};

export const planlar = [
  {
    ad: 'Başlangıç',
    fiyat: 99,
    ozellikler: ['50 kutuya kadar', '10 personel', '1 GB depolama', 'E-posta desteği', 'Temel raporlama'],
    aktif: false,
  },
  {
    ad: 'Profesyonel',
    fiyat: 299,
    ozellikler: ['200 kutuya kadar', '50 personel', '5 GB depolama', 'Öncelikli destek', 'Gelişmiş raporlama', 'Harita görünümü', 'API erişimi'],
    aktif: true,
  },
  {
    ad: 'Kurumsal',
    fiyat: 599,
    ozellikler: ['Sınırsız kutu', 'Sınırsız personel', '25 GB depolama', '7/24 telefon desteği', 'Özel raporlar', 'Harita görünümü', 'API erişimi', 'Özel entegrasyonlar'],
    aktif: false,
  },
];
