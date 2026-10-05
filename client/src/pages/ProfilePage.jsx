import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import assets from '../assets/assets'
import { AuthContext } from '../../context/AuthContext.jsx'

function ProfilePage() {
  const { authUser, updateProfile } = useContext(AuthContext)

  const [selectedImg, setSelectedImg] = useState(null)
  const navigate = useNavigate()
  const [name, setName] = useState(authUser?.fullName || '')
  const [bio, setBio] = useState(authUser?.bio || '')

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImg) {
      await updateProfile({ fullName: name, bio })
      navigate('/')
      return;
    }
    
    const reader = new FileReader();
    reader.readAsDataURL(selectedImg);
    reader.onload = async () => {
      const base64Image = reader.result;
      await updateProfile({ profilePic: base64Image, fullName: name, bio })
      navigate('/')
    }
  }

  return (
    <div className='min-h-screen bg-dark-bg flex items-center justify-center px-4 py-8 relative overflow-hidden'>
        {/* Background Ambience */}
        <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className='w-full max-w-3xl glass-panel text-white flex flex-col md:flex-row items-stretch rounded-[2rem] shadow-2xl relative overflow-hidden border border-white/10'>
          
          {/* Top subtle border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 to-purple-500"></div>

          {/* Avatar Section - Right side on desktop, top on mobile */}
          <div className='flex flex-col items-center justify-center p-10 bg-white/5 md:w-2/5 border-b md:border-b-0 md:border-l border-white/10'>
            <div className="relative group cursor-pointer mb-6">
              <div className="absolute inset-0 bg-brand-500/30 rounded-[2.5rem] blur-xl group-hover:bg-brand-400/40 transition-colors"></div>
              <img 
                className='relative w-40 h-40 object-cover rounded-[2.5rem] border-2 border-white/10 shadow-2xl group-hover:scale-105 transition-transform duration-300' 
                src={selectedImg ? URL.createObjectURL(selectedImg) : (authUser?.profilePic || assets.avatar_icon)} 
                alt="Profile" 
              />
              <label htmlFor="avatar" className="absolute inset-0 bg-black/50 rounded-[2.5rem] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                 <img src={assets.gallery_icon} alt="Upload" className="w-8 opacity-80 mb-2"/>
                 <span className="text-xs font-medium text-white/80">Change Photo</span>
                 <input onChange={(e) => setSelectedImg(e.target.files[0])} type="file" id='avatar' accept='.png,.jpg,.jpeg' hidden/>
              </label>
            </div>
            <h2 className="text-xl font-heading font-semibold text-white tracking-tight text-center">{name || "Your Name"}</h2>
            <p className="text-brand-300 text-sm mt-1">@{authUser?.email?.split('@')[0] || "user"}</p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className='flex flex-col gap-6 p-8 sm:p-12 md:w-3/5 bg-dark-surface/50 backdrop-blur-md'>
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <button type="button" onClick={() => navigate('/')} className="p-1.5 -ml-1 rounded-full hover:bg-white/5 transition-colors">
                  <img src={assets.arrow_icon} alt="Back" className="w-4 opacity-70"/>
                </button>
                <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.4)]">
                  <img src={assets.favicon} alt="Logo" className="w-4 h-4 object-contain drop-shadow-[0_0_6px_rgba(20,184,166,0.6)]" />
                </div>
                <span className="text-xs text-gray-400 font-medium tracking-wide">Neighbourr</span>
              </div>
              <h3 className='text-2xl font-heading font-bold mb-2'>Profile Settings</h3>
              <p className="text-gray-400 text-sm font-sans">Update your personal details and how others see you.</p>
            </div>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">Full Name</label>
                <input 
                  onChange={(e) => setName(e.target.value)}
                  value={name} 
                  type="text" 
                  required 
                  placeholder='Your full name' 
                  className='w-full glass-input p-3.5 rounded-xl text-white placeholder-gray-500 font-sans'
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">Bio</label>
                <textarea 
                  onChange={(e) => setBio(e.target.value)} 
                  value={bio} 
                  placeholder='Write something about yourself...' 
                  required 
                  className='w-full glass-input p-3.5 rounded-xl text-white placeholder-gray-500 font-sans resize-none custom-scrollbar' 
                  rows={5}
                ></textarea>
              </div>
            </div>

            <div className="flex gap-4 mt-4 pt-6 border-t border-white/5">
              <button 
                type="button"
                onClick={() => navigate('/')} 
                className='flex-1 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors'
              >
                Cancel
              </button>
              <button 
                type='submit' 
                className='flex-1 btn-primary py-3.5 text-[15px]'
              >
                Save Changes
              </button>
            </div>
          </form>

        </div>
    </div>
  )
}

export default ProfilePage
