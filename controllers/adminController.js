const Admin = require("../models/adminModel");
const bcrypt = require("bcrypt");
const createToken = require("../utils/generateToken");

// Register Controller
const register = async (req, res, next) => {
  try {
    const { name, email, password, profilePic } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are mandatory" });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ error: "Admin already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = new Admin({
      name,
      email,
      password: hashedPassword,
      profilePic,
    });

    const savedAdmin = await newAdmin.save();
    const adminData = savedAdmin.toObject();
    delete adminData.password;

    res.status(201).json({ message: "Admin account created", admin: adminData });
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
};

// Login Controller
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: "All fields are mandatory" });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ error: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = createToken(admin._id, admin.role);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict"
    });

    const adminObj = admin.toObject();
    delete adminObj.password;

    res.status(200).json({ message: "Login successful", admin: adminObj });
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
};

// Get Profile
const profile = async (req, res, next) => {
  try {
    const adminId = req.user.id;

    const adminData = await Admin.findById(adminId).select("-password");
    return res.status(200).json({ data: adminData, message: "Profile retrieved" });
  } catch (error) {
    console.log(error);
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
};

// Update Profile
const update = async (req, res, next) => {
  try {
    const adminId = req.user.id;
    const { name, email, profilePic } = req.body || {};

    const updatedAdmin = await Admin.findByIdAndUpdate(
      adminId,
      { name, email, profilePic },
      { new: true }
    ).select("-password");

    res.status(200).json({ data: updatedAdmin, message: "Profile updated" });
  } catch (error) {
    console.log(error);
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
};

// Delete Admin
const deleteAdmin = async (req, res, next) => {
  try {
    const adminId = req.params.adminId;
    if (!adminId) {
      return res.status(400).json({ error: "Admin ID is required" });
    }

    const deleted = await Admin.findByIdAndDelete(adminId);
    if (!deleted) {
      return res.status(404).json({ error: "Admin not found" });
    }

    return res.status(200).json({ message: "Admin deleted", data: deleted });
  } catch (error) {
    console.log(error);
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
};

// Logout
const logout = async (req, res, next) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "strict"
  });
  res.status(200).json({ message: "Logged out successfully" });
};

module.exports = { register, login, profile, update, deleteAdmin, logout };
