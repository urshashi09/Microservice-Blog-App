"use client"
import Image from 'next/image'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"
import { Button } from '@/src/components/ui/button'
import axios from 'axios'
import { User, useAppData, user_service } from '../../context/AppContext'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'
import { CodeResponse, useGoogleLogin } from '@react-oauth/google'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Loading from '@/src/components/loading'



interface LoginResponse {
  user: User;
  token: string;
}

const LoginPage = () => {
  const {isAuth, setUser, setIsAuth,loading, setLoading}= useAppData()
  const router = useRouter()

  useEffect(() => {
    if (isAuth) {
      router.replace("/")
    }
  }, [isAuth, router])

  const responseGoogle= async(authResult: Omit<CodeResponse, "error" | "error_description" | "error_uri">)=>{
    try {
      setLoading(true)
      const result = await axios.post<LoginResponse>(`${user_service}/login`, {
        code: authResult.code
      })

      Cookies.set("token", result.data.token, {
        expires: 1,
        secure: window.location.protocol === "https:",
        sameSite: "lax",
        path: "/"
      })
      setUser(result.data.user)
      setIsAuth(true)
      toast.success("Login successful")
      setUser(result.data.user)
      router.replace("/")
    } catch (error) {
      console.log("error", error)
      toast.error("Login failed")
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }


  const googleLogin= useGoogleLogin({
    onSuccess: responseGoogle,
    onError: () => toast.error("Login failed"),
    flow: "auth-code",
  })
  return (
    <>
    { loading ? (<Loading/> ): 
      (<div className='w-[350px] m-auto mt-[100px] '>
        <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className='font-bold '>Login to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
        <CardAction>
          <Button variant="link">Sign Up</Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" className="w-full">
          Login
        </Button>
        <Button onClick={() => googleLogin()} variant="outline" className="w-full">
          Login with Google <Image src="/google.png" width={24} height={24} alt="" />
        </Button>
      </CardFooter>
    </Card>
    </div>)}
    </>
  )
}

export default LoginPage
