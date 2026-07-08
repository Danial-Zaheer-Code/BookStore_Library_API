import * as userServices from "../services/userBusinessServices.js"

export async function register(req, res){
    const user = req.body

    const result = await userServices.register(user);

    return res.status(result.status).json(result.responseBody)
}

export async function login(req, res) {
    const user = req.body

    const result = await userServices.login(user)

    return res.status(result.status).json(result.responseBody)
}