"use client"

import React from 'react'
import { Button } from '@/src/components/ui/button'
import { useAppData } from '../context/AppContext'
import Loading from '../components/loading'


const Home = () => {
  const {loading} = useAppData()
  return (
    <div>
      {loading ? <Loading/> : <Button>click</Button>}
    </div>
  )
}

export default Home