import * as authorServices from "../services/authorServices.js"

export async function createAuthor(req, res){
    const author = req.body
    const result = authorServices.createAuthor(author)
    return res.status(result.status).json(result.responseBody)
}