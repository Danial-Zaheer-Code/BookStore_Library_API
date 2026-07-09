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
        decodeToken(req, token)
        next();
    } catch (error) {
        console.log(error);
        return res.status(response.status).json(response.responseBody);
    }
}

export async function validateRefreshToken(req, res, next) {
    const token = req.body.token;
    const response = failure(stausCode.BAD_REQUEST, "Unauthorized");
    if (!token) {
        return res.status(response.status).json(response.responseBody);
    }

    try {
        decodeToken(req, token)
        next();
    } catch (error) {
        console.log(error);
        return res.status(response.status).json(response.responseBody);
    }
}

async function decodeToken(req, token) {
    const decodedToken = jwt.verify(token, process.env.SECRET);
    req.userId = decodedToken.userId;
    req.isAdmin = decodedToken.isAdmin
}