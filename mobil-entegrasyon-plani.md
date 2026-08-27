# 🚀 Yesevi Flutter Mobil Uygulaması: Web Paneli Entegrasyon ve Mimari Rehberi

Bu doküman, Flutter geliştiricisinin (veya AI asistanının) YeseviWeb yönetim paneliyle %100 uyumlu çalışacak mobil uygulamayı geliştirirken izlemesi gereken **kesin mimari kuralları ve veri şemalarını** içerir. Lütfen kodlamaya başlamadan önce tüm maddeleri dikkatlice okuyun ve birebir uygulayın.

## 🏢 1. Multi-Tenant (Çoklu Kiracı) Bağlantı Kuralı

Sistemimiz çoklu kurum destekli bir SaaS yapısına sahiptir. Mobil uygulamanın web tarafıyla (Firestore üzerinden) doğru entegre olabilmesi için veri izolasyonu son derece kritiktir.

### 📌 1.1. Login ve State Yönetimi
- **Kural:** Personel (Saha görevlisi veya admin) e-posta/şifre ile giriş yaptıktan **hemen sonra**, kullanıcının `uid`'si ile Firestore `users` (eğer yoksa auth bilgilerinden kontrolle) koleksiyonundaki kullanıcı profil dokümanı çekilmelidir.
- **Zorunlu State:** Çekilen doküman içerisindeki `kurum_id` (String) bilgisi, uygulamanın global State'inde (Provider, Riverpod, BLoC vb.) veya Singleton oturum yöneticisinde mutlaka **güvenli ve kalıcı bir şekilde (oturuma bağlı olarak) saklanmalıdır**.

### 📌 1.2. Firestore Write (Ekleme/Güncelleme) Kuralı
- **Kural:** Veritabanına (Firestore) yazılacak **HER YENİ KAYDIN** (kutu, aktivite, ihtiyaç sahibi, teslimat raporu vb.) içerisinde `kurum_id` alanı **zorunlu olarak** bulunmalıdır.
- **Neden?:** Web panelindeki tüm listeleme ve güvenlik sorguları (`where('kurum_id', '==', aktifKurumId)`) filtresiyle çalışmaktadır. `kurum_id` değeri eksik veya yanlış olan kayıtlar, web panelinde kesinlikle **görüntülenemez**. (Yetki sınırları dışına çıkar).
- **Kritik Uyarı:** `kurum_id` mobil uygulamadan hard-coded (sabit) gitmemeli, giriş yapan aktif kullanıcının State'inden çekilerek dökümana eklenmelidir.

---

## 🗄️ 2. Koleksiyon Şemaları (Veri İskeletleri)

Mobil uygulamanın Firestore'a yazacağı veya okuyacağı dokümanlar, Web tabanlı panelin beklediği tam alanları içermelidir. Aşağıda spesifik modüllerin veri yapıları listelenmiştir:

### 📦 2.1. `kutular` (Kutu Yönetimi) Koleksiyonu
Flutter tarafından yeni bir bağış kutusu eklendiğinde beklenen veri yapısı:
```dart
{
  "kurum_id": "STRING (State'ten gelecek - Zorunlu)",
  "konum": "STRING (Örn: Alleben Mah. Kemal Köker Cad.)",
  "il": "STRING (Örn: Gaziantep)",
  "ilce": "STRING (Örn: Şahinbey)",
  "lat": DOUBLE (Enlem - Haritadan seçilen, Örn: 37.0662),
  "lng": DOUBLE (Boylam - Haritadan seçilen, Örn: 37.3833),
  "durum": "STRING (Enum: 'Aktif', 'Hasarlı', 'Bakımda', 'Dolu')",
  "doluluk": INTEGER (0-100 arası yüzde),
  "atananPersonel": "STRING (İsteğe bağlı - Atanmış personelin Adı veya ID'si)",
  "sonToplama": "STRING (Tarih formatında veya null)"
}
```

### 🤝 2.2. `beneficiaries` (İhtiyaç Sahipleri - YENİ MODÜL)
Web tarafına yeni eklediğimiz "İhtiyaç Sahipleri" modülü için mobilden gönderilmesi gereken zorunlu alanlar:
```dart
{
  "kurum_id": "STRING (State'ten gelecek - Zorunlu)",
  "ad_soyad": "STRING (Örn: Ayşe Demir)",
  "telefon": "STRING (Örn: 05xx xxx xx xx)",
  "adres": "STRING (Açık Adres)",
  "lat": DOUBLE (Enlem - Haritadan seçilen),
  "lng": DOUBLE (Boylam - Haritadan seçilen),
  "ihtiyac_durumu": "STRING (Enum: 'Bekliyor', 'Acil', 'Devam Ediyor', 'Tamamlandı')",
  "notlar": "STRING (Opsiyonel, saha personelinin sahadan eklediği notlar)",
  "son_teslimat": "STRING (Nullable, Yardım teslim edildiğinde / onaylandığında güncellenir)",
  "olusturma_tarihi": Timestamp (FieldValue.serverTimestamp())
}
```

---

## 📱 3. Flutter'a Eklenecek Yeni Modül Görevi: "İhtiyaç Sahipleri" Ekranı

Web panelinde `BeneficiariesPage` olarak hazırlanan altyapının mobil saha ekibi (Flutter) tarafı tasarlanmalıdır. İlgili Flutter Agent'in izlemesi, uygulaması ve kodlaması gereken iş adımları şunlardır:

1. **Yeni Ekran (Screen) Tasarımı ve Yönlendirme:** 
   - Alt navigasyon barına (BottomNavigationBar) veya yan menüye (Drawer) "İhtiyaç Sahipleri" adında yeni bir sekme/sayfa ekleyin. 
   - Bu ekranda, personelin aktif kurumuna (`kurum_id`) ait olan ihtiyaç sahipleri Firebase'den stream veya future yapısıyla List / Harita (Google Maps veya Leaflet/FlutterMap) üzerinde gösterilmelidir.

2. **Harita Üzerinden Lokasyon Seçme (Add Beneficiary):**
   - Sağ alt köşedeki (FAB) butonla yeni kişi ekleme ekranına veya modalına geçiş yapılmalıdır.
   - Kutularda yapıldığı gibi **Harita üzerinden ilgili lokasyona gelinerek bir nokta (marker) atılması** istenmelidir, böylece net (lat, lng) koordinatları elde edilir.

3. **Form ve Firestore Kaydı:**
   - Haritadan koordinat seçildikten sonra; Ad Soyad, Telefon, Adres açıklaması, İhtiyaç Durumu (Dropdown: Bekliyor, Acil, vs.) toplanmalıdır.
   - Form başarıyla doldurulduğunda, yukarıda (Madde 2.2) belirtilen `beneficiaries` koleksiyon şemasına **birebir uyularak** (içine Login state'indeki `kurum_id` yerleştirilerek) `FirebaseFirestore.instance.collection('beneficiaries').add(...)` işlemi yapılmalıdır.

***

**⚠️ Geliştirici Özel Notu:** Kodlamaya başlamadan önce `kurum_id` mantığının tüm repository (veri erişim) katmanlarınızdaki `GET`, `ADD`, `UPDATE` fonksiyonlarına sıkıca entegre edildiğinden emin olun. İzole edilmiş bir sorgu yapısı, SaaS güvenliğinin temelidir. Başarılar dileriz! 🚀
