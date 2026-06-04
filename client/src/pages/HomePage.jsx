import React,{useContext, useState} from 'react'
import Sidebar from '../components/Sidebar'
import ChatContainer from '../components/ChatContainer'
import RightSidebar from '../components/RightSidebar'
import { ChatContext } from '../../context/ChatContext.jsx'

function HomePage() {

  const {selectedUser} = useContext(ChatContext)
  return (
    <div className='border w-full min-h-screen flex items-center justify-center p-4 sm:p-6'>
        <div className={`backdrop-blur-xl border-2 border-gray-600 rounded-2xl overflow-hidden w-full max-w-6xl h-[90vh] grid grid-cols-1 relative ${selectedUser ? 'md:grid-cols-[1fr_1.5fr_1fr] grid-cols-[1fr_2fr_1fr]' : 'md:grid-cols-2'}`}>
            <Sidebar/>
            <ChatContainer/>
            <RightSidebar/>
        </div>
    </div>
  )
}

export default HomePage
