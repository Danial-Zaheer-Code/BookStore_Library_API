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

export async function refresh(req, res){    
    const tokenPayload = {
        userId: req.userId,
        isAdmin: req.isAdmin
    }

    const result = await userServices.refreshToken(tokenPayload)

    return res.status(result.status).json(result.responseBody)
}

export async function retrieveProfile(req, res){
    const userId = req.userId
    const result = await userServices.retrieveProfile(userId)
    
    return res.status(result.status).json(result.responseBody)
}

export async function updateUser(req, res){
    const user = {}
    user.id = req.userId
    user.data = req.body ?? {}

    const result = await userServices.updateUser(user)

    return res.status(result.status).json(result.responseBody)

}

export async function listUsers(req, res){
    const {page, limit} = req.body
    const result = await userServices.listUsers(page, limit)

    return res.status(result.status).json(result.responseBody)
} 