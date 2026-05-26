import type { AuthenticatedRequest } from "../middlewares/isAuth.js";
import { redisClient } from "../server.js";
import { sql } from "../utils/db.js";
import trycatch from "../utils/tryCatch.js";
import axios from "axios";

export const getAllBlogs= trycatch(async (req, res) => {
    const {searchQuery="", category="" }= req.query

    const cacheKey= `blogs:${searchQuery}:${category}`


    const cached= await redisClient.get(cacheKey)
    if (cached) {
        console.log("sending data from redis");
        
        return res.status(200).json(JSON.parse(cached))
    }

    let blogs
    const search = typeof searchQuery === "string" ? searchQuery : ""
    const selectedCategory = typeof category === "string" ? category : ""

    if (search && selectedCategory) {
        blogs = await sql`
            SELECT * FROM blogs WHERE (title ILIKE ${"%" + search + "%" } OR description ILIKE ${"%" + search + "%" }) AND category = ${selectedCategory} ORDER BY created_at DESC
        `
        
    } else if(search){
        blogs = await sql`
            SELECT * FROM blogs WHERE (title ILIKE ${"%" + search + "%" } OR description ILIKE ${"%" + search + "%" }) ORDER BY created_at DESC
        `
    } else if(selectedCategory){
        blogs = await sql`
            SELECT * FROM blogs WHERE category = ${selectedCategory} ORDER BY created_at DESC
        `
    } else{
        blogs= await sql`
            SELECT * FROM blogs ORDER BY created_at DESC
        `
    }

    console.log("sending data from db")
    await redisClient.set(cacheKey, JSON.stringify(blogs), {EX: 3600})

    res.status(200).json(blogs)
        return
    
})


export const getSingleBlog= trycatch(async (req, res) => {
    const {id} = req.params

    const cacheKey= `blog:${id}`

    const cached = await redisClient.get(cacheKey)
    if (cached) {
        console.log("sending data from redis");
        return res.status(200).json(JSON.parse(cached))
    }

    const blog = await sql`
        SELECT * FROM blogs WHERE id = ${id}
    `

    const existingBlog = blog[0]

    if (!existingBlog) {
        return res.status(404).json({message: "Blog not found"})
    }
    const {data}= await axios.get(`${process.env.USER_SERVICE}/api/user/profile/${existingBlog.author}`)

    console.log("sending data from db")

    await redisClient.set(cacheKey, JSON.stringify({blog: existingBlog, author: data}), {EX: 3600})

    res.status(200).json({
        blog: existingBlog,
        author: data
    })
})


export const addComment = trycatch(async (req: AuthenticatedRequest, res) => {
    const {id: blogId} = req.params
    const {comment} = req.body

    if (!comment || typeof comment !== "string" || !comment.trim()) {
        return res.status(400).json({message: "Comment is required"})
    }

    await sql`
        INSERT INTO comments (comment, userid, username, blogid) VALUES (${comment.trim()}, ${req.user?._id}, ${req.user?.name}, ${blogId})
        RETURNING *
    `
    res.json({message: "Comment added successfully"})

})


export const getAllComments = trycatch(async (req, res) => {
    const {id}= req.params
    const comments = await sql`
        SELECT * FROM comments WHERE blogid = ${id} ORDER BY created_at DESC
    `
    res.json(comments)
})


export const deleteComment = trycatch(async (req: AuthenticatedRequest, res) => {
    const {id}= req.params
    
    const comment = await sql`
        SELECT * FROM comments WHERE id = ${id}
    `

    const existingComment = comment[0]

    if (!existingComment) {
        return res.status(404).json({message: "Comment not found"})
    }

    if(existingComment.userid !== req.user?._id){
        return res.status(403).json({message: "You are not authorized to delete this comment"})

    }

    await sql`
        DELETE FROM comments WHERE id = ${id}
    `

    res.json({message: "Comment deleted successfully"})
})


export const saveBlog= trycatch(async (req: AuthenticatedRequest, res) => {
    const {blogid}= req.params
    const userid= req.user?._id

    if(!blogid || !userid){
        return res.status(400).json({message: "Blog id and user id are required"})
    }

    const existing = await sql`
        SELECT * FROM savedblogs WHERE blogid = ${blogid} AND userid = ${userid}
    `

    if (existing.length === 0) {
        await sql`
            INSERT INTO savedblogs (blogid, userid) VALUES (${blogid}, ${userid})
        `
        return res.json({message: "Blog saved successfully"})
    }else{
        await sql`
            DELETE FROM savedblogs WHERE blogid = ${blogid} AND userid = ${userid}
        `
        return res.json({message: "Blog unsaved successfully"})
    }

    
})



export const getSavedBlogs = trycatch(async (req: AuthenticatedRequest, res) => {
    const blogs = await sql`
        SELECT b.*, s.id as saved_id, s.created_at as saved_at, s.blogid, s.userid
        FROM savedblogs s
        JOIN blogs b ON s.blogid::integer = b.id
        WHERE s.userid = ${req.user?._id}
        ORDER BY s.created_at DESC
    `
    res.json(blogs)
})