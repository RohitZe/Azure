/* ---------- Settings ---------- */
const CURRENCY = "₹"; // change to "$", "€", etc.

/* ---------- Data ---------- */
const colorways = {
  tide:  { name: "Tide",  bg: "#d3e6f7", text: "#0f2742", upper: "#2e6db4", accent: "#ffffff", sole: "#ffffff", outsole: "#1b1f2a" },
  ember: { name: "Ember", bg: "#ffd9c2", text: "#3a1204", upper: "#e8571f", accent: "#1b1b1f", sole: "#ffffff", outsole: "#1b1b1f" },
  moss:  { name: "Moss",  bg: "#d6e8cf", text: "#12301b", upper: "#3f7d4e", accent: "#f2f2f2", sole: "#f2f2f2", outsole: "#12301b" },
  night: { name: "Night", bg: "#272a38", text: "#f4f4f8", upper: "#e9e9ef", accent: "#f2b705", sole: "#f2b705", outsole: "#101218" }
};

const products = [
  { id: 1, name: "Tread One",    type: "Everyday", price: 5499, color: "tide",  note: "The all-day pair." },
  { id: 2, name: "Tread Sprint", type: "Running",  price: 6999, color: "ember", note: "Springy foam for 5–10 km runs." },
  { id: 3, name: "Tread Ridge",  type: "Trail",    price: 7499, color: "moss",  note: "Grippy outsole for dirt and wet rock." },
  { id: 4, name: "Tread Dusk",   type: "Everyday", price: 5999, color: "night", note: "Dark upper, bright details." },
  { id: 5, name: "Tread Sprint Lite", type: "Running", price: 6499, color: "tide", note: "Lighter build for race days." },
  { id: 6, name: "Tread Camp",   type: "Trail",    price: 7999, color: "ember", note: "Reinforced toe and heel." },
  { id: 7, name: "Tread Loop",   type: "Everyday", price: 5299, color: "moss",  note: "Slip-resistant sole for wet floors." },
  { id: 8, name: "Tread Tempo",  type: "Running",  price: 7199, color: "night", note: "Stable ride for longer distances." }
];

const SIZES = [6, 7, 8, 9, 10, 11];

/* ---------- Helpers ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const money = n => CURRENCY + n.toLocaleString("en-IN");

function applyShoeColors(el, c) {
  el.style.setProperty("--upper", c.upper);
  el.style.setProperty("--accent", c.accent);
  el.style.setProperty("--sole", c.sole);
  el.style.setProperty("--outsole", c.outsole);
}

function shoeSVG(c, label) {
  return `<svg viewBox="0 0 410 190" role="img" aria-label="${label}" style="--upper:${c.upper};--accent:${c.accent};--sole:${c.sole};--outsole:${c.outsole}"><use href="#shoe"/></svg>`;
}

/* ---------- Toast ---------- */
let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ---------- Cart state ---------- */
let cart = [];
try { cart = JSON.parse(localStorage.getItem("tread-cart")) || []; } catch (e) { cart = []; }

function saveCart() {
  try { localStorage.setItem("tread-cart", JSON.stringify(cart)); } catch (e) { /* storage unavailable */ }
}

function addToCart(productId, size) {
  const found = cart.find(i => i.id === productId && i.size === size);
  if (found) found.qty += 1;
  else cart.push({ id: productId, size, qty: 1 });
  saveCart();
  renderCart(true);
  const p = products.find(p => p.id === productId);
  toast(`${p.name} (UK ${size}) added to cart`);
}

function changeQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  saveCart();
  renderCart();
}

function removeItem(index) {
  cart.splice(index, 1);
  saveCart();
  renderCart();
}

function renderCart(bump = false) {
  const list = $("#cartItems");
  const count = cart.reduce((n, i) => n + i.qty, 0);
  const total = cart.reduce((sum, i) => sum + i.qty * products.find(p => p.id === i.id).price, 0);

  list.innerHTML = cart.map((item, idx) => {
    const p = products.find(p => p.id === item.id);
    const c = colorways[p.color];
    return `
      <li class="cart-item" style="--bg:${c.bg}">
        <div class="cart-thumb">${shoeSVG(c, p.name)}</div>
        <div>
          <h3>${p.name}</h3>
          <p class="meta">${c.name} · UK ${item.size}</p>
          <div class="cart-row">
            <div class="qty">
              <button data-act="dec" data-i="${idx}" aria-label="Decrease quantity">−</button>
              <span>${item.qty}</span>
              <button data-act="inc" data-i="${idx}" aria-label="Increase quantity">+</button>
            </div>
            <strong>${money(p.price * item.qty)}</strong>
          </div>
          <button class="remove" data-act="rm" data-i="${idx}">Remove</button>
        </div>
      </li>`;
  }).join("");

  $("#cartEmpty").hidden = cart.length > 0;
  $(".drawer-foot").hidden = cart.length === 0;
  $("#cartTotal").textContent = money(total);

  const badge = $("#cartCount");
  badge.textContent = count;
  if (bump) {
    badge.classList.remove("bump");
    void badge.offsetWidth; // restart animation
    badge.classList.add("bump");
  }
}

