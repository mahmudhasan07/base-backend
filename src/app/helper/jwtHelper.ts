import jwt, { JwtPayload, Secret, } from 'jsonwebtoken';
import config from '../../config';


const generateToken = (payload: any, expiresIn: any) => {
    // const token = jwt.sign(payload, secret, options);
    const token = jwt.sign(payload, config.secretToken as Secret , { expiresIn: expiresIn.expiresIn, algorithm: 'HS256', });

    return token;
};

const verifyToken = (token: string) => {
    return jwt.verify(token, config.secretToken as Secret) as JwtPayload;
}

const tokenDecoder = (token: string) => {
    const decoded = jwt.decode(token)
    return decoded
}

export const jwtHelpers = {
    generateToken,
    verifyToken,
    tokenDecoder
}