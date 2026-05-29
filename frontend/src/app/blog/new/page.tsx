"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from '@/components/ui/select'
import { Card, CardContent, CardHeader } from '@/src/components/ui/card'
import { RefreshCw } from 'lucide-react'
import React, { useRef, useState, useMemo, type ChangeEvent, type FormEvent } from 'react'
import dynamic from 'next/dynamic'
import Cookies from 'js-cookie'
import axios from 'axios'
import { author_service, useAppData } from '@/src/context/AppContext'
import toast from 'react-hot-toast'


const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false })

export const blogCategories = [
    "Technology",
    "Health",
    "Travel",
    "Food",
    "Lifestyle",
    "Education",
    "Finance",
    "Entertainment",
    "Sports",
    "Fashion"
  ]
interface BlogFormData {
  title: string
  description: string
  category: string
  image: File | null
  blogcontent: string
}

type ApiError = {
  response?: {
    data?: {
      message?: unknown
    }
  }
}

const hasApiErrorResponse = (error: unknown): error is ApiError => {
  return typeof error === 'object' && error !== null && 'response' in error
}

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (!hasApiErrorResponse(error)) {
    return fallback
  }

  const message = error.response?.data?.message
  if (typeof message !== 'string') {
    return fallback
  }

  try {
    const parsed = JSON.parse(message)
    return parsed?.error?.message || message
  } catch {
    return message
  }
}

const AddBlog = () => {

  const blogCategories = [
    "Technology",
    "Health",
    "Travel",
    "Food",
    "Lifestyle",
    "Education",
    "Finance",
    "Entertainment",
    "Sports",
    "Fashion"
  ]



  const editor = useRef(null);
  const [content, setContent] = useState('');

  const { fetchBlogs } = useAppData()

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
      await axios.post(`${author_service}/blog/new`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      toast.success('Blog added successfully!');
      setFormData({
        title: '',
        description: '',
        category: '',
        image: null,
        blogcontent: ''
      })
      setContent("")
      setTimeout(() => {
        fetchBlogs()
      }, 4000)
    } catch (error) {
      console.error('Error adding blog:', error);
      toast.error(getApiErrorMessage(error, 'Failed to add blog. Please try again.'));
    } finally {
      setLoading(false)
    }
  }

  const [aiTitle, setAiTitle] = useState(false)

  const aiTitleResponse = async () => {
    try {
      setAiTitle(true)
      const { data } = await axios.post<string>(`${author_service}/ai/title`, { text: formdata.title })

      setFormData({ ...formdata, title: data })
      toast.success("Title generated successfully")
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to generate title"))
      console.log(error)
    } finally {
      setAiTitle(false)
    }
  }



  const [aiDescription, setAiDescription] = useState(false)

  const aiDescriptionResponse = async () => {
    try {
      setAiDescription(true)
      const { data } = await axios.post<string>(`${author_service}/ai/description`, { title: formdata.title, description: formdata.description })

      setFormData({ ...formdata, description: data })
      toast.success("Description generated successfully")
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to generate description"))
      console.log(error)
    } finally {
      setAiDescription(false)
    }
  }



  const [aiBlogLoading, setAiBlogLoading] = useState(false)
  const aiBlogResponse = async () => {
    try {
      setAiBlogLoading(true)
      const { data } = await axios.post<{ html: string }>(`${author_service}/ai/blog`, { blog: formdata.blogcontent })
      setContent(data.html)
      setFormData({ ...formdata, blogcontent: data.html })
      toast.success("Blog content fixed successfully")
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to fix blog"))
      console.log(error)
    } finally {
      setAiBlogLoading(false)
    }
  }


  const config = useMemo(
    () => ({
      readonly: false, // all options from https://xdsoft.net/jodit/docs/,
      placeholder: 'Start typings...'
    }),
    []
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">
            Add new Blog
          </h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Label>Title</Label>
            <div className="flex justify-center items-center gap-2">
              <Input name="title" value={formdata.title} onChange={handleInputChange} placeholder="Enter Blog Title" className={aiTitle? "animate-pulse placeholder:opacity-60" : ""} required />
              {formdata.title===""?"": <Button type="button" onClick={aiTitleResponse} disabled={aiTitle}>
                <RefreshCw className={aiTitle? "animate-spin": ""} size={16}/>
                <span className='ml-2'>AI Fix</span>
              </Button>}
            </div>

            <Label>Description</Label>
            <div className="flex justify-center items-center gap-2">
              <Input
                name="description"
                value={formdata.description}
                onChange={handleInputChange}
                placeholder="Enter Blog Description"
                className={aiDescription? "animate-pulse placeholder:opacity-60" : ""}
                required />
              {formdata.title===""?"": <Button type="button" onClick={aiDescriptionResponse} disabled={aiDescription}>
                <RefreshCw className={aiDescription? "animate-spin": ""} size={16}/>
                <span className='ml-2'>{formdata.description.trim() === "" ? "AI Generate" : "AI Fix"}</span>
              </Button>}
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
              <Input type="file" accept="image/*" name="image" onChange={handleFileChange} required >
              </Input>
            </div>

            <div>
              <Label>Blog Content</Label>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-muted-foreground">
                  Write your blog content here. You can use markdown syntax for formatting.
                  Please add any image in blog content after fixing grammar
                </p>
                <Button type="button" size={"sm"} onClick={aiBlogResponse} disabled={aiBlogLoading}>
                  <RefreshCw size={16} className={aiBlogLoading? "animate-spin": ""} />
                  <span className='ml-2'>Fix Grammar</span>
                </Button>
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

export default AddBlog