$("#cartItems").addEventListener("click", e => {
  const btn = e.target.closest("button[data-act]");
  if (!btn) return;
  const i = Number(btn.dataset.i);
  if (btn.dataset.act === "inc") changeQty(i, 1);
  if (btn.dataset.act === "dec") changeQty(i, -1);
  if (btn.dataset.act === "rm") removeItem(i);
});

/* ---------- Drawer ---------- */
const drawer = $("#drawer");
const scrim = $("#scrim");
let lastFocus = null;

function openCart() {
  lastFocus = document.activeElement;
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
  scrim.hidden = false;
  $("#cartClose").focus();
}
function closeCart() {
  drawer.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
  scrim.hidden = true;
  if (lastFocus) lastFocus.focus();
}
$("#cartOpen").addEventListener("click", openCart);
$("#cartClose").addEventListener("click", closeCart);
scrim.addEventListener("click", closeCart);
document.addEventListener("keydown", e => { if (e.key === "Escape" && drawer.classList.contains("open")) closeCart(); });

$("#checkout").addEventListener("click", () => {
  toast("Checkout isn't connected yet. Hook this button up to your payment provider.");
});

/* ---------- Hero colour switcher ---------- */
const hero = $("#hero");
const heroShoe = $("#heroShoe");
const featured = products[0];
let heroColor = "tide";

function setHeroColor(key, animate = true) {
  heroColor = key;
  const c = colorways[key];
  hero.style.setProperty("--bg", c.bg);
  hero.style.setProperty("--text", c.text);
  applyShoeColors(heroShoe, c);
  $("#heroColor").textContent = c.name;
  $$(".swatch").forEach(s => s.setAttribute("aria-checked", String(s.dataset.color === key)));
  if (animate) {
    heroShoe.classList.remove("swap");
    void heroShoe.getBoundingClientRect();
    heroShoe.classList.add("swap");
  }
}

$(".swatches").innerHTML = Object.entries(colorways).map(([key, c]) =>
  `<button class="swatch" role="radio" aria-checked="false" data-color="${key}" aria-label="${c.name}" title="${c.name}" style="--sw:${c.upper}"></button>`
).join("");

$(".swatches").addEventListener("click", e => {
  const s = e.target.closest(".swatch");
  if (s) setHeroColor(s.dataset.color);
});

$("#heroName").textContent = featured.name;
$("#heroPrice").textContent = money(featured.price);
$("#heroAdd").addEventListener("click", () => addToCart(featured.id, 8));
setHeroColor("tide", false);

/* ---------- Product grid + filters ---------- */
function renderGrid(filter = "all") {
  const items = products.filter(p => filter === "all" || p.type === filter);
  $("#empty").hidden = items.length > 0;
  $("#grid").innerHTML = items.map(p => {
    const c = colorways[p.color];
    return `
      <article class="card">
        <div class="card-img" style="--bg:${c.bg}">${shoeSVG(c, `${p.name} in ${c.name}`)}</div>
        <div class="card-body">
          <div class="card-top"><h3>${p.name}</h3><span class="price">${money(p.price)}</span></div>
          <p class="meta">${p.type} · ${c.name}</p>
          <p>${p.note}</p>
          <div class="card-actions">
            <select aria-label="Size for ${p.name}" data-size-for="${p.id}">
              ${SIZES.map(s => `<option value="${s}" ${s === 8 ? "selected" : ""}>UK ${s}</option>`).join("")}
            </select>
            <button class="btn" data-add="${p.id}">Add to cart</button>
          </div>
        </div>
      </article>`;
  }).join("");
}

$("#grid").addEventListener("click", e => {
  const btn = e.target.closest("[data-add]");
  if (!btn) return;
  const id = Number(btn.dataset.add);
  const size = Number($(`[data-size-for="${id}"]`).value);
  addToCart(id, size);
});

$$(".chip").forEach(chip => chip.addEventListener("click", () => {
  $$(".chip").forEach(c => { c.classList.remove("is-active"); c.setAttribute("aria-pressed", "false"); });
  chip.classList.add("is-active");
  chip.setAttribute("aria-pressed", "true");
  renderGrid(chip.dataset.filter);
}));

/* ---------- Newsletter ---------- */
$("#joinForm").addEventListener("submit", e => {
  e.preventDefault();
  const input = $("#email");
  const msg = $("#formMsg");
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
  if (!valid) {
    input.setAttribute("aria-invalid", "true");
    msg.textContent = "Enter a valid email address, like you@example.com.";
    msg.className = "form-msg err";
    input.focus();
    return;
  }
  input.removeAttribute("aria-invalid");
  msg.textContent = "You're on the list. Watch your inbox for the next drop.";
  msg.className = "form-msg ok";
  input.value = "";
});

/* ---------- Init ---------- */
$("#year").textContent = new Date().getFullYear();
renderGrid();
renderCart();