#!/usr/bin/env python3
"""Troy KMP fiyat listesini (.md) products.json'a otomatik uygular.

Kullanım:
  python3 update_prices.py "Troy KMP FL_v5.1 10.09.2026.md"                 # önizleme, dosyaya yazmaz
  python3 update_prices.py "Troy KMP FL_v5.1 10.09.2026.md" --apply         # products.json'u günceller
  python3 update_prices.py "Troy KMP FL_v5.1 10.09.2026.md" --apply --push  # + git commit & push

Kurallar:
- Baz fiyat "Kampanyalı Peşin Fiyatı" sütunudur (etikete basılan fiyat).
- Mevcut ürün: yalnızca fiyat değiştiyse `price` ve `priceUpdatedAt` güncellenir.
  model/brand/category'ye dokunulmaz (ör. Beats ürünlerinin Türkçe adları korunur).
- Yeni ürün: listedeki komşusunun hemen arkasına eklenir; marka ve kategori otomatik
  belirlenir, `priceUpdatedAt` eklenir.
- Listede olmayan ürünler SİLİNMEZ (Momax, Piili vb. zaten bu listede yok).
- Aynı liste tekrar çalıştırılırsa hiçbir şey değişmez.
"""
import argparse
import json
import re
import subprocess
import sys
from collections import Counter
from pathlib import Path

from normalize_categories import classify

ROOT = Path(__file__).resolve().parent
PRODUCTS = ROOT / "products.json"

COL_CODE = "Ürün Kodu"
COL_MODEL = "Açıklama / Model"
COL_PRICE = "Kampanyalı Peşin Fiyatı"

# Listeden bu kadardan az ürün okunursa dosya bozuk/format değişmiş sayılır.
MIN_ROWS = 100


def parse_price(cell: str):
    digits = cell.replace("TL", "").replace("₺", "").replace(".", "").strip()
    return digits if digits.isdigit() and int(digits) > 0 else None


def parse_date(text: str, filename: str):
    m = re.search(r"Geçerli olmaya başladığı tarih:\s*(\d{2})\.(\d{2})\.(\d{4})", text)
    if not m:
        m = re.search(r"(\d{2})\.(\d{2})\.(\d{4})", filename)
    if not m:
        return None
    day, month, year = m.groups()
    return f"{year}-{month}-{day}"


def split_row(line: str):
    return [c.strip() for c in line.strip().strip("|").split("|")]


def parse_list(path: Path):
    """Markdown tablolarını okur → [(kod, model, fiyat)], uyarılar."""
    rows, warnings = [], []
    cols = None
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line.startswith("|"):
            continue
        cells = split_row(line)
        if COL_CODE in cells:  # başlık satırı (her sayfada tekrar eder)
            cols = {name: i for i, name in enumerate(cells)}
            missing = [c for c in (COL_CODE, COL_MODEL, COL_PRICE) if c not in cols]
            if missing:
                sys.exit(f"HATA: tablo başlığında sütun yok: {missing}")
            continue
        if cols is None or set("".join(cells)) <= set(":- "):  # ayraç satırı
            continue
        code = cells[cols[COL_CODE]].strip("`").strip()
        model = cells[cols[COL_MODEL]]
        price = parse_price(cells[cols[COL_PRICE]])
        if not code:
            continue
        if price is None:
            warnings.append(f"fiyat okunamadı, atlandı: {code} {model} [{cells[cols[COL_PRICE]]}]")
            continue
        rows.append((code, model, price))
    return rows, warnings


def detect_brand(model: str) -> str:
    if model.lower().startswith(("beats", "powerbeats")):
        return "Beats"
    return "Apple"


