import type { NextFunction, Request, Response } from "express"
import jwt, { type JwtPayload } from "jsonwebtoken"


interface IUser extends Document {
    _id: string;
    name: string;
    email: string;
    image: string;  
    instagram: string;
    facebook: string;
    linkedin: string;
    bio: string;
}


export interface AuthenticatedRequest extends Request {
        user?: IUser | null;
    }

export const isAuth= async( req: AuthenticatedRequest, res: Response, next: NextFunction) 
: Promise<void> => {
    try {
        const token = req.headers.authorization;
        if(!token || !token.startsWith("Bearer ")) {
         res.status(401).json({ message: "Unauthorized" });
         return
        }
         const tokenWithoutBearer = token.split(" ")[1];

        const decodedToken = jwt.verify(tokenWithoutBearer as string, process.env.JWT_SECRET as string) as JwtPayload

        if(!decodedToken || !decodedToken.user) {
            res.status(401).json({ message: "Unauthorized" });
            return
        }

        req.user = decodedToken.user;
        next();
    } catch (error) {
        res.status(401).json({ message: "Unauthorized" });
    }
}
