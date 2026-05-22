"use client";

import { createContext, ReactNode , useEffect, useState, useContext} from "react";
import Cookies from 'js-cookie'
import axios from "axios";
import { Toaster } from "react-hot-toast";
import {GoogleOAuthProvider} from '@react-oauth/google'


export const user_service= "http://localhost:6001/api/user"
export const author_service= "http://localhost:5000/api/author"
export const blog_service= "http://localhost:7000/api/blog"

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

interface AppContextType{
    user:User | null;
    isAuth: boolean;
    loading: boolean;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
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

    useEffect(() => {
        const timer = window.setTimeout(() => {
            fetchUser()
        }, 0)

        return () => {
            window.clearTimeout(timer)
        }

    }, [])
    return (
        <AppContext.Provider value={{ user, isAuth, loading, setUser, setLoading, setIsAuth}}>
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
