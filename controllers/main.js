const jwt = require('jsonwebtoken');
const CustomAPIError = require('../errors/custom-error');

// Create Access Token
const createAccessToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '15s'});
}

// Create Refresh Token
const createRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '1d'});
}

// Login function
const login = async (req, res) => {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
        throw new CustomAPIError('Please provide username and password', 400);
    }

    // Simulate user data (in production, check from DB)
    const id = new Date().getDate(); // For demo, use date as user ID
    const payload = { id, username };

    // Generate tokens
    const accessToken = createAccessToken(payload);
    const refreshToken = createRefreshToken(payload);

    // Set the refresh token as a cookie
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Set to true for production
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // Return the access token
    res.status(200).json({ msg: 'Login/Signup successful', accessToken });
}

// Dashboard function - protected route
const dashboard = async (req, res) => {
    const luckyNumber = Math.random();
    res.status(200).json({
        msg: 'Hello, Andy',
        secret: `Here is your authorized data, your lucky number is ${luckyNumber}`,
    });
}

// Refresh function - to refresh access token
const refresh = async (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ msg: 'No refresh token provided' });

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);  

        // Check if the token has expired manually
        const currentTime = Math.floor(Date.now() / 1000);
        if (currentTime > payload.exp) {
            return res.status(401).json({ msg: 'Refresh token has expired. Please log in again.' });
        }

        const accessToken = createAccessToken({ id: payload.id, username: payload.username });
        res.status(200).json({ accessToken });
    } catch (error) {
        console.error('Error verifying refresh token:', error);
        return res.status(403).json({ msg: 'Invalid or expired refresh token' });
    }
}



module.exports = {
    login,
    dashboard,
    refresh
}
