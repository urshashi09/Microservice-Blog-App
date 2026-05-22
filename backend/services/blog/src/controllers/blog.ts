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
