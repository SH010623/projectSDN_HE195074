const jwt = require('jsonwebtoken');
const httpErrors = require('http-errors');

const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers['authorization'];

        if (!token) return res.status(403).json({
            message: "No token provided!",
            status: 403
        });

        const bearer = token.split(' ');
        const bearerToken = bearer[1];

        jwt.verify(bearerToken, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).send({
                    message: "Unauthorized!",
                    status: 401
                });
            }
            req.userId = decoded.userId;
            req.role = decoded.role;
            
            next();
        });
    } catch (error) {
        next(httpErrors.Unauthorized());
    }
};

const adminOnly = (req, res, next) => {
    if (req.role !== 'admin') {
        return res.status(403).json({
            message: "Access denied! Only admins are allowed.",
            status: 403,
        });
    }
    next();
};

const optionalVerifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (authHeader) {
            const bearer = authHeader.split(' ');
            const token = bearer[1];
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                req.userId = decoded.userId;
                req.role = decoded.role;
            }
        }
    } catch (error) {
        // Token invalid or expired, proceed as guest
    }
    next();
};

verifyToken.verifyToken = verifyToken;
verifyToken.adminOnly = adminOnly;
verifyToken.optionalVerifyToken = optionalVerifyToken;

module.exports = verifyToken;
module.exports.verifyToken = verifyToken;
module.exports.adminOnly = adminOnly;
module.exports.optionalVerifyToken = optionalVerifyToken;