# YeseviWeb - SaaS Çözümü: Kutu ve Personel Yönetim Paneli

**YeseviWeb**, dernekler, vakıflar ve sivil toplum kuruluşları (STK) için geliştirilmiş modern, çok kullanıcılı (multi-tenant) ve ölçeklenebilir bir Kutu ve Personel Yönetim SaaS (Hizmet Olarak Yazılım) çözümüdür. 

Uygulamanın temel amacı, sahada kullanılan bağış/yardım kutularını ve bu kutulardan sorumlu olan personelleri tek bir merkezden kolay, güvenli ve düzenli bir şekilde yönetmektir. Gelişmiş yetki mimarisi sayesinde her kurum, kendi verilerini diğerlerinden tamamen izole bir şekilde yönetir.

---

## 1. Temel Mimari ve Teknolojiler

- **Frontend:** React (Vite altyapısı ile), JSX, ES6+
- **Stil & UI/UX:** Tailwind CSS (Özelleştirilebilir modüler sınıflar, responsive tasarım, yumuşak geçiş efektleri, modern glassmorphism dokunuşları)
- **Yönlendirme (Routing):** React Router DOM v6
- **Backend & Veritabanı:** Firebase Firestore (Gerçek zamanlı NoSQL veritabanı)
- **Kimlik Doğrulama:** Firebase Authentication (E-posta ve şifre ile giriş)
- **Ağ ve Performans Çözümü:** Netlify SPA (Single Page Application) yönlendirme kuralları (404 sorunlarını önlemek için).

---

## 2. Kullanıcı Rolleri ve Yetki Yönetimi (RBAC)

Sistem içerisinde görev alanlarının ayrıştırılması için tasarlanmış geniş bir rol hiyerarşisi bulunmaktadır.

1. **Süper Yönetici (Super Admin):**
   - Sistemin kurucusudur. Tüm sistemi yönetir.
   - Diğer hiçbir role ait olmayan **"Sistem Yönetimi"** menüsünü görebilir.
   - Sisteme yeni STK'lar (Kurumlar) ekler ve bunlara Kutu limitleri tanımlar.
   - Sisteme eklenen yeni kurumlar için **"Kurum Yöneticisi"** (Admin) hesapları oluşturup yetkilendirir.

2. **Kurum Yöneticisi (Admin):**
   - Sadece atandığı `kurum_id`'ye (kendi derneğine/kurumuna) aittir. 
   - Dashboard'ı (Analitik), Kutu Yönetimini, Personel Yönetimini ve Kurumunun Abonelik detaylarını görebilir.
   - Başka bir kurumun veya derneğin verisini kesinlikle göremez (Veri İzolasyonu).

3. **Saha Sorumlusu & Saha Personeli:**
   - Genellikle veri kontrolü veya mobil uygulama ile senkronize çalışacak profillerdir. Sistemde kendilerine atanan kutuları toplarlar.

---

## 3. Temel Modüller ve Sayfalar (Özellikler)

### 3.1. Giriş ve Güvenlik (Authentication)
- Modern tasarımlı "Login" ekranı.
- Kullanıcının e-posta adresi sistemde kayıtlı ise, doğrudan hangi kuruma ait olduğu ve hesaptaki rolü denetlenerek sisteme güvenli giriş sağlanır.
- Sayfaların korunması sağlanmış olup (Protected Routes), izinsiz kullanıcılar doğrudan giriş sayfasına yönlendirilir.

### 3.2. Dashboard (Analitik Kontrol Paneli)
- Kurum yöneticisinin derneğindeki genel özeti gördüğü anasayfadır.
- Toplam Kutu, Aktif Personel, Hasarlı Kutu gibi istatistiklerin kutucuk (kart) yapısıyla, net ve anlaşılır gösterimi.

### 3.3. Sistem Yönetimi: Kurumlar (Yalnızca Süper Admin için)
- **Kurum Listesi:** Sistemde kayıtlı olan tüm vakıf/dernek vb. yapıların listelendiği sayfa.
- **Kurum Ekleme:** Sınırsız sayıda kurum kaydetme imkânı. Her kuruma ayrı bir 'Kutu Limiti' atama.
- **Yönetici Ata:** Yeni oluşturulan bir kuruma anında yönetici (Kurum Admini) hesabı oluşturma. *İkincil Auth Instancce (Secondary App)* sayesinde Süper Admin sistemden çıkış yapmadan veya oturumu düşmeden alt kurum hesapları yaratabilir.

### 3.4. Kutu Yönetimi
- **Liste Özelliği:** Sahadaki bağış kutularının (Kutu ID, İl, İlçe, Durum, Doluluk, Atanan Personel, Son Toplanma Tarihi) listelendiği bir veri tablosudur.
- **Harita (Map) Görünümü:** Kutuların saha operasyonları için koordinat tabanlı olarak harita üzerinden de izlenmesine olanak sunan arayüz geçişini destekler.
- **Durum Takibi:** Kutuların "Aktif, Dolu, Hasarlı, Bakımda" gibi renkli statü etiketleriyle operasyonların kolaylaşmasını sağlar.

### 3.5. Personel Yönetimi
- **Canlı Veri Çekme:** Firestore `users` koleksiyonundan, tamamen aktif kurumun personellerini (`where('kurum_id', '==', user.kurum_id)`) çekerek sergiler.
- İş akışını kolaylaştırmak için arama yapma ve özellik (rol) bazlı filtreleme sunar.
- **Yeni Personel Ekleme & Silme:** Personeller doğrudan liste üzerinden kolayca eklenebilir veya güvenli şekilde (`deleteDoc`) sistemden çıkarılabilir.

### 3.6. Abonelik ve Finans (SaaS Sayfası)
- SaaS modeline entegre olacak biçimde kurumların tanımlanan paketlerini, sistemde kullanabilecekleri kota/kutu limitlerini takip edebildiği arayüzdür.

---

## 4. Kullanıcı Deneyimi (UI/UX) ve Modern Çözümler

- **Dinamik Navbar ve Sidebar:** Sistemde dolaşırken sabit isimler yerine giriş yapan kullanıcının "İsim Baş Harfleri, Adı ve Dinamik Rolü" (örn: 'Saha Personeli', 'Süper Yönetici') sergilenir.
- **Mobil Uyum (Responsive):** Veri tablolarının ve menülerin akıllı telefon ve tablet ekranlarına uyması adına Bootstrap/Tailwind Grid yapısı (`overflow-x-auto`) uygulanmıştır.
- **Akıllı Skeleton (Yükleme Efektleri):** Sunucudan veriler tam olarak yüklenene kadar sayfada kaybolmayan bir arayüz bütünselliği (skeleton loaders) mevcuttur.
- **Toast ve Alert Geri Bildirimleri:** Tüm veri kaydı, ekleme, silme ve geçersiz yetki denemelerinde şık ve bilgilendirici mesajlar gösterilir.

---

## 5. Güvenlik ve Veri İzolasyonu
"Multi-tenant" mimari anlayışı nedeniyle **"Kurum Kimliği"** tabanlı bir filtreleme modeli kullanılır. Veritabanındaki (Firestore) her veri `kurum_id` referansına sahip olmalıdır. Kodlama içerisinde yapılan yetkilendirme sorguları ve veri filtrelemeleri sayesinde, iki farklı dernek verisinin birbirine geçme ihtimali yazılımsal düzeyde %100 engellenmiştir.