def detect_category(brand: str, model: str) -> str:
    # "AirPods 5 with Wireless Charging Case" bir cihazdır; "case" kelimesi aksesuar sanılmasın.
    if re.match(r"airpods\b.*\bwith\b.*charging case", model.lower()):
        return "AirPods"
    return classify({"brand": brand, "model": model})


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("price_list", type=Path, help="Troy KMP fiyat listesi (.md)")
    ap.add_argument("--apply", action="store_true", help="products.json'a yaz")
    ap.add_argument("--push", action="store_true", help="--apply sonrası git commit & push")
    ap.add_argument("--date", help="priceUpdatedAt tarihi (YYYY-MM-DD); varsayılan listeden okunur")
    ap.add_argument("-v", "--verbose", action="store_true", help="tüm değişiklikleri listele")
    args = ap.parse_args()
    if args.push and not args.apply:
        ap.error("--push için --apply da gerekli")

    text = args.price_list.read_text(encoding="utf-8")
    date = args.date or parse_date(text, args.price_list.name)
    if not date or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", date):
        sys.exit("HATA: liste tarihi bulunamadı; --date YYYY-MM-DD verin.")

    rows, warnings = parse_list(args.price_list)
    if len(rows) < MIN_ROWS:
        sys.exit(f"HATA: listeden yalnızca {len(rows)} ürün okundu; format değişmiş olabilir.")

    # Aynı kod listede birden fazla geçerse ilki geçerli.
    seen = {}
    for code, model, price in rows:
        if code in seen:
            if seen[code][1] != price:
                warnings.append(f"çift kod, farklı fiyat (ilki kullanıldı): {code} {seen[code][1]} / {price}")
            continue
        seen[code] = (model, price)

    products = json.loads(PRODUCTS.read_text(encoding="utf-8"))
    by_id = {p["id"]: p for p in products}

    changed, added = [], []
    insert_after = {}  # mevcut ürün id → arkasına eklenecek yeni ürünler (liste sırasıyla)
    anchor = None
    for code, (model, price) in seen.items():
        p = by_id.get(code)
        if p is not None:
            anchor = code
            if p["price"] != price:
                changed.append((p, p["price"], price))
                p["price"] = price
                p["priceUpdatedAt"] = date
            continue
        brand = detect_brand(model)
        new = {
            "id": code,
            "barcode": code,
            "brand": brand,
            "model": model,
            "price": price,
            "concept": "APR",
            "category": detect_category(brand, model),
            "priceUpdatedAt": date,
        }
        added.append(new)
        insert_after.setdefault(anchor, []).append(new)

    result = list(insert_after.get(None, []))
    for p in products:
        result.append(p)
        result.extend(insert_after.get(p["id"], []))

    missing = [p for p in products if p["brand"] in ("Apple", "Beats") and p["id"] not in seen]

    # --- Rapor ---
    up = sum(1 for _, old, new in changed if int(new) > int(old))
    print(f"Liste: {args.price_list.name}  |  tarih: {date}  |  okunan ürün: {len(seen)}")
    print(f"Fiyatı değişen: {len(changed)} (artan {up}, düşen {len(changed) - up})")
    print(f"Yeni ürün:      {len(added)}  {dict(Counter(n['category'] for n in added))}")
    print(f"Listede olmayan Apple/Beats ürünü (dokunulmadı): {len(missing)}")
    limit = None if args.verbose else 10

    def tl(price):
        return f"{int(price):,}".replace(",", ".")

    if changed:
        print("\n-- Fiyat değişiklikleri --")
        for p, old, new in changed[:limit]:
            print(f"  {p['id']:<11} {tl(old):>8} → {tl(new):>8}  {p['model'][:70]}")
    if added:
        print("\n-- Yeni ürünler --")
        for n in added[:limit]:
            print(f"  {n['id']:<11} {tl(n['price']):>8}  [{n['category']}/{n['brand']}] {n['model'][:70]}")
    if not args.verbose and (len(changed) > 10 or len(added) > 10):
        print("  ... (tamamı için -v)")
    for w in warnings:
        print(f"UYARI: {w}")

    if not args.apply:
        print("\nÖnizleme — products.json değişmedi. Uygulamak için --apply ekleyin.")
        return
    if not changed and not added:
        print("\nDeğişiklik yok.")
        return

    PRODUCTS.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"\nproducts.json yazıldı: {len(products)} → {len(result)} ürün")

    if args.push:
        msg = (f"Fiyat listesi {args.price_list.stem}: "
               f"{len(changed)} fiyat güncelle, {len(added)} yeni ürün ekle")
        subprocess.run(["git", "add", "products.json"], cwd=ROOT, check=True)
        subprocess.run(["git", "commit", "-m", msg], cwd=ROOT, check=True)
        subprocess.run(["git", "push"], cwd=ROOT, check=True)
        print("GitHub'a gönderildi.")


if __name__ == "__main__":
    main()
