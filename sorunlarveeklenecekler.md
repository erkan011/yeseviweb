# 🚀 Web Paneli: Dinamik Veri Çekme, Gerçek Harita Entegrasyonu ve Profil Sayfası Yapılandırması

Web panelimizde Firestore bağlantıları tam olarak tetiklenmediği için listeler ve Dashboard sıfır görünüyor. Ayrıca harita görünümlerimiz sahte bir ızgara (grid) yapısında ve Ayarlar sayfamız eksik. Lütfen aşağıdaki 4 adımı sırasıyla ve eksiksiz uygulayarak projeyi ayağa kaldır:

## 1. Veri Çekme İşlemlerinin (Fetch) Düzeltilmesi
`DashboardPage` ve `BoxesPage` bileşenlerinde `useEffect` ile Firestore'dan veri çekme (fetch) işlemi çalışmıyor.
* Hem `boxes` hem de `users` koleksiyonları için `onSnapshot` (veya getDocs) fonksiyonunu yaz. Sorgu mutlaka `where('kurum_id', '==', currentUser.kurum_id)` içermelidir.
* **Dashboard Matematik İşlemleri:** Gelen `boxes` state'i üzerinden;
  - *Toplam Kutu:* `boxes.length`
  - *Aylık Gelir:* `boxes.reduce((sum, box) => sum + (Number(box.donationAmount) || 0), 0)`
  - *Bekleyen Kutu:* Sadece `status === 'dropped'` olanların length'i.
* Hata almamak için tüm hesaplamalarda optional chaining (`?.`) ve default value (`|| 0`) kullan.

## 2. Gerçek Harita Entegrasyonu (Leaflet veya React-Google-Maps)
Hem Bağış Kutuları hem de İhtiyaç Sahipleri sayfalarındaki "Harita Görünümü" şu an sahte bir CSS grid arka planına sahip. Bunu gerçek bir haritaya dönüştür:
* Projeye uygun olan gerçek bir harita kütüphanesi (Örn: `react-leaflet` veya Google Maps) entegre et.
* **Kutular Haritası (`BoxesPage`):** `latitude` ve `longitude` değerlerine göre haritaya pin ekle. Durumu 'dropped' olanlar sarı/turuncu, 'collected' olanlar yeşil pin olsun.
* **İhtiyaç Sahipleri Haritası (`BeneficiariesPage`):** Kişilerin konumlarına pin ekle ve `needStatus` değerine göre renklendir (Acil=Kırmızı, Bekliyor=Sarı, Tamamlandı=Yeşil).
* Pinlere tıklandığında (Popup/InfoWindow) isim ve durum bilgilerini göster.

## 3. Ayarlar / Profil Sayfasının Oluşturulması
Ekranda "Yakında eklenecektir" yazan `SettingsPage.jsx` bileşenini tamamen kodla.
* Kullanıcının bilgilerini (`name`, `email`, `phone`, `role`) form alanlarında göster (Profil düzenleme formu).
* Bu sayfada şifre sıfırlama (Firebase sendPasswordResetEmail) butonu ve "Çıkış Yap" butonu da bulundur.

## 4. Dinamik Sidebar (Kurum Adı Gösterimi)
Sidebar menüsünün en üstünde statik olarak "YeseviWeb" yazıyor. 
* Bu kısmı dinamik hale getir: Mevcut kullanıcının `kurum_id` değerini kullanarak `kurumlar` koleksiyonundan ilgili dokümanı çek.
* O dokümandaki **`name`** (Örn: "Yesevi Harekatı Gaziantep") bilgisini statik "YeseviWeb" yazısının yerine yerleştir. Eğer yükleniyorsa "Yükleniyor..." veya varsayılan bir ikon göster.