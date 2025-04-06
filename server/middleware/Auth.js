const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.cookies.Authorization;
    const type = req.cookies.Type;
    if (!token || !type ) return res.status(401).json({ Error: 'Acceso denegado' });
    try {
        const decoded = jwt.verify(token, 'secret');
        req.userId = decoded.userId;
        req.userType = decoded.Type;
        next();
    } catch (error) {
        res.status(401).json({ Error: 'Sesión invalida' });
    }
 };

module.exports = verifyToken;