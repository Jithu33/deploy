const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  
  if (req.method === 'OPTIONS') {
    return next();
  }

  try {
  
    const token = req.headers.authorization.split(' ')[1]; 
    
    if (!token) {
      throw new Error('Authentication failed!');
    }
    
   
    const secretKey = process.env.JWT_SECRET || 'fallbacksecretkey';
    const decodedToken = jwt.verify(token, secretKey);
    
    
    req.userData = { userId: decodedToken.userId };
    
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    return res.status(401).json({ message: 'Authentication failed!' });
  }
};