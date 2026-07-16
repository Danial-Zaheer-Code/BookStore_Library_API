import * as stausCode from "../utils/statusCodes.js"
import { prisma } from "../lib/prisma.js"
import { success, failure } from "../utils/result.js"
import { calculateFine, calculateLiveFineEstimate } from "../utils/fineCalculator.js"
import { getSelectClauseForListBorrowRecords, getSelectClauseForListOverDueBooks } from "../utils/utils.js"
import { retrieveBookWithAvailableCopies } from "../utils/transactionUtils.js"

export async function borrowBook(userId, bookId) {
    try {
        return await prisma.$transaction(async (tx) => {
            const book = await retrieveBookWithAvailableCopies(tx, bookId)

            if (!book) {
                return failure(stausCode.NOT_FOUND, "The book does not exists")
            }

            if (book.availableCopies <= 0) {
                return failure(stausCode.CONFLICT, "Not available")
            }

            if (await isAlreadyBorrowed(tx, userId, bookId)) {
                return failure(stausCode.CONFLICT, "Book already borrowed")
            }

            const dueDate = calculateDueDate()

            await tx.book.update({
                where: {
                    id: bookId
                },
                data: {
                    availableCopies: {
                        decrement: 1
                    }
                }
            })

            await tx.borrowRecord.create({
                data: {
                    bookId,
                    userId,
                    dueDate
                }
            })

            return success(stausCode.OK, "Book borrwed successfully")
        })
    } catch (error) {
        console.log(error)
        return failure(stausCode.INTERNAL_SERVER_ERROR, "Something went wrong. Try again later")
    }
}

async function isAlreadyBorrowed(tx, userId, bookId) {
    const borrowRecord = await tx.borrowRecord.findFirst({
        where: {
            bookId,
            userId,
            status: "BORROWED"
        },
        select: { id: true }
    })

    return borrowRecord != null
}

function calculateDueDate() {
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 14)

    return dueDate
}

export async function returnBook(userId, borrowId) {
    try {
        return await prisma.$transaction(async (tx) => {
            const borrowRecord = await tx.borrowRecord.findUnique({
                where: {
                    id: borrowId,
                    userId,
                    status: "BORROWED"
                },
                select: { id: true, status: true, dueDate: true, bookId: true }
            })

            if (!borrowRecord) {
                return failure(stausCode.CONFLICT, "You have not borrowed this book")
            }

            const data = createBorrowRecordUpdateData(borrowRecord)

            await tx.book.update({
                where: {
                    id: borrowRecord.bookId
                },
                data: {
                    availableCopies: {
                        increment: 1
                    }
                }
            })

            await tx.borrowRecord.update({
                where: { id: borrowRecord.id },
                data: data
            })

            return success(stausCode.OK, "Book Returned Successfully")
        })
    } catch (error) {
        console.log(error)
        return failure(stausCode.INTERNAL_SERVER_ERROR, "Something went wrong. Try again later")
    }
}

function createBorrowRecordUpdateData(borrowRecord) {
    const data = {
        status: "RETURNED",
        returnDate: new Date()
    }

    const fineAmount = calculateFine(borrowRecord)

    if (fineAmount > 0) {
        data.fineAmount = fineAmount
        data.finePaid = false
        data.status = "OVERDUE"
    }

    return data
}

export async function retrieveMyBorrowHistory(userId, filters) {
    try {
        const history = await prisma.borrowRecord.findMany({
            take: filters.limit,
            skip: (filters.page - 1) * filters.limit,
            where: {
                userId: userId
            },
            select: {
                id: true,
                borrowDate: true,
                dueDate: true,
                returnDate: true,
                status: true,
                fineAmount: true,
                book: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            },
            orderBy: {
                borrowDate: "desc"
            }
        })

        return success(stausCode.OK, "Retrieved Successfully", { borrowHistory: history })
    } catch (error) {
        console.log(error)
        return failure(stausCode.INTERNAL_SERVER_ERROR, "Something went wrong. Try again later")
    }
}

export async function listBorrowRecords(filters) {
    try {
        const skip = (filters.page - 1) * filters.limit

        const where = {}

        if (filters.status) {
            where.status = filters.status
        }

        if (filters.userId) {
            where.userId = filters.userId
        }

        const select = getSelectClauseForListBorrowRecords()

        const records = await prisma.borrowRecord.findMany({
            where,
            skip,
            take: filters.limit,
            orderBy: {
                borrowDate: "desc"
            },
            select
        })

        return success(stausCode.OK, "Retrieved successfully", { borrowRecords: records, })
    } catch (error) {
        console.log(error)
        return failure(stausCode.INTERNAL_SERVER_ERROR, "Something went wrong. Try again later")
    }
}

export async function listOverdueBorrowRecords(filters) {
    try {
        const skip = (filters.page - 1) * filters.limit

        const where = {
            status: "BORROWED",
            dueDate: {
                lt: new Date()
            }
        }

        const select = getSelectClauseForListOverDueBooks()

        const records = await prisma.borrowRecord.findMany({
            where,
            skip,
            take: filters.limit,
            orderBy: {
                dueDate: "asc"
            },
            select
        })

        records.forEach(record => {
            record.estimateFine = calculateLiveFineEstimate(record.dueDate)
        })

        return success(stausCode.OK, "Retrieved successfully", { overdueBorrowRecords: records })
    } catch (error) {
        console.log(error)
        return failure(stausCode.INTERNAL_SERVER_ERROR, "Something went wrong. Try again later")
    }
}