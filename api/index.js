/**
 * Valley Notebooks – Vercel Serverless API
 */

const mongoose = require("mongoose");

let isConnected = false;

// MongoDB connection
async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGODB_URI);
  isConnected = true;
}

// Order model
const Order =
  mongoose.models.Order ||
  mongoose.model(
    "Order",
    new mongoose.Schema(
      {
        orderId: String,
        name: String,
        phone: String,
        address: String,
        items: Array,
        total: Number,
      },
      { timestamps: true }
    )
  );

module.exports = async function handler(req, res) {
  try {
    await connectDB();

    // ✅ Health check
    if (req.method === "GET") {
      return res.status(200).json({
        ok: true,
        message: "API is live",
      });
    }

    // ✅ Create order
    if (req.method === "POST") {
      const order = await Order.create(req.body);

      const message = `
🛒 New Order Received

🆔 Order ID: ${order.orderId}
👤 Name: ${order.name}
📞 Phone: ${order.phone}
📍 Address: ${order.address}
📦 Items: ${order.items?.length || 0}
💰 Total: ₹${order.total}
`;

      // ✅ Vercel global fetch (NO node-fetch)
      await fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text: message,
          }),
        }
      );

      return res.status(201).json({
        success: true,
        orderId: order.orderId,
      });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("API ERROR:", err);
    return res.status(500).json({
      error: "Internal Server Error",
      details: err.message,
    });
  }
};
