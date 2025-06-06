# 🚀 Gerçek Zamanlı Sohbet Uygulaması

Modern, güvenli ve kullanıcı dostu bir gerçek zamanlı sohbet uygulaması. Uçtan uca şifreleme, arkadaşlık sistemi ve gelişmiş bildirimler ile donatılmıştır.

## ✨ Özellikler

### 🔐 Güvenlik

- **Uçtan Uca Şifreleme**: AES-256 algoritması ile tüm mesajlar şifrelenir

### 💬 Mesajlaşma

- **Gerçek Zamanlı İletişim**: Socket.io ile anlık mesaj iletimi
- **Mesaj Durumu**: Gönderildi/Okundu durumu takibi
- **Şifreli Mesajlar**: Tüm mesajlar istemci tarafında şifrelenir/çözülür
- **Mesaj Geçmişi**: Persistent mesaj saklama

### 👥 Sosyal Özellikler

- **Arkadaşlık Sistemi**: Kullanıcı arama ve arkadaşlık istekleri
- **Çevrimiçi Durum**: Gerçek zamanlı çevrimiçi/çevrimdışı durumu
- **Kullanıcı Profilleri**: Profil fotoğrafı ve kişisel bilgiler
- **Son Görülme**: Kullanıcıların son aktif olma zamanı

### 🔔 Bildirimler

- **Gerçek Zamanlı Bildirimler**: Yeni mesajlar için anlık uyarılar
- **Görsel Göstergeler**: Okunmamış mesaj sayacı
- **Ses ve Görsel Efektler**: Kullanıcı deneyimini zenginleştiren animasyonlar

### ⚙️ Kullanıcı Ayarları

- **Profil Düzenleme**: Ad, e-posta ve profil fotoğrafı güncelleme
- **Hesap Yönetimi**: Güvenli oturum kapatma ve hesap bilgileri

## 🛠️ Teknoloji Stack'i

### Frontend

- **Next.js 15.3.2**: React tabanlı full-stack framework
- **React 19**: Modern UI kütüphanesi
- **TypeScript**: Tip güvenli JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Erişilebilir UI komponentleri
- **Lucide React**: Modern ikon kütüphanesi

### Backend

- **Next.js API Routes**: Serverless API endpoints
- **Socket.io**: Gerçek zamanlı iletişim
- **Better Auth**: Modern kimlik doğrulama
- **Prisma ORM**: Type-safe veritabanı client'ı
- **PostgreSQL**: İlişkisel veritabanı

### Güvenlik ve Şifreleme

- **Crypto-JS**: AES şifreleme kütüphanesi

### Geliştirme Araçları

- **ESLint**: Kod kalitesi ve standartları
- **TypeScript**: Statik tip kontrolü
- **Prisma Studio**: Veritabanı yönetim arayüzü

## 📁 Proje Yapısı

```
realtime-chat/
├── prisma/
│   └── schema.prisma          # Veritabanı şeması
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/              # API endpoints
│   │   │   ├── auth/         # Kimlik doğrulama
│   │   │   ├── messages/     # Mesaj yönetimi
│   │   │   ├── users/        # Kullanıcı işlemleri
│   │   │   └── friend-requests/ # Arkadaşlık istekleri
│   │   ├── settings/         # Kullanıcı ayarları sayfası
│   │   └── layout.tsx        # Ana layout
│   ├── components/           # React komponentleri
│   │   ├── private-chat.tsx  # Ana sohbet bileşeni
│   │   ├── main-dashboard.tsx # Ana dashboard
│   │   ├── user-search.tsx   # Kullanıcı arama
│   │   └── ...               # Diğer komponentler
│   ├── lib/                  # Yardımcı kütüphaneler
│   │   ├── encryption.ts     # Şifreleme fonksiyonları
│   │   ├── socket-client.ts  # Socket.io client
│   │   ├── auth.ts          # Better Auth yapılandırması
│   │   └── prisma.ts        # Prisma client
│   └── server.ts            # Socket.io sunucusu
└── package.json
```

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler

- Node.js 18.x veya üzeri
- PostgreSQL veritabanı
- npm veya yarn paket yöneticisi

### 1. Projeyi Klonlayın

```bash
git clone <repository-url>
cd realtime-chat
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Ortam Değişkenlerini Ayarlayın

`.env.local` dosyası oluşturun:

```env
# Veritabanı
DATABASE_URL="postgresql://username:password@localhost:5432/realtime_chat"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Veritabanını Hazırlayın

```bash
# Prisma migrasyonlarını çalıştırın
npx prisma migrate dev --name init

# Prisma Client'ı oluşturun
npx prisma generate
```

### 5. Uygulamayı Başlatın

