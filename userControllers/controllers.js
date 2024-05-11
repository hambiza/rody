const bcrypt = require('bcrypt')
const user = require("../models/user")
const jwt = require('jsonwebtoken')


export const registerController =  async(req, res)=> {
  try {
      //get input data
      const {name, email, password, role}= req.body

      // Check if All Details are there or not
  if (!name ||
    !email ||
    !password 
  ) {
    return res.status(403).send({
      success: false,
      message: "All Fields are required",
    });
  }

      //check if use already exists?
      const existingUser = await user.findOne({email})
      if(existingUser){
          return res.status(400).json({
              success: false,
              message: "User already exists"
          })
      }

      //secure password
      let hashedPassword
      try {
          hashedPassword = await bcrypt.hash(password,10)
      } catch (error) {
          return res.status(500).json({
              success: false,
              message : `Hashing pasword error for ${password}: `+error.message
          })
      }

      const User = await user.create({
          name, email, password:hashedPassword, role
      })

      return res.status(200).json({
          success: true,
          User,
          message: "user created successfully ✅"
      })
  } catch (error) {
      console.error(error)
      return res.status(500).json({
          success: false,
          message : "User registration failed"
      })
  }
}




export const loginController =  async(req, res)=> {

  try {
      //data fetch
      const {email, password} = req.body
      //validation on email and password
      if(!email || !password){
          return res.status(400).json({
              success:false,
              message: "Plz fill all the details carefully"
          })
      }

      //check for registered User
      let User= await  user.findOne({email})
      //if user not registered or not found in database
      if(!User){
          return res.status(401).json({
              success: false,
              message: "You have to Signup First"
          })
      }

      const payload ={
          email: User.email,
          id: User._id,
          role: User.role,
      }
      //verify password and generate a JWt token 🔎
      if(await bcrypt.compare(password,User.password)){
          //if password matched
           //now lets create a JWT token
           let token = jwt.sign(payload, 
                      process.env.JWT_SECRET,
                      {expiresIn: "2h"}
                      )
          User = User.toObject()
          User.token = token
          
          User.password = undefined
          const options = {
              expires: new Date( Date.now()+ 3*24*60*60*1000),
              httpOnly: true  //It will make cookie not accessible on clinet side -> good way to keep hackers away

          }
          res.cookie(
              "token",
              token,
              options
          ).status(200).json({
              success: true,
              token,
              User,
              message: "Logged in Successfully✅"

          })

      }else{
          //password donot matched
          return res.status(403).json({
              success: false,
              message: "Password incorrects⚠️"
          })
      }

  } catch (error) {
      console.error(error)
      res.status(500).json({
          success: false,
          message: "Login failure⚠️ :" + error
      })
  }

}

// export const authenticateUser = (req, res, next) => {
//   try {
//     const token = req.headers.authorization.split(' ')[1];

//     // Verify the token
//     const decodedToken = jwt.verify(token, 'secretKey');

//     // Attach the user ID to the request object
//     req.userId = decodedToken.userId;

//     next();
//   } catch (error) {
//     console.error('Error authenticating user:', error);
//     res.status(401).json({error: 'Unauthorized'});
//   }
// }

export const authorizeUser = (requiredRole) => async(req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    
    if (user.role !== requiredRole) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    next();
  } catch (error) {
    console.error('Error authorizing user:', error);
    res.status(500).json({ error: 'An error occurred while authorizing the user' });
  }
};
