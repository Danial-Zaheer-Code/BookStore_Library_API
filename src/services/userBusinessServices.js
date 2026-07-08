import * as userDbServices from "./userDbServices.js"
import * as stausCode from "../utils/statusCodes.js"
import { success, failure } from "../utils/result.js"

export async function createUser(user){
    try {
        if(await userDbServices.isEmailTaken(user.email)){
            return failure(stausCode.CONFLICT, "User already exists")
        }

        await userDbServices.createUser(user)
        return success(stausCode.OK, "User created successfully")
    } catch (error) {
        console.log(error)
        return failure(stausCode.INTERNAL_SERVER_ERROR, "Something went wrong. Try again later")
    }
}