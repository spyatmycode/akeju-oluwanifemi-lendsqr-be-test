"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer faux-token-')) {
        res.status(401).json({ error: 'Invalid or missing token' });
        return;
    }
    next();
};
exports.authMiddleware = authMiddleware;
