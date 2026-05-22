"use client"
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { User, useAppData, user_service } from '@/src/context/AppContext'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import Cookies from 'js-cookie'
import axios from 'axios'
import toast from 'react-hot-toast'
import Loading from '@/src/components/loading'
import { Button } from '@/src/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { redirect, useRouter } from 'next/dist/client/components/navigation'


const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
        <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
        <circle cx="17.5" cy="6.5" r="1.3" fill="currentColor" />
    </svg>
)

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
        <path d="M14 8.5V6.75C14 6.06 14.56 5.5 15.25 5.5H17V2.75C16.14 2.63 15.27 2.57 14.4 2.57C11.82 2.57 10 4.14 10 6.98V8.5H7.5V12H10V21.5H14V12H16.75L17.25 8.5H14Z" />
    </svg>
)

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
        <path d="M6.94 8.95H3.5V20.5H6.94V8.95ZM5.22 3.5C4.12 3.5 3.25 4.37 3.25 5.45C3.25 6.53 4.12 7.4 5.22 7.4C6.32 7.4 7.19 6.53 7.19 5.45C7.19 4.37 6.32 3.5 5.22 3.5ZM20.75 14.2C20.75 10.98 19.03 8.7 15.88 8.7C14.42 8.7 13.47 9.5 13.08 10.06H13.03V8.95H9.73V20.5H13.17V14.78C13.17 13.27 13.45 11.81 15.32 11.81C17.16 11.81 17.19 13.53 17.19 14.87V20.5H20.63L20.75 14.2Z" />
    </svg>
)

interface UpdateProfilePicResponse {
    user: User;
    token: string;
}

interface UpdateProfileResponse {
    user: User;
    token: string;
}

const ProfilePage = () => {
    const {user, setUser, logoutUser}= useAppData()
    const InputRef = React.useRef<HTMLInputElement>(null)

    const [loading, setLoading] = useState(false)

    const [open, setOpen] = useState(false)
    const [formData, setFormData] = useState({
        name: user?.name || "",
        instagram: user?.instagram || "",
        facebook: user?.facebook || "",
        linkedin: user?.linkedin || "",
        bio: user?.bio || ""
    })
    const router= useRouter()

    if(!user) {
        return redirect("/login")
    }

    const logoutHandler= async()=>{
        await logoutUser()
    }

    

    useEffect(() => {
        setFormData({
            name: user?.name || "",
            instagram: user?.instagram || "",
            facebook: user?.facebook || "",
            linkedin: user?.linkedin || "",
            bio: user?.bio || ""
        })
    }, [user])

    const clickHandle= ()=>{
        InputRef.current?.click()
    }
    const changeHandle = async (e: any) => {
        const file = e.target.files[0]
        if (file) {
            const formData = new FormData()
            formData.append("file", file)
            try{
                setLoading(true)
                const token= Cookies.get("token")
                const {data}= await axios.post<UpdateProfilePicResponse>(`${user_service}/updateprofilepic`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                } )
                toast.success("Profile picture updated successfully")
                setLoading(false)
                Cookies.set("token", data.token, {
                    expires: 1, 
                    secure: window.location.protocol === "https:", 
                    sameSite: "lax",
                    path: "/"})
                setUser(data.user)
            }catch(error){
                console.log("error", error)
                toast.error("Failed to update profile picture")
                setLoading(false)
            }
        }
    }

    const handleFormSubmit= async()=>{
        try{
            setLoading(true)
            const token= Cookies.get("token")
            const {data}= await axios.put<UpdateProfileResponse>(`${user_service}/update`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            } )
            toast.success("Profile updated successfully")
            Cookies.set("token", data.token, {
                expires: 1, 
                secure: window.location.protocol === "https:", 
                sameSite: "lax",
                path: "/"})
            setUser(data.user)
            setOpen(false)

        }catch(error){
            toast.error("Failed to update profile")
        } finally {
                setLoading(false)
        }
    }
    
  return (
    <div className= "flex justify-center items-center min-h-screen p-4">
        { loading? (<Loading/>) : 
        (<Card className= "w-full max-w-xl shadow-lg border rounded-2xl p-6">
            <CardHeader className='text-center'>
                <CardTitle className= "text-2xl font-semibold mb-4">User Profile</CardTitle>
                <CardContent className='flex flex-col items-center gap-y-4'>
                    <Avatar className='w-24 h-24 border-4 border-gray-200 shadow-md cursor-pointer' onClick={clickHandle} >
                        <AvatarImage src={user?.image || "/default-avatar.png"} alt="profile pic" className='rounded-full' />
                        <input 
                        type="file" 
                        className='hidden' 
                        accept="image/*" 
                        ref={InputRef} 
                        onChange={changeHandle} 
                         />
                    </Avatar>
                    <div className='w-full space-y-2 text-center'>
                        <label className= "font-medium text-gray-700">
                            Name 
                        </label>
                        <p>{user?.name}</p>
                    </div>
                    {
                    user?.bio && (
                        <div className='w-full space-y-2 text-center'>
                            <label className= "font-medium text-gray-700">
                                Bio
                            </label>
                            <p>{user?.bio}</p>
                        </div>
                    )}

                    <div className= "flex gap-4 mt-3">
                        {
                            user?.instagram && <a href={user.instagram} 
                            rel="noopener noreferrer" target="_blank" 
                            >
                                <InstagramIcon className="size-6 text-pink-500" />

                            </a>
                        }

                        {
                            user?.facebook && <a href={user.facebook} 
                            rel="noopener noreferrer" target="_blank" 
                            >
                                <FacebookIcon className="size-6 text-blue-600" />

                            </a>
                        }

                        {
                            user?.linkedin && <a href={user.linkedin} 
                            rel="noopener noreferrer" target="_blank" 
                            >
                                <LinkedinIcon className="size-6 text-blue-700" />

                            </a>
                        }
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 mt-6 w-full justify-center">
                        <Button onClick={logoutHandler} >Logout</Button>
                        <Button onClick={() => router.push("/blog/new")}>
                            Add Blog
                        </Button>

                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button variant={"outline"}>Edit</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:*:max-w-[500px]" >
                                <DialogHeader >
                                    <DialogTitle>Edit Profile</DialogTitle>
                                </DialogHeader>

                                <div className="space-y-3 ">
                                    <div>
                                        <Label>Name</Label>
                                        <Input value= {formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} ></Input>
                                    </div>
                                    <div>
                                        <Label>Bio</Label>
                                        <Input value= {formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} ></Input>
                                    </div>
                                    <div>
                                        <Label>Instagram</Label>
                                        <Input value= {formData.instagram} onChange={(e) => setFormData({...formData, instagram: e.target.value})} ></Input>
                                    </div>
                                    <div>
                                        <Label>Facebook</Label>
                                        <Input value= {formData.facebook} onChange={(e) => setFormData({...formData, facebook: e.target.value})} ></Input>
                                    </div>
                                    <div>
                                        <Label>LinkedIn</Label>
                                        <Input value= {formData.linkedin} onChange={(e) => setFormData({...formData, linkedin: e.target.value})} ></Input>
                                    </div>
                                    <Button onClick={handleFormSubmit} className="w-full mt-4">Save Changes</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardContent>
            </CardHeader>
        </Card>)}
        </div>
  )
}

export default ProfilePage
