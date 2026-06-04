import React,{useContext, useEffect, useState} from 'react'
import Sidebar from '../components/Sidebar'
import ChatContainer from '../components/ChatContainer'
import RightSidebar from '../components/RightSidebar'
import { ChatContext } from '../../context/ChatContext.jsx'

function HomePage() {

  const {selectedUser} = useContext(ChatContext)
  const [showProfile, setShowProfile] = useState(false)

  useEffect(()=>{
    setShowProfile(false)
  },[selectedUser])

  return (
    <div className='w-full min-h-screen flex items-center justify-center p-0 sm:p-4 md:p-6'>
        <div className={`backdrop-blur-xl border-0 sm:border-2 border-gray-600 rounded-none sm:rounded-2xl overflow-hidden w-full max-w-6xl h-screen sm:h-[90vh] grid grid-cols-1 relative ${selectedUser ? 'md:grid-cols-[280px_minmax(0,1fr)_280px] lg:grid-cols-[1fr_1.5fr_1fr]' : 'md:grid-cols-2'}`}>
            <Sidebar/>
            <ChatContainer setShowProfile={setShowProfile}/>
            <RightSidebar showProfile={showProfile} setShowProfile={setShowProfile}/>
        </div>
    </div>
  )
}

export default HomePage
