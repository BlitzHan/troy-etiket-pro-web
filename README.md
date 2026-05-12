# Troy Etiket Pro

Online Troy/APR etiket hazırlama aracı.

## Web sürümü

Bu sürüm statik çalışır; sunucu, veritabanı veya kurulum gerektirmez. `index.html`, `styles.css` ve `app.js` dosyaları doğrudan GitHub Pages, Netlify veya Vercel üzerinde yayınlanabilir.

Yerelde çalıştırmak için:

```bash
python3 -m http.server 8000
```

Ardından tarayıcıda `http://localhost:8000` adresini açın.

## Yayına alma

GitHub Pages için:

1. Repo ayarlarında `Pages` bölümüne girin.
2. `Build and deployment` kaynağını `Deploy from a branch` seçin.
3. Branch olarak `main`, klasör olarak `/root` seçin.
4. Kaydedin.

Site adresi birkaç dakika içinde şu formatta açılır:

```text
https://blitzhan.github.io/troy-etiket-pro-web/
```

## Özellikler

- Model, marka, fiyat, adet ve tarih girişi
- Apple ürün adları için otomatik yazım düzeltme
- Fiyatı Türkçe binlik ayırıcıyla biçimlendirme
- A4 üzerinde 3 sütun x 9 satır, sayfa başına 27 etiket
- Tarayıcıdan PDF olarak kaydetme veya yazdırma
- Etiketleri tarayıcıda otomatik saklama
- JSON dışa/içe aktarma
