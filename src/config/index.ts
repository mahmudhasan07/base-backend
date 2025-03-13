import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

// export const port = process.env.PORT  
// export const jwt_secret = process.env.TOKEN_SECRET

export default {
    port : process.env.PORT,
    secretToken : process.env.TOKEN_SECRET,
    jwt_secret : process.env.TOKEN_SECRET as string
}