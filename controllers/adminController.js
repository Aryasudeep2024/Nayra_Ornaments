const User = require("../models/userModel");
const Product = require('../models/productModel');
const bcrypt = require("bcrypt");
const  cloudinary = require('../config/cloudinary');
const createToken = require("../utils/generateToken");
const { ClientSession } = require("mongodb");
const Cart = require('../models/cartModel');

// ✅ Register New Seller (Only by Superadmin)
const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      profilePic,
      role,
      isApproved,
      shopName,
      contactNumber
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "All required fields are missing" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Create user document — password is auto-hashed in pre-save middleware
    const newUser = new User({
      name,
      email,
      password,
      profilePic,
      role,
      isApproved: role === "seller" ? isApproved : false,
      shopName: role === "seller" ? shopName : undefined,
      contactNumber: role === "seller" ? contactNumber : undefined,
      isSuperAdmin: role === "superadmin"
    });

    const savedUser = await newUser.save();
    const cleanUser = savedUser.toObject();
    delete cleanUser.password;

    res.status(201).json({
      message: "Seller account created successfully",
      user: cleanUser
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

// Login Admin

const login = async (req, res) => {
  

  try {
    const { email, password } = req.body;

    

    if (!email || !password) {
      
      return res.status(400).json({ error: "All fields are required" });
    }

    const admin = await User.findOne({ email, role: { $in: ["admin", "superadmin"] } });

    if (!admin) {
    
      return res.status(400).json({ error: "Admin not found" });
    }

    

    const isMatch = await bcrypt.compare(password.trim(), admin.password.trim());

    

    if (!isMatch) {
      
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = createToken(admin._id, admin.role);
    

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });
    console.log("🍪 Token cookie sent");

    const adminData = admin.toObject();
    delete adminData.password;

    console.log("🎉 Login successful");
    res.status(200).json({ message: "Login successful", admin: adminData });

  } catch (error) {
    console.error("🔥 Login error:", error.message);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};




/// Get any user's profile by ID (Only accessible by Super Admin)
const getUserProfileById = async (req, res) => {
  try {
    const userId = req.params.id;
    

    // Optionally, check if the requester is a Super Admin
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await User.findById(userId).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User profile retrieved", data: user });
  } catch (error) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

// Update any user's profile by ID (Super Admin only)
const updateUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully", data: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};
// delete user/ seller by admin

const deleteUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    // 1️⃣ Find the user first
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const role = user.role;

    // 2️⃣ If user is a seller, clean up their products and cart references
    if (role === 'seller') {
      // Get all products added by this seller
      const sellerProducts = await Product.find({ addedBy: userId }).select('_id');
      const productIds = sellerProducts.map(p => p._id);

      // Delete all products added by this seller
      await Product.deleteMany({ addedBy: userId });

      // Remove those products from all user carts
      if (productIds.length > 0) {
        await Cart.updateMany(
          {},
          { $pull: { cartItems: { productId: { $in: productIds } } } }
        );
      }
    }

    // 3️⃣ Delete the user's cart
    await Cart.deleteOne({ userId });

    // 4️⃣ Delete the user
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "User and related cart/Products also deleted successfully" });

  } catch (error) {
    console.error('Error in deleteUserById:', error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

//pending approval lists

const getPendingSellers = async (req, res) => {
  try {
    const pending = await User.find({ role: 'seller', isApproved: false }).select('-password');
    res.status(200).json(pending);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending sellers' });
  }
};



// ✅ Super Admin approves a seller
const approveSeller = async (req, res) => {
  try {
    const { sellerId } = req.params;

    const seller = await User.findById(sellerId);

    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    if (seller.role !== 'seller') {
      return res.status(400).json({ message: 'User is not a seller' });
    }

    if (seller.isApproved) {
      return res.status(400).json({ message: 'Seller is already approved' });
    }

    seller.isApproved = true;
    await seller.save();

    res.status(200).json({ message: 'Seller approved successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

//add products by admin

const addProduct = async (req, res, next) => {
  try {
    console.log("Body:", req.body);
    const { title, description, price,quantity,category  } = req.body;
     
    if (!title || !description || !price ||!quantity||!category) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Product image is required' });
    }
console.log("File received:", req.file);

    const result = await cloudinary.uploader.upload(req.file.path);

    const addedBy = req.user.id || req.user.userId;
    const role = req.user.role;

    const product = new Product({
      name: title,                         // match schema field
      description,
      category,
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
};//product view by ID

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json({ product });
  } catch (error) {
    console.error("Get Product Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


//Update Products and quantity

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params; // Extract product ID from the URL

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { title, description, price, quantity } = req.body;

    // Optional: handle new image upload
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      existingProduct.imageUrl = result.secure_url;
    }

    // Update other fields
    if (title) existingProduct.title = title;
    if (description) existingProduct.description = description;
    if (price) existingProduct.price = price;
    if (quantity !== undefined) existingProduct.quantity = quantity;

    // Check quantity status
    if (existingProduct.quantity < 1) {
      console.log('⚠️ Product is out of stock');
    }

    await existingProduct.save();

    res.status(200).json({ message: 'Product updated successfully', product: existingProduct });
  } catch (error) {
    console.error('Update Product Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
// delete Products

const deleteProductByAdmin = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id || req.user._id;
    const userRole = req.user.role;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const isSuperAdmin = userRole === 'superadmin';

    // Authorization check
    if (!isSuperAdmin ) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await Product.findByIdAndDelete(productId);

    res.status(200).json({ message: 'Product deleted successfully' });

  } catch (error) {
    console.error('Delete Product Error:', error);
    res.status(500).json({ message: 'Server error while deleting product' });
  }
};




// Admin Logout (Stateless)
const logoutAdmin = async (req, res, next) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "strict"
  });
  res.status(200).json({ message: "Logged out successfully" });
};

module.exports = { register, login, getUserProfileById, updateUserById,getPendingSellers,deleteUserById,addProduct,getProductById,updateProduct,deleteProductByAdmin, approveSeller,logoutAdmin };
