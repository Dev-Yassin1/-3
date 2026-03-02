const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Admin password — set ADMIN_PASSWORD env var on your hosting platform!
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "gampre@2026";

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Data file path — ensure folder exists
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "menu.json");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify({ menuItems: [], updatedAt: "" }, null, 2));

// Helper: read menu data
function readMenuData() {
  try {
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return { menuItems: [], updatedAt: "" };
  }
}

// Helper: write menu data
function writeMenuData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// Helper: verify admin password
function verifyAdmin(req, res, next) {
  const password = req.headers["x-admin-password"];
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "كلمة السر غلط ❌" });
  }
  next();
}

// GET /api/menu - Get current menu data
app.get("/api/menu", (req, res) => {
  const data = readMenuData();
  res.json(data);
});

// POST /api/menu - Add or update menu item
app.post("/api/menu", verifyAdmin, (req, res) => {
  const { title, link, type } = req.body;

  if (!title || !link) {
    return res.status(400).json({ error: "لازم تكتب اسم المنيو واللينك" });
  }

  const data = readMenuData();
  const newItem = {
    id: Date.now().toString(),
    title: title,
    link: link,
    type: type || "link", // 'link' or 'image'
    createdAt: new Date().toISOString(),
  };

  data.menuItems.push(newItem);
  data.updatedAt = new Date().toISOString();
  writeMenuData(data);

  res.json({
    success: true,
    message: "تم إضافة المنيو بنجاح ✅",
    item: newItem,
  });
});

// DELETE /api/menu/:id - Delete a menu item
app.delete("/api/menu/:id", verifyAdmin, (req, res) => {
  const { id } = req.params;
  const data = readMenuData();

  const index = data.menuItems.findIndex((item) => item.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "المنيو مش موجود" });
  }

  data.menuItems.splice(index, 1);
  data.updatedAt = new Date().toISOString();
  writeMenuData(data);

  res.json({ success: true, message: "تم حذف المنيو بنجاح 🗑️" });
});

// DELETE /api/menu - Delete all menu items
app.delete("/api/menu", verifyAdmin, (req, res) => {
  const data = { menuItems: [], updatedAt: new Date().toISOString() };
  writeMenuData(data);
  res.json({ success: true, message: "تم حذف كل المنيو بنجاح 🗑️" });
});

// PUT /api/menu/:id - Update a specific menu item
app.put("/api/menu/:id", verifyAdmin, (req, res) => {
  const { id } = req.params;
  const { title, link, type } = req.body;
  const data = readMenuData();

  const item = data.menuItems.find((item) => item.id === id);
  if (!item) {
    return res.status(404).json({ error: "المنيو مش موجود" });
  }

  if (title) item.title = title;
  if (link) item.link = link;
  if (type) item.type = type;
  data.updatedAt = new Date().toISOString();
  writeMenuData(data);

  res.json({ success: true, message: "تم تعديل المنيو بنجاح ✏️", item });
});

// Serve admin page
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

app.listen(PORT, () => {
  console.log(`🍽️  Restaurant server running at http://localhost:${PORT}`);
  console.log(`📋  Admin panel at http://localhost:${PORT}/admin`);
});
