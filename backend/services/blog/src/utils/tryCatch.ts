import type { NextFunction, Request, RequestHandler, Response } from "express";

const trycatch= (handler: RequestHandler): RequestHandler => {
    return async (req: Request, res: Response, next: NextFunction)=>{
        try {
            await handler(req, res, next)
        } catch (error: any) {
            console.error("❌ Express controller error:", error);
            res.status(500).json({message: error.message})
        }
    }
}

export default trycatch