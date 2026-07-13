import * as stausCode from "../utils/statusCodes.js"
import { prisma } from "../lib/prisma.js"
import { success, failure } from "../utils/result.js"

export async function createCategory(category) {
    try {
        if (await isCategoryNameTaken(category.name)) {
            return failure(stausCode.CONFLICT, "Category Already exists")
        }

        await prisma.category.create({
            data: category
        })

        return success(stausCode.OK, "Category Created successfully")

    } catch (error) {
        console.log(error)
        return failure(stausCode.INTERNAL_SERVER_ERROR, "Something went wrong. Try again later.")
    }
}

async function isCategoryNameTaken(categoryName) {
    const category = await prisma.category.findUnique({
        where: {
            name: categoryName
        },
        select: {
            id: true
        }
    })
    return category != null
}

export async function listCategories() {
    try {
        const categories = await prisma.category.findMany({
            select: {
                id: true,
                name: true,
                _count: {
                    select: {
                        books: true
                    }
                }
            }
        });

        categories.forEach(category => {
            category.booksCount = category._count.books
            delete category._count
        })

        return success(stausCode.OK, "Categories retrieved successfully", { categories: categories })
    } catch (error) {
        console.log(error)
        return failure(stausCode.INTERNAL_SERVER_ERROR, "Something went wrong. Try again later.")
    }
}