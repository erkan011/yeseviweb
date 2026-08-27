# 🚀 YeseviWeb Kapsamlı Hata Çözüm ve Geliştirme Yönergesi

Mevcut sistemde tespit edilen UI/UX, mantık ve yönlendirme hatalarını gidermek ve yeni bir modül eklemek için aşağıdaki 5 adımı sırasıyla uygula. Her adımı bitirdiğinde projeyi derle ve hata olup olmadığını kontrol et.

## 1. Süper Yönetici Dashboard Ayrımı
**Sorun:** Süper Yönetici ile Kurum Yöneticisi aynı Dashboard mantığını kullanıyor. Süper Yönetici dar kapsamlı veriler görüyor.
**Çözüm:** 
* `DashboardPage.jsx` bileşeninde aktif kullanıcının rolünü (`currentUser.rol`) kontrol et.
* Eğer rol `super_admin` ise, ekrana **Süper Yönetici Analitik Paneli** render edilsin.
* Bu panelde Firestore'dan global verileri çek: Sistemdeki toplam kurum sayısı, tüm kurumlardaki toplam aktif personel sayısı ve global toplam kutu sayısı gibi genel özet (Kiosk) istatistikleri gösterilsin.

## 2. Personel "Düzenle" Butonu Aktivasyonu
**Sorun:** `StaffPage.jsx` içerisindeki personel tablosunda yer alan "Düzenle" butonu şu an pasif veya işlevsiz.
**Çözüm:**
* `EditStaffModal.jsx` adında yeni bir bileşen oluştur.
* Tablodan "Düzenle"ye basıldığında bu modal açılsın ve seçili personelin bilgileri (Ad, Telefon, Rol, Durum) forma otomatik dolsun.
* Form kaydedildiğinde Firestore `users` koleksiyonunda ilgili personelin dokümanını `updateDoc` ile güncelle ve tabloyu yenile.

## 3. UI/UX ve Mobil Uyum (Responsive) Taşma Sorunları
**Sorun:** Mobil görünümlerde veya sayfa geçişlerinde ekran dışına taşmalar (overflow) ve boyutlandırma hataları yaşanıyor.
**Çözüm:**
* `MainLayout.jsx` veya ana kapsayıcı div'lerde yatay taşmayı engellemek için `overflow-x-hidden` sınıfını ekle.
* Sayfa içeriklerindeki geniş div'lere `w-full max-w-full` sınırları koy.
* Harita ve Tablo kapsayıcılarının mobilde ekranı patlatmaması için Tailwind'in `flex-col`, `overflow-x-auto` (tablolar için) ve yüksekliği sınırlayan (`min-h-[50vh]`) responsive (`sm:`, `md:`) yapılarını baştan aşağı denetle ve düzelt.

## 4. Giriş (Login) Ekranı Güncellemesi
**Sorun:** Sadece E-posta ve Şifre ile giriş yapılıyor. Tasarımsal ve işlevsel olarak "Firma/Kurum Adı" alanı eksik.
**Çözüm:**
* `LoginPage.jsx` formuna "Kurum/Firma Kodu" veya "Firma Adı" adında zorunlu bir text input ekle.
* Kullanıcı giriş yaparken, Authentication başarılı olduktan sonra Firestore'dan çekilen kullanıcı dokümanındaki `kurum_id` (veya kurum adı) ile formdan girilen "Firma Adı" bilgisini eşleştir. Uyuşmazlık varsa girişi reddet ve güvenli çıkış (`signOut`) yaptırarak uyarı ver.

## 5. Yeni Modül: İhtiyaç Sahibi Sayfası
**Sorun:** Kutu yönetimine benzer, yardımların ulaştırılacağı kişilerin takip edileceği bir sayfa eksik.
**Çözüm:**
* `BeneficiariesPage.jsx` (İhtiyaç Sahipleri) adında yeni bir sayfa oluştur ve `App.jsx` rotalarına ekle. `Sidebar.jsx` menüsüne dahil et.
* Kutu yönetimiyle aynı UI mantığını kurgula: Üstte bir Harita (Map), altta bir Veri Tablosu.
* Firestore'da `beneficiaries` adında yeni bir koleksiyon hedefle. Harita üzerinde ihtiyaç sahiplerinin lokasyonlarını (latitude/longitude), tabloda ise Ad, Adres, İhtiyaç Durumu ve Son Teslimat Tarihi gibi bilgileri listele.