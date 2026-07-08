import dotenv from "dotenv"
dotenv.config();

import jwt from "jsonwebtoken"

export async function validateToken(req, res, next) {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(401).json("Unauthorized");
    }

    try {
        const decodedToken = jwt.verify(token, process.env.SECRET);
        req.userId = decodedToken.userId;
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json("Session Expired");
    }
}