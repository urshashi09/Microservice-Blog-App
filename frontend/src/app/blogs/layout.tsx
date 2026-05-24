
import React, { ReactNode } from 'react'


import SideBar from '@/src/components/sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'


interface BlogsProps {
  children: ReactNode
}

const HomeLayout: React.FC<BlogsProps> = ({ children }) => {
  return (
    <div>
<SidebarProvider>
      <SideBar />
      <main className='w-full min-h-[calc(100vh-64px)] px-4'>
        
          {children}
        

      </main>

</SidebarProvider>
    </div>
  )
}

export default HomeLayout