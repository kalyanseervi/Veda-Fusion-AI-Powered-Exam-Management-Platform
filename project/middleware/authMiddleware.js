const jwt = require('jsonwebtoken');

const protect = (roles = []) => {
    return (req, res, next) => {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;

            if (roles.length && !roles.includes(req.user.role)) {
                return res.status(403).json({ msg: 'Access denied' });
            }

            next();
        } catch (err) {
            return res.status(401).json({ msg: 'Not authorized' });
        }
    };
};

module.exports = protect;
