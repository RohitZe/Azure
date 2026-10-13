/* ============================================================
   Pacer – shoe site
   Data, shoe drawing, hero colour picker, filters, cart, form
   ============================================================ */

/* ---------- Data ---------- */
const PRODUCTS = [
  { id: "aero",   name: "Aero Runner",   type: "Running", price: 89,  upper: "#2f49f5", accent: "#ffd84a", tint: "#dce3ff" },
  { id: "tempo",  name: "Tempo Lite",    type: "Running", price: 99,  upper: "#ff6b5b", accent: "#16224a", tint: "#ffe0db" },
  { id: "sprint", name: "Sprint Knit",   type: "Running", price: 109, upper: "#1fa37a", accent: "#ffffff", tint: "#d5f2e8" },
  { id: "court",  name: "Court Classic", type: "Casual",  price: 75,  upper: "#f4f1e8", accent: "#2f49f5", tint: "#e3e8f4" },
  { id: "daily",  name: "Daily Slip",    type: "Casual",  price: 65,  upper: "#ffd84a", accent: "#16224a", tint: "#fff2bf" },
  { id: "harbor", name: "Harbor Low",    type: "Casual",  price: 82,  upper: "#16224a", accent: "#ff6b5b", tint: "#d9ddea" },
  { id: "ridge",  name: "Ridge Boot",    type: "Boots",   price: 139, upper: "#8a5a3c", accent: "#f4e3c8", tint: "#ebd9c8", high: true },
  { id: "trail",  name: "Trail Mid",     type: "Boots",   price: 129, upper: "#5c6b3a", accent: "#ffd84a", tint: "#e1e7cf", high: true },
];

const HERO_SHOE = { name: "Aero Runner", price: 89 };
const COLOURWAYS = [
  { name: "Cobalt", upper: "#2f49f5", accent: "#ffd84a", tint: "#dce3ff" },
  { name: "Coral",  upper: "#ff6b5b", accent: "#16224a", tint: "#ffe0db" },
  { name: "Mint",   upper: "#1fa37a", accent: "#ffffff", tint: "#d5f2e8" },
  { name: "Butter", upper: "#ffd84a", accent: "#16224a", tint: "#fff2bf" },
  { name: "Ink",    upper: "#16224a", accent: "#ff6b5b", tint: "#d9ddea" },
];

/* ---------- Helpers ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const money = (n) => "$" + n;

/* Draws a side-on sneaker (or boot) as inline SVG, coloured with CSS variables */
function shoeSVG({ upper, accent, high = false, label = "" }) {
  const body = high
    ? "M50 168 C40 120 42 50 56 16 L138 16 C140 44 160 68 196 80 C250 100 302 112 342 126 C372 136 388 150 388 168 Z"
    : "M50 168 C38 120 44 76 62 54 C72 42 92 46 106 58 C130 78 152 72 170 62 L192 54 C212 90 252 110 302 122 C352 134 386 146 388 168 Z";
  const heel = high
    ? "M50 168 C40 120 42 50 56 16 L82 16 C72 60 74 130 90 168 Z"
    : "M50 168 C38 120 44 76 62 54 C68 48 76 46 84 48 C74 80 76 130 90 168 Z";
  const toe = high
    ? "M330 122 C364 132 386 146 388 168 L322 168 C328 152 330 138 330 122 Z"
    : "M302 122 C352 134 386 146 388 168 L300 168 C308 150 308 136 302 122 Z";
  const tongue = high ? "" : '<path class="u" d="M170 62 L192 54 L202 38 C190 34 176 44 170 62 Z"/>';
  const straps = high
    ? '<path class="lace" d="M62 40 L126 40"/><path class="lace" d="M64 64 L134 64"/>'
    : "";

  return `
<svg class="shoe" viewBox="0 0 410 230" role="img" aria-label="${label}" style="--u:${upper};--a:${accent}">
  <path class="u" d="${body}"/>
  <path class="shade" d="${heel}"/>
  <path class="shade" d="${toe}"/>
  ${tongue}
  ${straps}
  <path class="lace" d="M208 64 L194 86"/>
  <path class="lace" d="M236 81 L222 103"/>
  <path class="lace" d="M264 98 L250 120"/>
  <path class="lace" d="M291 115 L277 137"/>
  <path class="stripe" d="M104 146 C160 134 226 140 286 150"/>
  <path class="sole" d="M18 184 C18 174 30 168 46 168 L360 168 C384 168 394 180 392 192 C390 204 374 212 352 212 L52 212 C30 212 18 204 18 184 Z"/>
  <path class="collar" d="M28 192 L382 192"/>
</svg>`;
}

