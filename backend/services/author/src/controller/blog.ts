import type { AuthenticatedRequest } from "../middleware/isAuth.js";
import getBuffer from "../utils/dataUri.js";
import { sql } from "../utils/db.js";
import trycatch from "../utils/tryCatch.js";
import {v2 as cloudinary} from 'cloudinary'

export const createBlog= trycatch(async (req: AuthenticatedRequest, res) => {
    const {title, description, blogcontent, category} = req.body

    const file= req.file
    if (!file){
        return res.status(400).json({message: "No file uploaded"})
    }
    const fileBuffer= getBuffer(file)

    if(!fileBuffer || !fileBuffer.content) {
        return res.status(400).json({message: "Invalid file format"})
    }

    const cloud = await cloudinary.uploader.upload(fileBuffer.content, {
        folder: "blogs"
    })

    const result = await sql`
        INSERT INTO blogs (title, description, blogcontent, image, category, author)
        VALUES (${title}, ${description}, ${blogcontent}, ${cloud.secure_url}, ${category}, ${req.user?._id})
        RETURNING *`

    res.status(200).json({
        message: "Blog created successfully",
        blog: result[0]
    })
})


export const updateBlog= trycatch(async (req: AuthenticatedRequest, res) => {
    const {id}= req.params

    const {title, description, blogcontent, category} = req.body

    const file= req.file

    const blog = await sql`
        SELECT * FROM blogs WHERE id = ${id}
    `

    if (!blog.length) {
        return res.status(404).json({message: "Blog not found"})
    }

    const existingBlog = blog[0];


    if (String(existingBlog.author) !== String(req.user?._id)) {
        return res.status(401).json({message: "Unauthorized"})
    }

    let imageUrl= blog[0].image
})
