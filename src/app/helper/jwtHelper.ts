import jwt, { JwtPayload, Secret, } from 'jsonwebtoken';
import config from '../../config';
import { TOKEN_EXPIRY, TokenType } from '../../utils/tokenConfig';


const generateToken = (payload: any, tokenType: TokenType) => {
    // const token = jwt.sign(payload, secret, options);
    const expiry = TOKEN_EXPIRY[tokenType];
    const token = jwt.sign(payload, config.secretToken as Secret, { expiresIn: expiry, algorithm: 'HS256', });

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