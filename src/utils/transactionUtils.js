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