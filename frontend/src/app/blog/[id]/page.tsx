"use client"

import React, { useEffect, useState } from 'react'
import { author_service, Blog, blog_service, useAppData, User } from '@/src/context/AppContext'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import Loading from '@/src/components/loading'
import { Card, CardContent, CardHeader } from '@/src/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Bookmark, BookmarkCheck, Edit, Trash2Icon,  User2 } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import Cookies from 'js-cookie'
import { toast } from 'react-hot-toast'


interface Comment {  
    id: string  
    username: string
    comment: string
    created_at: string
    userid: string
}

type ApiError = {
    response?: {
        data?: {
            message?: unknown
        }
    }
}

const getApiErrorMessage = (error: unknown, fallback: string) => {
    if (typeof error !== "object" || error === null || !("response" in error)) {
        return fallback
    }

    const message = (error as ApiError).response?.data?.message
    return typeof message === "string" ? message : fallback
}

const BlogPage = () => {
    const { user,isAuth, fetchBlogs, savedBlogs, getSavedBlogs } = useAppData()
    const router= useRouter()
    const { id } = useParams()
    const [blog, setBlog] = useState<Blog | null>(null)
    const [author, setAuthor] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [comment,setComment]= useState("")
    const [comments , setComments] = useState <Comment[]>([])


    async function fetchComments(){
        try{
            const {data}= await axios.get(`${blog_service}/comment/${id}`)
            setComments(data)
        }catch(error){
            console.log("error",error)
        }
    }
    
    useEffect(()=>{
        
            fetchComments()
        
    },[id])

     async function addComment(){
        try{
            setLoading(true)
            const token= Cookies.get("token")
            await axios.post(`${blog_service}/comment/${id}`,{comment},{
                headers:{
                    Authorization: `Bearer ${token}`
                }
            })
            toast.success("Comment added successfully")
            setComment("")
            fetchComments()
        }catch(error){
            console.log("error",error)
            toast.error(getApiErrorMessage(error, "Failed to add comment"))

        }finally{
            setLoading(false)
        }
    }


    async function fetchSingleBlog() {
        try {
            setLoading(true)
            setError("")

            const { data } = await axios.get(`${blog_service}/blog/${id}`)

            setBlog(data.blog)
            setAuthor(data.author.user)
        } catch (error) {
            console.log("error", error)
            setBlog(null)
            setAuthor(null)
            setError("Blog not found")
        } finally {
            setLoading(false)
        }
    }

    const deleteComment = async (id: string) => {
        if (confirm("Are you sure you want to delete this comment?")) {
            try {
                setLoading(true)
                const token = Cookies.get("token")
                await axios.delete(`${blog_service}/comment/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                toast.success("Comment deleted successfully")
                fetchComments()
            } catch (error) {
                console.log("error", error)
                toast.error(getApiErrorMessage(error, "Failed to delete comment"))
            } finally {
                setLoading(false)
            }
        }
    }

    async function deleteBlog() {
        if (confirm("Are you sure you want to delete this blog?")) {
            try {
                setLoading(true)
                const token = Cookies.get("token")
                await axios.delete(`${author_service}/blog/delete/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                toast.success("Blog deleted successfully")
                router.push("/blogs")
                setTimeout(() => {
                    fetchBlogs()
                },2000)
            } catch (error) {
                console.log("error", error)
                toast.error(getApiErrorMessage(error, "Failed to delete blog"))
            } finally {
                setLoading(false)
            }
        }
    } 

    const [saved, setSaved] = useState(false)

    useEffect(()=>{
        if(savedBlogs && id){
            setSaved(savedBlogs.some(e => String(e.blogid) === String(id)))
        }
    }, [savedBlogs, id])

    async function saveBlog() {
        const token= Cookies.get("token")
        try{
            setLoading(true)
            
            const {data}= await axios.post(`${blog_service}/save/${id}`, {},{
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            toast.success(data.message)
            setSaved(!saved)
                getSavedBlogs()
        }catch(error){
            console.log("error", error)
            toast.error(getApiErrorMessage(error, "Failed to save blog"))
        }finally{
            setLoading(false)
        }
    }

    useEffect(() => {
        if (id) {
            fetchSingleBlog()
        }
    }, [id])

    if (loading) {
        return <Loading />
    }

    if (error || !blog) {
        return (
            <div className="w-full max-w-4xl mx-auto p-6">
                <p className="text-center text-gray-500">{error || "Blog not found"}</p>
            </div>
        )
    }

   
    return (
        <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
            <Card className="w-full">
                <CardHeader>
                    <h1 className="text-3xl font-bold text-gray-900">{blog.title}</h1>
                    {author && (
                        <p className="text-gray-600 mt-2 flex items-center">
                            <Link href={`/profile/${author._id}`} className="flex items-center gap-2">
                                <img src={author.image} alt={author.name} className="w-8 h-8 rounded-full" />
                                <span>{author.name}</span>
                            </Link>
                            {
                                isAuth && (<Button variant={"ghost"} className="mx-3" size={"lg"} onClick={saveBlog} disabled={loading}>
                                  {saved ? <BookmarkCheck/> : <Bookmark/>}  
                                </Button>)
                            }
                            {
                                blog.author === user?._id && (
                                    <>
                                    <Button size={"sm"} onClick={()=>router.push(`/blog/edit/${id}`)}>
                                        <Edit/>
                                    </Button>
                                    <Button variant={"destructive"} onClick={deleteBlog} className="mx-3" size={"sm"} disabled={loading}>
                                        <Trash2Icon/>
                                    </Button>
                                    </>
                                )
                            }
                        </p>
                    )}
                </CardHeader>
                <CardContent className="space-y-6">
                    <img src={blog.image} alt={blog.title} className="w-full max-h-64 rounded-lg object-cover" />
                    <p className="text-lg text-gray-600">{blog.description}</p>
                    <div
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: blog.blogcontent }}
                    />
                </CardContent>
            </Card>

            {
                isAuth && (
                    <Card>
                        <CardHeader>
                            <h2 className="text-2xl font-bold text-gray-900">Comments</h2>
                        </CardHeader>
                        <CardContent>
                            <Label htmlFor="comment">Add a comment</Label>
                            <Input id="comment" placeholder="Write your comment here..." className='my-2' value={comment} onChange={(e) => setComment(e.target.value)} />
                            <Button onClick={addComment} disabled={loading}>
                                {loading ? "Posting..." : "Post Comment"}
                            </Button>
                        </CardContent>
                    </Card>
                )
            }

            <Card>
                <CardHeader>
                    <h3 className="text-lg font-medium text-gray-900">
                        All Comments
                    </h3>
                </CardHeader>

                <CardContent>
                    {comments && comments.length > 0 ? (
                        comments.map((e,i) => {
                            return <div key={i} className="border-b flex items-center py-2 gap-3">
                                <div>
                                    <p className='font-semibold flex items-center gap-1'>
                                        <span className='user border border-gray-400 rounded-full p-1'>
                                            <User2/>
                                        </span>
                                        {e.username}
                                    </p>
                                    <p>{e.comment}</p>
                                    <p className='text-xs text-gray-500'>{new Date(e.created_at).toLocaleString()} </p>
                                </div>
                                {
                                    e.userid === user?._id && <Button onClick={() => deleteComment(e.id)} variant={"destructive"} className="ml-auto" size={"sm"} disabled={loading}>
                                        <Trash2Icon/>
                                    </Button>
                                }
                            </div>
                        }
                    )): <p>No comments</p>}
                </CardContent>
            </Card>
        </div>
    )
}

export default BlogPage