/* ---------- Cart state ---------- */
let cart = [];
try {
  cart = JSON.parse(localStorage.getItem("pacer-cart")) || [];
} catch (e) {
  cart = [];
}

function saveCart() {
  try { localStorage.setItem("pacer-cart", JSON.stringify(cart)); } catch (e) { /* storage unavailable */ }
}

function addToCart(item) {
  const existing = cart.find((i) => i.key === item.key);
  if (existing) existing.qty += 1;
  else cart.push({ ...item, qty: 1 });
  saveCart();
  renderCart();
  const badge = $("#cartCount");
  badge.classList.remove("bump");
  void badge.offsetWidth; // restart animation
  badge.classList.add("bump");
}

function changeQty(key, delta) {
  const item = cart.find((i) => i.key === key);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter((i) => i.key !== key);
  saveCart();
  renderCart();
}

function removeItem(key) {
  cart = cart.filter((i) => i.key !== key);
  saveCart();
  renderCart();
}

function renderCart() {
  const list = $("#cartList");
  const count = cart.reduce((n, i) => n + i.qty, 0);
  const total = cart.reduce((n, i) => n + i.qty * i.price, 0);

  $("#cartCount").textContent = count;
  $("#cartTotal").textContent = money(total);
  $("#cartEmpty").hidden = cart.length > 0;
  $("#openCart").setAttribute("aria-label", `Open cart, ${count} item${count === 1 ? "" : "s"}`);

  list.innerHTML = cart
    .map(
      (i) => `
    <li class="cart-item" data-key="${i.key}">
      <div class="cart-thumb" style="--tint:${i.tint}">
        ${shoeSVG({ upper: i.upper, accent: i.accent, high: i.high, label: "" })}
      </div>
      <div>
        <h3>${i.name}</h3>
        <p class="meta">${i.variant}</p>
        <div class="qty">
          <button type="button" data-act="dec" aria-label="Remove one ${i.name}">&minus;</button>
          <span aria-live="polite">${i.qty}</span>
          <button type="button" data-act="inc" aria-label="Add one more ${i.name}">+</button>
        </div>
      </div>
      <div class="cart-side">
        <span>${money(i.price * i.qty)}</span>
        <button type="button" class="remove" data-act="remove">Remove</button>
      </div>
    </li>`
    )
    .join("");
}

$("#cartList").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-act]");
  if (!btn) return;
  const key = btn.closest(".cart-item").dataset.key;
  const act = btn.dataset.act;
  if (act === "inc") changeQty(key, 1);
  if (act === "dec") changeQty(key, -1);
  if (act === "remove") removeItem(key);
});

/* ---------- Cart drawer ---------- */
const drawer = $("#drawer");
const overlay = $("#overlay");
const openBtn = $("#openCart");

function openCart() {
  overlay.hidden = false;
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  $("#closeCart").focus();
}

function closeCart() {
  overlay.hidden = true;
  drawer.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  $("#checkoutMsg").textContent = "";
  openBtn.focus();
}

openBtn.addEventListener("click", openCart);
$("#closeCart").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && drawer.classList.contains("open")) closeCart();
});

$("#checkout").addEventListener("click", () => {
  const msg = $("#checkoutMsg");
  msg.classList.remove("error");
  if (cart.length === 0) {
    msg.classList.add("error");
    msg.textContent = "Add a pair to your cart before checking out.";
    return;
  }
  msg.textContent = "This is a demo store, so no order was placed.";
});

/* ---------- Hero colour picker ---------- */
const heroShoe = $("#heroShoe");
const hero = $("#hero");
let heroColour = COLOURWAYS[0];

