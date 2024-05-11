const bcrypt = require('bcrypt')
const user = require("../models/user")
const jwt = require('jsonwebtoken')


export const registerController = (req, res) => {
  try {
    const {email, password} = req.body;

    // Check if the email is already registered
    const existingUser = await User.findOne({email});
    if (existingUser) {
      return res.status(400).json({error: 'Email already registered'});
    }

    // Encrypt and hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new User({email, password: hashedPassword});
    await newUser.save();

    res.status(201).json({message: 'User registered successfully'});
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({error: 'An error occurred while registering the user'});
  }
}



export const loginController = async (req, res) => {

  try {
    //data fetch
    const {email, password} = req.body
    //validation on email and password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Plz fill all the details carefully"
      })
    }

    //check for registered User
    let User = await user.findOne({email})
    //if user not registered or not found in database
    if (!User) {
      return res.status(401).json({
        success: false,
        message: "You have to Signup First"
      })
    }
    const payload = {
      email: User.email,
      id: User._id,
      role: User.role,
    }
    //verify password and generate a JWt token 🔎
    if (await bcrypt.compare(password, User.password)) {
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
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
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

    } else {
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

export const authenticateUser = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];

    // Verify the token
    const decodedToken = jwt.verify(token, 'secretKey');

    // Attach the user ID to the request object
    req.userId = decodedToken.userId;

    next();
  } catch (error) {
    console.error('Error authenticating user:', error);
    res.status(401).json({error: 'Unauthorized'});
  }
}

export const authorizeUser = (requiredRole) => (req, res, next) => {
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
