import * as categoryServices from "../services/categoryServices.js"

export async function createCategory(req, res){
    const category = req.body

    const result = await categoryServices.createCategory(category)

    return res.status(result.status).json(result.responseBody)
}

export async function listCategories(req, res){
    const result = await categoryServices.listCategories()

    return res.status(result.status).json(result.responseBody)
}