const storageKey = "troy-etiket-pro-items";
const formatter = new Intl.NumberFormat("tr-TR");

// Manual Mode Elements
const form = document.querySelector("#labelForm");
const modelInput = document.querySelector("#modelInput");
const brandInput = document.querySelector("#brandInput");
const priceInput = document.querySelector("#priceInput");
const quantityInput = document.querySelector("#quantityInput");
const dateInput = document.querySelector("#dateInput");
const conceptInput = document.querySelector("#conceptInput");
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

// Welcome Screen & Navigation Elements
const welcomeScreen = document.querySelector("#welcomeScreen");
const manualShell = document.querySelector("#manualShell");
const autoShell = document.querySelector("#autoShell");
const btnSelectManual = document.querySelector("#btnSelectManual");
const btnSelectAuto = document.querySelector("#btnSelectAuto");
const btnManualBackHome = document.querySelector("#btnManualBackHome");
const btnAutoBackHome = document.querySelector("#btnAutoBackHome");

// Automatic Mode Elements
const catalogGrid = document.querySelector("#catalogGrid");
const catalogSearch = document.querySelector("#catalogSearch");
const categoryMenu = document.querySelector("#categoryMenu");
const autoConceptInput = document.querySelector("#autoConceptInput");
const autoDateInput = document.querySelector("#autoDateInput");
const autoCountBadge = document.querySelector("#autoCountBadge");
const autoClearButton = document.querySelector("#autoClearButton");
const autoPrintButton = document.querySelector("#autoPrintButton");

// Database Modal Elements
const dbModal = document.querySelector("#dbModal");
const btnOpenDbModal = document.querySelector("#btnOpenDbModal");
const btnCloseDbModal = document.querySelector("#btnCloseDbModal");
const dbSearch = document.querySelector("#dbSearch");
const btnResetDb = document.querySelector("#btnResetDb");
const btnExportDb = document.querySelector("#btnExportDb");
const dbTableBody = document.querySelector("#dbTableBody");

// Passcode Modal Elements
const passcodeModal = document.querySelector("#passcodeModal");
const btnClosePasscodeModal = document.querySelector("#btnClosePasscodeModal");
const passcodeForm = document.querySelector("#passcodeForm");
const passcodeInput = document.querySelector("#passcodeInput");
const passcodeError = document.querySelector("#passcodeError");

// Excel Input
const excelImportInput = document.querySelector("#excelImportInput");
const loadMoreContainer = document.querySelector("#catalogLoadMoreContainer");

// State Variables
let items = loadItems();
let userEditedBrand = false;

let currentScreen = "welcome"; // "welcome", "manual", "automatic"
let catalogProducts = []; // Loaded from products.json
const overridesStorageKey = "troy-etiket-catalog-overrides";
const catalogStorageKey = "troy-etiket-custom-catalog";
const ADMIN_PASSCODE = "troy123";

let catalogOverrides = loadCatalogOverrides(); // { productId: newPriceString }
let selectedQuantities = {}; // { productId: quantity }
let activeCategoryFilter = "all";
let catalogVisibleLimit = 12;

