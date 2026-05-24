import type { AuthenticatedRequest } from "../middleware/isAuth.js";
import getBuffer from "../utils/dataUri.js";
import { sql } from "../utils/db.js";
import { invalidateCacheJob } from "../utils/rabbitmq.js";
import trycatch from "../utils/tryCatch.js";
import {v2 as cloudinary} from 'cloudinary'
import { GoogleGenAI } from "@google/genai"
import { GoogleGenerativeAI } from "@google/generative-ai"

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


    
    await invalidateCacheJob(["blogs:*"])

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

    const existingBlog = blog[0]

    if (!existingBlog) {
        return res.status(404).json({message: "Blog not found"})
    }

    if (String(existingBlog.author) !== String(req.user?._id)) {
        return res.status(401).json({message: "Unauthorized"})
    }

    let imageUrl= existingBlog.image

    if(file){
        const fileBuffer= getBuffer(file)
    

    if(!fileBuffer || !fileBuffer.content) {
        return res.status(400).json({message: "Invalid file format"})
    }
    const cloud = await cloudinary.uploader.upload(fileBuffer.content, {
        folder: "blogs"
    })

    imageUrl= cloud.secure_url
    }

    const updatedBlog= await sql`
    UPDATE blogs SET 
    title= ${title || existingBlog.title},
    blogcontent= ${blogcontent || existingBlog.blogcontent},
    image= ${imageUrl},
    category= ${category || existingBlog.category},
    description= ${description || existingBlog.description}
    
    WHERE id = ${id}
    RETURNING *
    `

    await invalidateCacheJob(["blogs:*", `blog:${id}`])

    res.status(200).json({
        message: "Blog updated successfully",
        blog: updatedBlog[0]
    })

    
})


export const deleteBlog= trycatch(async (req: AuthenticatedRequest, res) => {
    const {id}= req.params

    const blog = await sql`
        SELECT * FROM blogs WHERE id = ${id}
    `
    if (!blog.length) {
        return res.status(404).json({message: "Blog not found"})
    }

    const existingBlog = blog[0]

    if (!existingBlog) {
        return res.status(404).json({message: "Blog not found"})
    }

    if (String(existingBlog.author) !== String(req.user?._id)) {
        return res.status(401).json({message: "Unauthorized"})
    }

    await sql`
        DELETE FROM savedblogs WHERE blogid = ${id}
    `
    await sql`
        DELETE FROM comments WHERE blogid = ${id}
    `
    await sql`
        DELETE FROM blogs WHERE id = ${id}
    `

    await invalidateCacheJob(["blogs:*", `blog:${id}`])

    res.status(200).json({
        message: "Blog deleted successfully"
    })

})

export const aiTitleResponse= trycatch(async(req,res)=>{
    const {text}= req.body

    const prompt=   `Correct the grammar os the following blog title and return only corrected title without any additional text, formatting or symbols: "${text}" `

    let result;

    const ai= new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY || ""
    })

    async function main(){
        const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: prompt 
        })

        let rawtext= response.text

        if(!rawtext){
           return res.status(500).json({message: "Failed to generate response"})
        }

        result= rawtext
        .replace(/\*\*/g, "")
        .replace(/[\r\n]+/g, " ")
        .replace(/[*_`~`]/g, "")
        .trim()
    }

    await main()

    res.json(result)
})



export const aiDescriptionResponse= trycatch(async(req,res)=>{
    const {title, description}= req.body

    const prompt = description === "" ? `Generate only one short blog description based on
this title: "${title}". Your response must be only one sentence, strictly under 30 words, with no options, no
greetings, and no extra text. Do not explain. Do not say 'here is'. Just return the description only.` : `Fix the
grammar in the following blog description and return only the corrected sentence. Do not add anything else:
"${description}"`;

    let result;

    const ai= new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY || ""
    })

    async function main(){
        const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: prompt 
        })

        let rawtext= response.text

        if(!rawtext){
           return res.status(500).json({message: "Failed to generate response"})
        }

        result= rawtext
        .replace(/\*\*/g, "")
        .replace(/[\r\n]+/g, " ")
        .replace(/[*_`~`]/g, "")
        .trim()
    }

    await main()

    res.json(result)
})



export const aiBlogResponse= trycatch(async(req,res)=>{
    const prompt = ` You will act as a grammar correction engine. I will provide you with blog content
in rich HTML format (from Jodit Editor). Do not generate or rewrite the content with new ideas. Only correct
grammatical, punctuation, and spelling errors while preserving all HTML tags and formatting. Maintain inline styles,
image tags, line breaks, and structural tags exactly as they are. Return the full corrected HTML string as output. `;

const {blog}= req.body
if(!blog){
    return res.status(400).json({message: "Blog content is required"})
}

const fullMessage= `${prompt}\n\n${blog}`

const ai= new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)

const model= ai.getGenerativeModel({model: "gemini-2.5-flash"})

const result= await model.generateContent({
    contents:[
        {
            role:"user",
            parts: [{
                text: fullMessage
            }]
        }
    ]
})

const responseText= await result.response.text()

const cleanedHtml= responseText
.replace(/```$/i,"")
.replace(/^(html|```html|```)\n?/i,"")
.replace(/\*\*/g, "")
.replace(/[\r\n]+/g, "\n")
.replace(/[*_`~`]/g, "")
.trim()

res.status(200).json({html:cleanedHtml})

}
)