heroShoe.innerHTML = shoeSVG({
  upper: heroColour.upper,
  accent: heroColour.accent,
  label: `${HERO_SHOE.name} sneaker in ${heroColour.name}`,
});
const heroSvg = $(".shoe", heroShoe);

function setHeroColour(cw) {
  heroColour = cw;
  heroSvg.style.setProperty("--u", cw.upper);
  heroSvg.style.setProperty("--a", cw.accent);
  heroSvg.setAttribute("aria-label", `${HERO_SHOE.name} sneaker in ${cw.name}`);
  hero.style.setProperty("--hero-tint", cw.tint);
  $("#heroLabel").innerHTML = `<strong>${HERO_SHOE.name}</strong> in ${cw.name}, ${money(HERO_SHOE.price)}`;
  document.querySelectorAll(".swatch").forEach((b) => {
    b.setAttribute("aria-pressed", String(b.dataset.name === cw.name));
  });
}

$("#swatches").innerHTML = COLOURWAYS.map(
  (cw) =>
    `<button type="button" class="swatch" data-name="${cw.name}" aria-label="${cw.name}" aria-pressed="false" style="background:${cw.upper}"></button>`
).join("");

$("#swatches").addEventListener("click", (e) => {
  const btn = e.target.closest(".swatch");
  if (!btn) return;
  setHeroColour(COLOURWAYS.find((c) => c.name === btn.dataset.name));
});

$("#heroAdd").addEventListener("click", () => {
  addToCart({
    key: `aero-${heroColour.name.toLowerCase()}`,
    name: HERO_SHOE.name,
    variant: heroColour.name,
    price: HERO_SHOE.price,
    upper: heroColour.upper,
    accent: heroColour.accent,
    tint: heroColour.tint,
  });
  openCart();
});

setHeroColour(heroColour);

/* ---------- Product grid + filters ---------- */
const grid = $("#grid");
let activeFilter = "All";

function renderGrid() {
  const shown = PRODUCTS.filter((p) => activeFilter === "All" || p.type === activeFilter);
  $("#resultCount").textContent = `Showing ${shown.length} ${shown.length === 1 ? "pair" : "pairs"}`;

  grid.innerHTML = shown
    .map(
      (p) => `
    <article class="tile">
      <div class="tile-art" style="--tint:${p.tint}">
        ${shoeSVG({ upper: p.upper, accent: p.accent, high: p.high, label: `${p.name}, ${p.type.toLowerCase()} shoe` })}
      </div>
      <div class="tile-info">
        <div class="tile-row">
          <h3>${p.name}</h3>
          <span class="price">${money(p.price)}</span>
        </div>
        <p class="tile-type">${p.type}</p>
        <button type="button" class="add-btn" data-id="${p.id}">Add to cart</button>
      </div>
    </article>`
    )
    .join("");
}

$("#filters").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  activeFilter = chip.dataset.filter;
  document.querySelectorAll(".chip").forEach((c) => {
    c.setAttribute("aria-pressed", String(c === chip));
  });
  renderGrid();
});

grid.addEventListener("click", (e) => {
  const btn = e.target.closest(".add-btn");
  if (!btn) return;
  const p = PRODUCTS.find((x) => x.id === btn.dataset.id);
  addToCart({
    key: p.id,
    name: p.name,
    variant: p.type,
    price: p.price,
    upper: p.upper,
    accent: p.accent,
    tint: p.tint,
    high: !!p.high,
  });
  btn.textContent = "Added to cart";
  btn.classList.add("added");
  setTimeout(() => {
    btn.textContent = "Add to cart";
    btn.classList.remove("added");
  }, 1200);
});

/* ---------- Newsletter form ---------- */
$("#joinForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = $("#email");
  const msg = $("#formMsg");
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());

  msg.classList.toggle("error", !valid);
  input.setAttribute("aria-invalid", String(!valid));

  if (!valid) {
    msg.textContent = "Enter an email address like name@example.com.";
    input.focus();
    return;
  }
  msg.textContent = "Subscribed. Check your inbox for a welcome note.";
  input.value = "";
});

/* ---------- Init ---------- */
$("#year").textContent = new Date().getFullYear();
renderGrid();
renderCart();