const subcategoryRules = {
  // iPhone Subcategories
  "iphone-all": (p) => p.category === "iPhone",
  "iphone-17": (p) => p.category === "iPhone" && p.model.toLowerCase().includes("iphone 17"),
  "iphone-16": (p) => p.category === "iPhone" && p.model.toLowerCase().includes("iphone 16"),
  "iphone-15": (p) => p.category === "iPhone" && p.model.toLowerCase().includes("iphone 15"),

  // iPad Subcategories
  "ipad-all": (p) => p.category === "iPad",
  "ipad-pro": (p) => p.category === "iPad" && p.model.toLowerCase().includes("ipad pro"),
  "ipad-air": (p) => p.category === "iPad" && p.model.toLowerCase().includes("ipad air"),
  "ipad-standard": (p) => p.category === "iPad" && !p.model.toLowerCase().includes("ipad pro") && !p.model.toLowerCase().includes("ipad air"),

  // Mac Subcategories
  "mac-all": (p) => p.category === "Mac",
  "mac-pro": (p) => p.category === "Mac" && p.model.toLowerCase().includes("macbook pro"),
  "mac-air": (p) => p.category === "Mac" && p.model.toLowerCase().includes("macbook air"),
  "mac-desktop": (p) => p.category === "Mac" && (p.model.toLowerCase().includes("mini") || p.model.toLowerCase().includes("studio") || p.model.toLowerCase().includes("imac")),

  // Watch Subcategories
  "watch-all": (p) => p.category === "Watch",
  "watch-ultra": (p) => p.category === "Watch" && p.model.toLowerCase().includes("ultra"),
  "watch-s11": (p) => p.category === "Watch" && p.model.toLowerCase().includes("series 11"),
  "watch-s9-se": (p) => p.category === "Watch" && (p.model.toLowerCase().includes("series 9") || p.model.toLowerCase().includes("se")),

  // AirPods Subcategories
  "airpods-all": (p) => p.category === "AirPods" || p.model.toLowerCase().includes("airpods"),

  // Aksesuar Subcategories
  "acc-all": (p) => p.category === "Aksesuar",
  "acc-cable-adapter": (p) => {
    const m = p.model.toLowerCase();
    return m.includes("kablo") || m.includes("cable") || m.includes("adaptör") || m.includes("adapter") || m.includes("charger") || m.includes("şarj") || m.includes("power adapter") || m.includes("güç adaptörü");
  },
  "acc-case": (p) => {
    const m = p.model.toLowerCase();
    return m.includes("kılıf") || m.includes("kilif") || m.includes("case") || m.includes("sleeve") || m.includes("koruyucu");
  },
  "acc-headphones": (p) => {
    const m = p.model.toLowerCase();
    return p.category === "AirPods" || m.includes("airpods") || m.includes("kulaklık") || m.includes("kulaklik") || m.includes("earpods") || m.includes("beats");
  },
  "acc-ipad": (p) => {
    const m = p.model.toLowerCase();
    return m.includes("pencil") || m.includes("keyboard") || m.includes("klavye") || m.includes("ipad") || m.includes("kalem");
  },
  "acc-iphone": (p) => {
    const m = p.model.toLowerCase();
    return m.includes("iphone") || m.includes("kablo") || m.includes("adaptör") || m.includes("kilif") || m.includes("kılıf") || m.includes("magsafe");
  },
  "acc-watch": (p) => {
    const m = p.model.toLowerCase();
    return m.includes("watch") || m.includes("band") || m.includes("kayış") || m.includes("kordon") || m.includes("loop") || m.includes("şarj") || m.includes("charger");
  }
};

// Shared Helpers
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
  const digits = String(value).replace(/\D/g, "");
  if (!digits) return "";
  return formatter.format(Number(digits));
}

function createId() {
  return crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
}

// Manual Mode logic
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
  node.querySelector(".label-artwork").src = `${item.concept || "APR"}.png`;
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

