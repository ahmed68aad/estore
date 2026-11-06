import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
      default: () => `ORD-${Date.now()}`,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        productName: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        color: {
          type: String,
          default: "",
        },
        size: {
          type: String,
          default: "",
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    shippingAddress: {
      street: String,
      city: String,
      postalCode: String,
      country: String,
    },
    phone: {
      type: String,
      required: true,
    },
    assignedTo: {
      staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      staffName: {
        type: String,
        default: "",
      },
      assignedAt: {
        type: Date,
        default: null,
      },
    },
    confirmedBy: {
      staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      staffName: {
        type: String,
        default: "",
      },
      confirmedAt: {
        type: Date,
        default: null,
      },
    },
    quantityHistory: [
      {
        changedBy: {
          staffId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          staffName: String,
        },
        oldQuantity: Number,
        newQuantity: Number,
        reason: String,
        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    timeline: [
      {
        action: String,
        performer: {
          staffId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          staffName: String,
        },
        description: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    notes: {
      type: String,
      default: "",
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    this.orderNumber = `ORD-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
