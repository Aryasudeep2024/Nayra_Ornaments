// controllers/authController.js

const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const createToken=require('../utils/generateToken')
const Cart = require("../models/cartModel");


// Register Controller
const register = async (req, res, next) => {
  try {
    const { name, email, password, profilePic } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are mandatory" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Pass plain password; schema will hash it
    const newUser = new User({
      name,
      email,
      password,
      profilePic,
    });

    const savedUser = await newUser.save();

    const userData = savedUser.toObject();
    delete userData.password;

    res.status(201).json({ message: "Account created", userData });
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
};

//login

const login = async (req, res, next) => {
  try {
    let { email, password } = req.body || {};

    // Trim inputs
    const trimmedEmail = email?.trim();
    const trimmedPassword = password?.trim();
    console.log("🔐 Password being sent:", JSON.stringify(trimmedPassword));

    console.log("📩 Email being sent:", `"${trimmedEmail}"`);
    console.log("🔐 Password being sent:", `"${trimmedPassword}"`);

    // Validate input
    if (!trimmedEmail || !trimmedPassword) {
      return res.status(400).json({ error: "All fields are mandatory" });
    }

    // Check if user exists
    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      console.log("❌ User not found for:", trimmedEmail);
      return res.status(400).json({ error: "User not found" });
    }

    console.log("🔍 Found user:", user.email, "Role:", user.role);

    // Compare passwords
    const isPasswordMatch = await bcrypt.compare(trimmedPassword, user.password);
    
    if (!isPasswordMatch) {
      console.log("❌ Password mismatch for:", trimmedEmail);
      return res.status(400).json({ error: "Invalid password" });
    }

    // Create token
    const token = createToken(user._id, user.role);

    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // Use `true` in production (HTTPS)
      sameSite: "strict"
    });

    // Exclude password from response
    const userObject = user.toObject();
    delete userObject.password;

    console.log("✅ Login Success:", userObject);

    return res.status(200).json({ message: "Login Successful", user: userObject });

  } catch (error) {
    console.error("🔥 Login Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

  // profile 

  const profile=async(req,res,next)=>{
    try{

      const userId=req.user._id

      const userData=await User.findById(userId).select("-password")
      return res.status(200).json({data:userData,message:"Profile retrieved"})
    }catch(error){
      console.log(error)
      res.status(error.status||500).json({error:error.message||"internal server error"})
    }
  }

  //update
   const update=async(req,res,next)=>{
    try{

      const userId=req.user._id
      console.log("userid:",userId)
const{name,email,password,profilePic}=req.body||{}
      const userData=await User.findByIdAndUpdate(userId,{name,email,password,profilePic},{new:true})
      .select("-password")
      return res.status(200).json({data:userData,message:"Profile Updated"})
    }catch(error){
      console.log(error)
      res.status(error.status||500).json({error:error.message||"internal server error"})
    }
  }
  //delete

  const deleteUser = async (req, res, next) => {
  try {
    const userId = req.user._id; // Get user ID from token (authenticated user)

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Delete the user's cart
    await Cart.deleteOne({ userId });

    // Delete the user
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Clear auth cookie if you're using one
    res.clearCookie('token');

    return res.status(200).json({
      message: 'Your account and cart have been deleted successfully.',
      deletedUser: {
        id: deletedUser._id,
        email: deletedUser.email,
        role: deletedUser.role,
      }
    });
  } catch (error) {
    console.error("❌ Delete User Error:", error);
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
};
  // forget password
const resetUserPassword = async (req, res, next) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await User.findOne({ email, role: "user" });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("👉 Setting new password...");
    user.password = newPassword;

    console.log("👉 Saving user...");
    try {
      await user.save();
      console.log("✅ Saved user successfully");
      return res.status(200).json({ message: "Password updated successfully" });
    } catch (saveError) {
      console.error("❌ Error during user.save():", saveError);
      return res.status(500).json({ message: "Server error", error: saveError.message });
    }

  } catch (error) {
    console.error("❌ Outer try-catch error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};



 //log out

 const logout = async (req, res, next) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "strict"
  });
  res.status(200).json({ message: "Logged out successfully" });
};



module.exports = { register, login,profile,logout,update,deleteUser,resetUserPassword };
