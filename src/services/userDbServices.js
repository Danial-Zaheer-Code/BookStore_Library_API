import { prisma } from "../lib/prisma.js"

export async function createUser(user) {
    try {
        return await prisma.user.create({
            data: user
        })
    } catch (error) {
        console.log(error)
        throw new Error("Error while adding user")
    }
}

export async function isEmailTaken(email) {
    try {
        const user = await retrieveUser(email)

        return user != null;
    } catch (error) {
        console.log(error)
        throw new Error("Error while checking if email is already taken or not")
    }
}

export async function retrieveUser(email) {
    try {
        return await prisma.user.findFirst({
            where: {
                email: email
            }
        })
    } catch (error) {
        console.log(error)
        throw new Error("Error while checking if email is already taken or not")
    }
}