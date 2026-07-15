import * as  borrowServices from "../services/borrowServices.js"

export async function borrowBook(req, res) {
    const {bookId} = req.body

    const result = await borrowServices.borrowBook(req.userId, bookId)
    return res.status(result.status).json(result.responseBody)
}