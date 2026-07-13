import * as stausCode from "../utils/statusCodes.js"
import { prisma } from "../lib/prisma.js"
import { success, failure } from "../utils/result.js"

export async function createAuthor(author) {
    try {
        await prisma.author.create({
            data: author
        })
        return success(stausCode.OK, "Author created successfully")
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

export async function retriveAuthorDetails(authorId) {
    try {
        const author = await prisma.author.findUnique({
            where: {
                id: authorId
            },
            select: {
                id: true,
                name: true,
                bio: true,
                books: {
                    select: {
                        id: true,
                        title: true,
                        isbn: true
                    }
                }
            }
        })

        if (!author) {
            return failure(stausCode.NOT_FOUND, "Author does not exists")
        }

        return success(stausCode.OK, "Retrieved Successfully", { author: author })
    } catch (error) {
        console.log(error)
        return failure(stausCode.INTERNAL_SERVER_ERROR, "Something went wrong. Try again later.")
    }
}

export async function updateAuthor(author) {
    try {
        if (!await isAuthorExists(author.id)) {
            return failure(stausCode.NOT_FOUND, "Author does not exists")
        }

        await prisma.author.update({
            where: {
                id: author.id
            },
            data: author.data
        })

        return success(stausCode.OK, "Author updated successfully")
    } catch (error) {
        console.log(error)
        return failure(stausCode.INTERNAL_SERVER_ERROR, "Something went wrong. Try again later.")
    }
}

export async function deleteAuthor(authorId) {
    try {
        return await prisma.$transaction(async (tx) => {
            const author = await tx.author.findUnique({
                where: { id: authorId },
                include: { _count: { select: { books: true } } }
            });

            
            if (!author) {
                return failure(stausCode.NOT_FOUND, "Author does not exists")
            }

            if (author._count.books > 0) {
                return failure(stausCode.CONFLICT, "Author has books linked to him");
            }

            await tx.author.delete({
                where: { id: authorId }
            });

            return success(stausCode.OK, "Author deleted successfully")
        });

        return res.status(200).json({ message: "Deleted", result });
    } catch (error) {
        console.log(error)
        return failure(stausCode.INTERNAL_SERVER_ERROR, "Something went wrong. Try again later.")
    }
}

async function isAuthorExists(authorId) {
    const author = await prisma.author.findUnique({
        where: {
            id: authorId
        },
        select: {
            id: true
        }
    })

    return author != null;
}
