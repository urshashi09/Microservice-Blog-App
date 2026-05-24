"use client"

import React from 'react'


import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { useSidebar } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Filter } from 'lucide-react'
import Loading from '@/src/components/loading'
import { useAppData } from '@/src/context/AppContext'


const Blogs = () => {
  const {toggleSidebar}= useSidebar()
  const {loading, blogLoading, blogs} = useAppData()

  return (
    <div>
      {loading ? (
        <Loading/>
      ) : (
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center my-5">
            <h1 className="text-3xl font-bold text-gray-900">Latest Blogs</h1>
            <Button onClick={toggleSidebar} variant="outline" className="flex items-center gap-2 px-4 bg-primary text-white">
              <Filter size={16} />
              <span>Filter blogs</span>
            </Button>
          </div>
          {
            blogLoading ? <Loading/> : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {blogs?.length===0 && <p className="text-center text-gray-500 col-span-full">No blogs found.</p>}
                {
                  blogs && blogs.map((e,i)=>{
                    return <p key={i}>{e.title}</p>
                  })
                }
              </div>
            )
          }
        </div>
      )}
      
    </div>
  )
}

export default Blogs
