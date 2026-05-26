"use client"
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { User, user_service } from '@/src/context/AppContext'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import axios from 'axios'
import Loading from '@/src/components/loading'

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

const PublicProfilePage = () => {
    const { id } = useParams()
    const [profileUser, setProfileUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const fetchPublicProfile = async () => {
            if (!id) return
            try {
                setLoading(true)
                setError("")
                const { data } = await axios.get<{ user: User }>(`${user_service}/profile/${id}`)
                setProfileUser(data.user)
            } catch (err) {
                console.error("Error fetching public profile:", err)
                setError("User profile not found")
            } finally {
                setLoading(false)
            }
        }

        fetchPublicProfile()
    }, [id])

    if (loading) {
        return <Loading />
    }

    if (error || !profileUser) {
        return (
            <div className="flex justify-center items-center min-h-screen p-4">
                <Card className="w-full max-w-xl shadow-lg border rounded-2xl p-6 text-center">
                    <p className="text-gray-500">{error || "User profile not found"}</p>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex justify-center items-center min-h-screen p-4">
            <Card className="w-full max-w-xl shadow-lg border rounded-2xl p-6">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-semibold mb-4">Author Profile</CardTitle>
                    <CardContent className="flex flex-col items-center gap-y-4">
                        <Avatar className="w-24 h-24 border-4 border-gray-200 shadow-md">
                            <AvatarImage src={profileUser.image || "/default-avatar.png"} alt="profile pic" className="rounded-full" />
                        </Avatar>
                        
                        <div className="w-full space-y-2 text-center">
                            <label className="font-medium text-gray-700">Name</label>
                            <p className="text-xl font-bold text-gray-900">{profileUser.name}</p>
                        </div>

                        {profileUser.bio && (
                            <div className="w-full space-y-2 text-center">
                                <label className="font-medium text-gray-700">Bio</label>
                                <p className="text-gray-600 italic px-4">"{profileUser.bio}"</p>
                            </div>
                        )}

                        <div className="flex gap-4 mt-3">
                            {profileUser.instagram && (
                                <a href={profileUser.instagram} rel="noopener noreferrer" target="_blank">
                                    <InstagramIcon className="size-6 text-pink-500 hover:opacity-80 transition-opacity" />
                                </a>
                            )}

                            {profileUser.facebook && (
                                <a href={profileUser.facebook} rel="noopener noreferrer" target="_blank">
                                    <FacebookIcon className="size-6 text-blue-600 hover:opacity-80 transition-opacity" />
                                </a>
                            )}

                            {profileUser.linkedin && (
                                <a href={profileUser.linkedin} rel="noopener noreferrer" target="_blank">
                                    <LinkedinIcon className="size-6 text-blue-700 hover:opacity-80 transition-opacity" />
                                </a>
                            )}
                        </div>
                    </CardContent>
                </CardHeader>
            </Card>
        </div>
    )
}

export default PublicProfilePage
