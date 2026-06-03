#!/usr/bin/env python3
"""Tek seferlik: products.json kategori alanını 6 temiz değere normalize eder.
Değerler: iPhone, iPad, Mac, Watch, AirPods, Aksesuar
brand/model/price/barcode/id alanlarına dokunmaz."""
import json
from collections import Counter

PATH = "products.json"

# Not: "glass" tek başına KULLANILMAZ — gerçek iPad Pro modelleri "standard glass" /
# "nano-texture glass" içeriyor. "band"/"case" tek başına Apple Watch cihazlarında geçiyor;
# bu yüzden "Apple Watch" cihaz kontrolü classify() içinde EN ÖNCE yapılır.
ACC_KEYWORDS = [
    "kılıf", "kilif", "case", "koruyucu", "silicone", "clear case", "techwoven",
    "aramid", "kevlar", "ekran kor", "screen protector", "screen prot",
    "kablo", "cable", "adaptör", "adapter", "şarj", "charger", "powerbank",
    "power bank", "güç adaptörü", "kordon", "band", "loop", "kayış",
    "çanta", " bag", "sleeve", "stand", "tutucu", "pencil", "kalem",
    "klavye", "keyboard", "hoparlör", "speaker", "kulaklık", "kulaklik",
    "mouse", " hub", " dock", "dönüştürücü", "magsafe", "bracelet",
    "magnetic link", "modern buckle", "crossbody", "strap", "key ring",
    "polishing cloth", "card reader", "finewoven", "folio", "smart cover",
]


def is_accessory_kw(model: str) -> bool:
    m = model.lower()
    return any(k in m for k in ACC_KEYWORDS)


def main_device(model: str):
    m = model.lower()
    if "iphone" in m:
        return "iPhone"
    if "ipad" in m:
        return "iPad"
    if any(x in m for x in ["macbook", "imac", "mac mini", "mac studio", "mac pro"]):
        return "Mac"
    if "watch" in m:
        return "Watch"
    if "airpods" in m:
        return "AirPods"
    return None


def classify(p) -> str:
    brand = (p.get("brand") or "").strip().lower()
    model = p.get("model") or ""
    m = model.lower()
    # 1) Apple Watch CİHAZI: gerçek saatler daima "... Case with ... Band/Loop" kalıbındadır.
    #    Bağımsız kordon/kablo/3.parti kılıf ("Apple Watch ... Band/Kılıf/Cable") "case with"
    #    içermez → aşağıda Aksesuar olarak sınıflanır.
    if "apple watch" in m and "case with" in m:
        return "Watch"
    # 2) Apple-dışı marka → Aksesuar (Momax, Piili, Buff, JBL, Thule, Beats...)
    if brand != "apple":
        return "Aksesuar"
    # 3) Aksesuar anahtar kelimesi
    if is_accessory_kw(model):
        return "Aksesuar"
    # 4) Apple ana cihaz
    dev = main_device(model)
    if dev:
        return dev
    # 5) güvenli varsayılan
    return "Aksesuar"


def run():
    with open(PATH, encoding="utf-8") as f:
        data = json.load(f)

    before = Counter(p.get("category", "?") for p in data)
    changed = 0
    for p in data:
        new_cat = classify(p)
        if p.get("category") != new_cat:
            changed += 1
        p["category"] = new_cat

    after = Counter(p["category"] for p in data)

    with open(PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"Toplam ürün: {len(data)}  | değişen kategori: {changed}")
    print("--- Yeni dağılım ---")
    for k, v in after.most_common():
        print(f"{v:5d}  {k}")
    print(f"--- Önceki farklı kategori sayısı: {len(before)} ---")


if __name__ == "__main__":
    run()
