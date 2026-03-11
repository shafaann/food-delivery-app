const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database
const db = new Database(path.join(__dirname, 'food_ordering.db'));
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS restaurants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    image TEXT,
    category TEXT,
    address TEXT,
    rating REAL DEFAULT 0,
    distance TEXT,
    deliveryTime TEXT,
    isOpen INTEGER DEFAULT 1,
    deliveryFee INTEGER DEFAULT 0,
    isVerified INTEGER DEFAULT 0,
    freeShipping INTEGER DEFAULT 0,
    heroImage TEXT,
    offer TEXT
  );

  CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurantId INTEGER NOT NULL,
    name TEXT NOT NULL,
    image TEXT,
    price REAL NOT NULL,
    category TEXT,
    isTopPick INTEGER DEFAULT 0,
    FOREIGN KEY (restaurantId) REFERENCES restaurants(id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customerPhone TEXT,
    customerAddress TEXT,
    subtotal REAL,
    deliveryFee REAL,
    total REAL,
    status TEXT DEFAULT 'confirmed',
    createdAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orderId INTEGER NOT NULL,
    menuItemId INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    price REAL NOT NULL,
    FOREIGN KEY (orderId) REFERENCES orders(id),
    FOREIGN KEY (menuItemId) REFERENCES menu_items(id)
  );
