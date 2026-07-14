import * as bookServices from "../services/bookServices.js"

export async function createBook(req, res) {
    const book = req.body
    book.availableCopies = book.totalCopies
    const result = await bookServices.createBook(book)
    return res.status(result.status).json(result.responseBody)
}

export async function updateBook(req, res) {
    const {bookId, title, isbn, authorId, categoryId, publishedYear} = req.body

    const book = {
        id: bookId,
        data: {
            title,
            isbn,
            authorId,
            categoryId,
            publishedYear
        }
    }

    const result = await bookServices.updateBook(book)
    return res.status(result.status).json(result.responseBody)
}

export async function retrieveBookDetails(req, res) {
    const { bookId } = req.body;

    const result = await bookServices.retrieveBookDetails(bookId)

    return res.status(result.status).json(result.responseBody)
}

export async function deleteBook(req, res) {
    const { bookId } = req.body;

    const result = await bookServices.deleteBook(bookId)

    return res.status(result.status).json(result.responseBody)

}