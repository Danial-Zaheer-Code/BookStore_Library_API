import dotenv from "dotenv"
dotenv.config();

import jwt from "jsonwebtoken"
import { failure } from "../utils/result.js";
import * as stausCode from "../utils/statusCodes.js"


export async function validateToken(req, res, next) {
    const token = req.headers.authorization.split(' ')[1];
    const response = failure(stausCode.UNAUTHORIZED, "Unauthorized");
    if (!token) {
        return res.status(response.status).json(response.responseBody);
    }

    try {
        const decodedToken = jwt.verify(token, process.env.SECRET);
        req.userId = decodedToken.userId;
        req.isAdmin = decodedToken.isAdmin
        next();
    } catch (error) {
        console.log(error);
        return res.status(response.status).json(response.responseBody);
    }
}