import express, {json} from 'express';
const User = require('./models/user');
import {
  registerController,
  loginController,
  authenticateUser
} from "./userControllers/controllers"



const app = express();
const PORT = 3000;

app.use(json());


app.post('/register', registerController);
app.post('/login', loginController);



app.get('/', authenticateUser, (req, res) => {
  //TODO: Handle protected route logic here
});

app.get('/admin', authenticateUser, authorizeUser('admin'), (req, res) => {
  res.send("You are Admin");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
