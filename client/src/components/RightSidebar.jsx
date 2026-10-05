import React, { useContext, useEffect, useState } from 'react'
import assets from '../assets/assets'
import { ChatContext } from '../../context/ChatContext.jsx'
import { AuthContext } from '../../context/AuthContext.jsx'

function RightSidebar({ showProfile, setShowProfile }) {
  const { selectedUser, messages } = useContext(ChatContext)
  const { logout, onlineUsers } = useContext(AuthContext)
  const [msgImages, setMsgImages] = useState([])

  useEffect(() => {
    setMsgImages(
      messages.filter(msg => msg.image).map(msg => msg.image)
    )
  }, [messages])

  if (!selectedUser) return null;

  const isOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div className={`glass-panel h-full min-h-0 relative flex flex-col md:rounded-r-3xl md:border-l-0 ${showProfile ? "max-md:absolute max-md:inset-0 max-md:z-30 rounded-none border-x-0" : "max-md:hidden"}`}>
      
      {/* Mobile back button */}
      <button onClick={() => setShowProfile(false)} className='absolute left-4 top-4 md:hidden p-2 bg-white/5 rounded-full z-10'>
        <img src={assets.arrow_icon} alt="Back" className='w-5 opacity-70'/>
      </button>

      <div className='flex-1 overflow-y-auto pb-24'>
        {/* Profile Header */}
        <div className='pt-12 pb-8 flex flex-col items-center px-6 relative'>
          {/* Subtle background glow behind avatar */}
          <div className="absolute top-10 w-32 h-32 bg-brand-500/20 rounded-full blur-2xl"></div>
          
          <div className="relative">
             <img src={selectedUser?.profilePic || assets.avatar_icon} alt="" className='w-24 h-24 object-cover rounded-[2rem] border border-white/10 shadow-2xl relative z-10'/>
             {isOnline && (
               <div className="absolute bottom-[-4px] right-[-4px] w-6 h-6 bg-green-500 border-4 border-dark-surface rounded-full z-20"></div>
             )}
          </div>
          
          <h2 className='mt-6 text-2xl font-heading font-semibold text-white flex items-center gap-2'>
            {selectedUser.fullName}
          </h2>
          <p className='mt-2 text-sm text-gray-400 text-center font-sans max-w-[200px] leading-relaxed'>
            {selectedUser.bio || "No bio available"}
          </p>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-4"></div>

        {/* Media Section */}
        <div className='px-6'>
          <div className="flex items-center justify-between mb-4">
             <h3 className='text-sm font-medium text-gray-300'>Shared Media</h3>
             <span className="text-xs text-brand-400 bg-brand-500/10 px-2 py-1 rounded-md">{msgImages.length}</span>
          </div>
          
          {msgImages.length > 0 ? (
            <div className='grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar'>
              {msgImages.map((url, index) => (
                <div key={index} onClick={() => window.open(url)} className='group relative aspect-square rounded-xl overflow-hidden cursor-pointer border border-white/5'>
                  <img src={url} alt="" className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'/>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-white/5 rounded-2xl border border-white/5">
               <p className="text-sm text-gray-500">No media shared yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Logout Button */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-dark-surface to-transparent pt-12">
        <button onClick={() => logout()} className='w-full py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-red-500/10 hover:border-red-500/30 transition-all font-medium'>
          Logout
        </button>
      </div>
    </div>
  )
}

export default RightSidebar
