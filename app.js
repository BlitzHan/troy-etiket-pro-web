const storageKey = "troy-etiket-pro-items";
const formatter = new Intl.NumberFormat("tr-TR");

// Site Login Elements
const siteLoginScreen = document.querySelector("#siteLoginScreen");
const siteLoginForm = document.querySelector("#siteLoginForm");
const sitePasswordInput = document.querySelector("#sitePasswordInput");
const siteLoginError = document.querySelector("#siteLoginError");

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
const SITE_PASSCODES = ["2808", "0828"];
const ADMIN_PASSCODE = "troy123";

let catalogOverrides = loadCatalogOverrides(); // { productId: newPriceString }
let selectedQuantities = {}; // { productId: quantity }
let activeCategoryFilter = "all";
let catalogCurrentPage = 1;
const catalogItemsPerPage = 12;

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
  },
  // 3. Parti
  "brand-momax": (p) => p.brand.toLowerCase() === "momax"
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
  if (!value) return "";
  const specialCases = new Map([
    ["iphone", "iPhone"],
    ["ıphone", "iPhone"],
    ["ipad", "iPad"],
    ["ıpad", "iPad"],
    ["imac", "iMac"],
    ["ımac", "iMac"],
    ["macbook", "MacBook"],
    ["ipod", "iPod"],
    ["ıpod", "iPod"],
    ["ios", "iOS"],
    ["ıos", "iOS"],
    ["macos", "macOS"],
    ["airpods", "AirPods"],
    ["airtag", "AirTag"],
    ["usb-c", "USB-C"],
    ["usb", "USB"],
    ["wi-fi", "Wi-Fi"],
    ["jbl", "JBL"],
    ["ipro", "IPRO"],
    ["ıpro", "IPRO"],
    ["ka", "KA"],
    ["tr", "TR"],
    ["fd", "FD"],
    ["zagg", "ZAGG"],
    ["tws", "TWS"],
    ["pd", "PD"],
    ["qc", "QC"],
    ["otg", "OTG"],
    ["ram", "RAM"],
    ["ssd", "SSD"],
    ["bt", "BT"],
    ["magsafe", "MagSafe"]
  ]);

  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      const match = word.match(/^([^A-Za-z0-9ÇĞİÖŞÜçğıöşü]*)(.*?)([^A-Za-z0-9ÇĞİÖŞÜçğıöşü]*)$/);
      if (!match) return word;
      const leading = match[1];
      const core = match[2];
      const trailing = match[3];

      if (!core) return word;

      const key = core.toLocaleLowerCase("tr-TR");
      let formattedCore;
      if (specialCases.has(key)) {
        formattedCore = specialCases.get(key);
      } else {
        formattedCore = core.charAt(0).toLocaleUpperCase("tr-TR") + core.slice(1).toLocaleLowerCase("tr-TR");
      }
      return leading + formattedCore + trailing;
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
  node.querySelector(".label-brand").textContent = capitalizeProductText(item.brand);
  node.querySelector(".label-model").textContent = capitalizeProductText(item.model);
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

  const sortedItems = [...items].sort((a, b) => {
    const priceA = parseFloat(String(a.price).replace(/\D/g, "")) || 0;
    const priceB = parseFloat(String(b.price).replace(/\D/g, "")) || 0;
    return priceA - priceB;
  });

  for (const item of sortedItems) {
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
  
  let printItems = currentScreen === "automatic" ? getAutoPrintItems() : items;

  // Sort print items by price ascending
  printItems = [...printItems].sort((a, b) => {
    const priceA = parseFloat(String(a.price).replace(/\D/g, "")) || 0;
    const priceB = parseFloat(String(b.price).replace(/\D/g, "")) || 0;
    return priceA - priceB;
  });

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
function isSiteAuthenticated() {
  return sessionStorage.getItem("troy-site-authenticated") === "true";
}

function showSiteLogin() {
  siteLoginScreen.hidden = false;
  welcomeScreen.hidden = true;
  manualShell.hidden = true;
  autoShell.hidden = true;
  setTimeout(() => sitePasswordInput.focus(), 0);
}

function hideSiteLogin() {
  siteLoginScreen.hidden = true;
}

function applyRouting() {
  if (!isSiteAuthenticated()) {
    showSiteLogin();
    return;
  }

  hideSiteLogin();
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
    catalogCurrentPage = 1;
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

siteLoginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (SITE_PASSCODES.includes(sitePasswordInput.value)) {
    sessionStorage.setItem("troy-site-authenticated", "true");
    sitePasswordInput.value = "";
    siteLoginError.hidden = true;
    applyRouting();
  } else {
    siteLoginError.hidden = false;
    sitePasswordInput.select();
  }
});

