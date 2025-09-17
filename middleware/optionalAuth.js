import jwt from "jsonwebtoken";
import { User } from "../models/User.js";


export const optionalAuth = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken;
        if (token) {
            const payload = jwt.verify(token, process.env.JWT_SECRET);
            
            const user = await User.findById(payload.sub).lean();
            const sid = req.cookies?.sid;
            const exists = (user.sessions || []).some(
                (s) => String(s._id) === String(sid)
            );

            if (user && exists) {
                // Attach user info only if valid
                req.user = { id: payload.sub, role: payload.role };
            }
        }
    } catch (err) {
        next(err);
    } finally {
        next();
    }
};