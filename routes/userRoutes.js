const express=require('express')
const userRoutes= express.Router()
const { register, login,profile,logout,update,deleteUser } = require("../controllers/userController");
const authUser=require('../middlewares/authUser')
const authAdmin=require('../middlewares/authAdmin')
//signup
  
userRoutes.post('/register',register)

//log in
///api/user/login
userRoutes.post('/login',login)

//logout
userRoutes.get('/logout',logout)

//profile
userRoutes.get('/profile',authUser,profile)

//update
userRoutes.patch('/update',authUser,update)
 
//delete
userRoutes.delete('/delete/:userId',authAdmin,deleteUser)


module.exports=userRoutes