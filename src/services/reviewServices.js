import * as stausCode from "../utils/statusCodes.js"
import { prisma } from "../lib/prisma.js"
import { success, failure } from "../utils/result.js"
import {isBookExists} from "./bookServices.js"
export async function createReview(data) {
    try {
        if(!await isBookExists(data.bookId)){
            return failure(stausCode.NOT_FOUND, "Book does not exists")
        }

        if(!await isEverBorrowed(prisma, data.userId, data.bookId)){
            return failure(stausCode.FORBIDDEN, "You can only review books that you have borrowed.")
        }

        const existingReview = await prisma.review.findFirst({
            where: {
                userId: data.userId,
                bookId: data.bookId
            }
        })

        if(existingReview){
            await prisma.review.update({
                where: {
                    id: existingReview.id
                },
                data: {
                    rating: data.rating,
                    comment: data.comment
                }
            })
        }

        await prisma.review.create({
            data: data
        })

        return success(stausCode.CREATED, "Review created successfully")
    }
    catch (error) {
        console.log(error)
        return failure(stausCode.INTERNAL_SERVER_ERROR, "Something went wrong. Try again later.")
    }
}

async function  isEverBorrowed(transactionClient, userId, bookId) {
    const borrowRecord = await transactionClient.borrowRecord.findFirst({
        where: {
            userId,
            bookId,
        }
    })

    return borrowRecord !== null
}