"use client"
import React from 'react'
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { Input } from '@/components/ui/input'
import { BoxSelect } from 'lucide-react'
import { blogCategories } from '../app/blog/new/page'
import { useAppData } from '../context/AppContext'

const SideBar = () => {

    const {searchQuery, setSearchQuery, setCategory}= useAppData()
  return (
    <Sidebar>
        <SidebarHeader className='bg-white text-2xl font-bold mt-5'>
            VibeLogs 
        </SidebarHeader>
        <SidebarContent className='bg-white'>
            <SidebarGroup>
                <SidebarGroupLabel>Search</SidebarGroupLabel>
                <Input type='text' placeholder='Search blog' value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} ></Input>

                <SidebarGroupLabel>Categories</SidebarGroupLabel>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={()=>setCategory("")}><BoxSelect />
                        <span>All</span>
                        </SidebarMenuButton>
                        {blogCategories.map((e,i)=>{
                            return (<SidebarMenuButton key={i} onClick={()=>setCategory(e)}><BoxSelect />
                        <span>{e}</span>
                        </SidebarMenuButton>)
                        })}
                    </SidebarMenuItem>
                </SidebarMenu>

            </SidebarGroup>
        </SidebarContent>
    </Sidebar>
  )
}

export default SideBar