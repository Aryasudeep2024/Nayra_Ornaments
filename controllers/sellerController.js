const User = require('../models/userModel');
const  cloudinary = require('../config/cloudinary');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');

const registerSeller = async (req, res) => {
  try {
    const { name, email, password, shopName, contactNumber } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const newSeller = new User({
      name,
      email,
      password,
      shopName,
      contactNumber,
      role: 'seller',
      isApproved: false
    });

    await newSeller.save();

    res.status(201).json({
      message: 'Seller registered successfully. Awaiting admin approval.',
      sellerId: newSeller._id
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};
// login seller

const loginSeller = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Check if seller exists
    const seller = await User.findOne({ email });
    
    if (!seller) {
      
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    if (seller.role !== 'seller') {
      
      return res.status(403).json({ message: 'Access denied. Not a seller account.' });
    }

    if (!seller.isApproved) {
      
      return res.status(403).json({ message: 'Seller not approved by Super Admin yet' });
    }

    // Compare password
    console.log("🔑 Password in DB:", seller.password);
    const isMatch = await bcrypt.compare(password.trim(), seller.password.trim());
    console.log("🔄 Password match result:", isMatch);

    if (!isMatch) {
      console.log("❌ Passwords do not match.");
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: seller._id, role: seller.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '7d' }
    );

   

    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Send response
    res.status(200).json({
      message: 'Login successful',
      seller: {
        id: seller._id,
        name: seller.name,
        email: seller.email,
        shopName: seller.shopName,
        contactNumber: seller.contactNumber,
        profilePic: seller.profilePic,
        role: seller.role,
      },
    });

  } catch (error) {
   
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

//seller delete their account and their products



const deleteSellerAccount = async (req, res) => {
  try {
    const sellerId = req.user.id || req.user._id;
    const role = req.user.role;

    if (role !== 'seller') {
      return res.status(403).json({ message: 'Only sellers can delete their accounts' });
    }

    // 1️⃣ Get all product IDs added by the seller
    const sellerProducts = await Product.find({ addedBy: sellerId }).select('_id');
    const productIds = sellerProducts.map(p => p._id);

    // 2️⃣ Delete all products added by seller
    await Product.deleteMany({ addedBy: sellerId });

    // 3️⃣ Remove seller's products from ALL user carts
    if (productIds.length > 0) {
      await Cart.updateMany(
        {},
        { $pull: { cartItems: { productId: { $in: productIds } } } }
      );
    }

    // 4️⃣ Delete seller's own cart (if exists)
    await Cart.deleteOne({ userId: sellerId });

    // 5️⃣ Delete seller's user account
    await User.findByIdAndDelete(sellerId);

    // 6️⃣ Clear cookie
    res.clearCookie('token');

    res.status(200).json({ message: 'Seller account, products, and related cart items deleted successfully' });

  } catch (error) {
    console.error('Error deleting seller account:', error);
    res.status(500).json({ message: 'Server error while deleting account' });
  }
};




// ✅ Seller updates their own profile
const updateSellerProfile = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const seller = await User.findById(sellerId);

    if (!seller || seller.role !== 'seller') {
      return res.status(403).json({ message: 'Access denied. Not a seller.' });
    }

    const { name, shopName,email, contactNumber, profilePic } = req.body;

    // Only update fields that are passed
    if (name) seller.name = name;
    if (email) seller.email=email;
    if (shopName) seller.shopName = shopName;
    if (contactNumber) seller.contactNumber = contactNumber;
    if (profilePic) seller.profilePic = profilePic;

    await seller.save();

    res.status(200).json({ message: 'Seller profile updated', data: seller });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

//password forget and reset password

const resetSellerPassword = async (req, res) => {
  try {
    const { email, mobileNumber, newPassword, confirmPassword } = req.body;


    if (newPassword !== confirmPassword) {
      console.log("Passwords do not match");
      return res.status(400).json({ message: "Passwords do not match" });
    }


    const seller = await User.findOne({
      email,
      contactNumber: String(mobileNumber),
      role: "seller"
    });

    if (!seller) {
      console.log("Seller not found or mobile number mismatch");
      return res.status(404).json({ message: "Seller not found or invalid mobile number" });
    }

    // Assign plain newPassword and save to trigger pre-save hook hashing
    seller.password = newPassword;
    await seller.save();

  
    res.status(200).json({ message: "Password updated successfully" });

  } catch (error) {
  
    res.status(500).json({ message: "Server error" });
  }
};


//Add products

const addProduct = async (req, res, next) => {
  try {
    const { title, description, price,quantity } = req.body;

    if (!title || !description || !price ||!quantity) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Product image is required' });
    }

    const result = await cloudinary.uploader.upload(req.file.path);

    const addedBy = req.user.id || req.user._id;
    const role = req.user.role;

    const product = new Product({
      name: title,                         // match schema field
      description,
      price,
      quantity,
      image: result.secure_url,            // match schema field
      role,                                // required in schema
      addedBy                              // required in schema
    });

    await product.save();

    res.status(201).json({
      message: 'Product added successfully',
      product,
    });

  } catch (error) {
    console.error('Add Product Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

//Update products by seller
const updateProductStockAndPrice = async (req, res) => {
  try {
    const { productId } = req.params;
    const { price, quantity } = req.body;

    // Ensure at least one field is provided
    if (price === undefined && quantity === undefined) {
      return res.status(400).json({ message: 'At least price or quantity must be provided for update' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const isSeller = req.user.role === 'seller';
  

    // Only allow seller (of that product) or superadmin to update
    if (isSeller && product.addedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    // Update fields only if they’re present
    if (price !== undefined) product.price = price;
    if (quantity !== undefined) product.quantity = quantity;

    await product.save();

    res.status(200).json({
      message: 'Product updated successfully',
      product
    });

  } catch (error) {
    console.error('Update Product Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete Product


const deleteProductBySeller = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id || req.user._id;
    const userRole = req.user.role;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const isSeller = userRole === 'seller';
    const isSuperAdmin = userRole === 'superadmin';

    // Authorization check
    if (isSeller && product.addedBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await Product.findByIdAndDelete(productId);

    res.status(200).json({ message: 'Product deleted successfully' });

  } catch (error) {
    console.error('Delete Product Error:', error);
    res.status(500).json({ message: 'Server error while deleting product' });
  }
};


// Log out seller
const logoutseller = async (req, res, next) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "strict"
  });
  res.status(200).json({ message: "Logged out successfully" });
};



module.exports = { registerSeller,loginSeller,updateSellerProfile,addProduct,logoutseller,resetSellerPassword,deleteSellerAccount,deleteProductBySeller,updateProductStockAndPrice   };
