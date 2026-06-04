import React, { useContext,useEffect,useState } from 'react'
import assets, { imagesDummyData } from '../assets/assets'
import { ChatContext } from '../../context/ChatContext.jsx'
import { AuthContext } from '../../context/AuthContext.jsx'

function RightSidebar({showProfile, setShowProfile}) {

  const {selectedUser,messages} = useContext(ChatContext)
  const {logout, onlineUsers} = useContext(AuthContext)
  const [msgImages,setMsgImages] = useState([])

  // Get all the images from the messages and set them to state
  useEffect(()=>{
    setMsgImages(
      messages.filter(msg=>msg.image).map(msg=>msg.image)
  )},[messages])

  return selectedUser && (
    <div className={`bg-[#123D3A] md:bg-[#2DD4BF]/10 text-white w-full min-h-0 relative overflow-y-auto ${showProfile ? "max-md:absolute max-md:inset-0 max-md:z-30" : "max-md:hidden"}`}>
        <button onClick={()=>setShowProfile(false)} className='absolute left-4 top-4 md:hidden'>
          <img src={assets.arrow_icon} alt="Back" className='w-7'/>
        </button>
        <div className='pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto'>
          <img src={selectedUser?.profilePic || assets.avatar_icon } alt="" className='w-20 aspect-[1/1] rounded-full'/>
          <h1 className='px-6 lg:px-10 text-xl font-medium mx-auto flex items-center gap-2 max-w-full'>
              <span className='truncate'>{selectedUser.fullName}</span>
              {onlineUsers.includes(selectedUser._id) ? <p className='w-2 h-2 rounded-full bg-green-500'></p> : <p className='w-2 h-2 rounded-full bg-gray-500'></p>}
            </h1>
            <p className='px-6 lg:px-10 mx-auto text-center break-words'>{selectedUser.bio}</p>
        </div>
        <hr className='border-[#ffffff50] my-4'/>
        <div className='px-5 text-xs'>
            <p>Media</p>
            <div className='mt-2 max-h-[200px] overflow-y-auto grid grid-cols-2 gap-4 opacity-80'>
              {msgImages.map((url,index)=>(
                <div key={index} onClick={()=> window.open(url)} className='cursor-pointer rounded'>
                  <img src={url} alt="" className='h-full w-full object-cover rounded-md'/>
                </div>
              ))}
            </div>
        </div>

        <button onClick={()=>logout()} className='absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-teal-400 to-emerald-600 text-white border-none text-sm font-light py-2 px-10 lg:px-20 rounded-full cursor-pointer'>
          Logout
        </button>
    </div>
  ) 
}

export default RightSidebar
