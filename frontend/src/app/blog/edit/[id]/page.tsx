
"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from '@/components/ui/select'
import React, { useRef, useState, useMemo, useEffect, type ChangeEvent, type FormEvent } from 'react'
import dynamic from 'next/dynamic'
import Cookies from 'js-cookie'
import axios from 'axios'
import { author_service, blog_service, useAppData } from '@/src/context/AppContext'
import toast from 'react-hot-toast'
import { blogCategories } from '../../new/page'
import { Card, CardContent, CardHeader } from '@/src/components/ui/card'
import { useParams, useRouter } from 'next/navigation'

type ApiError = {
    response?: {
        data?: {
            message?: unknown
        }
    }
}

interface BlogFormData {
    title: string
    description: string
    category: string
    image: File | null
    blogcontent: string
}

const hasApiErrorResponse = (error: unknown): error is ApiError => {
    return typeof error === 'object' && error !== null && 'response' in error
}

const getApiErrorMessage = (error: unknown, fallback: string) => {
    if (!hasApiErrorResponse(error)) {
        return fallback
    }

    const message = error.response?.data?.message
    return typeof message === 'string' ? message : fallback
}

const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false })

const EditBlogPage = () => {

    const editor = useRef(null);
    const [content, setContent] = useState('');
    const { id } = useParams<{ id: string }>()
    const router = useRouter()
    const {fetchBlogs}= useAppData()

    const [loading, setLoading] = useState(false);
    const [formdata, setFormData] = useState<BlogFormData>({
        title: '',
        description: '',
        category: '',
        image: null,
        blogcontent: ''
    })

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formdata,
            [e.target.name]: e.target.value
        })
    }

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null
        setFormData({
            ...formdata,
            image: file
        })
    }

    const config = useMemo(
        () => ({
            readonly: false, // all options from https://xdsoft.net/jodit/docs/,
            placeholder: 'Start typings...'
        }),
        []
    );

    const [existingImage, setExistingImage] = useState<string | null>(null)

    useEffect(() => {
        const fetchBlog = async () => {
            setLoading(true)
            try {
                const token = Cookies.get("token")
                const { data } = await axios.get(`${blog_service}/blog/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                const blog = data.blog
                setFormData({
                    title: blog.title,
                    description: blog.description,
                    category: blog.category,
                    image: null,
                    blogcontent: blog.blogcontent
                })

                setContent(blog.blogcontent)
                setExistingImage(blog.image)
                
            } catch (error) {
                console.error('Error fetching blog:', error)
            } finally {
                setLoading(false)
            }
        }
        if (id) {
            fetchBlog()
        }
    }, [id])

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true)

        const formDataToSend = new FormData();

        formDataToSend.append('title', formdata.title);
    formDataToSend.append('description', formdata.description);
    formDataToSend.append('category', formdata.category);
    formDataToSend.append('blogcontent', content);

    if (formdata.image) {
      formDataToSend.append('file', formdata.image);
    }

    try {
      const token = Cookies.get('token');
      await axios.post(`${author_service}/blog/update/${id}`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      toast.success('Blog updated successfully!');
     
      
        fetchBlogs()
        // router.push(`/blog/${id}`)
        
    } catch (error) {
      console.error('Error editing blog:', error);
      toast.error(getApiErrorMessage(error, 'Failed to edit blog. Please try again.'));
    } finally {
      setLoading(false)
    }
    }


    

    return (
        <div className="max-w-4xl mx-auto p-6">
            <Card>
                <CardHeader>
                    <h2 className="text-2xl font-bold">
                        Edit Blog
                    </h2>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Label>Title</Label>
                        <div className="flex justify-center items-center gap-2">
                            <Input name="title" value={formdata.title} onChange={handleInputChange} placeholder="Enter Blog Title" required />

                        </div>

                        <Label>Description</Label>
                        <div className="flex justify-center items-center gap-2">
                            <Input
                                name="description"
                                value={formdata.description}
                                onChange={handleInputChange}
                                placeholder="Enter Blog Description"
                                required />

                        </div>

                        <Label>Category</Label>
                        <Select
                            name="category"
                            value={formdata.category}
                            onValueChange={(value) => setFormData({ ...formdata, category: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={formdata.category || "Select a category"}></SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {blogCategories?.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div>
                            <Label>Thumbnail</Label>
                            {
                                existingImage && !formdata.image && (
                                    <div className="mb-2">

                                        <img src={existingImage} alt="Existing Image" className="w-32 h-32 object-cover rounded-md" />
                                    </div>
                                )
                            }
                            <Input type="file" accept="image/*" name="image" onChange={handleFileChange}>
                            </Input>
                        </div>

                        <div>
                            <Label>Blog Content</Label>
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-sm text-muted-foreground">
                                    Write your blog content here. You can use markdown syntax for formatting.
                                    Please add the image after improving grammer
                                </p>

                            </div>
                            <JoditEditor
                                ref={editor}
                                value={content}
                                config={config}
                                tabIndex={1}
                                onBlur={(newContent) => {
                                    setContent(newContent)
                                    setFormData({ ...formdata, blogcontent: newContent })
                                }}

                            />


                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default EditBlogPage
