
const express = require('express')
const router=express.Router()

const userRoutes=require('./userRoutes')
const adminRoutes = require('./adminRoutes')
const sellerRoutes = require('./sellerRoutes')
//api/user
router.use('/admin', adminRoutes)
router.use('/seller', sellerRoutes)
router.use('/user',userRoutes)





module.exports= router 