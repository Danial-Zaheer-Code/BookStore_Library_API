import * as authorServices from "../services/authorServices.js"

export async function createAuthor(req, res) {
    const author = req.body
    const result = await authorServices.createAuthor(author)
    return res.status(result.status).json(result.responseBody)
}

export async function listAuthors(req, res) {
    const filters = req.query

    filters.limit = Number(filters.limit)
    filters.page = Number(filters.page)

    const result = await authorServices.listAuthors(filters)

    return res.status(result.status).json(result.responseBody)
}

export async function retrieveAuthorDetails(req, res){
    const {authorId} = req.body
    const result = await authorServices.retriveAuthorDetails(authorId)

    return res.status(result.status).json(result.responseBody)
}

export async function updateAuthor(req, res) {
    const {authorId, name, bio} = req.body;
    const author = {
        id: authorId,
        data:{
            name: name,
            bio: bio
        }
    }
    const result = await authorServices.updateAuthor(author)
    return res.status(result.status).json(result.responseBody)
}

export async function deleteAuthor(req, res){
    const {authorId} = req.body
    const result = await authorServices.deleteAuthor(authorId)
    return res.status(result.status).json(result.responseBody)

}