/* =========================================
   Valley Notebooks – script.js
   Frontend Logic (Products, Cart, Checkout)
   ========================================= */

const PRODUCTS = {
  copy: {
    image: "images/copy.jpg",
    items: [
      { pages: 24, price: 10 },
      { pages: 48, price: 20 },
      { pages: 72, price: 30 },
      { pages: 96, price: 40 },
      { pages: 120, price: 50 },
      { pages: 144, price: 60 },
      { pages: 168, price: 70 },
      { pages: 192, price: 80 },
      { pages: 216, price: 90 },
      { pages: 240, price: 100 },
      { pages: 288, price: 120 },
      { pages: 360, price: 150 },
      { pages: 432, price: 180 },
      { pages: 480, price: 200 },
      { pages: 552, price: 230 },
      { pages: 600, price: 250 },
      { pages: 672, price: 280 },
      { pages: 720, price: 300 }
    ]
  },
  jumbo: {
    image: "images/jumbo.jpg",
    items: [
      { pages: 72, price: 30 },
      { pages: 96, price: 40 },
      { pages: 120, price: 50 },
      { pages: 144, price: 60 },
      { pages: 168, price: 70 },
      { pages: 192, price: 80 },
      { pages: 216, price: 90 },
      { pages: 240, price: 100 },
      { pages: 288, price: 120 },
      { pages: 360, price: 150 },
      { pages: 432, price: 180 },
      { pages: 480, price: 200 },
      { pages: 552, price: 230 },
      { pages: 600, price: 250 },
      { pages: 672, price: 280 },
      { pages: 720, price: 300 }
    ]
  },
  a4: {
    image: "images/a4.jpg",
    items: [
      { pages: 72, price: 30 },
      { pages: 96, price: 40 },
      { pages: 120, price: 50 },
      { pages: 144, price: 60 },
      { pages: 168, price: 70 },
      { pages: 192, price: 80 },
      { pages: 216, price: 90 },
      { pages: 240, price: 100 },
      { pages: 288, price: 120 },
      { pages: 360, price: 150 },
      { pages: 432, price: 180 },
      { pages: 480, price: 200 },
      { pages: 552, price: 230 },
      { pages: 600, price: 250 },
      { pages: 672, price: 280 },
      { pages: 720, price: 300 }
    ]
  },
  spiral: {
    image: "images/spiral.jpg",
    items: [
      { pages: 240, price: 100 },
      { pages: 288, price: 120 },
      { pages: 360, price: 150 },
      { pages: 432, price: 180 },
      { pages: 480, price: 200 },
      { pages: 552, price: 230 },
      { pages: 600, price: 250 },
      { pages: 672, price: 280 },
      { pages: 720, price: 300 }
    ]
  }
};

let cart = JSON.parse(localStorage.getItem("vn_cart")) || [];

const productGrid = document.getElementById("productGrid");
const cartBtn = document.getElementById("cartBtn");
const cartDrawer = document.getElementById("cartDrawer");
const closeCart = document.getElementById("closeCart");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartCount = document.getElementById("cartCount");
const checkoutBtn = document.getElementById("checkoutBtn");
const checkoutSection = document.getElementById("checkoutSection");
const checkoutForm = document.getElementById("checkoutForm");
const thankYou = document.getElementById("thankYou");
const orderIdEl = document.getElementById("orderId");
const deliveryDateEl = document.getElementById("deliveryDate");
const scrollTopBtn = document.getElementById("scrollTop");

let activeCategory = "copy";

/* ================= PRODUCTS ================= */
function renderProducts() {
  productGrid.innerHTML = "";
  const data = PRODUCTS[activeCategory];

  data.items.forEach(item => {
    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
      <img src="${data.image}" alt="Notebook">
      <h3>${activeCategory.toUpperCase()} Notebook</h3>
      <p>${item.pages} pages</p>
      <div class="price">₹${item.price}</div>
      <button class="primary-btn" data-pages="${item.pages}" data-price="${item.price}">
        Add to Cart
      </button>
    `;

    card.querySelector("button").addEventListener("click", () => {
      addToCart(activeCategory, item.pages, item.price, data.image);
    });

    productGrid.appendChild(card);
  });
}

/* ================= CART ================= */
function addToCart(category, pages, price, image) {
  const existing = cart.find(
    i => i.category === category && i.pages === pages
  );

  if (existing) {
    existing.qty += 500;
  } else {
    cart.push({
      category,
      pages,
      price,
      image,
      qty: 500
    });
  }

  saveCart();
  renderCart();
}

function renderCart() {
  cartItems.innerHTML = "";
  let total = 0;
  let totalQty = 0;

  cart.forEach((item, index) => {
    total += item.price * item.qty;
    totalQty += item.qty;

    const div = document.createElement("div");
    div.className = "cart-item";

    div.innerHTML = `
      <img src="${item.image}">
      <div>
        <strong>${item.category.toUpperCase()}</strong><br>
        ${item.pages} pages<br>
        ₹${item.price} × ${item.qty}
      </div>
      <button data-index="${index}">✕</button>
    `;

    div.querySelector("button").addEventListener("click", () => {
      cart.splice(index, 1);
      saveCart();
      renderCart();
    });

    cartItems.appendChild(div);
  });

  cartTotal.textContent = total;
  cartCount.textContent = cart.length;
  checkoutBtn.disabled = totalQty < 500;
}

function saveCart() {
  localStorage.setItem("vn_cart", JSON.stringify(cart));
}

/* ================= CHECKOUT ================= */
checkoutBtn.addEventListener("click", () => {
  checkoutSection.classList.remove("hidden");
  cartDrawer.classList.remove("open");
  window.scrollTo(0, checkoutSection.offsetTop);
});

checkoutForm.addEventListener("submit", e => {
  e.preventDefault();

  const phone = document.getElementById("phone").value;
  const pin = document.getElementById("pincode").value;

  if (!/^[6-9]\d{9}$/.test(phone)) {
    alert("Invalid phone number");
    return;
  }

  if (!/^\d{6}$/.test(pin)) {
    alert("Invalid pincode");
    return;
  }

  const orderId = "VN" + Date.now();
  orderIdEl.textContent = orderId;

  const date = new Date();
  date.setDate(date.getDate() + 7);
  deliveryDateEl.textContent = date.toDateString();

  checkoutSection.classList.add("hidden");
  thankYou.classList.remove("hidden");

  cart = [];
  saveCart();
  renderCart();
});

/* ================= TABS ================= */
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    activeCategory = tab.dataset.category;
    renderProducts();
  });
});

/* ================= UI ================= */
cartBtn.addEventListener("click", () => cartDrawer.classList.add("open"));
closeCart.addEventListener("click", () => cartDrawer.classList.remove("open"));

window.addEventListener("scroll", () => {
  scrollTopBtn.classList.toggle("show", window.scrollY > 300);
});

scrollTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ================= INIT ================= */
renderProducts();
renderCart();