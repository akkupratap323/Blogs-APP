const JWT = require("jsonwebtoken")
require('dotenv').config();


function createToken(user){
   const payload =  {
      _id: user._id,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
      role:user.role,   
   }
   const token = JWT.sign(payload, process.env.SECRET_KEY , {expiresIn: "1h"});
   return token;
}

function verifyToken(token) {
    const payload = JWT.verify(token, process.env.SECRET_KEY , {expiresIn: "1h"});
    return payload;
}

module.exports = {
    createToken,
    verifyToken,
    };