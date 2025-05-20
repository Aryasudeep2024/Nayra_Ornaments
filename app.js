const express = require('express')
const app = express()
require('dotenv').config()
const port = process.env.PORT
const connectDb=require('./config/db')
const router=require('./routes/index')

  //coockie parser

  const cookieParser=require('cookie-parser')
app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.use(express.json())
app.use(cookieParser())
app.use('/api',router)

connectDb()
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
