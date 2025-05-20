const jwt=require('jsonwebtoken')

const authUser =(req,res,next)=>
{
    try{

 //collect token from coockies
const {token}=req.cookies

//no token - unauthorized user

if(!token){
    return res.status(401).json({message:"User not authorized"})
}

//token decode
const decodedToken=jwt.verify(token,process.env.JWT_SECRET_KEY)

 //issues  with token  
 if(!decodedToken){
    return res.status(401).json({message:"Invalid Token"})
 }
console.log(decodedToken)
 //attach token to req
req.user=decodedToken 
 //next
 next()


    }catch(error){

    }
}
module.exports = authUser;