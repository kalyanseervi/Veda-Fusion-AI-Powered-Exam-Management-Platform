const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;


const decodeTokenFromParams = async (req, res, next) => {
    const token = req.params.token;

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        // Decode and verify the token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Attach user data (like role) to the request object
        req.user = decoded;

        // Call the next middleware or route handler
        next();
    } catch (err) {
        console.error('Token verification failed:', err.message);
        res.status(401).json({ msg: 'Token is not valid' });
    }
};


const auth = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        let email = decoded.userEmail;
        req.user = await User.findOne({email}).populate('role').select('-password');
        
        next();
    } catch (err) {
        console.error(err.message);
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

const authorize = (requiredRoles) => {
    return (req, res, next) => {
        if (!requiredRoles.includes(req.user.role.name)) {
            return res.status(403).json({ msg: 'Access denied: You do not have the required role' });
        }
        next();
    };
};

module.exports = { auth, authorize,decodeTokenFromParams };