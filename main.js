import './index.css';

// ============ CONFIG & STATE ============
const API_URL = 'http://localhost:3001/api';

const state = {
  cart: [],
  currentRestaurant: null,
  currentCategory: null,
};

let restaurants = [];

const categories = [
  { name: "Burgers", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=150&h=150&fit=crop" },
  { name: "Pastas", image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=150&h=150&fit=crop" },
  { name: "Dosa", image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=150&h=150&fit=crop" },
  { name: "Ice Cream", image: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=150&h=150&fit=crop" },
  { name: "Pizza", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=150&h=150&fit=crop" },
  { name: "Sandwich", image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=150&h=150&fit=crop" },
];

// ============ HELPERS ============
function showToast(message) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

function svgIcon(type) {
  const icons = {
    check: '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>',
    star: '<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    back: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>',
    search: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    location: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    nav: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>',
    heart: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    filter: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/></svg>',
    clock: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    percent: '%',
    chevronDown: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>',
    mapPin: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    checkLg: '<svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>',
  };
  return icons[type] || '';
}

// ============ API CALLS ============
async function fetchRestaurants() {
  try {
    const response = await fetch(`${API_URL}/restaurants`);
    restaurants = await response.json();
    return restaurants;
  } catch (err) {
    console.error('API Error:', err);
    showToast('Failed to load restaurants');
    return [];
  }
}

async function fetchRestaurantDetails(id) {
  try {
    const response = await fetch(`${API_URL}/restaurants/${id}`);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('API Error:', err);
    showToast('Failed to load menu');
    return null;
  }
}

async function submitOrder(orderData) {
  try {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    return await response.json();
  } catch (err) {
    console.error('API Error:', err);
    return null;
  }
}

// ============ PAGES ============

async function renderHome() {
  const container = document.getElementById('page-container');
  document.getElementById('bottom-nav').classList.remove('hidden');
  setActiveNav('home');

  if (restaurants.length === 0) {
    await fetchRestaurants();
  }

  container.innerHTML = `
    <div class="search-container">
      <div class="search-bar" id="home-search-bar">
        ${svgIcon('location')}
        <input type="text" placeholder="search on serving" id="home-search-input" />
      </div>
      <div class="delivery-row">
        <div class="delivery-info">
          ${svgIcon('nav')}
          <div>
            <div class="delivery-label">Delivery to</div>
            <div class="delivery-address">1014 Prospect Valley ${svgIcon('chevronDown')}</div>
          </div>
        </div>
        <button class="filter-btn" id="filter-btn">${svgIcon('filter')} Filter</button>
      </div>
    </div>

    <div class="filter-chips">
      <button class="filter-chip active">Nearby</button>
      <button class="filter-chip">Sales</button>
      <button class="filter-chip">Rating</button>
      <button class="filter-chip">Fast Delivery</button>
    </div>

    <div class="section">
      <div class="section-header">
        <h2 class="section-title">Best Partners</h2>
        <button class="section-link" id="see-all-partners">See all</button>
      </div>
      <div class="partners-grid">
        ${restaurants.filter(r => r.isVerified).map(r => `
          <div class="partner-card" data-id="${r.id}" id="partner-${r.id}">
            <img class="partner-card-img" src="${r.image}" alt="${r.name}" loading="lazy" />
            <div class="partner-card-body">
              <div class="partner-name">${r.name} ${r.isVerified ? `<span class="verified-badge">${svgIcon('check')}</span>` : ''}</div>
              <div class="partner-status">
                <span class="status-open">Open</span>
                <span>·</span>
                <span>${r.address}</span>
              </div>
              <div class="partner-meta">
                <span class="rating-badge">${svgIcon('star')} ${r.rating}</span>
                <span>${r.distance}</span>
                ${r.freeShipping ? '<span>· Free shipping</span>' : ''}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="categories-section">
      <div class="categories-title">whats on your mind?</div>
      <div class="categories-grid">
        ${categories.map(c => `
          <div class="category-item" data-category="${c.name}" id="category-${c.name.toLowerCase().replace(/\s+/g, '-')}">
            <img class="category-img" src="${c.image}" alt="${c.name}" loading="lazy" />
            <span class="category-name">${c.name}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Event Listeners
  container.querySelectorAll('.partner-card').forEach(card => {
    card.addEventListener('click', async () => {
      const id = parseInt(card.dataset.id);
      renderLoading();
      state.currentRestaurant = await fetchRestaurantDetails(id);
      if (state.currentRestaurant) renderRestaurant();
    });
  });

  container.querySelectorAll('.category-item').forEach(item => {
    item.addEventListener('click', () => {
      state.currentCategory = item.dataset.category;
      renderCategory();
    });
  });

  container.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      container.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });
}

function renderLoading() {
  const container = document.getElementById('page-container');
  container.innerHTML = `
    <div style="display:flex; justify-content:center; align-items:center; height:100vh; color:var(--color-primary)">
      Loading...
    </div>
  `;
}

async function renderCategory() {
  const container = document.getElementById('page-container');
  document.getElementById('bottom-nav').classList.remove('hidden');
  setActiveNav('home');
  const category = state.currentCategory;
  
  if (restaurants.length === 0) await fetchRestaurants();
  const filteredRestaurants = restaurants.filter(r => r.category === category);

  container.innerHTML = `
    <div class="page-header">
      <button class="back-btn" id="category-back">${svgIcon('back')}</button>
      <h1 class="page-title">${category}</h1>
    </div>
    <div class="restaurant-list">
      ${filteredRestaurants.length > 0 ? filteredRestaurants.map(r => `
        <div class="restaurant-item" data-id="${r.id}">
          <img class="restaurant-item-img" src="${r.image}" alt="${r.name}" loading="lazy" />
          <div class="restaurant-item-info">
            <div class="restaurant-item-name">${r.name}</div>
            <div class="restaurant-item-meta">
              <span class="restaurant-item-price">Rs.200</span>
              <span>·</span>
              <span>Food</span>
            </div>
          </div>
          <span class="restaurant-item-star">★</span>
        </div>
      `).join('') : '<div style="padding: 20px; text-align: center;">No restaurants found in this category.</div>'}
    </div>
  `;

  document.getElementById('category-back').addEventListener('click', renderHome);

  container.querySelectorAll('.restaurant-item').forEach(item => {
    item.addEventListener('click', async () => {
      const id = parseInt(item.dataset.id);
      renderLoading();
      state.currentRestaurant = await fetchRestaurantDetails(id);
      if (state.currentRestaurant) renderRestaurant();
    });
  });
}

function renderRestaurant() {
  const container = document.getElementById('page-container');
  document.getElementById('bottom-nav').classList.add('hidden');
  const r = state.currentRestaurant;
  
  const menu = r.menu || [];
  const topPicks = menu.filter(m => m.isTopPick);
  const menuGroups = {};
  menu.forEach(m => {
    if (!menuGroups[m.category]) menuGroups[m.category] = [];
    menuGroups[m.category].push(m);
  });

  container.innerHTML = `
    <div class="restaurant-hero">
      <img src="${r.heroImage || r.image}" alt="${r.name}" />
      <div class="restaurant-hero-overlay">
        <button class="hero-btn" id="restaurant-back">${svgIcon('back')}</button>
        <div class="hero-actions">
          <button class="hero-btn">${svgIcon('search')}</button>
          <button class="hero-btn" id="restaurant-fav">${svgIcon('heart')}</button>
        </div>
      </div>
    </div>

    <div class="restaurant-info-card">
      <div class="restaurant-info-name">
        ${r.name}
        ${r.isVerified ? `<span class="verified-badge">${svgIcon('check')}</span>` : ''}
      </div>
      <div class="restaurant-info-row">
        <div class="restaurant-info-status">
          <span class="status-open">Open</span>
          <span>·</span>
          <span>${r.address}</span>
        </div>
        <span class="take-away-badge">Take Away 💛</span>
      </div>
      <div class="restaurant-info-stats">
        <span class="rating-badge">${svgIcon('star')} ${r.rating}</span>
        <span class="stat-item">${svgIcon('clock')} ${r.deliveryTime}</span>
      </div>
    </div>

    ${r.offer ? `
      <div class="offer-banner">
        <span class="offer-banner-icon">${svgIcon('percent')}</span>
        <span class="offer-banner-text">${r.offer}</span>
      </div>
    ` : ''}

    <div class="menu-search">
      <div class="search-bar">
        ${svgIcon('search')}
        <input type="text" placeholder="search for dishes" id="menu-search-input" />
      </div>
    </div>

    <div class="tabs">
      <button class="tab active" id="tab-delivery">Delivery</button>
      <button class="tab" id="tab-review">Review</button>
    </div>

    ${topPicks.length > 0 ? `
      <div class="top-picks">
        <h2 class="top-picks-title">Top Picks</h2>
        <div class="top-picks-scroll">
          ${topPicks.map(item => `
            <div class="top-pick-card" data-item-id="${item.id}" id="top-pick-${item.id}">
              <img class="top-pick-img" src="${item.image}" alt="${item.name}" loading="lazy" />
              <div class="top-pick-name">${item.name}</div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    ${Object.entries(menuGroups).map(([cat, items]) => `
      <div class="menu-section">
        <h3 class="menu-section-title">${cat}</h3>
        ${items.map(item => `
          <div class="menu-item" data-item-id="${item.id}" id="menu-${item.id}">
            <img class="menu-item-img" src="${item.image}" alt="${item.name}" loading="lazy" />
            <div class="menu-item-info">
              <div class="menu-item-name">${item.name}</div>
              <div class="menu-item-details">
                <span class="menu-item-price">₹ ${item.price}</span>
                <span>·</span>
                <span>${item.category}</span>
              </div>
            </div>
            <span class="menu-item-star">★</span>
          </div>
        `).join('')}
      </div>
    `).join('')}
  `;

  // Event listeners
  document.getElementById('restaurant-back').addEventListener('click', () => {
    if (state.currentCategory) renderCategory();
    else renderHome();
  });

  document.getElementById('restaurant-fav').addEventListener('click', () => {
    showToast('❤️ Added to favorites!');
  });

  container.querySelectorAll('.top-pick-card, .menu-item').forEach(el => {
    el.addEventListener('click', () => {
      const itemId = parseInt(el.dataset.itemId);
      const menuItem = r.menu.find(m => m.id === itemId);
      if (menuItem) renderProductDetail(menuItem);
    });
  });

  // Tab switching
  document.getElementById('tab-delivery').addEventListener('click', function() {
    this.classList.add('active');
    document.getElementById('tab-review').classList.remove('active');
  });
  document.getElementById('tab-review').addEventListener('click', function() {
    this.classList.add('active');
    document.getElementById('tab-delivery').classList.remove('active');
  });
}

function renderProductDetail(menuItem) {
  const container = document.getElementById('page-container');
  document.getElementById('bottom-nav').classList.add('hidden');
  const r = state.currentRestaurant;
  const menu = r.menu || [];
  const topPicks = menu.filter(m => m.isTopPick);
  const menuGroups = {};
  menu.forEach(m => {
    if (!menuGroups[m.category]) menuGroups[m.category] = [];
    menuGroups[m.category].push(m);
  });

  let qty = 1;

  container.innerHTML = `
    <div class="page-header">
      <button class="back-btn" id="product-back">${svgIcon('back')}</button>
      <h1 class="page-title">${r.name}</h1>
    </div>

    ${topPicks.length > 0 ? `
      <div class="top-picks">
        <h2 class="top-picks-title">Top Picks</h2>
        <div class="top-picks-scroll">
          ${topPicks.map(item => `
            <div class="top-pick-card ${item.id === menuItem.id ? 'active' : ''}" data-item-id="${item.id}">
              <img class="top-pick-img" src="${item.image}" alt="${item.name}" loading="lazy" />
              <div class="top-pick-name">${item.name}</div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    ${Object.entries(menuGroups).map(([cat, items]) => `
      <div class="menu-section">
        <h3 class="menu-section-title">${cat}</h3>
        ${items.map(item => `
          <div class="menu-item" data-item-id="${item.id}">
            <img class="menu-item-img" src="${item.image}" alt="${item.name}" loading="lazy" />
            <div class="menu-item-info">
              <div class="menu-item-name">${item.name}</div>
              <div class="menu-item-details">
                <span class="menu-item-price">₹ ${item.price}</span>
                <span>·</span>
                <span>${item.category}</span>
              </div>
            </div>
            <span class="menu-item-star">★</span>
          </div>
        `).join('')}
      </div>
    `).join('')}

    <div class="product-detail-section">
      <div class="product-detail-card">
        <img class="product-detail-img" src="${menuItem.image}" alt="${menuItem.name}" />
        <div>
          <div class="product-detail-name">${menuItem.name}</div>
          <div class="product-detail-price"><span>Rs.</span> ${menuItem.price}</div>
        </div>
      </div>
    </div>
    <div class="add-to-cart-bar">
      <div class="qty-selector">
        <button class="qty-btn" id="qty-minus">−</button>
        <span class="qty-value" id="qty-value">${qty}</span>
        <button class="qty-btn" id="qty-plus">+</button>
      </div>
      <button class="add-to-cart-btn" id="add-to-cart-btn">Add To Cart</button>
    </div>
  `;

  // Qty buttons
  document.getElementById('qty-minus').addEventListener('click', () => {
    if (qty > 1) {
      qty--;
      document.getElementById('qty-value').textContent = qty;
    }
  });

  document.getElementById('qty-plus').addEventListener('click', () => {
    qty++;
    document.getElementById('qty-value').textContent = qty;
  });

  // Add to cart
  document.getElementById('add-to-cart-btn').addEventListener('click', () => {
    const existingIndex = state.cart.findIndex(c => c.item.id === menuItem.id);
    if (existingIndex >= 0) {
      state.cart[existingIndex].qty += qty;
    } else {
      state.cart.push({ item: menuItem, qty, restaurant: r });
    }
    showToast(`🛒 Added ${qty}x ${menuItem.name} to cart!`);
    setTimeout(() => renderCheckout(), 800);
  });

  // Back button
  document.getElementById('product-back').addEventListener('click', () => renderRestaurant());

  // Click other items to switch
  container.querySelectorAll('.top-pick-card, .menu-item').forEach(el => {
    el.addEventListener('click', () => {
      const itemId = parseInt(el.dataset.itemId);
      const item = r.menu.find(m => m.id === itemId);
      if (item) renderProductDetail(item);
    });
  });
}

function renderCheckout() {
  const container = document.getElementById('page-container');
  document.getElementById('bottom-nav').classList.add('hidden');

  if (state.cart.length === 0) {
    showToast('Your cart is empty!');
    renderHome();
    return;
  }

  const cartItem = state.cart[0];
  const subtotal = state.cart.reduce((sum, c) => sum + c.item.price * c.qty, 0);
  const deliveryFee = cartItem.restaurant.deliveryFee;
  const total = subtotal + deliveryFee;

  container.innerHTML = `
    <div class="page-header">
      <button class="back-btn" id="checkout-back">${svgIcon('back')}</button>
      <h1 class="page-title">Confirm Order</h1>
    </div>

    <div class="checkout-section">
      <div class="delivery-card">
        <div class="delivery-card-title">Delivery to</div>
        <div class="delivery-card-body">
          <div class="delivery-map">
            ${svgIcon('mapPin')}
          </div>
          <div class="delivery-details">
            <div class="delivery-phone">(323) 238-0678</div>
            <div class="delivery-full-address">909-1/2 E 49th St<br/>Los Angeles, California(CA), 90011</div>
            <div class="delivery-distance">${svgIcon('mapPin')} 1.5 km</div>
          </div>
        </div>
      </div>

      <div class="order-summary-card">
        ${state.cart.map(c => `
          <div class="order-item-row">
            <img class="order-item-img" src="${c.item.image}" alt="${c.item.name}" />
            <div class="order-item-info">
              <div class="order-item-name">${c.item.name}</div>
              <div class="order-item-price-big"><span>Rs.</span> ${c.item.price}</div>
              <div class="checkout-qty-selector">
                <button class="checkout-qty-btn cart-minus" data-id="${c.item.id}">−</button>
                <span class="checkout-qty-value">${c.qty}</span>
                <button class="checkout-qty-btn cart-plus" data-id="${c.item.id}">+</button>
              </div>
            </div>
          </div>
        `).join('')}

        <div class="price-row">
          <span>Subtotal (${state.cart.reduce((s, c) => s + c.qty, 0)} item${state.cart.reduce((s, c) => s + c.qty, 0) > 1 ? 's' : ''})</span>
          <span class="price-value">Rs.${subtotal}</span>
        </div>
        <div class="price-row">
          <span>Delivery</span>
          <span class="price-value">Rs.${deliveryFee}</span>
        </div>
        <div class="price-row">
          <span>Voucher</span>
          <span class="price-value">—</span>
        </div>
        <div class="price-row total">
          <span>Total</span>
          <span class="price-value">Rs.${total}</span>
        </div>

        <button class="confirm-order-btn" id="confirm-order-btn">Confirm Order</button>
      </div>
    </div>
  `;

  // Back
  document.getElementById('checkout-back').addEventListener('click', () => renderRestaurant());

  // Qty controls in checkout
  container.querySelectorAll('.cart-minus').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      const cartIdx = state.cart.findIndex(c => c.item.id === id);
      if (cartIdx >= 0 && state.cart[cartIdx].qty > 1) {
        state.cart[cartIdx].qty--;
        renderCheckout();
      }
    });
  });

  container.querySelectorAll('.cart-plus').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      const cartIdx = state.cart.findIndex(c => c.item.id === id);
      if (cartIdx >= 0) {
        state.cart[cartIdx].qty++;
        renderCheckout();
      }
    });
  });

  // Confirm order (send to backend)
  const confirmBtn = document.getElementById('confirm-order-btn');
  confirmBtn.addEventListener('click', async () => {
    confirmBtn.textContent = 'Processing...';
    confirmBtn.disabled = true;

    const orderData = {
      customerPhone: '(323) 238-0678',
      customerAddress: '909-1/2 E 49th St, Los Angeles, CA 90011',
      items: state.cart.map(c => ({
        menuItemId: c.item.id,
        quantity: c.qty
      }))
    };

    const res = await submitOrder(orderData);
    if (res && res.id) {
      state.cart = []; // clear cart
      renderOrderSuccess();
    } else {
      showToast('Error placing order');
      confirmBtn.textContent = 'Confirm Order';
      confirmBtn.disabled = false;
    }
  });
}

function renderOrderSuccess() {
  const container = document.getElementById('page-container');
  document.getElementById('bottom-nav').classList.add('hidden');

  container.innerHTML = `
    <div class="success-page">
      <div class="success-icon">
        ${svgIcon('checkLg')}
      </div>
      <h1 class="success-title">Order Confirmed!</h1>
      <p class="success-message">Your food will be delivered<br/>within 20 minutes 🎉</p>
      <button class="success-btn" id="back-home-btn">Back to Home</button>
    </div>
  `;

  document.getElementById('back-home-btn').addEventListener('click', () => {
    renderHome();
  });
}

// ============ NAV ============
function setActiveNav(page) {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });
}

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    const page = item.dataset.page;
    setActiveNav(page);
    if (page === 'home') renderHome();
    else if (page === 'orders') {
      if (state.cart.length > 0) renderCheckout();
      else showToast('No orders yet. Start ordering!');
    }
    else showToast(`${page.charAt(0).toUpperCase() + page.slice(1)} coming soon!`);
  });
});

// ============ INIT ============
renderHome();
