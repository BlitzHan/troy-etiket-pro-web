# Yönetici Kullanım Kılavuzu & Güncelleme Detayları

Bu kılavuz, **Troy Etiket Pro** uygulamasının yeni şifre korumalı veritabanı yönetim modunu ve Excel entegrasyonunu nasıl kullanacağınızı açıklar.

---

## 🔐 1. Yönetici Girişi (Şifre Koruması)
Uygulama artık yetkisiz kişilerin fiyatları ve ürünleri değiştirmesini engellemek için şifre korumalıdır.
- **Yönetim Butonu**: Otomatik Etiket Modu sol panelindeki **⚙️ Fiyatları Yönet (Veritabanı)** butonuyla açılır.
- **Varsayılan Giriş Şifresi**: `troy123`
- Şifrenizi doğruladıktan sonra tarayıcı sekmesini kapatmadığınız sürece panel açık kalır ve tekrar şifre girmeniz gerekmez.

---

## 📥 2. Excel ile Toplu Ürün Yükleme / Güncelleme
Elinizdeki toplu ürün listelerini tek tek girmek yerine Excel dosyasından (`.xlsx` veya `.xls`) sisteme aktarabilirsiniz.

### Excel Kolon Formatı:
Sistem Excel başlıklarını akıllıca eşleştirir. Aşağıdaki başlıklardan herhangi birini kullanabilirsiniz:

| Kolon Amacı | Excel Başlığı Seçenekleri (Büyük/Küçük Harf Fark Etmez) | Örnek Veri |
| :--- | :--- | :--- |
| **Kategori** | `Kategori`, `Category`, `Tür`, `Tur` | iPhone, iPad, Aksesuar |
| **Marka** | `Marka`, `Brand`, `Üretici` | Apple |
| **Model / Adı** | `Model`, `Açıklama`, `Ürün Adı`, `Açiklama` | iPhone 15 Pro Max 256 GB |
| **Fiyat** | `Fiyat`, `Price`, `Tutar`, `Fiyatı` | 89999 veya 89.999 |

*Örnek Excel yapısı:*
| Kategori | Marka | Model | Fiyat |
| :--- | :--- | :--- | :--- |
| iPhone | Apple | iPhone 15 Pro Max 256 GB | 89999 |
| Aksesuar | Apple | 20 W USB-C Güç Adaptörü | 779 |

### Excel Yükleme Kuralları:
1. **Fiyat Güncelleme**: Excel'deki ürünün model adı veritabanında zaten varsa, fiyatı Excel'deki yeni fiyatla güncellenir.
2. **Yeni Ürün Ekleme**: Model adı veritabanında yoksa, bu ürün kataloğa yeni ürün olarak eklenir.

---

## 💾 3. Değişiklikleri Kalıcı Hale Getirme (Workflow)
Sistem tamamen tarayıcı tabanlı çalıştığı için Excel yüklediğinizde veya fiyatları elle düzenlediğinizde bu değişiklikler geçici olarak sizin tarayıcınızda (`localStorage`) saklanır. 

**Tüm kullanıcıların yeni fiyatları görmesi için izlenmesi gereken adımlar:**
1. Excel dosyanızı yükleyin veya fiyatları düzenleyin.
2. Veritabanı panelindeki **JSON İndir** butonuna tıklayın. Bu işlem size güncel verileri içeren bir `products.json` dosyası indirir.
3. İndirdiğiniz bu yeni `products.json` dosyasını, projenin ana klasöründeki eski `products.json` dosyasıyla değiştirin.
4. Değişiklikleri Git ile pushlayın.
5. Siteye giren herkes artık sizin güncellediğiniz yeni fiyatları ve ürünleri görecektir.

*Not: Eğer tüm yerel değişiklikleri silip sunucudaki orijinal veritabanına dönmek isterseniz **Varsayılana Sıfırla** butonunu kullanabilirsiniz.*
