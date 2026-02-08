const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      pincode: { type: String, required: true },
      city: String,
      state: String
    },
    items: [
      {
        variant: String, // "1KG", "500G"
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        name: String,
        // 🏭 BATCH TRACKING
        batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', default: null },
        costAtTimeOfOrder: { type: Number, default: 0 } // Snapshot of Batch.costPerUnit
      }
    ],
    pricing: {
      subtotal: { type: Number, required: true },
      codFee: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      coinsRedeemed: { type: Number, default: 0 },
      total: { type: Number, required: true }
    },
    shipping: {
      awbNumber: { type: String, default: null },
      courierName: { type: String, default: null },
      trackingUrl: { type: String, default: null },
      labelUrl: { type: String, default: null }, // 📄 PDF Label
      manifestUrl: { type: String, default: null }, // 📄 Manifest

      // Redundant but useful for quick query if needed, mainly relies on root 'status'
      shipmentStatus: {
        type: String,
        default: null
      },

      shippedAt: { type: Date, default: null },
      deliveredAt: { type: Date, default: null },
      lastSync: { type: Date, default: null }, // ⚡ For Live Tracking Freshness

      // Full tracking history from Courier
      logs: [
        {
          status: String,
          description: String,
          timestamp: { type: Date, default: Date.now },
          raw_code: String,
          location: String
        }
      ],
      retryCount: { type: Number, default: 0 }
    },
    status: {
      type: String,
      enum: ["PENDING_SHIPMENT", "PACKED", "SHIPPED", "ON_THE_WAY", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "RTO_INITIATED", "RTO_DELIVERED"],
      default: "PENDING_SHIPMENT",
      index: true
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "UPI"],
      required: true,
      index: true
    },
    transactionId: { type: String, default: null },
    // 📌 CANONICAL USER REFERENCE
    // Currently type: String for compatibility.
    // Going forward, this will store the MongoDB ObjectId (as string) for logged-in users.
    userId: { type: String, default: null },
    coinsCredited: { type: Boolean, default: false },

    /* ================= CANCELLATION & RTO ================= */
    cancellation: {
      reason: { type: String, default: null },
      cancelledBy: { type: String, default: null }, // Store 'ADMIN' or User ID
      cancelledAt: { type: Date, default: null }
    },
    rto: {
      reason: { type: String, default: null },
      initiatedAt: { type: Date, default: null },
      restocked: { type: Boolean, default: false } // Track inventory restore
    },

    /* ================= REFERRAL SYSTEM ================= */
    referral: {
      code: { type: String, default: null },
      referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      rewardStatus: {
        type: String,
        enum: ['PENDING_MATURATION', 'ELIGIBLE', 'CREDITED', 'VOID', 'NONE'],
        default: 'NONE'
      },
      discountAmount: { type: Number, default: 0 }
    },

    /* ================= FINANCIAL SNAPSHOT (Immutable) ================= */
    financials: {
      // REVENUE SIDE
      grossRevenue: { type: Number, default: 0 }, // Total paid by customer (inc. tax)
      taxableValue: { type: Number, default: 0 }, // Revenue excluding GST
      gstAmount: { type: Number, default: 0 },    // Tax Liability

      // COST SIDE (Snapshotted at fulfillment)
      totalProductCost: { type: Number, default: 0 }, // Sum of batch costs
      shippingCost: { type: Number, default: 0 },     // Actual or Flat rate
      packagingCost: { type: Number, default: 0 },    // Box/Tape cost
      platformFee: { type: Number, default: 0 },      // Gateway charges (~2%)

      // PROFITABILITY
      netProfit: { type: Number, default: 0 },      // taxableValue - costs
      profitMargin: { type: Number, default: 0 }    // %
    }
  },
  {
    timestamps: true,
    collection: "orders"
  }
);

// ⚡ Compound Index for Dashboard Date Filtering
OrderSchema.index({ createdAt: -1, status: 1 });
OrderSchema.index({ "shipping.awbNumber": 1 }); // Useful for webhooks

module.exports = mongoose.model("Order", OrderSchema);
