
const express = require('express')
const router=express.Router()

const userRoutes=require('./userRoutes')
//api/user
router.use('/user',userRoutes)


module.exports= router 