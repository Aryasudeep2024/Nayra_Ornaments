const mongoose = require('mongoose');
 
const connectDb=async()=>{
    const dburl=process.env.MONGODB_URL
    console.log(dburl)

    try {
        await mongoose.connect(dburl)
        console.log("DB CONNECTED...")
    } catch (error) {
        console.log(error)
        
    }
}
module.exports=connectDb