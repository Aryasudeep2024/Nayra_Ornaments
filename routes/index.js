
const express = require('express')
const router=express.Router()
const userRoutes=require('./userRoutes')
const adminRoutes = require('./adminRoutes')
const sellerRoutes = require('./sellerRoutes')
const cartRoutes= require('./cartRoutes')
const reviewRoutes=require('./reviewRoutes')
const productRoutes=require('./productRoutes')
const paymentRoutes = require('./paymentRoutes');
const orderRoutes = require('./orderRoutes');


//api/user
router.use('/admin', adminRoutes)

router.use('/seller', sellerRoutes)

router.use('/user',userRoutes)

router.use('/collection',productRoutes)

router.use('/cart',cartRoutes)

router.use('/review',reviewRoutes)

router.use('/payment',paymentRoutes)

router.use('/orders',orderRoutes)




module.exports= router 