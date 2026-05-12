const storageKey = "troy-etiket-pro-items";
const formatter = new Intl.NumberFormat("tr-TR");

const form = document.querySelector("#labelForm");
const modelInput = document.querySelector("#modelInput");
const brandInput = document.querySelector("#brandInput");
const priceInput = document.querySelector("#priceInput");
const quantityInput = document.querySelector("#quantityInput");
const dateInput = document.querySelector("#dateInput");
const resetFormButton = document.querySelector("#resetFormButton");
const previewGrid = document.querySelector("#previewGrid");
const printArea = document.querySelector("#printArea");
const emptyState = document.querySelector("#emptyState");
const countBadge = document.querySelector("#countBadge");
const printButton = document.querySelector("#printButton");
const clearButton = document.querySelector("#clearButton");
const sampleButton = document.querySelector("#sampleButton");
const exportButton = document.querySelector("#exportButton");
const importInput = document.querySelector("#importInput");
const labelTemplate = document.querySelector("#labelTemplate");

let items = loadItems();
let userEditedBrand = false;

function todayForInput() {
  return new Date().toISOString().slice(0, 10);
}

function formatDisplayDate(value) {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}.${month}.${year}`;
}

function capitalizeProductText(value) {
  const specialCases = new Map([
    ["iphone", "iPhone"],
    ["ipad", "iPad"],
    ["imac", "iMac"],
    ["macbook", "MacBook"],
    ["ipod", "iPod"],
    ["ios", "iOS"],
    ["macos", "macOS"],
    ["airpods", "AirPods"],
    ["airtag", "AirTag"],
    ["usb-c", "USB-C"],
    ["usb", "USB"],
    ["wi-fi", "Wi-Fi"],
  ]);

  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      const key = word.toLocaleLowerCase("tr-TR");
      if (specialCases.has(key)) return specialCases.get(key);
      return word.charAt(0).toLocaleUpperCase("tr-TR") + word.slice(1);
    })
    .join(" ");
}

function formatPrice(value) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return formatter.format(Number(digits));
}

function createId() {
  return crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
}

function loadItems() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
    return Array.isArray(stored) ? stored.filter(isValidItem) : [];
  } catch {
    return [];
  }
}

function isValidItem(item) {
  return item && item.brand && item.model && item.price && item.date;
}

function saveItems() {
  localStorage.setItem(storageKey, JSON.stringify(items));
}

function fillLabel(node, item) {
  node.querySelector(".label-brand").textContent = item.brand;
  node.querySelector(".label-model").textContent = item.model;
  node.querySelector(".label-price").textContent = `${item.price} TL`;
  node.querySelector(".label-date").textContent = item.date;
}

function buildLabel(item) {
  const fragment = labelTemplate.content.cloneNode(true);
  const card = fragment.querySelector(".label-card");
  card.dataset.id = item.id;
  fillLabel(card, item);
  return card;
}

function renderPreview() {
  previewGrid.replaceChildren();

  for (const item of items) {
    previewGrid.append(buildLabel(item));
  }

  countBadge.textContent = items.length;
  emptyState.hidden = items.length > 0;
  clearButton.disabled = items.length === 0;
  printButton.disabled = items.length === 0;
  exportButton.disabled = items.length === 0;
}

function renderPrintArea() {
  printArea.replaceChildren();

  for (let pageStart = 0; pageStart < items.length; pageStart += 27) {
    const pageItems = items.slice(pageStart, pageStart + 27);
    const page = document.createElement("div");
    page.className = "print-page";

    const grid = document.createElement("div");
    grid.className = "print-grid";

    for (let index = 0; index < 27; index += 1) {
      const item = pageItems[index];
      if (item) {
        const visual = labelTemplate.content.querySelector(".label-visual").cloneNode(true);
        fillLabel(visual, item);
        grid.append(visual);
      } else {
        const placeholder = document.createElement("div");
        placeholder.className = "print-placeholder";
        grid.append(placeholder);
      }
    }

    page.append(grid);
    printArea.append(page);
  }
}

function resetForm() {
  form.reset();
  dateInput.value = todayForInput();
  quantityInput.value = "1";
  userEditedBrand = false;
  modelInput.focus();
}

function addItemsFromForm(event) {
  event.preventDefault();

  const brand = brandInput.value.trim();
  const model = modelInput.value.trim();
  const price = priceInput.value.trim();
  const date = formatDisplayDate(dateInput.value || todayForInput());
  const quantity = Math.max(1, Math.min(100, Number(quantityInput.value) || 1));

  if (!brand || !model || !price) return;

  const newItems = Array.from({ length: quantity }, () => ({
    id: createId(),
    brand,
    model,
    price,
    date,
  }));

  items = [...items, ...newItems];
  saveItems();
  renderPreview();
  resetForm();
}

function duplicateItem(id) {
  const item = items.find((candidate) => candidate.id === id);
  if (!item) return;
  items = [...items, { ...item, id: createId() }];
  saveItems();
  renderPreview();
}

function removeItem(id) {
  items = items.filter((item) => item.id !== id);
  saveItems();
  renderPreview();
}

function exportJson() {
  const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `troy-etiketler-${todayForInput()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

async function importJson(file) {
  if (!file) return;

  try {
    const imported = JSON.parse(await file.text());
    if (!Array.isArray(imported)) throw new Error("JSON liste formatında değil.");

    const normalized = imported
      .filter(isValidItem)
      .map((item) => ({
        id: item.id || createId(),
        brand: String(item.brand).trim(),
        model: String(item.model).trim(),
        price: formatPrice(String(item.price)),
        date: String(item.date).trim(),
      }));

    items = [...items, ...normalized];
    saveItems();
    renderPreview();
  } catch (error) {
    alert(`JSON yüklenemedi: ${error.message}`);
  } finally {
    importInput.value = "";
  }
}

modelInput.addEventListener("input", () => {
  const endsWithSpace = /\s$/.test(modelInput.value);
  const formatted = capitalizeProductText(modelInput.value);
  modelInput.value = endsWithSpace && formatted ? `${formatted} ` : formatted;

  if (!userEditedBrand) {
    brandInput.value = modelInput.value.split(/\s+/).filter(Boolean)[0] || "";
  }
});

brandInput.addEventListener("input", () => {
  userEditedBrand = true;
});

priceInput.addEventListener("input", () => {
  priceInput.value = formatPrice(priceInput.value);
});

quantityInput.addEventListener("input", () => {
  const digits = quantityInput.value.replace(/\D/g, "");
  if (!digits) {
    quantityInput.value = "";
    return;
  }
  quantityInput.value = String(Math.max(1, Math.min(100, Number(digits))));
});

form.addEventListener("submit", addItemsFromForm);
resetFormButton.addEventListener("click", resetForm);

previewGrid.addEventListener("click", (event) => {
  const card = event.target.closest(".label-card");
  if (!card) return;

  if (event.target.closest(".duplicate-item")) duplicateItem(card.dataset.id);
  if (event.target.closest(".remove-item")) removeItem(card.dataset.id);
});

clearButton.addEventListener("click", () => {
  if (!items.length) return;
  if (!confirm("Tüm etiketleri temizlemek istiyor musun?")) return;
  items = [];
  saveItems();
  renderPreview();
});

printButton.addEventListener("click", () => {
  renderPrintArea();
  window.print();
});

window.addEventListener("beforeprint", renderPrintArea);

sampleButton.addEventListener("click", () => {
  items = [
    ...items,
    {
      id: createId(),
      brand: "Apple",
      model: "20 W USB-C Güç Adaptörü",
      price: "779",
      date: formatDisplayDate(dateInput.value || todayForInput()),
    },
  ];
  saveItems();
  renderPreview();
});

exportButton.addEventListener("click", exportJson);
importInput.addEventListener("change", () => importJson(importInput.files[0]));

dateInput.value = todayForInput();
renderPreview();
