// controllers/authController.js

const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const createToken=require('../utils/generateToken')

// Register Controller
const register = async (req, res, next) => {
  try {
    const { name, email, password, profilePic } = req.body || {};
    console.log(name, email, password);

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are mandatory" });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log(hashedPassword);

    // Save user to DB
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      profilePic,
    });

    const savedUser = await newUser.save();

    // Remove password from returned data
    const userData = savedUser.toObject();
    delete userData.password;

    res.status(201).json({ message: "Account created", userData });
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
};

// Login Controller
// Login Controller
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "All fields are mandatory" });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // Compare passwords
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }

    // Token creation
    const token = createToken(user._id, 'user');

    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict"
      
    });

    // Remove password from user object
    const userObject = user.toObject();
    delete userObject.password;

    return res.status(200).json({ message: "Login Successful", user: userObject });
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }};
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

  const deleteUser=async(req,res,next)=>{
    try{

      const userId=req.params.userId
      if(!userId){
        return res.status(400).json({error:'Used Id is Required'})
      }

      const userData=await User.findByIdAndDelete(userId)
      if(!userData){
      return res.status(200).json({deletedUser:userData._Id,message:'User Deleted'})
      }  
      
      return res.status(200).json({data:userData,message:"Profile Updated"})
    }catch(error){
      console.log(error)
      res.status(error.status||500).json({error:error.message||"internal server error"})
    }
  }

 //log out

 const logout = async (req, res, next) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "strict"
  });
  res.status(200).json({ message: "Logged out successfully" });
};



module.exports = { register, login,profile,logout,update,deleteUser };
