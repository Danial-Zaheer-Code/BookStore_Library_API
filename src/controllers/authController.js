import * as userServices from "../services/userBusinessServices.js"

export async function register(req, res){
    const user = req.body

    const result = await userServices.createUser(user);

    return res.status(result.status).json(result.responseBody)
}