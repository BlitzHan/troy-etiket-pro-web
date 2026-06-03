# Yönetici Kullanım Kılavuzu & Veri Akışı

Bu kılavuz, **Troy Etiket Pro** uygulamasının güncel çalışma mantığını ve fiyat/ürün
güncelleme akışını açıklar.

---

## 🔐 1. Giriş Güvenliği
Uygulama, yetkisiz erişimi engellemek için site giriş şifresiyle korunur.
- **Giriş şifreleri**: `2808` veya `0828` (kod: `SITE_PASSCODES`, `app.js`).
- Şifre doğrulandıktan sonra tarayıcı sekmesi açık kaldığı sürece tekrar sorulmaz.

> Not: Eski "Fiyatları Yönet (Veritabanı)" paneli, Excel yükleme ve tarayıcı-içi fiyat
> düzenleme **kaldırıldı**. Bunun nedeni güvenlikti: o panel ile siteye giren herkes
> veritabanını değiştirebiliyordu. Artık fiyat/ürün değişiklikleri yalnızca koddan yapılır.

---

## 💾 2. Veritabanı (`products.json`)
Tüm ürünler tek bir `products.json` dosyasında tutulur. Her ürün şu alanları taşır:

| Alan | Açıklama | Örnek |
| :--- | :--- | :--- |
| `id` / `barcode` | Ürün kodu | `MHFA4TU/A` |
| `brand` | Marka | `Apple`, `Momax`, `Buff` |
| `model` | Ürün açıklaması | `iPhone 17 256GB Black` |
| `price` | Fiyat (sadece rakam, KDV dahil) | `89999` |
| `concept` | Mağaza konsepti | `APP` |
| `category` | Kategori (6 değerden biri) | `iPhone` |
| `priceUpdatedAt` | (opsiyonel) Fiyatın güncellendiği tarih | `2026-06-03` |

### Kategoriler (yalnızca 6 değer)
`iPhone`, `iPad`, `Mac`, `Watch`, `AirPods`, `Aksesuar`.

Kategoriler `normalize_categories.py` betiğiyle bu 6 değere indirildi. Aksesuarlar arayüzde,
çalışma anında (`app.js` → `classifyAccessory`) ana cihaza (`accFor`) ve türe (`accType`) göre
otomatik gruplanır; bu alanlar `products.json`'a yazılmaz.

---

## 🔄 3. Fiyat / Ürün Güncelleme Akışı
Değişiklikler doğrudan koddan yapılır:
1. Yapılacak değişikliği (fiyat, yeni ürün, kategori vb.) asistana bildirin.
2. Asistan `products.json` dosyasını günceller.
3. **Fiyatı değişen ürünlere `priceUpdatedAt: "YYYY-MM-DD"` alanı eklenir** (o günün tarihi).
4. Değişiklikler Git ile push'lanır; siteye giren herkes güncel veriyi görür.

---

## 🆕 4. "Yeni Fiyatlar" Kategorisi
Otomatik mod sol menüsündeki **🆕 Yeni Fiyatlar** filtresi, katalogdaki **en güncel**
`priceUpdatedAt` tarihine sahip ürünleri toplu listeler. Böylece hangi ürünlerin değiştiğini
tek tek aramadan görüp, adetleri seçip çıktıyı tek seferde hazırlayabilirsiniz.

> Mantık: tüm ürünler içindeki en yeni `priceUpdatedAt` bulunur; yalnızca o tarihe eşit
> olan ürünler gösterilir (`app.js` → `getLatestPriceUpdateDate` + `renderCatalog`).

---

## 🖨️ 5. Baskı (A4)
Etiketler 3 sütun × 9 satır = sayfa başına 27 etiket olarak A4'e basılır. Düz A4'e basıp elle
kesim için, yazıcının basamadığı kenar alanına denk gelmesin diye sayfaya garantili üst/yan
boşluk bırakılır (grid üstten hizalı — `styles.css` → `.print-page` / `.print-grid`).
Tarayıcı yazdırma penceresinde kenar boşluğu "Yok/None", ölçek %100 önerilir.
