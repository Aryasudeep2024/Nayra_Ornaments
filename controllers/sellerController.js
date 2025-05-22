const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
    console.error("🔥 Error in loginSeller:", error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

module.exports = loginSeller;



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


// Log out seller
const logoutseller = async (req, res, next) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "strict"
  });
  res.status(200).json({ message: "Logged out successfully" });
};



module.exports = { registerSeller,loginSeller,updateSellerProfile,logoutseller };
