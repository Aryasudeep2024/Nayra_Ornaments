const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const createToken = require("../utils/generateToken");
const { ClientSession } = require("mongodb");

// Register New Admin (Only by Superadmin)
const register = async (req, res) => {
  try {
    const { name, email, password, profilePic, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new User({
      name,
      email,
      password: hashedPassword,
      profilePic,
      role, // "admin" or "superadmin"
      isSuperAdmin: role === "superadmin"
    });

    const savedAdmin = await newAdmin.save();
    const adminData = savedAdmin.toObject();
    delete adminData.password;

    res.status(201).json({ message: "Seller account created", admin: adminData });
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

// Delete any user by ID (Super Admin only)
const deleteUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message || "Internal server error" });
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




// Admin Logout (Stateless)
const logoutAdmin = async (req, res, next) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "strict"
  });
  res.status(200).json({ message: "Logged out successfully" });
};

module.exports = { register, login, getUserProfileById, updateUserById, deleteUserById, approveSeller,logoutAdmin };
