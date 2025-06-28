const Cart = require('../models/cartModel');
const Product = require('../models/productModel'); // Actual product schema


//add produts to cart
const addProductToCart = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    // Check product existence
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find user's cart
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Create new cart
      cart = new Cart({
        userId,
        cartItems: [{
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: 1
        }]
      });
    } else {
      // Check if product already in cart
      const existingItem = cart.cartItems.find(item => item.productId.toString() === productId);
      if (existingItem) {
        return res.status(400).json({ message: 'Product is already in the cart' });
      }

      // Add product to existing cart
      cart.cartItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: 1
      });
    }

    // Save updated cart
    await cart.save();

    // Convert to object to include virtuals like totalAmount
    const cartWithVirtuals = cart.toObject(); // or cart.toJSON();

    res.status(200).json({
      message: 'Product added to cart successfully',
      cart: cartWithVirtuals,
      totalAmount: cartWithVirtuals.totalAmount // Comes from schema virtual
    });

  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Server error while adding to cart' });
  }
};
// get cart items
const getCartItems = async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ userId }).populate('cartItems.productId', 'name image price');

    if (!cart) {
  return res.status(200).json({
    cart: { cartItems: [] },
    totalAmount: 0
  });
}
console.log("Fetching cart for user:", userId);
console.log("Cart found:", cart);


    const cartWithVirtuals = cart.toObject();

    res.status(200).json({
      cart: cartWithVirtuals,
      totalAmount: cartWithVirtuals.totalAmount
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Server error while fetching cart' });
  }
};
// update cart quantity
const updateCartItemQuantity = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity } = req.body;

    // Input validation
    if (!productId || typeof quantity !== 'number') {
      return res.status(400).json({ message: 'Invalid productId or quantity' });
    }

    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    // Fetch product to check stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

     if (quantity > product.quantity)
{
      return res.status(400).json({
        message: `Only ${product.quantity} unit(s) available in stock`
      });
    }

    // Update quantity in cart
    const result = await Cart.updateOne(
      { userId, 'cartItems.productId': productId },
      { $set: { 'cartItems.$.quantity': quantity } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }

    const updatedCart = await Cart.findOne({ userId })
      .populate('cartItems.productId')
      .lean();

    res.status(200).json({
      message: 'Cart item updated successfully',
      cart: updatedCart
    });

  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ message: 'Server error while updating cart item' });
  }
};

//Remove Cart Items

const removeCartItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    const result = await Cart.updateOne(
      { userId },
      { $pull: { cartItems: { productId } } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }

    const updatedCart = await Cart.findOne({ userId });

    res.status(200).json({
      message: 'Product removed from cart',
      cart: updatedCart
    });

  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ message: 'Server error while removing item from cart' });
  }
};
//Clear Cart
const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart already empty' });
    }

    cart.cartItems = [];
    await cart.save();

    res.status(200).json({ message: 'Cart cleared successfully', cart });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Server error while clearing cart' });
  }
};


module.exports = {
  addProductToCart,
  getCartItems ,
  updateCartItemQuantity ,
  removeCartItem,
  clearCart
};
