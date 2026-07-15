import * as  borrowServices from "../services/borrowServices.js"

export async function borrowBook(req, res) {
    const {bookId} = req.body

    const result = await borrowServices.borrowBook(req.userId, bookId)
    return res.status(result.status).json(result.responseBody)
}

export async function returnBook(req, res){
    const {borrowId} = req.body;

    const result = await borrowServices.returnBook(req.userId, borrowId)
    return res.status(result.status).json(result.responseBody)
}

export async function retrieveMyBorrowHistory(req, res){
    const filters = req.query

    filters.limit = Number(filters.limit)
    filters.page = Number(filters.page)
    const result = await borrowServices.retrieveMyBorrowHistory(req.userId, filters)
    return res.status(result.status).json(result.responseBody)

}

export async function listBorrowRecords(req, res){
    const filters = req.query

    filters.limit = Number(filters.limit)
    filters.page = Number(filters.page)
    filters.userId = filters.userId ? Number(filters.userId) : undefined

    const result = await borrowServices.listBorrowRecords(filters)
    return res.status(result.status).json(result.responseBody)
}