import * as authorServices from "../services/authorServices.js"

export async function createAuthor(req, res) {
    const author = req.body
    const result = authorServices.createAuthor(author)
    return res.status(result.status).json(result.responseBody)
}

export async function listAuthors(req, res) {
    const filters = req.query

    filters.limit = Number(filters.limit)
    filters.page = Number(filters.page)

    const result = await authorServices.listAuthors(filters)

    return res.status(result.status).json(result.responseBody)
}