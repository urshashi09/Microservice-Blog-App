"use client"

import React from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { Button } from './ui/button'
import { CircleUserRound, Menu, X, LogIn, LogOut } from 'lucide-react'
import { cn } from '@/src/lib/utils'
import { useAppData } from '../context/AppContext'

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false)

    const { isAuth, logoutUser } = useAppData()

    return (
        <nav className='bg-white shadow-md p-4 z-50' >
            <div className='container mx-auto flex justify-between items-center' >
                <Link href={"/"} className='text-xl font-bold text-gray-900'>
                    VibeLogs 
                </Link>

                <div className='md:hidden'>
                    <Button variant="ghost" onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <X className='w-6 h-6' /> : <Menu className='w-6 h-6' />}
                    </Button>

                </div>
                <ul className="hidden md:flex justify-center items-center space-x-6 text-gray-700">
                    <li>
                        <Link href={"/"} className='hover:text-blue-500 '>Home</Link>
                    </li>
                    {isAuth && (
                        <li>
                            <Link href={"/blog/new"} className='hover:text-blue-500 '>Create Blog</Link>
                        </li>
                    )}
                    <li>
                        <Link href={"/blogs/saved"} className='hover:text-blue-500 '>Saved blogs</Link>
                    </li>
                    <li>
                        {isAuth ? (
                            <Link href={"/profile"} className='hover:text-blue-500 '>
                                <CircleUserRound />
                            </Link>
                        ) : (
                            <Link href={"/login"} className='hover:text-blue-500 flex items-center gap-1 cursor-pointer bg-transparent border-0 p-0 font-medium text-gray-700'>
                                <LogIn />
                                <span>Login</span>
                            </Link>
                        )}
                    </li>
                    {isAuth && (
                        <li>
                            <button 
                                onClick={logoutUser} 
                                className='hover:text-red-500 flex items-center gap-1 cursor-pointer bg-transparent border-0 p-0 font-medium text-gray-700 hover:text-red-500 transition-colors'
                            >
                                <LogOut className="w-5 h-5" />
                                <span>Logout</span>
                            </button>
                        </li>
                    )}
                </ul>
            </div>
            <div className={cn("md:hidden overflow-hidden transition-all duration-300 ease-in-out ", isOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0")}>
                <ul className="flex flex-col justify-center items-center space-y-4 p-4 text-gray-700 bg-white shadow-md">
                    <li>
                        <Link href={"/"} className='hover:text-blue-500 '>Home</Link>
                    </li>
                    {isAuth && (
                        <li>
                            <Link href={"/blog/new"} className='hover:text-blue-500 '>Create Blog</Link>
                        </li>
                    )}
                    <li>
                        <Link href={"/blogs/saved"} className='hover:text-blue-500 '>Saved blogs</Link>
                    </li>
                    <li>
                        {isAuth ? (
                            <Link href={"/profile"} className='hover:text-blue-500 '>
                                <CircleUserRound />
                            </Link>
                        ) : (
                            <Link href={"/login"} className='hover:text-blue-500 flex items-center gap-1 cursor-pointer bg-transparent border-0 p-0 font-medium text-gray-700'>
                                <LogIn />
                                <span>Login</span>
                            </Link>
                        )}
                    </li>
                    {isAuth && (
                        <li>
                            <button 
                                onClick={logoutUser} 
                                className='hover:text-red-500 flex items-center gap-1 cursor-pointer bg-transparent border-0 p-0 font-medium text-gray-700 hover:text-red-500 transition-colors'
                            >
                                <LogOut className="w-5 h-5" />
                                <span>Logout</span>
                            </button>
                        </li>
                    )}
                </ul>
            </div>
        </nav>
    )
}

export default Navbar
