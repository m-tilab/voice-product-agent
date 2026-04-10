const express = require("express");
const app = express();
const PORT = process.env.PORT || 8081;

// ─── Sample product catalog (20 products) ──────────────────────────────────
const PRODUCTS = [
  {
    id: "p001",
    name: "Apple AirPods Pro (2nd Gen)",
    description: "Active noise cancellation, adaptive transparency, personalized spatial audio with dynamic head tracking.",
    price: 249.99,
    currency: "USD",
    category: "audio",
    imageUrl: "https://picsum.photos/seed/airpods/400/300",
    inStock: true,
    tags: ["wireless", "earbuds", "noise-cancelling", "apple", "bluetooth"],
  },
  {
    id: "p002",
    name: "Sony WH-1000XM5 Headphones",
    description: "Industry-leading noise cancellation with 30-hour battery life. Exceptional call quality with 8 microphones.",
    price: 349.99,
    currency: "USD",
    category: "audio",
    imageUrl: "https://picsum.photos/seed/sony-wh/400/300",
    inStock: true,
    tags: ["wireless", "headphones", "noise-cancelling", "sony", "over-ear"],
  },
  {
    id: "p003",
    name: 'Samsung 65" QLED 4K TV',
    description: "Quantum Dot technology with 100% color volume. Neo QLED AI upscaling, 4K resolution, HDR10+.",
    price: 1299.99,
    currency: "USD",
    category: "tv",
    imageUrl: "https://picsum.photos/seed/samsung-tv/400/300",
    inStock: true,
    tags: ["television", "4k", "qled", "samsung", "smart-tv"],
  },
  {
    id: "p004",
    name: "iPhone 16 Pro 256GB",
    description: "A18 Pro chip, titanium design, 48MP camera system with 5x optical zoom, Action button.",
    price: 1099.99,
    currency: "USD",
    category: "smartphone",
    imageUrl: "https://picsum.photos/seed/iphone16/400/300",
    inStock: true,
    tags: ["phone", "apple", "5g", "camera", "ios"],
  },
  {
    id: "p005",
    name: "Samsung Galaxy S25 Ultra",
    description: "Snapdragon 8 Elite, built-in S Pen, 200MP camera, 12GB RAM. The ultimate Android flagship.",
    price: 1299.99,
    currency: "USD",
    category: "smartphone",
    imageUrl: "https://picsum.photos/seed/galaxy-s25/400/300",
    inStock: false,
    tags: ["phone", "samsung", "android", "5g", "s-pen"],
  },
  {
    id: "p006",
    name: "MacBook Pro 14\" M4 Pro",
    description: "M4 Pro chip, Liquid Retina XDR display, 18GB unified memory, 22-hour battery life.",
    price: 1999.99,
    currency: "USD",
    category: "laptop",
    imageUrl: "https://picsum.photos/seed/macbook-m4/400/300",
    inStock: true,
    tags: ["laptop", "apple", "macos", "m4", "professional"],
  },
  {
    id: "p007",
    name: "Dell XPS 15 (2025)",
    description: "Intel Core Ultra 9, OLED 4K touch display, 32GB DDR5 RAM, NVIDIA RTX 4070. Premium Windows laptop.",
    price: 2299.99,
    currency: "USD",
    category: "laptop",
    imageUrl: "https://picsum.photos/seed/dell-xps/400/300",
    inStock: true,
    tags: ["laptop", "dell", "windows", "oled", "gaming"],
  },
  {
    id: "p008",
    name: "Logitech MX Master 3S Mouse",
    description: "Electromagnetic scroll wheel, 8K DPI sensor, USB-C charging, works on glass. Ergonomic design.",
    price: 99.99,
    currency: "USD",
    category: "accessories",
    imageUrl: "https://picsum.photos/seed/mx-master/400/300",
    inStock: true,
    tags: ["mouse", "wireless", "logitech", "ergonomic", "productivity"],
  },
  {
    id: "p009",
    name: "Keychron Q1 Pro Mechanical Keyboard",
    description: "75% layout, QMK/VIA compatible, hot-swappable, gasket-mounted, RGB backlight. Wireless & wired.",
    price: 199.99,
    currency: "USD",
    category: "accessories",
    imageUrl: "https://picsum.photos/seed/keychron/400/300",
    inStock: true,
    tags: ["keyboard", "mechanical", "wireless", "keychron", "tkl"],
  },
  {
    id: "p010",
    name: 'LG UltraWide 34" Monitor',
    description: "34-inch curved IPS panel, 3440x1440 UWQHD, 144Hz, 1ms GTG, HDR10, Thunderbolt 4.",
    price: 799.99,
    currency: "USD",
    category: "monitor",
    imageUrl: "https://picsum.photos/seed/lg-monitor/400/300",
    inStock: true,
    tags: ["monitor", "ultrawide", "curved", "lg", "144hz"],
  },
  {
    id: "p011",
    name: "iPad Pro 13\" M4",
    description: "Tandem OLED display, M4 chip, Apple Pencil Pro support, ultra-thin design, 16GB RAM.",
    price: 1299.99,
    currency: "USD",
    category: "tablet",
    imageUrl: "https://picsum.photos/seed/ipad-pro/400/300",
    inStock: true,
    tags: ["tablet", "apple", "ipad", "oled", "drawing"],
  },
  {
    id: "p012",
    name: "Samsung Galaxy Tab S10+",
    description: "12.4-inch Dynamic AMOLED 2X, Snapdragon 8 Gen 3, S Pen included, IP68, 12GB RAM.",
    price: 999.99,
    currency: "USD",
    category: "tablet",
    imageUrl: "https://picsum.photos/seed/galaxy-tab/400/300",
    inStock: false,
    tags: ["tablet", "samsung", "android", "s-pen", "amoled"],
  },
  {
    id: "p013",
    name: "GoPro HERO13 Black",
    description: "5.3K video, HyperSmooth 6.0 stabilization, waterproof to 33ft, 27MP photos, magnetic mounts.",
    price: 399.99,
    currency: "USD",
    category: "camera",
    imageUrl: "https://picsum.photos/seed/gopro/400/300",
    inStock: true,
    tags: ["camera", "action", "waterproof", "gopro", "video"],
  },
  {
    id: "p014",
    name: "Sony Alpha A7 IV Mirrorless",
    description: "33MP full-frame BSI CMOS sensor, 4K 60fps video, 10fps burst, real-time autofocus, weather-sealed.",
    price: 2499.99,
    currency: "USD",
    category: "camera",
    imageUrl: "https://picsum.photos/seed/sony-a7/400/300",
    inStock: true,
    tags: ["camera", "mirrorless", "sony", "full-frame", "professional"],
  },
  {
    id: "p015",
    name: "Anker 200W GaN Charger",
    description: "200W total output, 4 USB ports (2×USB-C + 2×USB-A), foldable plug, charges 4 devices simultaneously.",
    price: 79.99,
    currency: "USD",
    category: "accessories",
    imageUrl: "https://picsum.photos/seed/anker-gan/400/300",
    inStock: true,
    tags: ["charger", "gan", "usb-c", "anker", "fast-charge"],
  },
  {
    id: "p016",
    name: "Apple Watch Series 10",
    description: "Thinnest Apple Watch ever, 46mm LTPO OLED, sleep apnea detection, ECG, 18-hour battery.",
    price: 399.99,
    currency: "USD",
    category: "wearable",
    imageUrl: "https://picsum.photos/seed/apple-watch/400/300",
    inStock: true,
    tags: ["smartwatch", "apple", "health", "gps", "fitness"],
  },
  {
    id: "p017",
    name: "Garmin Fenix 8 Solar",
    description: "Rugged GPS multisport watch, solar charging, 29-day battery, dive computer, topographic maps.",
    price: 899.99,
    currency: "USD",
    category: "wearable",
    imageUrl: "https://picsum.photos/seed/garmin/400/300",
    inStock: true,
    tags: ["smartwatch", "garmin", "outdoor", "solar", "gps"],
  },
  {
    id: "p018",
    name: "Sonos Era 300 Speaker",
    description: "Spatial audio speaker, Dolby Atmos support, six-driver array, Wi-Fi & Bluetooth, voice assistant ready.",
    price: 449.99,
    currency: "USD",
    category: "audio",
    imageUrl: "https://picsum.photos/seed/sonos/400/300",
    inStock: true,
    tags: ["speaker", "sonos", "spatial-audio", "wifi", "smart-home"],
  },
  {
    id: "p019",
    name: "NVIDIA GeForce RTX 5080",
    description: "Next-gen GPU with 16GB GDDR7, DLSS 4 Multi Frame Generation, 4K gaming at ultra settings.",
    price: 999.99,
    currency: "USD",
    category: "gpu",
    imageUrl: "https://picsum.photos/seed/rtx5080/400/300",
    inStock: false,
    tags: ["gpu", "nvidia", "gaming", "rtx", "4k"],
  },
  {
    id: "p020",
    name: "Elgato Stream Deck MK.2",
    description: "15 customizable LCD keys, works with OBS, Twitch, YouTube. Trigger actions, macros, scenes with one tap.",
    price: 149.99,
    currency: "USD",
    category: "accessories",
    imageUrl: "https://picsum.photos/seed/streamdeck/400/300",
    inStock: true,
    tags: ["streaming", "elgato", "macro", "productivity", "content-creator"],
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Score a product against a query (higher = more relevant) */
function scoreProduct(product, query) {
  if (!query) return 1;
  const q = query.toLowerCase();
  const terms = q.split(/\s+/).filter(Boolean);

  const searchText = [
    product.name,
    product.description,
    product.category,
    ...product.tags,
  ]
    .join(" ")
    .toLowerCase();

  let score = 0;
  for (const term of terms) {
    if (product.name.toLowerCase().includes(term)) score += 3;
    if (product.category.toLowerCase().includes(term)) score += 2;
    if (product.tags.some((t) => t.includes(term))) score += 2;
    if (product.description.toLowerCase().includes(term)) score += 1;
  }
  return score;
}

// ─── Routes ─────────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "product-service", count: PRODUCTS.length });
});