`);

// ============ SEED DATA ============
const existingCount = db.prepare('SELECT COUNT(*) as count FROM restaurants').get();
if (existingCount.count === 0) {
  console.log('🌱 Seeding database...');

  const insertRestaurant = db.prepare(`
    INSERT INTO restaurants (name, image, category, address, rating, distance, deliveryTime, isOpen, deliveryFee, isVerified, freeShipping, heroImage, offer)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMenuItem = db.prepare(`
    INSERT INTO menu_items (restaurantId, name, image, price, category, isTopPick)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const restaurantData = [
    { name: "Dominos", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop", category: "Pizza", address: "Anna nagar 600106", rating: 4.5, distance: "1.5km", deliveryTime: "20-30 Mins", isOpen: 1, deliveryFee: 45, isVerified: 1, freeShipping: 1, heroImage: null, offer: "save 15% on large pizzas", menu: [
      { name: "Margherita Pizza", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200&h=200&fit=crop", price: 299, category: "Pizzas", isTopPick: 1 },
      { name: "Pepperoni Pizza", image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=200&h=200&fit=crop", price: 449, category: "Pizzas", isTopPick: 1 },
      { name: "Garlic Breadsticks", image: "https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=200&h=200&fit=crop", price: 149, category: "Sides", isTopPick: 1 },
    ]},
    { name: "Subway", image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400&h=300&fit=crop", category: "Sandwich", address: "Adyar 600040", rating: 4.5, distance: "1.5km", deliveryTime: "15-25 Mins", isOpen: 1, deliveryFee: 30, isVerified: 1, freeShipping: 1, heroImage: null, offer: "Buy 1 Get 1 on 6-inch subs", menu: [
      { name: "Veggie Delight", image: "https://images.unsplash.com/photo-1554433607-66b5efe9d304?w=200&h=200&fit=crop", price: 199, category: "Subs", isTopPick: 1 },
      { name: "Chicken Teriyaki", image: "https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=200&h=200&fit=crop", price: 349, category: "Subs", isTopPick: 1 },
    ]},
    { name: "McDonald's", image: "https://images.unsplash.com/photo-1586816001966-79b736744398?w=400&h=300&fit=crop", category: "Burgers", address: "Anna nagar, Chennai, 60040", rating: 4.5, distance: "1.8km", deliveryTime: "20-30 Mins", isOpen: 1, deliveryFee: 45, isVerified: 1, freeShipping: 1, heroImage: "https://images.unsplash.com/photo-1586816001966-79b736744398?w=600&h=400&fit=crop", offer: "save 15% on Maharaja burgers", menu: [
      { name: "Mini Meal Combo", image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=200&h=200&fit=crop", price: 399, category: "Combo", isTopPick: 1 },
      { name: "McChicken", image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=200&h=200&fit=crop", price: 149, category: "Burgers", isTopPick: 1 },
      { name: "Family Meal", image: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=200&h=200&fit=crop", price: 699, category: "Combo", isTopPick: 1 },
      { name: "Combo Spicy Tender", image: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=200&h=200&fit=crop", price: 299, category: "Burger combo", isTopPick: 0 },
    ]},
    { name: "Burger King", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop", category: "Burgers", address: "T Nagar 600017", rating: 4.3, distance: "2km", deliveryTime: "25-35 Mins", isOpen: 1, deliveryFee: 40, isVerified: 1, freeShipping: 0, heroImage: null, offer: "save 20% on Whopper meals", menu: [
      { name: "Whopper", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop", price: 249, category: "Burger combo", isTopPick: 1 },
      { name: "Chicken Royale", image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=200&h=200&fit=crop", price: 199, category: "Burger combo", isTopPick: 1 },
    ]},
    { name: "Burger Man", image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop", category: "Burgers", address: "Mylapore 600004", rating: 4.0, distance: "3km", deliveryTime: "30-40 Mins", isOpen: 1, deliveryFee: 50, isVerified: 0, freeShipping: 0, heroImage: null, offer: "", menu: [
      { name: "Classic Burger", image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=200&h=200&fit=crop", price: 179, category: "Burgers", isTopPick: 1 },
    ]},
    { name: "Biggie's Burgers", image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop", category: "Burgers", address: "Velachery 600042", rating: 4.2, distance: "2.5km", deliveryTime: "25-35 Mins", isOpen: 1, deliveryFee: 35, isVerified: 0, freeShipping: 0, heroImage: null, offer: "", menu: [
      { name: "Texas BBQ Burger", image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=200&h=200&fit=crop", price: 249, category: "Burgers", isTopPick: 1 },
    ]},
    { name: "NORMAL BUNS", image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&h=300&fit=crop", category: "Burgers", address: "Tambaram 600045", rating: 3.9, distance: "4km", deliveryTime: "35-45 Mins", isOpen: 1, deliveryFee: 55, isVerified: 0, freeShipping: 0, heroImage: null, offer: "", menu: [
      { name: "Simple Bun Burger", image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=200&h=200&fit=crop", price: 99, category: "Burgers", isTopPick: 1 },
    ]},
  ];

  const seedAll = db.transaction(() => {
    for (const r of restaurantData) {
      const result = insertRestaurant.run(r.name, r.image, r.category, r.address, r.rating, r.distance, r.deliveryTime, r.isOpen, r.deliveryFee, r.isVerified, r.freeShipping, r.heroImage, r.offer);
      const restaurantId = result.lastInsertRowid;
      for (const m of r.menu) {
        insertMenuItem.run(restaurantId, m.name, m.image, m.price, m.category, m.isTopPick);
      }
    }
  });
  seedAll();
  console.log('✅ Database seeded!');
}

// ============ API ROUTES ============

// Get all restaurants
app.get('/api/restaurants', (req, res) => {
  const { category } = req.query;
  let restaurants;
  if (category) {
    restaurants = db.prepare('SELECT * FROM restaurants WHERE category = ?').all(category);
  } else {
    restaurants = db.prepare('SELECT * FROM restaurants').all();
  }
  res.json(restaurants);
});

// Get single restaurant with menu
app.get('/api/restaurants/:id', (req, res) => {
  const restaurant = db.prepare('SELECT * FROM restaurants WHERE id = ?').get(req.params.id);
  if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });

  const menu = db.prepare('SELECT * FROM menu_items WHERE restaurantId = ?').all(req.params.id);
  res.json({ ...restaurant, menu });
});

// Get restaurants by category
app.get('/api/categories/:category', (req, res) => {
  const restaurants = db.prepare('SELECT * FROM restaurants WHERE category = ?').all(req.params.category);
  res.json(restaurants);
});

// Create order
app.post('/api/orders', (req, res) => {
  const { customerPhone, customerAddress, items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'No items in order' });
  }

  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const menuItem = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(item.menuItemId);
    if (!menuItem) return res.status(400).json({ error: `Menu item ${item.menuItemId} not found` });
    const itemTotal = menuItem.price * item.quantity;
    subtotal += itemTotal;
    orderItems.push({ menuItemId: item.menuItemId, quantity: item.quantity, price: menuItem.price });
  }

  // Get delivery fee from the restaurant of the first item
  const firstItem = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(items[0].menuItemId);
  const restaurant = db.prepare('SELECT * FROM restaurants WHERE id = ?').get(firstItem.restaurantId);
  const deliveryFee = restaurant ? restaurant.deliveryFee : 45;
  const total = subtotal + deliveryFee;

  const createOrder = db.transaction(() => {
    const result = db.prepare(`
      INSERT INTO orders (customerPhone, customerAddress, subtotal, deliveryFee, total)
      VALUES (?, ?, ?, ?, ?)
    `).run(customerPhone || '(323) 238-0678', customerAddress || '909-1/2 E 49th St, Los Angeles, CA 90011', subtotal, deliveryFee, total);

    const orderId = result.lastInsertRowid;

    const insertOrderItem = db.prepare(`
      INSERT INTO order_items (orderId, menuItemId, quantity, price) VALUES (?, ?, ?, ?)
    `);

    for (const oi of orderItems) {
      insertOrderItem.run(orderId, oi.menuItemId, oi.quantity, oi.price);
    }

    return orderId;
  });

  const orderId = createOrder();
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  res.status(201).json(order);
});

// Get order by ID
app.get('/api/orders/:id', (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const items = db.prepare(`
    SELECT oi.*, mi.name, mi.image, mi.category 
    FROM order_items oi 
    JOIN menu_items mi ON oi.menuItemId = mi.id 
    WHERE oi.orderId = ?
  `).all(req.params.id);

  res.json({ ...order, items });
});

// ============ START SERVER ============
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📦 API available at http://localhost:${PORT}/api`);
});
