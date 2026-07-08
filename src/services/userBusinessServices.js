import dotenv from "dotenv"
dotenv.config()

import jwt from "jsonwebtoken"
import * as userDbServices from "./userDbServices.js"
import * as stausCode from "../utils/statusCodes.js"
import { hash, compare } from "../utils/hashing.js"
import { success, failure } from "../utils/result.js"

export async function register(user) {
    try {
        if (await userDbServices.isEmailTaken(user.email)) {
            return failure(stausCode.CONFLICT, "User already exists")
        }

        user.password = await hash(user.password);
        await userDbServices.createUser(user)
        return success(stausCode.OK, "User created successfully")
    } catch (error) {
        console.log(error)
        return failure(stausCode.INTERNAL_SERVER_ERROR, "Something went wrong. Try again later")
    }
}

export async function login(user) {
    try {
        const existingUser = await userDbServices.retrieveUser(user.email);
        if (!existingUser) {
            return failure(stausCode.NOT_FOUND, "User does not exists")
        }

        const isMatch = await compare(user.password, existingUser.password);

        if (!isMatch) {
            return failure(stausCode.UNAUTHORIZED, "Wrong Password")
        }

        const tokenPayload = {
            userId: existingUser.id,
            isAdmin: existingUser.role == "ADMIN"
        }

        const token = jwt.sign(
            tokenPayload,
            process.env.SECRET,
            { expiresIn: "15m" }
        );

        const refreshToken = jwt.sign(
            tokenPayload,
            process.env.SECRET,
            { expiresIn: "1" }
        );


        return success(stausCode.OK, "Login Successfull", { token: token, refreshToken: refreshToken });

    } catch (error) {
        console.log(error)
        return failure(stausCode.INTERNAL_SERVER_ERROR, "Something went wrong try again later")
    }
}