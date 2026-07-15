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



export async function updateBook(book) {
    try {
        if (!await isBookExists(book.id)) {
            return failure(stausCode.NOT_FOUND, "The book does not exists")
        }

        if (book.data.authorId && !await isAuthorExists(book.data.authorId)) {
            return failure(stausCode.NOT_FOUND, "Author does not exists")
        }

        if (book.data.categoryId && !await isCategoryExists(book.data.categoryId)) {
            return failure(stausCode.NOT_FOUND, "Category does not exists")
        }
        const existingBook = book.data.isbn ? await retrieveBookByISBN(book.data.isbn) : null
        if (existingBook && existingBook.id != book.id) {
            return failure(stausCode.CONFLICT, "New ISBN already taken by another book")
        }

        await prisma.book.update({
            where: { id: book.id },
            data: book.data
        })

        return success(stausCode.OK, "Book Updated successfully")
    } catch (error) {
        console.log(error)
        return failure(stausCode.INTERNAL_SERVER_ERROR, "Something went wrong. Try again later.")
    }
}



async function isISBNTaken(isbn) {
    const book = await retrieveBookByISBN(isbn)

    return book != null
}

async function retrieveBookByISBN(isbn) {
    return await prisma.book.findUnique({
        where: {
            isbn: isbn
        },
        select: {
            id: true
        }
    })
}

async function isBookExists(bookId) {
    const book = await prisma.book.findUnique({
        where: { id: bookId },
        select: { id: true }
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

        book.averageRating = await calculateAverageRating(bookId)

        return success(stausCode.OK, "Retrieved SUccessfully", { book: book })
    } catch (error) {
        console.log(error)
        return failure(stausCode.INTERNAL_SERVER_ERROR, "Something went wrong. Try again later.")
    }
}

async function calculateAverageRating(bookId) {
    const reviewStats = await prisma.review.aggregate({
        where: {
            bookId: bookId
        },
        _avg: {
            rating: true
        }
    })

    return reviewStats._avg.rating ?? 0;
}

export async function deleteBook(bookId) {
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

        if (!book) {
            return failure(stausCode.NOT_FOUND, "The book does not exists")
        }

        if (book.borrowRecords.length > 0) {
            return failure(stausCode.CONFLICT, "The book is borrowed")
        }

        if (book.reservations.length > 0) {
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

export async function listBooks(filters) {
    try {
        const skip = (filters.page - 1) * filters.limit

        const where = createWhereClauseForBookList(filters)

        const sortFieldMap = {
            title: "title",
            publishedYear: "publishedYear",
            availableCopies: "availableCopies"
        }

        const sortBy = filters.sortBy ?? "title"
        const sortOrder = filters.sortOrder ?? "asc"

        const books = await prisma.book.findMany({
            where,
            skip,
            take: filters.limit,
            orderBy: {
                [sortBy]: sortOrder
            },
            select: {
                id: true,
                title: true,
                isbn: true,
                totalCopies: true,
                availableCopies: true,
                publishedYear: true,
                author: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                category: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        })

        return success(stausCode.OK, "Books retrieved successfully", { books })
    } catch (error) {
        console.log(error)
        return failure(stausCode.INTERNAL_SERVER_ERROR, "Something went wrong. Try again later.")
    }
}

function createWhereClauseForBookList(filters) {
    const where = {}

    if (filters.categoryId) {
        where.categoryId = Number(filters.categoryId)
    }

    if (filters.authorId) {
        where.authorId = Number(filters.authorId)
    }

    if (filters.availability) {
        where.availableCopies = {
            gt: 0
        }
    }

    if (filters.yearFrom || filters.yearTo) {
        where.publishedYear = {}
        if (filters.yearFrom) {
            where.publishedYear.gte = Number(filters.yearFrom)
        }
        if (filters.yearTo) {
            where.publishedYear.lte = Number(filters.yearTo)
        }
    }

    if (filters.search) {
        where.title = {
            contains: filters.search,
            mode: "insensitive"
        }
    }

    return where
}