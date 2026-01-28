/**
 * Valley Notebooks – Vercel Serverless API
 */

const mongoose = require("mongoose");

let isConnected = false;

// MongoDB connect
async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGODB_URI);
  isConnected = true;
}

// Import Order model
const Order =
  mongoose.models.Order ||
  require("./models/Order");

export default async function handler(req, res) {
  await connectDB();

  // Health check
  if (req.method === "GET") {
    return res.status(200).json({ ok: true });
  }

  // Create order
  if (req.method === "POST") {
    try {
      const order = await Order.create(req.body);

      // Telegram notification
      const message = `
🛒 New Order Received
🆔 ${order.orderId}
👤 ${order.name}
📞 ${order.phone}
📍 ${order.address}
💰 ₹${order.total}
      `;

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

      return res.status(201).json({ success: true, order });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.status(405).json({ error: "Method not allowed" });
    }
