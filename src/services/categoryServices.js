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

export async function updateCategory(category) {
    try {
        const existingCategory = await prisma.category.findUnique({
            where: {
                id: category.id
            }
        })

        if (!existingCategory) {
            return failure(stausCode.NOT_FOUND, "Category does not exist")
        }

        if(category.data.name && await isCategoryNameTaken(category.data.name)) {
            return failure(stausCode.CONFLICT, "Category name already taken")
        }

        await prisma.category.update({
            where: {
                id: category.id
            },
            data: category.data
        })

        return success(stausCode.OK, "Category updated successfully")
    } catch (error) {
        console.log(error)
        return failure(stausCode.INTERNAL_SERVER_ERROR, "Something went wrong. Try again later.")
    }
}

export async function deleteCategory(categoryId) {
    try {
        const category = await prisma.category.findUnique({
            where: { id: categoryId },
            include: { _count: { select: { books: true } } }
        });
      
        if (!category) {
            return failure(stausCode.NOT_FOUND, "Category does not exist")
        }

        if (category._count.books > 0) {
            return failure(stausCode.CONFLICT, "Category has books linked to it")
        }

        await prisma.category.delete({
            where: { id: categoryId }
        })

        return success(stausCode.OK, "Category deleted successfully")
    } catch (error) {
        console.log(error)
        return failure(stausCode.INTERNAL_SERVER_ERROR, "Something went wrong. Try again later.")
    }
}