
"use client"

import React, { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import SideBar from '@/src/components/sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'

interface BlogsProps {
  children: ReactNode
}

const HomeLayout: React.FC<BlogsProps> = ({ children }) => {
  const pathname = usePathname()
  const isSavedPage = pathname === '/blogs/saved'

  if (isSavedPage) {
    return (
      <main className="w-full min-h-[calc(100vh-64px)] px-4">
        {children}
      </main>
    )
  }

  return (
    <div>
      <SidebarProvider>
        <SideBar />
        <main className="w-full min-h-[calc(100vh-64px)] px-4">
          {children}
        </main>
      </SidebarProvider>
    </div>
  )
}

export default HomeLayout