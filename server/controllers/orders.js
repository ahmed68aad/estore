import Order from "../models/orders.js";

export const createOrder = async (req, res, next) => {
  try {
    const { items, totalPrice, shippingAddress, phone, notes } = req.body;
    const userId = req.userId;

    if (!items || items.length === 0) {
      return res.status(400).json({
        error: "Order must contain at least one item",
      });
    }

    if (!totalPrice || !shippingAddress || !phone) {
      return res.status(400).json({
        error: "Total price, shipping address, and phone are required",
      });
    }

    const order = await Order.create({
      userId,
      items,
      totalPrice,
      shippingAddress,
      phone,
      notes: notes || "",
    });

    const populatedOrder = await order.populate("userId", "name email");

    res.status(201).json({
      message: "Order created successfully",
      order: populatedOrder,
    });
  } catch (err) {
    return next(err);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email role")
      .populate("confirmedBy.staffId", "name email role")
      .populate("assignedTo.staffId", "name email role")
      .sort({ orderDate: -1 });

    res.json({
      count: orders.length,
      orders,
    });
  } catch (err) {
    return next(err);
  }
};

export const getUserOrders = async (req, res, next) => {
  try {
    const userId = req.userId;

    const orders = await Order.find({ userId })
      .populate("userId", "name email role")
      .populate("confirmedBy.staffId", "name email role")
      .populate("assignedTo.staffId", "name email role")
      .sort({ orderDate: -1 });

    res.json({
      count: orders.length,
      orders,
    });
  } catch (err) {
    return next(err);
  }
};

export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("userId", "name email role")
      .populate("confirmedBy.staffId", "name email role")
      .populate("assignedTo.staffId", "name email role");

    if (!order) {
      return res.status(404).json({
        error: "Order not found",
      });
    }

    return res.json({
      order,
    });
  } catch (err) {
    return next(err);
  }
};

export const confirmOrder = async (req, res, next) => {
  try {
    const staffId = req.userId;
    const staffName = req.user.name;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: "confirmed",
        "confirmedBy.staffId": staffId,
        "confirmedBy.staffName": staffName,
        "confirmedBy.confirmedAt": new Date(),
      },
      { new: true, runValidators: true },
    )
      .populate("userId", "name email role")
      .populate("confirmedBy.staffId", "name email role")
      .populate("assignedTo.staffId", "name email role");

    if (!order) {
      return res.status(404).json({
        error: "Order not found",
      });
    }

    return res.json({
      message: "Order confirmed successfully",
      order,
    });
  } catch (err) {
    return next(err);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        error: "Status is required",
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true },
    )
      .populate("userId", "name email role")
      .populate("confirmedBy.staffId", "name email role")
      .populate("assignedTo.staffId", "name email role");

    if (!order) {
      return res.status(404).json({
        error: "Order not found",
      });
    }

    return res.json({
      message: "Order status updated successfully",
      order,
    });
  } catch (err) {
    return next(err);
  }
};

export const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({
        error: "Order not found",
      });
    }

    return res.json({
      message: "Order deleted successfully",
      order,
    });
  } catch (err) {
    return next(err);
  }
};

export const assignOrder = async (req, res, next) => {
  try {
    const staffId = req.userId;
    const staffName = req.user.name;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        "assignedTo.staffId": staffId,
        "assignedTo.staffName": staffName,
        "assignedTo.assignedAt": new Date(),
      },
      { new: true, runValidators: true },
    )
      .populate("userId", "name email role")
      .populate("assignedTo.staffId", "name email role")
      .populate("confirmedBy.staffId", "name email role");

    if (!order) {
      return res.status(404).json({
        error: "Order not found",
      });
    }

    return res.json({
      message: "Order assigned to staff successfully",
      order,
    });
  } catch (err) {
    return next(err);
  }
};

export const getStaffOrders = async (req, res, next) => {
  try {
    const staffId = req.userId;

    const orders = await Order.find({ "assignedTo.staffId": staffId })
      .populate("userId", "name email role")
      .populate("assignedTo.staffId", "name email role")
      .populate("confirmedBy.staffId", "name email role")
      .sort({ orderDate: -1 });

    res.json({
      count: orders.length,
      orders,
    });
  } catch (err) {
    return next(err);
  }
};

export const updateOrderQuantity = async (req, res, next) => {
  try {
    const { itemIndex, newQuantity, reason } = req.body;
    const staffId = req.userId;
    const staffName = req.user.name;

    if (itemIndex === undefined || !newQuantity) {
      return res.status(400).json({
        error: "Item index and new quantity are required",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        error: "Order not found",
      });
    }

    const item = order.items[itemIndex];
    const oldQuantity = item.quantity;

    item.quantity = newQuantity;

    order.quantityHistory.push({
      changedBy: {
        staffId,
        staffName,
      },
      oldQuantity,
      newQuantity,
      reason: reason || "Quantity updated",
      changedAt: new Date(),
    });

    order.timeline.push({
      action: "quantity_updated",
      performer: {
        staffId,
        staffName,
      },
      description: `${item.productName} quantity changed from ${oldQuantity} to ${newQuantity}${reason ? ` - Reason: ${reason}` : ""}`,
      timestamp: new Date(),
    });

    await order.save();

    const updatedOrder = await order.populate("userId", "name email role");

    return res.json({
      message: "Order quantity updated successfully",
      order: updatedOrder,
    });
  } catch (err) {
    return next(err);
  }
};

export const addOrderTimeline = async (req, res, next) => {
  try {
    const { action, description } = req.body;
    const staffId = req.userId;
    const staffName = req.user.name;

    if (!action || !description) {
      return res.status(400).json({
        error: "Action and description are required",
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          timeline: {
            action,
            performer: {
              staffId,
              staffName,
            },
            description,
            timestamp: new Date(),
          },
        },
      },
      { new: true, runValidators: true },
    )
      .populate("userId", "name email role")
      .populate("assignedTo.staffId", "name email role")
      .populate("confirmedBy.staffId", "name email role");

    if (!order) {
      return res.status(404).json({
        error: "Order not found",
      });
    }

    return res.json({
      message: "Timeline entry added successfully",
      order,
    });
  } catch (err) {
    return next(err);
  }
};
