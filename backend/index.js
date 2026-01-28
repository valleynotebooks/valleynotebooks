/**
 * Valley Notebooks – Backend API
 * Node.js + Express (Vercel Serverless Compatible)
 * STEP 4: backend/index.js
 */

const express = require("express");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
const cors = require("cors");
const crypto = require("crypto");
const fetch = require("node-fetch");

const app = express();

/* =========================
   BASIC MIDDLEWARE
========================= */
app.use(cors({ origin: "*", methods: ["GET", "POST"] }));
app.use(express.json({ limit: "1mb" }));

/* =========================
   RATE LIMITING (ANTI-SPAM)
========================= */
const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/order", orderLimiter);

/* =========================
   MONGODB CONNECTION
========================= */
let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGODB_URI, {
    bufferCommands: false,
  });
  isConnected = true;
}

const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true },
    name: String,
    phone: String,
    address: String,
    pincode: String,
    items: Array,
    totalQty: Number,
    totalAmount: Number,
    createdAt: Date,
    status: { type: String, default: "Pending" },
  },
  { versionKey: false }
);

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

/* =========================
   UTIL FUNCTIONS
========================= */
function generateOrderId() {
  return "VN-" + crypto.randomBytes(4).toString("hex").toUpperCase();
}

async function sendTelegramAlert(order) {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) return;

  const message = `
🧾 *New Order – Valley Notebooks*

🆔 Order ID: ${order.orderId}
👤 Name: ${order.name}
📞 Phone: ${order.phone}
📍 Pincode: ${order.pincode}

📦 Quantity: ${order.totalQty}
💰 Amount: ₹${order.totalAmount}
⏰ ${order.createdAt.toLocaleString()}
`;

  const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: "Markdown",
    }),
  });
}

/* =========================
   PLACE ORDER API
========================= */
app.post("/api/order", async (req, res) => {
  try {
    await connectDB();

    const { name, phone, address, pincode, items, totalQty, totalAmount } =
      req.body;

    // Validation
    if (
      !name ||
      !phone ||
      !address ||
      !pincode ||
      !items ||
      !totalQty ||
      !totalAmount
    ) {
      return res.status(400).json({ error: "Invalid data" });
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ error: "Invalid phone number" });
    }

    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({ error: "Invalid pincode" });
    }

    if (totalQty < 500 || totalQty > 500000) {
      return res.status(400).json({ error: "Quantity out of range" });
    }

    // Duplicate prevention (same phone + amount within 5 minutes)
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const duplicate = await Order.findOne({
      phone,
      totalAmount,
      createdAt: { $gte: fiveMinAgo },
    });

    if (duplicate) {
      return res.status(409).json({ error: "Duplicate order detected" });
    }

    const order = new Order({
      orderId: generateOrderId(),
      name,
      phone,
      address,
      pincode,
      items,
      totalQty,
      totalAmount,
      createdAt: new Date(),
    });

    await order.save();
    await sendTelegramAlert(order);

    res.json({
      success: true,
      orderId: order.orderId,
      estimatedDelivery: "7–10 working days",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* =========================
   HEALTH CHECK
========================= */
app.get("/api/health", (_, res) => {
  res.json({ status: "OK", service: "Valley Notebooks Backend" });
});

/* =========================
   EXPORT FOR VERCEL
========================= */
module.exports = app;
