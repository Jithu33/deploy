const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');


const signup = async (req, res, next) => {
  const { name, email, password } = req.body;
  
  console.log('Signup attempt:', { name, email });
  
  try {

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists');
      return res.status(422).json({ message: 'User already exists, please login instead.' });
    }

    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
      console.error('Password hashing error:', err);
      return res.status(500).json({ message: 'Could not create user, please try again.' });
    }

    
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      places: []
    });

    await newUser.save();
    console.log('User created successfully');

   
    console.log('JWT Secret available:', !!process.env.JWT_SECRET);
    const secretKey = process.env.JWT_SECRET || 'fallbacksecretkey';
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      secretKey,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
      token
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Signing up failed, please try again.' });
  }
};


const login = async (req, res, next) => {
  const { email, password } = req.body;
  
  console.log('Login attempt:', { email });
  
  try {
    
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      console.log('User not found');
      return res.status(403).json({ message: 'Invalid credentials.' });
    }

   
    let isValidPassword;
    try {
      isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
      console.error('Password comparison error:', err);
      return res.status(500).json({ message: 'Login failed, please try again.' });
    }
    
    if (!isValidPassword) {
      console.log('Invalid password');
      return res.status(403).json({ message: 'Invalid credentials.' });
    }

   
    console.log('JWT Secret available:', !!process.env.JWT_SECRET);
    const secretKey = process.env.JWT_SECRET || 'fallbacksecretkey';
    const token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      secretKey,
      { expiresIn: '1h' }
    );

    console.log('Login successful for user:', existingUser.email);
    
  
    res.json({
      userId: existingUser.id,
      email: existingUser.email,
      name: existingUser.name,
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed, please try again.' });
  }
};


const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}, '-password');
    res.json({ users: users.map(user => user.toObject({ getters: true })) });
  } catch (err) {
    console.error('Fetching users error:', err);
    res.status(500).json({ message: 'Fetching users failed.' });
  }
};

module.exports = {
  signup,
  login,
  getUsers
};