sitePasswordInput.addEventListener("input", () => {
  siteLoginError.hidden = true;
});

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
    populateThirdPartyBrands();
    renderCatalog();
    renderDbTable();
  } catch (error) {
    console.error("Katalog yüklenirken hata oluştu:", error);
    alert("Katalog dosyası (products.json) yüklenemedi. Manuel giriş modunu kullanabilir veya veritabanı dosyasını kontrol edebilirsiniz.");
  }
}

function populateThirdPartyBrands() {
  const brands = new Set();
  for (const p of catalogProducts) {
    if (p.brand) {
      const cleanBrand = p.brand.trim();
      if (cleanBrand && cleanBrand.toLowerCase() !== "apple") {
        brands.add(cleanBrand);
      }
    }
  }

  const sortedBrands = Array.from(brands).sort((a, b) => 
    a.localeCompare(b, "tr-TR", { sensitivity: "base" })
  );

  const container = document.getElementById("thirdPartyBrandItems");
  if (!container) return;

  container.innerHTML = "";
  for (const brand of sortedBrands) {
    const btn = document.createElement("button");
    btn.className = "sub-item";
    btn.type = "button";
    btn.dataset.filter = `brand-${brand.toLowerCase()}`;
    btn.textContent = capitalizeProductText(brand);
    container.appendChild(btn);
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
    <div style="color: var(--muted); font-size: 10px; font-family: monospace; margin: 3px 0 1.5px 0;">${product.barcode || ""}</div>
    <h4><strong>${capitalizeProductText(product.brand)}</strong> ${capitalizeProductText(product.model)}</h4>
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
      if (activeCategoryFilter.startsWith("brand-")) {
        const brandName = activeCategoryFilter.replace("brand-", "").toLowerCase();
        if (!product.brand || product.brand.toLowerCase() !== brandName) {
          return false;
        }
      } else {
        const rule = subcategoryRules[activeCategoryFilter];
        if (rule && !rule(product)) {
          return false;
        }
      }
    }
    if (searchWord) {
      const matchText = `${product.brand} ${product.model} ${product.category} ${product.barcode || ""} ${product.id || ""}`.toLocaleLowerCase("tr-TR");
      return matchText.includes(searchWord);
    }
    return true;
  });

  // Sort catalog products by price ascending
  filtered.sort((a, b) => {
    const priceA = parseFloat(String(a.price).replace(/\D/g, "")) || 0;
    const priceB = parseFloat(String(b.price).replace(/\D/g, "")) || 0;
    return priceA - priceB;
  });

  if (filtered.length === 0) {
    catalogGrid.innerHTML = `<div class="empty-state"><p>Aradığınız kriterlere uygun ürün bulunamadı.</p></div>`;
    return;
  }

  // Pagination calculation
  const totalPages = Math.ceil(filtered.length / catalogItemsPerPage);
  if (catalogCurrentPage > totalPages) {
    catalogCurrentPage = Math.max(1, totalPages);
  }

  const start = (catalogCurrentPage - 1) * catalogItemsPerPage;
  const end = start + catalogItemsPerPage;
  const sliced = filtered.slice(start, end);

  for (const product of sliced) {
    catalogGrid.appendChild(createCatalogItemCard(product));
  }

  // Render pagination controls
  renderPaginationControls(filtered, totalPages);
}

