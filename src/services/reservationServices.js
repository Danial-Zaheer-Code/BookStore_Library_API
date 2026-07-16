import * as stausCode from "../utils/statusCodes.js"
import { prisma } from "../lib/prisma.js"
import { success, failure } from "../utils/result.js"

export async function reserveBook(userId, bookId) {
    try {
        return await prisma.$transaction(async (tx) => {
            const book = await tx.book.findUnique({
                where: { id: bookId },
                select: { availableCopies: true }
            })

            if (!book) {
                return failure(stausCode.NOT_FOUND, "The book does not exists")
            }

            if (book.availableCopies > 0) {
                return failure(stausCode.CONFLICT, "Book is available for borrowing.")
            }

            const alreadyReserved = await tx.reservation.findFirst({
                where: {
                    userId,
                    bookId,
                    status: "WAITING"
                }
            })

            if(alreadyReserved){
                return failure(stausCode.CONFLICT, "You had already reserved this book")
            }

            const lastReserved = await tx.reservation.findFirst({
                where: {
                    status: "WAITING",
                    bookId: bookId
                },
                select: {
                    queuePosition: true
                },
                orderBy: {
                    queuePosition: "desc"
                }
            })

            const nextQueuePostion = lastReserved ? lastReserved.queuePosition + 1 : 1

            await tx.reservation.create({
                data: {
                    userId,
                    bookId,
                    queuePosition: nextQueuePostion
                }
            })

            return success(stausCode.OK, "Book reserved successfully")
        })
    } catch (error) {
        console.log(error)
        return failure(stausCode.INTERNAL_SERVER_ERROR, "Something went wrong. Try again later.")
    }
}