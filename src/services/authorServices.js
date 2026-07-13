import * as stausCode from "../utils/statusCodes.js"
import { prisma } from "../lib/prisma.js"
import { success, failure } from "../utils/result.js"

export async function createAuthor(author) {
    try {
        await prisma.author.create({
            data: author
        })

        return success(stausCode.OK, "AUthor created successfully")
    } catch (error) {
        console.log(error)
        return failure(stausCode.INTERNAL_SERVER_ERROR, "Something went wrong. Try again later.")
    }
}

export async function listAuthors(filters) {
    try {
        const authors = await prisma.author.findMany({
            take: filters.limit,
            skip: (filters.page - 1) * filters.limit,
            where: {
                name: {
                    contains: filters.search ?? '',
                    mode: "insensitive"
                }
            },
            select: {
                id: true,
                name: true,
            }
        });

        return success(stausCode.OK, "Users retrieved successfully", { authors: authors })
    } catch (error) {
        console.log(error)
        return failure(stausCode.INTERNAL_SERVER_ERROR, "Something went wrong. Try again later.")
    }
}