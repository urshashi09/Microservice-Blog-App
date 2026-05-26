"use client";

import { createContext, ReactNode , useEffect, useState, useContext} from "react";
import Cookies from 'js-cookie'
import axios from "axios";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import {GoogleOAuthProvider} from '@react-oauth/google'


export const user_service= "http://localhost:6001/api/user"
export const author_service= "http://localhost:5000/api/v1"
export const blog_service= "http://localhost:7000/api/v1"

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

interface SavedBlogType extends Blog {
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
            const {data}= await axios.get(`${blog_service}/blog/saved/all`,{
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
            <GoogleOAuthProvider clientId={"480344245099-46e22ukfddqd2h276kpruh939po6e7rc.apps.googleusercontent.com"}>
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
