const jwt=require('jsonwebtoken')

const authSeller=(req,res,next)=>
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
//check the role-Admin
if(decodedToken.role!='admin' && decodedToken.role!='seller'){
    return res.status(401).json({message:"User Not Authorized"})
}

 //attach token to req
req.user=decodedToken 
 //next
 next()


    }catch(error){

    }
}
module.exports = authSeller;