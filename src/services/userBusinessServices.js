import dotenv from "dotenv"
dotenv.config()

import * as userRepository from "../repository/userRepository.js"
import * as stausCode from "../utils/statusCodes.js"
import { hash, compare } from "../utils/hashing.js"
import { success, failure } from "../utils/result.js"
import { createToken } from "../utils/utils.js"

export async function register(user) {
    try {
        if (await userRepository.isEmailTaken(user.email)) {
            return failure(stausCode.CONFLICT, "User already exists")
        }

        user.password = await hash(user.password);
        await userRepository.createUser(user)
        return success(stausCode.OK, "User created successfully")
    } catch (error) {
        console.log(error)
        return failure(stausCode.INTERNAL_SERVER_ERROR, "Something went wrong. Try again later")
    }
}

export async function login(user) {
    try {
        const existingUser = await userRepository.retrieveUser(user.email);
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

        const token = createToken(tokenPayload, "15m", process.env.JWT_SECRET)
        const refreshToken = createToken(tokenPayload, "1h", process.env.REFRSEH_JWT_SECRET)

        return success(stausCode.OK, "Login Successfull", { token: token, refreshToken: refreshToken, userName: existingUser.name });

    } catch (error) {
        console.log(error)
        return failure(stausCode.INTERNAL_SERVER_ERROR, "Something went wrong try again later")
    }
}

export async function refreshToken(tokenPayload) {
    try {
        const token = createToken(tokenPayload, "15m", process.env.JWT_SECRET)
        return success(stausCode.OK, "Token refreshed successfully", { token: token })
    } catch (error) {
        console.log(error)
        return failure(stausCode.INTERNAL_SERVER_ERROR, "Something went wrong try again later")
    }
}

export async function retrieveProfile(userId) {
    try {
        const user = await userRepository.retrieveUserById(userId)

        if (!user) {
            return failure(stausCode.NOT_FOUND, "User does not exists")
        }

        return success(stausCode.OK, "Profile retrieved successfully", { user: user })

    } catch (error) {
        console.log(error)
        return failure(stausCode.INTERNAL_SERVER_ERROR, "Something went wrong try again later")
    }
}

export async function updateUser(user) {
    try {
        if (!await userRepository.isUserExists(user.userId)) {
            return failure(stausCode.NOT_FOUND, "User does not exists")
        }

        if (user.data.email && await userRepository.isEmailTaken(user.data.email)) {
            return failure(stausCode.CONFLICT, "Email already in use")
        }

        if (user.data.password) {
            user.data.password = await hash(user.data.password)
        }

        await userRepository.updateUser(user)

        return success(stausCode.OK, "Profile Updated successfully")

    } catch (error) {
        console.log(error)
        return failure(stausCode.INTERNAL_SERVER_ERROR, "Something went wrong try again later")
    }
}

export async function listUsers(filters) {
    try {
        const users = await userRepository.listUsers(filters)

        return success(stausCode.OK, "Users retrieved successfully", { users: users })
    } catch (error) {
        console.log(error)
        return failure(stausCode.INTERNAL_SERVER_ERROR, "Something went wrong try again later")
    }
}

export async function updateRole(user, adminId) {
    console.log(user)
    if (user.userId == adminId) {
        return failure(stausCode.FORBIDDEN, "You can't change your own role")
    }

    if(!await userRepository.isUserExists(user.userId)){
        return failure(stausCode.NOT_FOUND, "The user does not exists")
    }

    try {
        await userRepository.updateUser(user)

        return success(stausCode.OK, "Role updated successfully")
    } catch (error) {
        console.log(error)
        return failure(stausCode.INTERNAL_SERVER_ERROR, "Something went wrong try again later")
    }
}