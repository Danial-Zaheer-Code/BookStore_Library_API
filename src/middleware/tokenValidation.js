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
        decodeToken(req, token, process.env.JWT_SECRET)
        next();
    } catch (error) {
        console.log(error);
        return res.status(response.status).json(response.responseBody);
    }
}

export async function validateRefreshToken(req, res, next) {
    const token = req.body.token;
    const response = failure(stausCode.BAD_REQUEST, "Inavlid refresh token");
    console.log(token)
    console.log("Is token exists?")
    if (!token) {
        console.log("NO")
        return res.status(response.status).json(response.responseBody);
    }
    console.log("Yes")

    try {
        console.log("Tyring to decode token")
        decodeToken(req, token, process.env.REFRSEH_JWT_SECRET)
        console.log("Token Decoded")
        next();
    } catch (error) {
        console.log(error);
        return res.status(response.status).json(response.responseBody);
    }
}

async function decodeToken(req, token, secret) {
    const decodedToken = jwt.verify(token, secret);
    req.userId = decodedToken.userId;
    req.isAdmin = decodedToken.isAdmin
}