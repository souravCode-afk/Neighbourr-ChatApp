import React, { useContext, useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import ChatContainer from '../components/ChatContainer'
import RightSidebar from '../components/RightSidebar'
import { ChatContext } from '../../context/ChatContext.jsx'

function HomePage() {
  const { selectedUser } = useContext(ChatContext)
  const [showProfile, setShowProfile] = useState(false)

  useEffect(() => {
    setShowProfile(false)
  }, [selectedUser])

  return (
    <div className='w-full h-screen flex items-center justify-center p-0 sm:p-4 md:p-8 bg-dark-bg relative overflow-hidden'>
      {/* Background ambient glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-500/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className={`glass-panel rounded-none sm:rounded-3xl overflow-hidden w-full max-w-7xl h-full sm:h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)] max-h-[900px] grid grid-cols-1 grid-rows-1 relative shadow-2xl shadow-black/50 ${selectedUser ? 'md:grid-cols-[300px_minmax(0,1fr)_300px] lg:grid-cols-[320px_minmax(0,1fr)_320px]' : 'md:grid-cols-[320px_minmax(0,1fr)]'}`}>
        <Sidebar />
        <ChatContainer setShowProfile={setShowProfile} />
        {selectedUser && (
          <RightSidebar showProfile={showProfile} setShowProfile={setShowProfile} />
        )}
      </div>
    </div>
  )
}

export default HomePage
