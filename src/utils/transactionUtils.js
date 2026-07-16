import {calculateDueDate} from "./utils.js"
export async function retrieveBookWithAvailableCopies(transactionClient, bookId) {
    return await transactionClient.book.findUnique({
        where: { id: bookId },
        select: { availableCopies: true }
    })
}

export async function updateQueuePosititons(transactionClient, reservedRecord) {
    await transactionClient.reservation.updateMany({
        where: {
            queuePosition: {
                gt: reservedRecord.queuePosition
            },
            bookId: reservedRecord.bookId
        },
        data: {
            queuePosition: {
                decrement: 1
            }
        }
    })
}

export async function borrowBookIfReservation(transactionClient, bookId) {
    const nextReservation = await retreiveNextReservation(transactionClient, bookId)

    if (!nextReservation) {
        await transactionClient.book.update({
            where: {
                id: bookId
            },
            data: {
                availableCopies: {
                    increment: 1
                }
            }
        })

        return;
    }

    await transactionClient.reservation.update({
        where: {
            id: nextReservation.id
        },
        data: {
            status: "FULFILLED",
            queuePosition: null
        }
    })

    await updateQueuePosititons(transactionClient, nextReservation)

    const dueDate = calculateDueDate()
    await transactionClient.borrowRecord.create({
        data: {
            bookId: nextReservation.bookId,
            userId: nextReservation.userId,
            dueDate
        }
    })
}

async function retreiveNextReservation(transactionClient, bookId) {
    return await transactionClient.reservation.findFirst({
        where: {
            bookId: bookId,
            queuePosition: 1,
            status: "WAITING"
        },
        select: {
            id: true,
            bookId: true,
            userId: true
        }
    })
}