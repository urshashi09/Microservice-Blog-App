"use client";

import { createContext, ReactNode , useEffect, useState, useContext} from "react";
import Cookies from 'js-cookie'
import axios from "axios";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import {GoogleOAuthProvider} from '@react-oauth/google'


const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ""

export const user_service= "https://user-service2-8fen.onrender.com/api/v1" 
export const author_service= "https://author-service-ztfg.onrender.com/api/v1"
export const blog_service= "https://blog-service-7rf9.onrender.com/api/v1"

export interface User{
    _id: string;
    name: string;
    email: string;
    image: string;  
    instagram: string;
    facebook: string;
    linkedin: string;
    bio: string;

}


export interface Blog{
    id: string;
    title: string;
    description: string;
    blogcontent: string;  
    image: string;
    category: string;
    author: string;
    created_at: string;

}

export interface SavedBlogType extends Blog {
    saved_id: string;
    blogid: string;
    userid: string;
    saved_at: string;
}

interface AppContextType{
    user:User | null;
    isAuth: boolean;
    loading: boolean;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
    logoutUser: ()=> Promise<void>
    blogs: Blog[] | null
    blogLoading: boolean
    setSearchQuery:React.Dispatch<React.SetStateAction<string>>;
    searchQuery: string;
    category: string;
    setCategory: React.Dispatch<React.SetStateAction<string>> 
    fetchBlogs: () => Promise<void>
    savedBlogs: SavedBlogType[] | null
    getSavedBlogs: () => Promise<void>
}


const AppContext= createContext<AppContextType | undefined>(undefined)

interface AppProviderProps{
    children: ReactNode
}



export const AppProvider: React.FC<AppProviderProps>=(({children}) => {
    const [user, setUser]= useState<User | null>(null)
    const [isAuth, setIsAuth] = useState(false)
    const [loading, setLoading] = useState(true)

    async function fetchUser() {
        try {
            const token= Cookies.get("token")

            const {data}= await axios.get<{ user: User }>(`${user_service}/myprofile`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            })

            setUser(data.user)
            setIsAuth(true)
            setLoading(false)
        } catch (error) {
            console.log(error)
            setLoading(false)
        }
    }


    const[blogLoading, setBlogLoading] = useState(true)
    const [blogs, setBlogs]= useState<Blog[] | null>(null)
    const [category, setCategory] = useState<string>("")
    const [searchQuery, setSearchQuery] = useState<string>("")


    async function fetchBlogs() {
        setBlogLoading(true)
        try{
            const {data}= await axios.get<Blog[]>(`${blog_service}/blog/all?searchQuery=${searchQuery}&category=${category}`)
            setBlogs(data)
        } catch (error) {
            console.log(error)
        } finally {
            setBlogLoading(false)
        }
    }


    const [savedBlogs, setSavedBlogs] = useState<SavedBlogType[] | null>(null)

    async function getSavedBlogs() {
        try{
            const token = Cookies.get("token")
            const {data}= await axios.get<SavedBlogType[]>(`${blog_service}/blog/saved/all`,{
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            setSavedBlogs(data)
            
        } catch (error) {
            console.log(error)
        } 
    } 
        


    async function logoutUser(){
        Cookies.remove("token")
        setUser(null)
        setIsAuth(false)

        toast.success("Logout successful")
    }

    useEffect(() => {
        const timer = window.setTimeout(() => {
            fetchUser()
            getSavedBlogs()
            
        }, 0)

        return () => {
            window.clearTimeout(timer)
        }

    }, [])
    
    useEffect(()=>{
        fetchBlogs()
    },[searchQuery, category])
    return (
        <AppContext.Provider value={{ user, isAuth, loading, setUser, setLoading, setIsAuth, logoutUser, blogs, blogLoading, searchQuery, setSearchQuery, category, setCategory, fetchBlogs, savedBlogs, getSavedBlogs}}>
            <GoogleOAuthProvider clientId={googleClientId}>
                {children} <Toaster />
            </GoogleOAuthProvider>
        </AppContext.Provider>
    )
    
})


export const useAppData= (): AppContextType => {
    const context = useContext(AppContext);
    if (!context) {
      throw new Error("useAppData must be used within a AppProvider");
    }
    return context;
  };
