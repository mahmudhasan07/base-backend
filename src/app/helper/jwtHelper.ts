import jwt from 'jsonwebtoken';

const tokenCreator = (payload: any) => {
    const token = jwt.sign(payload, process.env.TOKEN_SECRET as string, { expiresIn: "24h" })
    return token
}

const tokenVerifier = (token: string) => {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET as string) 
    return verified
}

const tokenDecoder = (token: string) => {
    const decoded = jwt.decode(token)
    return decoded
}

export const jwtHelpers = {
    tokenCreator,
    tokenVerifier,
    tokenDecoder
}