const jwt = require("jsonwebtoken");
const UserModel = require("../model/User.model");
const AuthModel = require("../model/Auth.model");

const crypto = require('crypto');

function createHash(jsonBody, apiKey) {
  // Convert JSON body to string
  const jsonString = JSON.stringify(jsonBody);
  
  // Concatenate the JSON string with the API key
  const dataToHash = jsonString + apiKey;

  // Create SHA-512 hash
  const hash = crypto.createHash('sha512').update(dataToHash).digest('hex');

  return hash;
}

function Errordisplay(error) {
    console.log(error);// can be removed
        if (error.message) {
            const msg=(error.message.split(':')[2])
            return {msg:msg?(msg.split(',')[0])?(msg.split(',')[0].split(' ').find(i=>i=='dup'))?'Oops! It seems like the details you provided already exist in our system. Please try again':(msg.split(',')[0]):'Oops! An error occurred. Please try again':`Issue occured, Please try again.`}
        } else {
            console.log(error);
            return{msg:'Oops! An unexpected error occurred. Please try again later.'}

        }  

}

/////////////////////Jwt

async function CreateJWTToken(payload) {
    try {
        await AuthModel.deleteMany({UserID:payload._id})
        let token = await jwt.sign({...payload},process.env.jwtSecret,{expiresIn:'1d'})
        await AuthModel.create({
          UserID:payload._id,
          Auth:token,
          UserName:payload.username
        })
        return token
      } catch (error) {
        throw error
    }
}

// 'Bearer dfghjkfghjdfgytguyufghytgbuhyrvfrfvtujfr'
                   
async function VerifyJWTToken(req, res, next) {
    const authHeader = req.headers['authorization'];
  
    if (!authHeader) {
      return res.status(401).json({ Access: false, Error: 'Authorization header missing' });
    }
    
    let [scheme, token] = authHeader.split(' ')
    
    if(scheme !== 'Bearer' || !token) return res.status(401).json({ Access: false, Error: 'invalid token format' });
    
    jwt.verify(token, process.env.jwtSecret, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ Access: false, Error: 'You are logged out' });
      }

      console.log(decoded._doc);
      
      let GetAuth= await AuthModel.findOne({Auth:token, UserID:decoded._doc._id, })

      if (GetAuth){
        let User= await UserModel.findOne({_id:decoded._doc._id})

        if(User.Blocked)return res.status(401).json({Access:false, Error: 'User has been blocked' });
        
        req.user = User;
        return next();
      }

      return res.status(401).json({Access:false, Error: 'You are logged out' });
      
    });
  }

function VerifyWebJWTToken(req, res, next) {
    const token = req.session.Auth;
  
    if (!token) {
      return res.status(401).json({ Error: 'User Does Not Exist' });
    }
  
    jwt.verify(token, process.env.jwtSecret, (err, decoded) => {
      if (err) {
        return res.status(401).json({ Error: 'User Does Not Exist' });
      }

      if(decoded.Blocked)return res.status(401).json({Access:false, Error: 'User has been blocked' });

      req.user = decoded._doc;
      next();
    });
}

module.exports= {Errordisplay, CreateJWTToken, VerifyJWTToken,VerifyWebJWTToken, createHash}