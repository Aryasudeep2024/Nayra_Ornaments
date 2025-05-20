const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const createToken = require('../utils/generateToken');

// 1. Register Seller
const register = async (req, res) => {
  try {
    const { name, email, password, profilePic } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingSeller = await User.findOne({ email });
    if (existingSeller) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newSeller = new User({
      name,
      email,
      password: hashedPassword,
      profilePic,
      role: 'seller'
    });

    const savedSeller = await newSeller.save();
    const sellerData = savedSeller.toObject();
    delete sellerData.password;

    res.status(201).json({ message: "Seller registered", seller: sellerData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Server error" });
  }
};

// 2. Login Seller
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const seller = await User.findOne({ email, role: 'seller' });
    if (!seller) {
      return res.status(404).json({ error: "Seller not found" });
    }

    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Incorrect password" });
    }

    const token = createToken(seller._id, seller.role);

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict'
    });

    const sellerObj = seller.toObject();
    delete sellerObj.password;

    res.status(200).json({ message: "Login successful", seller: sellerObj });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Server error" });
  }
};

// 3. Get Seller Profile
const profile = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const seller = await User.findById(sellerId).select('-password');
    res.status(200).json({ seller });
  } catch (err) {
    res.status(500).json({ error: err.message || "Server error" });
  }
};

// 4. Update Seller Profile
const update = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { name, email, profilePic } = req.body;

    const updated = await User.findByIdAndUpdate(
      sellerId,
      { name, email, profilePic },
      { new: true }
    ).select('-password');

    res.status(200).json({ message: "Profile updated", seller: updated });
  } catch (err) {
    res.status(500).json({ error: err.message || "Server error" });
  }
};

// 5. Logout
const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "strict"
  });
  res.status(200).json({ message: "Logged out successfully" });
};

// 6. (Optional) Delete Seller
const deleteSeller = async (req, res) => {
  try {
    const sellerId = req.params.id;
    const deleted = await User.findByIdAndDelete(sellerId);
    if (!deleted) return res.status(404).json({ error: "Seller not found" });
    res.status(200).json({ message: "Seller deleted", data: deleted });
  } catch (err) {
    res.status(500).json({ error: err.message || "Server error" });
  }
};

module.exports = {
  register,
  login,
  profile,
  update,
  logout,
  deleteSeller
};
