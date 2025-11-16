const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// Create order
exports.createOrder = async (req, res) => {
  try {
    const { userId, orderItems, shippingAddress, paymentMethod, totalPrice } = req.body;

    // Validation
    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one product',
      });
    }

    if (!shippingAddress || !shippingAddress.address || !shippingAddress.city) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required (address, city, postalCode, country)',
      });
    }

    if (!totalPrice) {
      return res.status(400).json({
        success: false,
        message: 'Total price is required',
      });
    }

    // Verify products exist and have sufficient stock
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.product} not found`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        });
      }
    }

    // Deduct stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
    }

    // Create order
    const order = new Order({
      user: userId,
      orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'cash-on-delivery',
      totalPrice,
    });

    const newOrder = await order.save();

    // Populate product details
    await newOrder.populate('orderItems.product', 'name price');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: newOrder,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email address')
      .populate('orderItems.product', 'name price category');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID',
      });
    }
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get user orders
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.params.userId || req.user?.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const total = await Order.countDocuments({ user: userId });

    const orders = await Order.find({ user: userId })
      .skip(skip)
      .limit(limit * 1)
      .populate('orderItems.product', 'name price')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        limit,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get all orders (admin only)
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, orderStatus } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (orderStatus) filter.orderStatus = orderStatus;

    const total = await Order.countDocuments(filter);

    const orders = await Order.find(filter)
      .skip(skip)
      .limit(limit * 1)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name price')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        limit,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Update order status (admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;

    if (!orderStatus && !paymentStatus) {
      return res.status(400).json({
        success: false,
        message: 'At least one status field is required',
      });
    }

    const updateData = {};
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const order = await Order.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('user', 'name email')
      .populate('orderItems.product', 'name price');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
