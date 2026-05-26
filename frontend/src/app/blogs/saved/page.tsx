"use client"

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Loading from '@/src/components/loading'
import { useAppData } from '@/src/context/AppContext'
import BlogCard from '@/src/components/BlogCard'

const SavedBlogs = () => {
  const { loading, isAuth, savedBlogs } = useAppData()
  const router = useRouter()

  useEffect(() => {
    // If not loading and not authenticated, redirect to login
    if (!loading && !isAuth) {
      router.push("/login")
    }
  }, [loading, isAuth, router])

  if (loading) {
    return <Loading />
  }

  const allSavedBlogs = savedBlogs || []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center my-5">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-gray-900">Saved Blogs</h1>
          
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
        {allSavedBlogs.length === 0 ? (
          <p className="text-center text-gray-500 col-span-full py-12">
            You haven't saved any blogs yet
          </p>
        ) : (
          allSavedBlogs.map((e, i) => {
            return (
              <BlogCard
                key={i}
                image={e.image}
                title={e.title}
                description={e.description}
                id={e.id}
                time={e.created_at}
              />
            )
          })
        )}
      </div>
    </div>
  )
}

export default SavedBlogs
