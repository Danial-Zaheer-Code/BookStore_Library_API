import * as stausCode from "../utils/statusCodes.js"
import { prisma } from "../lib/prisma.js"
import { success, failure } from "../utils/result.js"
import { retrieveBookWithAvailableCopies } from "../utils/transactionUtils.js"
import { borrowBook } from "./borrowServices.js"
import { updateQueuePosititons } from "../utils/transactionUtils.js"

export async function reserveBook(userId, bookId) {
    try {
        return await prisma.$transaction(async (tx) => {
            const book = await retrieveBookWithAvailableCopies(tx, bookId)

            if (!book) {
                return failure(stausCode.NOT_FOUND, "The book does not exists")
            }

            if (book.availableCopies > 0) {
                return failure(stausCode.CONFLICT, "Book is available for borrowing.")
            }

            if (await isAlreadyReserved(tx, userId, bookId)) {
                return failure(stausCode.CONFLICT, "You had already reserved this book")
            }

            const nextQueuePostion = await calculateNextQueuePosition(tx, bookId)

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

async function isAlreadyReserved(transactionClient, userId, bookId) {
    const reservation = await transactionClient.reservation.findFirst({
        where: {
            userId,
            bookId,
            status: "WAITING"
        }
    })

    return reservation != null;
}

async function calculateNextQueuePosition(transactionClient, bookId) {
    const lastReserved = await transactionClient.reservation.findFirst({
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

    return lastReserved ? lastReserved.queuePosition + 1 : 1
}

export async function cancelReservation(userId, reservationId) {
    try {
        return await prisma.$transaction(async (tx) => {
            const reservedRecord = await tx.reservation.findFirst({
                where: {
                    id: reservationId,
                    userId,
                    status: "WAITING"
                },
                select: { bookId: true, queuePosition: true }
            })

            if (!reservedRecord) {
                return failure(stausCode.NOT_FOUND, "No such reservation belongs to you")
            }

            await tx.reservation.update({
                where: {
                    id: reservationId
                },
                data: {
                    status: "CANCELLED",
                    queuePosition: null
                }
            })

            await updateQueuePosititons(tx, reservedRecord)

            return success(stausCode.OK, "Reservation cancelled successfully")
        })
    } catch (error) {
        console.log(error)
        return failure(stausCode.INTERNAL_SERVER_ERROR, "Something went wrong. Try again later.")

    }
}

