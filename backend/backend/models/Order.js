/**
 * Valley Notebooks – MongoDB Order Model
 * STEP 5: backend/models/Order.js
 */

const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      match: /^[6-9]\d{9}$/,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    pincode: {
      type: String,
      required: true,
      match: /^\d{6}$/,
    },

    items: [
      {
        category: String,
        size: String,
        pages: Number,
        price: Number,
        quantity: Number,
      },
    ],

    totalQty: {
      type: Number,
      required: true,
      min: 500,
      max: 500000,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

module.exports =
  mongoose.models.Order || mongoose.model("Order", OrderSchema);
