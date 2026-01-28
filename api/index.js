/**
 * Valley Notebooks – Vercel Serverless API
 */

const mongoose = require("mongoose");
const fetch = require("node-fetch");

let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGODB_URI);
  isConnected = true;
}

const Order =
  mongoose.models.Order || require("./models/Order");

module.exports = async function handler(req, res) {
  try {
    await connectDB();

    // Health check
    if (req.method === "GET") {
      return res.status(200).json({ ok: true });
    }

    // Create order
    if (req.method === "POST") {
      const order = await Order.create(req.body);

      const message = `
🧾 New Order Received

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

      return res.status(201).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};
