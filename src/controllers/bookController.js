import * as bookServices from "../services/bookServices.js"

export async function createBook(req, res) {
    const book = req.body
    book.availableCopies = book.totalCopies
    const result = await bookServices.createBook(book)
    return res.status(result.status).json(result.responseBody)
}
