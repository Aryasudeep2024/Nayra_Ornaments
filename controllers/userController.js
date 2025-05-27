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
    const { email, password } = req.body || {};

    const trimmedEmail = email.trim();
const trimmedPassword = password.trim();

    // Validate input
    if (!email || !password) {
      console.log("🔴 Missing Fields:", { email, password });
      return res.status(400).json({ error: "All fields are mandatory" });
    }


    // Check if user exists
    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      
      return res.status(400).json({ error: "User not found" });
    }

    // Compare passwords
   const isPasswordMatch = await bcrypt.compare(trimmedPassword, user.password);

  

    if (!isPasswordMatch) {
      
      return res.status(400).json({ error: "Invalid password" });
    }

    // Token creation
    const token = createToken(user._id, user.role || 'user');
  

    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict"
    });

    // Remove password from user object
    const userObject = user.toObject();
    delete userObject.password;

    console.log("✅ Login Success:", userObject);

    return res.status(200).json({ message: "Login Successful", user: userObject });

  } catch (error) {
    console.error("🔥 Login Error:", error);
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
};

  // profile 

  const profile=async(req,res,next)=>{
    try{

      const userId=req.user.id

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

      const userId=req.user.id
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

    // Assign plain password and save to trigger pre-save hook hashing
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
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