function scrollToCatalogTop() {
  if (window.innerWidth <= 850) {
    // Mobilde sayfanın grid başlangıcına kaydır
    const gridTop = catalogGrid.getBoundingClientRect().top + window.scrollY - 60;
    window.scrollTo({ top: gridTop, behavior: "smooth" });
  } else {
    // Desktopda workspace container'ı scroll et
    const scrollContainer = catalogGrid.closest(".workspace-content-scroll");
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
}

function renderPaginationControls(filteredList, totalPages) {
  loadMoreContainer.innerHTML = "";
  if (totalPages <= 1) return;

  // 1. First Page Button
  const firstBtn = document.createElement("button");
  firstBtn.className = "pagination-btn";
  firstBtn.type = "button";
  firstBtn.innerHTML = "⏮️ En Başa Git";
  firstBtn.disabled = catalogCurrentPage === 1;
  firstBtn.addEventListener("click", () => {
    catalogCurrentPage = 1;
    renderCatalog();
    scrollToCatalogTop();
  });
  loadMoreContainer.appendChild(firstBtn);

  // 2. Previous Page Button
  const prevBtn = document.createElement("button");
  prevBtn.className = "pagination-btn";
  prevBtn.type = "button";
  prevBtn.innerHTML = "⬅️ Önceki";
  prevBtn.disabled = catalogCurrentPage === 1;
  prevBtn.addEventListener("click", () => {
    if (catalogCurrentPage > 1) {
      catalogCurrentPage -= 1;
      renderCatalog();
      scrollToCatalogTop();
    }
  });
  loadMoreContainer.appendChild(prevBtn);

  // 3. Numeric Page Buttons
  const delta = 2;
  const pageRange = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= catalogCurrentPage - delta && i <= catalogCurrentPage + delta)
    ) {
      pageRange.push(i);
    }
  }

  let lastNumber = 0;
  for (const page of pageRange) {
    if (lastNumber !== 0) {
      if (page - lastNumber === 2) {
        createPageNumBtn(lastNumber + 1);
      } else if (page - lastNumber > 2) {
        const ellipsis = document.createElement("span");
        ellipsis.className = "pagination-ellipsis";
        ellipsis.textContent = "...";
        loadMoreContainer.appendChild(ellipsis);
      }
    }
    createPageNumBtn(page);
    lastNumber = page;
  }

  function createPageNumBtn(page) {
    const numBtn = document.createElement("button");
    numBtn.className = `pagination-btn pagination-number ${page === catalogCurrentPage ? "active" : ""}`;
    numBtn.type = "button";
    numBtn.textContent = page;
    numBtn.addEventListener("click", () => {
      catalogCurrentPage = page;
      renderCatalog();
      scrollToCatalogTop();
    });
    loadMoreContainer.appendChild(numBtn);
  }

  // 4. Next Page Button
  const nextBtn = document.createElement("button");
  nextBtn.className = "pagination-btn";
  nextBtn.type = "button";
  nextBtn.innerHTML = "Sonraki ➡️";
  nextBtn.disabled = catalogCurrentPage === totalPages;
  nextBtn.addEventListener("click", () => {
    if (catalogCurrentPage < totalPages) {
      catalogCurrentPage += 1;
      renderCatalog();
      scrollToCatalogTop();
    }
  });
  loadMoreContainer.appendChild(nextBtn);

  // 5. Last Page Button
  const lastBtn = document.createElement("button");
  lastBtn.className = "pagination-btn";
  lastBtn.type = "button";
  lastBtn.innerHTML = "En Sona Git ⏭️";
  lastBtn.disabled = catalogCurrentPage === totalPages;
  lastBtn.addEventListener("click", () => {
    catalogCurrentPage = totalPages;
    renderCatalog();
    scrollToCatalogTop();
  });
  loadMoreContainer.appendChild(lastBtn);
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
  catalogCurrentPage = 1;
  renderCatalog();
});

categoryMenu.addEventListener("click", (event) => {
  const toggleBtn = event.target.closest(".group-toggle");
  const menuItem = event.target.closest(".menu-item:not(.group-toggle)");
  const subItem = event.target.closest(".sub-item");

  if (toggleBtn) {
    const isMobile = window.innerWidth <= 850;
    if (isMobile) {
      // Mobilde grup toggle -> direkt o grubun "tümü" filtresini uygula
      const group = toggleBtn.closest(".menu-group");
      // İlk sub-item'ın data-filter'ına bak (-all ile biten)
      const firstSubItem = group.querySelector(".sub-item[data-filter$='-all']") ||
                           group.querySelector(".sub-item");
      const filter = firstSubItem ? firstSubItem.dataset.filter : "all";
      
      categoryMenu.querySelectorAll(".menu-item, .sub-item").forEach(item => item.classList.remove("active"));
      toggleBtn.classList.add("active");
      activeCategoryFilter = filter;
      catalogCurrentPage = 1;
      renderCatalog();
    } else {
      // Desktop: accordion davranışı
      const group = toggleBtn.closest(".menu-group");
      const isOpen = group.classList.contains("open");
      categoryMenu.querySelectorAll(".menu-group").forEach(g => g.classList.remove("open"));
      if (!isOpen) {
        group.classList.add("open");
      }
    }
    return;
  }

  if (menuItem) {
    categoryMenu.querySelectorAll(".menu-item, .sub-item").forEach(item => item.classList.remove("active"));
    menuItem.classList.add("active");
    activeCategoryFilter = menuItem.dataset.filter;
    catalogCurrentPage = 1;
    renderCatalog();
    return;
  }

  if (subItem) {
    categoryMenu.querySelectorAll(".menu-item, .sub-item").forEach(item => item.classList.remove("active"));
    subItem.classList.add("active");
    activeCategoryFilter = subItem.dataset.filter;
    catalogCurrentPage = 1;
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
