import * as stausCode from "../utils/statusCodes.js"
import { prisma } from "../lib/prisma.js"
import { success, failure } from "../utils/result.js"


export async function createBook(book) {
    try {
        if(await isISBNTaken(book.isbn)){
            return failure(stausCode.CONFLICT, "Book with ISBN already exists")
        }

        if(!await isAuthorExists(book.authorId)){
            return failure(stausCode.NOT_FOUND, "Author does not exists")
        }

        if(!await isCategoryExists(book.categoryId)){
            return failure(stausCode.NOT_FOUND, "Category does not exists")
        }

        await prisma.book.create({
            data: book
        })

        return success(stausCode.OK, "Book created successfully")
    } catch (error) {
        console.log(error)
        return failure(stausCode.INTERNAL_SERVER_ERROR, "Something went wrong. Try again later.")
    }
}

async function isISBNTaken(isbn) {
    const book = await prisma.book.findUnique({
        where: {
            isbn: isbn
        },
        select: {
            id: true
        }
    })

    return book != null
}

async function isAuthorExists(authorId){
    const author = await prisma.author.findUnique({
        where: {
            id: authorId
        },
        select:{
            id: true
        }
    })

    return author != null
}

async function isCategoryExists(categoryId){
    const category = await prisma.category.findUnique({
        where: {
            id: categoryId
        },
        select:{
            id: true
        }
    })

    return category != null
}