// Shared print area renderer (handles both manual items and auto items)
function renderPrintArea() {
  printArea.replaceChildren();
  
  const printItems = currentScreen === "automatic" ? getAutoPrintItems() : items;

  for (let pageStart = 0; pageStart < printItems.length; pageStart += 27) {
    const pageItems = printItems.slice(pageStart, pageStart + 27);
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
  const concept = conceptInput.value;
  const quantity = Math.max(1, Math.min(100, Number(quantityInput.value) || 1));

  if (!brand || !model || !price) return;

  const newItems = Array.from({ length: quantity }, () => ({
    id: createId(),
    brand,
    model,
    price,
    date,
    concept,
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
        concept: item.concept || "APR",
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

// Navigation & Routing Logic
function applyRouting() {
  const hash = window.location.hash;
  if (hash === "#manual") {
    currentScreen = "manual";
    welcomeScreen.hidden = true;
    manualShell.removeAttribute("hidden");
    autoShell.hidden = true;
  } else if (hash === "#automatic") {
    currentScreen = "automatic";
    welcomeScreen.hidden = true;
    manualShell.hidden = true;
    autoShell.removeAttribute("hidden");
    catalogVisibleLimit = 12;
    if (catalogProducts.length === 0) {
      loadCatalog();
    } else {
      renderCatalog();
    }
  } else {
    currentScreen = "welcome";
    welcomeScreen.hidden = false;
    manualShell.hidden = true;
    autoShell.hidden = true;
  }
}

// Catalog Database Overrides
function loadCatalogOverrides() {
  try {
    return JSON.parse(localStorage.getItem(overridesStorageKey) || "{}");
  } catch {
    return {};
  }
}

function saveCatalogOverrides() {
  localStorage.setItem(overridesStorageKey, JSON.stringify(catalogOverrides));
}

const customAddedStorageKey = "troy-etiket-custom-added-products";

function loadCustomAddedProducts() {
  try {
    return JSON.parse(localStorage.getItem(customAddedStorageKey) || "[]");
  } catch {
    return [];
  }
}

function saveCustomAddedProducts(products) {
  localStorage.setItem(customAddedStorageKey, JSON.stringify(products));
}

function applyOverridesToCatalog() {
  for (const product of catalogProducts) {
    if (product.originalPrice === undefined) {
      product.originalPrice = product.price;
    }
    if (catalogOverrides[product.id] !== undefined) {
      product.price = catalogOverrides[product.id];
    } else {
      product.price = product.originalPrice;
    }
  }
}

// Load Catalog JSON
async function loadCatalog() {
  try {
    const response = await fetch("products.json");
    if (!response.ok) throw new Error("Katalog dosyası bulunamadı.");
    const products = await response.json();
    
    const customAdded = loadCustomAddedProducts();
    catalogProducts = [...products, ...customAdded];
    
    applyOverridesToCatalog();
    renderCatalog();
    renderDbTable();
  } catch (error) {
    console.error("Katalog yüklenirken hata oluştu:", error);
    alert("Katalog dosyası (products.json) yüklenemedi. Manuel giriş modunu kullanabilir veya veritabanı dosyasını kontrol edebilirsiniz.");
  }
}

// Render Catalog Grid
function createCatalogItemCard(product) {
  const qty = selectedQuantities[product.id] || 0;
  const card = document.createElement("article");
  card.className = `catalog-item-card ${qty > 0 ? "has-selected" : ""}`;
  card.dataset.id = product.id;

  card.innerHTML = `
    <span class="catalog-item-badge">${product.category}</span>
    <div style="color: var(--muted); font-size: 11px; font-family: monospace; margin: 4px 0 2px 0;">${product.barcode || ""}</div>
    <h4>${product.model}</h4>
    <div class="catalog-item-price">${formatPrice(product.price)} TL</div>
    <div class="catalog-item-actions">
      <div class="counter-container">
        <button class="counter-button btn-dec" type="button" aria-label="Azalt">-</button>
        <input class="counter-input qty-input" type="text" inputmode="numeric" value="${qty}">
        <button class="counter-button btn-inc" type="button" aria-label="Arttır">+</button>
      </div>
    </div>
  `;
  return card;
}

// Render Catalog Grid
function renderCatalog() {
  catalogGrid.innerHTML = "";
  loadMoreContainer.innerHTML = "";
  
  const searchWord = catalogSearch.value.trim().toLocaleLowerCase("tr-TR");
  
  const filtered = catalogProducts.filter(product => {
    if (activeCategoryFilter !== "all") {
      const rule = subcategoryRules[activeCategoryFilter];
      if (rule && !rule(product)) {
        return false;
      }
    }
    if (searchWord) {
      const matchText = `${product.brand} ${product.model} ${product.category} ${product.barcode || ""} ${product.id || ""}`.toLocaleLowerCase("tr-TR");
      return matchText.includes(searchWord);
    }
    return true;
  });

  if (filtered.length === 0) {
    catalogGrid.innerHTML = `<div class="empty-state"><p>Aradığınız kriterlere uygun ürün bulunamadı.</p></div>`;
    return;
  }

  // Slice the list according to the limit
  const sliced = filtered.slice(0, catalogVisibleLimit);

  for (const product of sliced) {
    catalogGrid.appendChild(createCatalogItemCard(product));
  }

  // Render "Load More" button helper
  function renderLoadMoreButton(filteredList) {
    loadMoreContainer.innerHTML = "";
    if (filteredList.length > catalogVisibleLimit) {
      const btn = document.createElement("button");
      btn.className = "primary-button";
      btn.type = "button";
      btn.style.minWidth = "240px";
      btn.style.height = "42px";
      btn.style.fontSize = "13px";
      btn.style.boxShadow = "var(--shadow)";
      btn.innerHTML = `👇 Daha Fazla Göster (${filteredList.length - catalogVisibleLimit} ürün kaldı)`;
      btn.addEventListener("click", () => {
        const nextLimit = catalogVisibleLimit + 24;
        const nextSlice = filteredList.slice(catalogVisibleLimit, nextLimit);
        
        for (const product of nextSlice) {
          catalogGrid.appendChild(createCatalogItemCard(product));
        }
        
        catalogVisibleLimit = nextLimit;
        renderLoadMoreButton(filteredList);
      });
      loadMoreContainer.appendChild(btn);
    }
  }

  renderLoadMoreButton(filtered);
}

function updateSelectedQuantity(productId, quantity) {
  if (quantity > 0) {
    selectedQuantities[productId] = quantity;
  } else {
    delete selectedQuantities[productId];
  }
  
  const card = catalogGrid.querySelector(`.catalog-item-card[data-id="${productId}"]`);
  if (card) {
    const qtyInput = card.querySelector(".qty-input");
    if (qtyInput && document.activeElement !== qtyInput) {
      qtyInput.value = String(quantity);
    }
    if (quantity > 0) {
      card.classList.add("has-selected");
    } else {
      card.classList.remove("has-selected");
    }
  }

  updateAutoBadge();
}

function updateAutoBadge() {
  let total = 0;
  for (const qty of Object.values(selectedQuantities)) {
    total += qty;
  }
  autoCountBadge.textContent = total;
  autoClearButton.disabled = total === 0;
  autoPrintButton.disabled = total === 0;
}

function getAutoPrintItems() {
  const itemsToPrint = [];
  const concept = autoConceptInput.value;
  const dateValue = formatDisplayDate(autoDateInput.value || todayForInput());

  for (const [productId, quantity] of Object.entries(selectedQuantities)) {
    if (quantity > 0) {
      const product = catalogProducts.find(p => p.id === productId);
      if (product) {
        for (let i = 0; i < quantity; i++) {
          itemsToPrint.push({
            id: createId(),
            brand: product.brand,
            model: product.model,
            price: formatPrice(product.price),
            date: dateValue,
            concept: concept
          });
        }
      }
    }
  }
  return itemsToPrint;
}

// Database Table Rendering & Editing
function renderDbTable() {
  dbTableBody.innerHTML = "";
  const query = dbSearch.value.trim().toLowerCase("tr-TR");

  const filtered = catalogProducts.filter(product => {
    if (query) {
      const matchText = `${product.brand} ${product.model} ${product.category} ${product.barcode || ""} ${product.id || ""}`.toLowerCase("tr-TR");
      return matchText.includes(query);
    }
    return true;
  });

  if (filtered.length === 0) {
    dbTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--muted); padding: 20px;">Ürün bulunamadı.</td></tr>`;
    return;
  }

  for (const product of filtered) {
    const row = document.createElement("tr");
    const isOverridden = catalogOverrides[product.id] !== undefined;
    const rowStyle = isOverridden ? "background-color: #f4f9ff;" : "";

    row.innerHTML = `
      <td style="${rowStyle}">${product.category}</td>
      <td style="${rowStyle}">
        <strong>${product.brand}</strong> ${product.model}
        <div style="color: var(--muted); font-size: 11px; font-family: monospace; margin-top: 3px;">${product.barcode || ""}</div>
      </td>
      <td style="${rowStyle}">${formatPrice(product.originalPrice)} TL</td>
      <td style="${rowStyle}">
        <input class="db-price-input" data-id="${product.id}" type="text" value="${formatPrice(product.price)}" style="${isOverridden ? "border-color: var(--accent); font-weight: bold;" : ""}">
      </td>
    `;

    dbTableBody.append(row);
  }
}

// Event Listeners Registration

// Navigation
btnSelectManual.addEventListener("click", () => { window.location.hash = "#manual"; });
btnSelectAuto.addEventListener("click", () => { window.location.hash = "#automatic"; });
btnManualBackHome.addEventListener("click", () => { window.location.hash = "#welcome"; });
btnAutoBackHome.addEventListener("click", () => { window.location.hash = "#welcome"; });

// Manual Mode Handlers
modelInput.addEventListener("input", () => {
  const endsWithSpace = /\s$/.test(modelInput.value);
  const formatted = capitalizeProductText(modelInput.value);
  modelInput.value = endsWithSpace && formatted ? `${formatted} ` : formatted;

  if (!userEditedBrand) {
    brandInput.value = modelInput.value.split(/\s+/).filter(Boolean)[0] || "";
  }
});

brandInput.addEventListener("input", () => { userEditedBrand = true; });
priceInput.addEventListener("input", () => { priceInput.value = formatPrice(priceInput.value); });

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

conceptInput.addEventListener("change", () => {
  const selectedConcept = conceptInput.value;
  items.forEach(item => item.concept = selectedConcept);
  saveItems();
  renderPreview();
});

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

sampleButton.addEventListener("click", () => {
  items = [
    ...items,
    {
      id: createId(),
      brand: "Apple",
      model: "20 W USB-C Güç Adaptörü",
      price: "779",
      date: formatDisplayDate(dateInput.value || todayForInput()),
      concept: conceptInput.value,
    },
  ];
  saveItems();
  renderPreview();
});

exportButton.addEventListener("click", exportJson);
importInput.addEventListener("change", () => importJson(importInput.files[0]));

// Automatic Mode Handlers
catalogSearch.addEventListener("input", () => {
  catalogVisibleLimit = 12;
  renderCatalog();
});

categoryMenu.addEventListener("click", (event) => {
  const toggleBtn = event.target.closest(".group-toggle");
  const menuItem = event.target.closest(".menu-item:not(.group-toggle)");
  const subItem = event.target.closest(".sub-item");

  if (toggleBtn) {
    const group = toggleBtn.closest(".menu-group");
    group.classList.toggle("open");
    return;
  }

  if (menuItem) {
    categoryMenu.querySelectorAll(".menu-item, .sub-item").forEach(item => item.classList.remove("active"));
    menuItem.classList.add("active");
    activeCategoryFilter = menuItem.dataset.filter;
    catalogVisibleLimit = 12;
    renderCatalog();
    return;
  }

  if (subItem) {
    categoryMenu.querySelectorAll(".menu-item, .sub-item").forEach(item => item.classList.remove("active"));
    subItem.classList.add("active");
    activeCategoryFilter = subItem.dataset.filter;
    catalogVisibleLimit = 12;
    renderCatalog();
  }
});

catalogGrid.addEventListener("click", (event) => {
  const decBtn = event.target.closest(".btn-dec");
  const incBtn = event.target.closest(".btn-inc");
  const card = event.target.closest(".catalog-item-card");
  if (!card) return;

  const productId = card.dataset.id;
  let qty = selectedQuantities[productId] || 0;

  if (decBtn) {
    qty = Math.max(0, qty - 1);
    updateSelectedQuantity(productId, qty);
  } else if (incBtn) {
    qty = qty + 1;
    updateSelectedQuantity(productId, qty);
  }
});

catalogGrid.addEventListener("input", (event) => {
  const qtyInput = event.target.closest(".qty-input");
  const card = event.target.closest(".catalog-item-card");
  if (!qtyInput || !card) return;

  const productId = card.dataset.id;
  const digits = qtyInput.value.replace(/\D/g, "");
  let qty = 0;
  if (digits) {
    qty = Math.max(0, Math.min(100, Number(digits)));
  }
  qtyInput.value = qty > 0 ? String(qty) : "";
  updateSelectedQuantity(productId, qty);
});

catalogGrid.addEventListener("focusout", (event) => {
  const qtyInput = event.target.closest(".qty-input");
  if (!qtyInput) return;
  if (qtyInput.value === "") {
    qtyInput.value = "0";
  }
});

autoClearButton.addEventListener("click", () => {
  if (confirm("Seçilen tüm ürün adetlerini sıfırlamak istiyor musun?")) {
    selectedQuantities = {};
    renderCatalog();
    updateAutoBadge();
  }
});

autoPrintButton.addEventListener("click", () => {
  renderPrintArea();
  window.print();
});

// Database Modal Handlers
function isAdminAuthenticated() {
  return sessionStorage.getItem("troy-admin-authenticated") === "true";
}

btnOpenDbModal.addEventListener("click", () => {
  if (isAdminAuthenticated()) {
    dbModal.removeAttribute("hidden");
    renderDbTable();
  } else {
    passcodeError.hidden = true;
    passcodeInput.value = "";
    passcodeModal.removeAttribute("hidden");
    passcodeInput.focus();
  }
});

btnCloseDbModal.addEventListener("click", () => {
  dbModal.hidden = true;
});

dbModal.addEventListener("click", (e) => {
  if (e.target === dbModal) {
    dbModal.hidden = true;
  }
});

// Passcode Modal Handlers
btnClosePasscodeModal.addEventListener("click", () => {
  passcodeModal.hidden = true;
});

passcodeModal.addEventListener("click", (e) => {
  if (e.target === passcodeModal) {
    passcodeModal.hidden = true;
  }
});

passcodeForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const value = passcodeInput.value.trim();
  if (value === ADMIN_PASSCODE) {
    sessionStorage.setItem("troy-admin-authenticated", "true");
    passcodeModal.hidden = true;
    dbModal.removeAttribute("hidden");
    renderDbTable();
  } else {
    passcodeError.hidden = false;
    // Trigger shake animation
    passcodeError.classList.remove("error-message");
    void passcodeError.offsetWidth; // Force reflow
    passcodeError.classList.add("error-message");
    passcodeInput.value = "";
    passcodeInput.focus();
  }
});

dbSearch.addEventListener("input", renderDbTable);

dbTableBody.addEventListener("input", (event) => {
  const input = event.target.closest(".db-price-input");
  if (!input) return;

  const productId = input.dataset.id;
  const digits = input.value.replace(/\D/g, "");
  input.value = formatPrice(digits);

  const product = catalogProducts.find(p => p.id === productId);
  if (!product) return;

  if (!digits || digits === product.originalPrice.replace(/\D/g, "")) {
    delete catalogOverrides[productId];
    input.style.borderColor = "";
    input.style.fontWeight = "";
  } else {
    catalogOverrides[productId] = digits;
    input.style.borderColor = "var(--accent)";
    input.style.fontWeight = "bold";
  }

  saveCatalogOverrides();
  applyOverridesToCatalog();
  renderCatalog();
});

btnResetDb.addEventListener("click", () => {
  if (confirm("Tüm fiyatları varsayılan ayarlara döndürmek ve eklenen özel ürünleri temizlemek istediğinizden emin misiniz?")) {
    catalogOverrides = {};
    saveCatalogOverrides();
    saveCustomAddedProducts([]);
    loadCatalog();
  }
});

btnExportDb.addEventListener("click", () => {
  const exportData = catalogProducts.map(product => ({
    id: product.id,
    brand: product.brand,
    model: product.model,
    price: product.price,
    concept: product.concept || "APR",
    category: product.category
  }));

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "products.json";
  link.click();
  URL.revokeObjectURL(url);
});

// Excel Import Logic (SheetJS)
function findValue(row, possibleKeys) {
  for (const key of Object.keys(row)) {
    const normKey = key.trim().toLowerCase("tr-TR");
    if (possibleKeys.includes(normKey)) {
      return row[key];
    }
  }
  return undefined;
}

async function handleExcelImport(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet);

    if (rows.length === 0) {
      alert("Yüklenen Excel dosyasında veri bulunamadı.");
      return;
    }

    let updatedCount = 0;
    let addedCount = 0;
    const customAdded = loadCustomAddedProducts();

    for (const row of rows) {
      const category = findValue(row, ["kategori", "category", "kategori adi", "kategori adı", "tür", "tur"]) || "Aksesuar";
      const brand = findValue(row, ["marka", "brand", "markası", "markasi", "üretici", "uretici"]) || "Apple";
      const model = findValue(row, ["model", "aciklama", "açıklama", "urun adi", "ürün adı", "model adi", "model adı", "tanım", "tanim", "ürün açıklaması", "urun aciklamasi"]);
      const price = findValue(row, ["fiyat", "price", "tutar", "fiyatı", "fiyati", "etiket fiyatı", "etiket fiyati"]);

      if (!model || price === undefined) continue;

      const cleanPrice = String(price).replace(/\D/g, "");
      const cleanModel = capitalizeProductText(String(model).trim());
      const cleanBrand = capitalizeProductText(String(brand).trim());
      const cleanCategory = String(category).trim();

      // Check if it exists in current catalogProducts
      const existing = catalogProducts.find(p => p.model.toLowerCase("tr-TR") === cleanModel.toLowerCase("tr-TR"));

      if (existing) {
        // Update its override and details in memory
        existing.price = cleanPrice;
        existing.brand = cleanBrand;
        existing.category = cleanCategory;
        catalogOverrides[existing.id] = cleanPrice;
        updatedCount++;
      } else {
        // Create new product
        const newProduct = {
          id: "prod-" + createId(),
          brand: cleanBrand,
          model: cleanModel,
          price: cleanPrice,
          category: cleanCategory,
          concept: "APR"
        };
        customAdded.push(newProduct);
        addedCount++;
      }
    }

    // Save state
    saveCatalogOverrides();
    saveCustomAddedProducts(customAdded);
    
    // Reload catalog combining products.json + custom added
    await loadCatalog();

    alert(`Excel başarıyla yüklendi!\nGüncellenen Ürün Fiyatı: ${updatedCount}\nYeni Eklenen Ürün Sayısı: ${addedCount}`);
  } catch (error) {
    console.error("Excel yüklenirken hata oluştu:", error);
    alert(`Excel dosyası okunamadı. Lütfen dosya biçimini kontrol edin. Hata: ${error.message}`);
  } finally {
    excelImportInput.value = "";
  }
}

excelImportInput.addEventListener("change", handleExcelImport);

// Print area global listener (for browser menu printing)
window.addEventListener("beforeprint", renderPrintArea);

// Initializations
dateInput.value = todayForInput();
autoDateInput.value = todayForInput();
if (items.length > 0 && items[0].concept) {
  conceptInput.value = items[0].concept;
}
renderPreview();
window.addEventListener("load", applyRouting);
window.addEventListener("hashchange", applyRouting);
applyRouting();
