import * as stausCode from "../utils/statusCodes.js"
import { prisma } from "../lib/prisma.js"
import { success, failure } from "../utils/result.js"
import { isBookExists } from "./bookServices.js"
export async function createReview(data) {
    try {
        if (!await isBookExists(data.bookId)) {
            return failure(stausCode.NOT_FOUND, "Book does not exists")
        }

        if (!await isEverBorrowed(data.userId, data.bookId)) {
            return failure(stausCode.FORBIDDEN, "You can only review books that you have borrowed.")
        }

        const existingReview = await prisma.review.findFirst({
            where: {
                userId: data.userId,
                bookId: data.bookId
            }
        })

        if (existingReview) {
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

async function isEverBorrowed(userId, bookId) {
    const borrowRecord = await prisma.borrowRecord.findFirst({
        where: {
            userId,
            bookId,
        }
    })

    return borrowRecord !== null
}

export async function retrieveBookReviews(bookId) {
    try {
        const reviews = await prisma.review.findMany({
            where: {
                bookId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        })


        return success(stausCode.OK, "Reviews retrieved successfully", reviews)
    } catch (error) {
        console.log(error)
        return failure(stausCode.INTERNAL_SERVER_ERROR, "Something went wrong. Try again later.")
    }
}

export async function deleteReview(reviewId, userId, isAdmin) {
    try {
        const review = await prisma.review.findUnique({
            where: {
                id: reviewId
            },
            select: {
                userId: true
            }
        })

        if (!review) {
            return failure(stausCode.NOT_FOUND, "Review not found")
        }

        if (review.userId !== userId && !isAdmin) {
            return failure(stausCode.FORBIDDEN, "You are not the owner of this review")
        }

        await prisma.review.delete({
            where: {
                id: reviewId
            }
        })

        return success(stausCode.OK, "Review deleted successfully")
    }
    catch (error) {
        console.log(error)
        return failure(stausCode.INTERNAL_SERVER_ERROR, "Something went wrong. Try again later.")
    }
}