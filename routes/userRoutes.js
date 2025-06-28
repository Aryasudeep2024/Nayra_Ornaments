const express=require('express')
const userRoutes= express.Router()
const { register, login,profile,logout,update,deleteUser } = require("../controllers/userController");
const authUser=require('../middlewares/authUser')
const { resetUserPassword } = require('../controllers/userController');

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
userRoutes.put('/update',authUser,update)
 
//delete
userRoutes.delete('/delete',authUser,deleteUser)

//forget password

userRoutes.post('/reset-password', resetUserPassword);


module.exports=userRoutes