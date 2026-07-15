import * as stausCode from "../utils/statusCodes.js"
import { prisma } from "../lib/prisma.js"
import { success, failure } from "../utils/result.js"

export async function borrowBook(userId, bookId) {
    try {
        return await prisma.$transaction(async (tx) => {
            const book = await tx.book.findUnique({
                where: { id: bookId },
                select: { availableCopies: true }
            })


            if (!book) {
                return failure(stausCode.NOT_FOUND, "The book does not exists")
            }

            if (book.availableCopies <= 0) {
                return failure(stausCode.CONFLICT, "Not available")
            }

            const isAlreadyBorrowed = await tx.borrowRecord.findFirst({
                where: {
                    bookId,
                    userId,
                    status: {
                        in: ["BORROWED", "OVERDUE"]
                    }
                }
            })

            if(isAlreadyBorrowed){
                return failure(stausCode.CONFLICT, "Book already borrowed")
            }

            const dueDate = new Date()
            dueDate.setDate(dueDate.getDate() + 14)

            await tx.book.update({
                where: {
                    id:bookId
                },
                data: {
                    availableCopies: book.availableCopies - 1
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