/** GET /api/products/search?q=&category=&minPrice=&maxPrice=&limit= */
app.get("/api/products/search", (req, res) => {
  const query = (req.query.q || "").trim();
  const category = (req.query.category || "").trim().toLowerCase();
  const minPrice = parseFloat(req.query.minPrice) || 0;
  const maxPrice = parseFloat(req.query.maxPrice) || Infinity;
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);

  let results = PRODUCTS.map((p) => ({ ...p, _score: scoreProduct(p, query) }));

  // Filter by category
  if (category) {
    results = results.filter((p) => p.category === category);
  }

  // Filter by price range
  results = results.filter((p) => p.price >= minPrice && p.price <= maxPrice);

  // Sort by relevance (score desc), then price asc as tiebreaker
  results.sort((a, b) => b._score - a._score || a.price - b.price);

  // Remove internal score field and apply limit
  const products = results.slice(0, limit).map(({ _score, tags, ...p }) => p);

  res.json({ products, total: results.length });
});

/** GET /api/products/:id */
app.get("/api/products/:id", (req, res) => {
  const product = PRODUCTS.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  const { tags, ...rest } = product;
  res.json(rest);
});

/** GET /api/products/categories */
app.get("/api/products/categories", (_req, res) => {
  const categories = [...new Set(PRODUCTS.map((p) => p.category))].sort();
  res.json({ categories });
});

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[product-service] Running on http://localhost:${PORT}`);
  console.log(`[product-service] ${PRODUCTS.length} products loaded`);
});
