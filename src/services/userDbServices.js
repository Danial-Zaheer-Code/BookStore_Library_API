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

export async function retrieveUserById(id) {
    try {
        return await prisma.user.findFirst({
            where: {
                id: id
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            }
        })
    } catch (error) {
        console.log(error)
        throw new Error("Error while retrieving user by id")
    }
}

export async function updateUser(user) {
    try {
        return await prisma.user.update({
            where: {
                id: user.id
            },
            data: user.data
        })
    } catch (error) {
        console.log(error)
        throw new Error("Error while updating the user")
    }
}


export async function listUsers(filters) {
    try {
        return await prisma.user.findMany({
            take: filters.limit,
            skip: (filters.page - 1) * filters.limit,
            where: {
                OR: [
                    {
                        name: {
                            contains: filters.search,
                            mode: "insensitive"
                        }
                    },
                    {
                        email: {
                            contains: filters.search,
                            mode: "insensitive"
                        }
                    }
                ]
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            }
        });
    } catch (error) {
        console.log(error)
        throw new Error("Error while listing the users")
    }
}