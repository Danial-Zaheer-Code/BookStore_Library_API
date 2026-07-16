export async function retrieveBookWithAvailableCopies(transactionClient, bookId) {
    return await transactionClient.book.findUnique({
        where: { id: bookId },
        select: { availableCopies: true }
    })
}