```bash
# Geliştirme modu
npm run dev

# Üretim modu
npm run build
npm start
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacaktır.

## 🔒 Güvenlik Mimarisi

### Şifreleme Süreci

1. **Anahtar Üretimi**: Her sohbet odasına özel AES anahtarı
2. **Mesaj Şifreleme**: İstemci tarafında gerçek zamanlı şifreleme
3. **Güvenli Transmisyon**: Şifrelenmiş veriler Socket.io üzerinden
4. **Çözümleme**: Alıcı tarafında otomatik şifre çözme

### Kimlik Doğrulama

- Better Auth ile modern OAuth2/OIDC desteği
- Güvenli session yönetimi
- CSRF koruması
- Rate limiting

## 🎯 Kullanım Kılavuzu

### Hesap Oluşturma

1. Ana sayfada "Kayıt Ol" butonuna tıklayın
2. Gerekli bilgileri doldurun
3. E-posta doğrulaması yapın (opsiyonel)

### Arkadaş Ekleme

1. Sol panelde "Kişiler" sekmesine geçin
2. Arama kutusuna kullanıcı adı yazın
3. Arkadaşlık isteği gönderin
4. Karşı tarafın kabul etmesini bekleyin

### Mesajlaşma

1. Arkadaş listesinden bir kişi seçin
2. Mesaj kutusuna yazmaya başlayın
3. Enter ile mesajı gönderin
4. Mesaj durumunu takip edin (✓ gönderildi, ✓✓ okundu)

### Profil Yönetimi

1. Sol panelde ayarlar simgesine tıklayın
2. "Ayarlar" sayfasına gidin
3. Profil bilgilerinizi güncelleyin
4. Değişiklikleri kaydedin

## 🔧 Geliştirme

### Kod Yapısı

- **Komponent Tabanlı**: Yeniden kullanılabilir React komponentleri
- **TypeScript**: Tam tip güvenliği
- **API Routes**: RESTful API yapısı
- **Real-time Events**: Socket.io event sistemi

### Stil Rehberi

- Tailwind CSS ile responsive tasarım
- Dark mode desteği hazırlığı
- Erişilebilirlik standartları (a11y)
- Mobile-first yaklaşım

### Veritabanı Migrasyonları

```bash
# Yeni migrasyon oluştur
npx prisma migrate dev --name migration_name

# Migrasyonları uygula
npx prisma migrate deploy

# Veritabanını resetle (geliştirme ortamı)
npx prisma migrate reset
```

## 📊 Performans ve Optimizasyon

### Frontend Optimizasyonları

- React.memo ile gereksiz render'ların önlenmesi
- Lazy loading ile komponent yüklemesi
- Debouncing ile arama optimizasyonu
- Virtual scrolling ile büyük listeler

### Backend Optimizasyonları

- Database indexing
- Query optimization
- Connection pooling
- Caching strategies

## 🐛 Hata Ayıklama

### Yaygın Sorunlar

1. **Socket bağlantı sorunu**: Port çakışması kontrolü
2. **Veritabanı bağlantısı**: CONNECTION_URL kontrolü
3. **Şifreleme hataları**: Crypto-JS sürüm uyumluluğu
4. **Session sorunları**: Cookie ayarları kontrolü

### Log Takibi

```bash
# Socket.io logları
DEBUG=socket.io* npm run dev

# Prisma sorgu logları
DATABASE_LOG_LEVEL=info npm run dev
```

## 🔄 Migrasyon Durumu

Bu proje şu anda **Iron Session**'dan **Better Auth**'a migrasyon sürecindedir:

### ✅ Tamamlanan

- Better Auth paket kurulumu
- Prisma şeması güncellemesi
- Kullanıcı arayüzü güncellemeleri
- API endpoint'leri hazırlığı

### 🔄 Devam Eden

- Better Auth server yapılandırması
- Auth client entegrasyonu
- Session migration
- Ortam değişkenleri güncellemesi

### 📋 Yapılacaklar

- Iron Session kaldırılması
- Final testler
- Dokümantasyon güncellemesi

## 🤝 Katkıda Bulunma

1. Projeyi fork'layın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit'leyin (`git commit -m 'Add amazing feature'`)
4. Branch'i push'layın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakın.

## 🙏 Teşekkürler

- Next.js ekibine framework için
- Socket.io geliştiricilerine gerçek zamanlı iletişim için
- Prisma ekibine modern ORM için
- Better Auth geliştiricilerine güvenli kimlik doğrulama için

## 📞 İletişim

Sorularınız için [issues](./issues) bölümünü kullanabilirsiniz.

---

⚡ **Realtime Chat** - Modern, güvenli ve hızlı sohbet deneyimi!
