// Mercado Fácil - protótipo acadêmico de mercado online
document.addEventListener("DOMContentLoaded", () => {
  const products = [
    { id: 1, name: "Banana", category: "Hortifruti", unit: "1 kg", price: 5.99, emoji: "🍌", bg: "#fff4d7" },
    { id: 2, name: "Maçã", category: "Hortifruti", unit: "1 kg", price: 8.49, emoji: "🍎", bg: "#ffeded" },
    { id: 3, name: "Alface", category: "Hortifruti", unit: "unidade", price: 3.50, emoji: "🥬", bg: "#e9f7df" },
    { id: 4, name: "Tomate", category: "Hortifruti", unit: "1 kg", price: 6.99, emoji: "🍅", bg: "#ffeded" },
    { id: 5, name: "Arroz", category: "Mercearia", unit: "5 kg", price: 24.90, emoji: "🍚", bg: "#f5f0e8" },
    { id: 6, name: "Feijão", category: "Mercearia", unit: "1 kg", price: 8.99, emoji: "🫘", bg: "#f5e8df" },
    { id: 7, name: "Macarrão", category: "Mercearia", unit: "500 g", price: 4.79, emoji: "🍝", bg: "#fff2d8" },
    { id: 8, name: "Café", category: "Mercearia", unit: "500 g", price: 16.90, emoji: "☕", bg: "#f1e8df" },
    { id: 9, name: "Leite", category: "Laticínios", unit: "1 litro", price: 5.49, emoji: "🥛", bg: "#eaf4ff" },
    { id: 10, name: "Queijo", category: "Laticínios", unit: "300 g", price: 12.90, emoji: "🧀", bg: "#fff4ce" },
    { id: 11, name: "Iogurte", category: "Laticínios", unit: "170 g", price: 2.99, emoji: "🥣", bg: "#f8eafa" },
    { id: 12, name: "Pão francês", category: "Padaria", unit: "unidade", price: 0.90, emoji: "🥖", bg: "#fff0d7" }
  ];

  const cart = new Map();
  let activeCategory = "Todos";
  let toastTimer;

  const grid = document.querySelector("#product-grid");
  const search = document.querySelector("#product-search");
  const emptyState = document.querySelector("#empty-state");
  const cartCount = document.querySelector("#cart-count");
  const cartModal = document.querySelector("#cart-modal");
  const loginModal = document.querySelector("#login-modal");
  const toast = document.querySelector("#toast");

  const money = value => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
  }

  function renderProducts() {
    const term = search.value.trim().toLocaleLowerCase("pt-BR");
    const visible = products.filter(product => {
      const matchesCategory = activeCategory === "Todos" || product.category === activeCategory;
      const matchesSearch = `${product.name} ${product.category}`.toLocaleLowerCase("pt-BR").includes(term);
      return matchesCategory && matchesSearch;
    });

    grid.innerHTML = visible.map(product => `
      <article class="product-card">
        <div class="product-visual" style="--visual-bg:${product.bg}" aria-hidden="true">${product.emoji}</div>
        <span class="product-category">${product.category}</span>
        <h3>${product.name}</h3>
        <span class="product-unit">${product.unit}</span>
        <div class="product-bottom">
          <span class="product-price">${money(product.price)}</span>
          <button class="add-button" data-add="${product.id}" aria-label="Adicionar ${product.name} ao carrinho" title="Adicionar ao carrinho">+</button>
        </div>
      </article>
    `).join("");

    emptyState.classList.toggle("hidden", visible.length > 0);
  }

  function addToCart(productId) {
    const current = cart.get(productId) || 0;
    cart.set(productId, current + 1);
    updateCart();
    const product = products.find(item => item.id === productId);
    showToast(`${product.name} adicionado ao carrinho!`);
  }

  function updateCart() {
    const totalItems = [...cart.values()].reduce((sum, quantity) => sum + quantity, 0);
    cartCount.textContent = totalItems;

    const itemsContainer = document.querySelector("#cart-items");
    const empty = document.querySelector("#cart-empty");
    const subtotalElement = document.querySelector("#cart-subtotal");
    const totalElement = document.querySelector("#cart-total");

    let subtotal = 0;
    itemsContainer.innerHTML = [...cart.entries()].map(([id, quantity]) => {
      const product = products.find(item => item.id === id);
      subtotal += product.price * quantity;
      return `
        <article class="cart-item">
          <div class="cart-item-emoji">${product.emoji}</div>
          <div>
            <h3>${product.name}</h3>
            <small>${money(product.price)} / ${product.unit}</small>
            <div class="quantity-controls">
              <button data-quantity="${id}" data-change="-1" aria-label="Diminuir ${product.name}">−</button>
              <span>${quantity}</span>
              <button data-quantity="${id}" data-change="1" aria-label="Aumentar ${product.name}">+</button>
            </div>
          </div>
          <span class="cart-line-price">${money(product.price * quantity)}</span>
        </article>`;
    }).join("");

    empty.classList.toggle("hidden", cart.size > 0);
    subtotalElement.textContent = money(subtotal);
    totalElement.textContent = money(subtotal);
  }

  function openModal(modal) {
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    const focusable = modal.querySelector("button, input");
    if (focusable) focusable.focus();
  }

  function closeModal(modal) {
    modal.classList.add("hidden");
    document.body.style.overflow = "";
  }

  grid.addEventListener("click", event => {
    const button = event.target.closest("[data-add]");
    if (button) addToCart(Number(button.dataset.add));
  });

  search.addEventListener("input", renderProducts);

  document.querySelectorAll(".filter-chip").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelector(".filter-chip.active")?.classList.remove("active");
      button.classList.add("active");
      activeCategory = button.dataset.category;
      renderProducts();
    });
  });

  document.querySelector("#open-cart").addEventListener("click", () => {
    updateCart();
    openModal(cartModal);
  });

  document.querySelector("#open-login").addEventListener("click", () => openModal(loginModal));

  document.querySelectorAll("[data-close]").forEach(button => {
    button.addEventListener("click", () => closeModal(document.getElementById(button.dataset.close)));
  });

  [cartModal, loginModal].forEach(modal => {
    modal.addEventListener("click", event => {
      if (event.target === modal) closeModal(modal);
    });
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeModal(cartModal);
      closeModal(loginModal);
    }
  });

  document.querySelector("#cart-items").addEventListener("click", event => {
    const button = event.target.closest("[data-quantity]");
    if (!button) return;
    const id = Number(button.dataset.quantity);
    const next = (cart.get(id) || 0) + Number(button.dataset.change);
    if (next <= 0) cart.delete(id);
    else cart.set(id, next);
    updateCart();
  });

  document.querySelector("#checkout-button").addEventListener("click", () => {
    if (cart.size === 0) {
      showToast("Adicione pelo menos um produto antes de finalizar.");
      return;
    }
    const total = [...cart.entries()].reduce((sum, [id, quantity]) => {
      return sum + products.find(product => product.id === id).price * quantity;
    }, 0);
    showToast(`Pedido demonstrativo criado! Total: ${money(total)}.`);
    cart.clear();
    updateCart();
    closeModal(cartModal);
  });

  document.querySelector("#login-form").addEventListener("submit", event => {
    event.preventDefault();
    const name = document.querySelector("#login-name").value.trim();
    showToast(`Olá, ${name}! Acesso demonstrativo realizado.`);
    closeModal(loginModal);
    event.target.reset();
    document.querySelector("#open-login").textContent = "Minha conta";
  });

  document.querySelector("#current-year").textContent = new Date().getFullYear();

  renderProducts();
  updateCart();
});
