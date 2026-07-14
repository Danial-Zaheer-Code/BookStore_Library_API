import * as stausCode from "../utils/statusCodes.js"
import { prisma } from "../lib/prisma.js"
import { success, failure } from "../utils/result.js"
import { isAuthorExists } from "./authorServices.js"
import { isCategoryExists } from "./categoryServices.js"

export async function createBook(book) {
    try {
        if (await isISBNTaken(book.isbn)) {
            return failure(stausCode.CONFLICT, "Book with ISBN already exists")
        }

        if (!await isAuthorExists(book.authorId)) {
            return failure(stausCode.NOT_FOUND, "Author does not exists")
        }

        if (!await isCategoryExists(book.categoryId)) {
            return failure(stausCode.NOT_FOUND, "Category does not exists")
        }

        await prisma.book.create({
            data: book
        })

        return success(stausCode.OK, "Book created successfully")
    } catch (error) {
        console.log(error)
        return failure(stausCode.INTERNAL_SERVER_ERROR, "Something went wrong. Try again later.")
    }
}

async function isISBNTaken(isbn) {
    const book = await prisma.book.findUnique({
        where: {
            isbn: isbn
        },
        select: {
            id: true
        }
    })

    return book != null
}

export async function retrieveBookDetails(bookId) {
    try {
        const book = await prisma.book.findUnique({
            where: { id: bookId },
            select: {
                id: true,
                title: true,
                availableCopies: true,
                totalCopies: true,
                publishedYear: true,
                category: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                author: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        })

        if (!book) {
            return failure(stausCode.NOT_FOUND, "Book does not exists")
        }

        const reviewStats = await prisma.review.aggregate({
            where: {
                bookId: bookId
            },
            _avg: {
                rating: true
            }
        })

        book.averageRating = reviewStats._avg.rating ?? 0;

        return success(stausCode.OK, "Retrieved SUccessfully", { book: book })
    } catch (error) {
        console.log(error)
        return failure(stausCode.INTERNAL_SERVER_ERROR, "Something went wrong. Try again later.")
    }
}

export async function deleteBook(bookId){
    try {
        const book = await prisma.book.findUnique({
            where: {
                id: bookId
            },
            select: {
                id: true,
                borrowRecords: {
                    where: {
                        status: "BORROWED"
                    },
                    take: 1,
                    select: {
                        id: true
                    }
                },
                reservations: {
                    where: {
                        status: "WAITING"
                    },
                    take: 1,
                    select: {
                        id: true
                    }
                }
            },
        })

        if(!book){
            return failure(stausCode.NOT_FOUND, "The book does not exists")
        }

        if(book.borrowRecords.length > 0){
            return failure(stausCode.CONFLICT, "The book is borrowed")
        }

        if(book.reservations.length > 0){
            return failure(stausCode.CONFLICT, "The book has a waiting reservation")
        }

        await prisma.book.delete({
            where: {
                id: bookId
            }
        })

        return success(stausCode.OK, "Book deleted successfully")
    } catch (error) {
        console.log(error)
        return failure(stausCode.INTERNAL_SERVER_ERROR, "Something went wrong. Try again later.")
    }
}