const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

// Utility
function calculateCartTotal(items) {
  return items.reduce((total, item) => {
    return total + item.productId.price * item.quantity;
  }, 0);
}

// Create a new order
const createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ userId }).populate("cartItems.productId");

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Create new order
    const newOrder = new Order({
      user: userId,
      products: cart.cartItems.map(item => ({
        productId: item.productId._id,
        name: item.productId.name,
        image: item.productId.image,
        price: item.productId.price,
        quantity: item.quantity,
        addedBy: item.productId.addedBy,
      })),
      totalAmount: cart.totalAmount || calculateCartTotal(cart.cartItems),
      paymentId: req.body.paymentId || 'test_payment',
    });

    await newOrder.save();

    // Reduce product quantity
    for (const item of cart.cartItems) {
      const product = await Product.findById(item.productId._id);
      if (!product) continue;
      if (product.quantity < item.quantity) continue;

      product.quantity -= item.quantity;
      await product.save();
    }

    // Clear cart
    await Cart.findOneAndDelete({ userId });

    return res.status(201).json({ success: true, orderId: newOrder._id });

  } catch (error) {
    console.error("❌ Failed to create order:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Get user orders
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve orders", error });
  }
};

// Get seller orders (filtered to only their products)
const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user?._id || req.user?.userId;

    if (!sellerId) {
      return res.status(401).json({ message: 'Unauthorized: Seller ID missing' });
    }

    const orders = await Order.find({ 'products.addedBy': sellerId }).sort({ createdAt: -1 });

    const sellerOrders = orders.map(order => {
      const filteredProducts = order.products.filter(
        product => product.addedBy.toString() === sellerId.toString()
      );
      return {
        _id: order._id,
        user: order.user,
        paymentId: order.paymentId,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        products: filteredProducts,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus || 'pending',
      };
    });

    res.status(200).json({ orders: sellerOrders });

  } catch (err) {
    console.error('❌ Error fetching seller orders:', err);
    res.status(500).json({ message: 'Server error while fetching seller orders' });
  }
};
// confirm order by seller
const confirmOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const sellerId = req.user?._id || req.user?.userId;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Check if the order includes any product by this seller
    const hasProductFromSeller = order.products.some(
      p => p.addedBy.toString() === sellerId.toString()
    );

    if (!hasProductFromSeller) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    order.orderStatus = 'Confirmed';
    await order.save();

    res.status(200).json({ message: 'Order confirmed', order });

  } catch (err) {
    console.error('❌ Error confirming order:', err);
    res.status(500).json({ message: 'Failed to confirm order', error: err });
  }
};
// Get orders for Super Admin (filtered by their added products)
const getSuperAdminOrders = async (req, res) => {
  try {
    const superAdminId = req.user?.userId;

    if (!superAdminId) {
      return res.status(401).json({ message: 'Unauthorized: Super Admin ID missing' });
    }

    // Fetch all orders that contain at least one product added by the superadmin
    const orders = await Order.find({ 'products.addedBy': superAdminId }).sort({ createdAt: -1 });

    // Filter products in each order to only those added by the superadmin
    const superAdminOrders = orders.map(order => {
      const filteredProducts = order.products.filter(
        product => product.addedBy.toString() === superAdminId.toString()
      );

      return {
        _id: order._id,
        user: order.user,
        paymentId: order.paymentId,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        products: filteredProducts,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus || 'Pending',
      };
    });

    res.status(200).json({ orders: superAdminOrders });

  } catch (err) {
    console.error('❌ Error fetching superadmin orders:', err);
    res.status(500).json({ message: 'Server error while fetching superadmin orders' });
  }
};


// Exports
module.exports = {
  createOrder,
  getUserOrders,
  getSellerOrders,
  confirmOrderStatus,
  getSuperAdminOrders,
};
