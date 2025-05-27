
const express = require('express')
const router=express.Router()
const userRoutes=require('./userRoutes')
const adminRoutes = require('./adminRoutes')
const sellerRoutes = require('./sellerRoutes')
const cartRoutes= require('./cartRoutes')
const reviewRoutes=require('./reviewRoutes')


//api/user
router.use('/admin', adminRoutes)

router.use('/seller', sellerRoutes)

router.use('/user',userRoutes)

router.use('/cart',cartRoutes)

router.use('/review',reviewRoutes)




module.exports= router 