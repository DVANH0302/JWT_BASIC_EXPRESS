const jwt = require('jsonwebtoken');
const CustomAPIError = require("../errors/custom-error");

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    // If no authorization header is provided, return error.
    if (!authHeader) {
        return res.status(401).json({ msg: 'Authorization header is missing' });
    }

    // Extract token from the 'Bearer <token>' format.
    const token = authHeader.split(' ')[1];
    
    // If token is missing, return error.
    if (!token) {
        return res.status(401).json({ msg: 'Token is missing' });
    }

    try {
        // Verify the token using JWT secret
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attach decoded user info to the request object
        req.user = decoded;
        
        // Proceed to the next middleware/handler
        next();
    } catch (err) {
        // Handle token verification errors (invalid or expired)
        return res.status(403).json({ msg: 'Invalid or expired token' });
    }
};

module.exports = { authenticateToken };
