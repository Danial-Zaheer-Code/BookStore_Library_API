import jwt from "jsonwebtoken"

export async function createToken(tokenPayload, duration) {
    const token = jwt.sign(
        tokenPayload,
        process.env.SECRET,
        { expiresIn: duration }
    );
    return token
}