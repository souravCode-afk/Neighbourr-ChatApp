import React, { useContext, useState, useEffect } from 'react'
import assets from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext.jsx'
import { ChatContext } from '../../context/ChatContext.jsx'

function Sidebar() {
    const { getUsers, users, selectedUser, setSelectedUser, unseenMessages, setUnseenMessages } = useContext(ChatContext)
    const { logout, onlineUsers } = useContext(AuthContext)

    const [input, setInput] = useState("");
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const filteredUsers = input ? users.filter((user) => user.fullName.toLowerCase().includes(input.toLowerCase())) : users;

    useEffect(() => {
        getUsers()
    }, [onlineUsers])

    const navigate = useNavigate()

    return (
        <div className={`glass-panel h-full min-h-0 p-5 md:rounded-l-3xl md:rounded-r-none border-r-0 sm:border-r border-dark-border flex flex-col z-10 ${selectedUser ? "hidden md:flex" : "flex"}`}>
            {/* Header Area */}
            <div className='pb-6'>
                <div className='flex justify-between items-center mb-6'>
                    <div className='flex items-center gap-3'>
                        <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(20,184,166,0.45)]">
                            <img src={assets.favicon} alt="Neighbourr" className="w-5 h-5 object-contain drop-shadow-[0_0_8px_rgba(20,184,166,0.7)]" />
                        </div>
                        <span className="font-heading font-bold text-xl tracking-tight text-white">Neighbourr</span>
                    </div>

                    {/* Menu */}
                    <div className='relative'>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className='p-2 hover:bg-white/5 rounded-full transition-colors'
                        >
                            <img src={assets.menu_icon} alt="Menu" className='w-5 h-5 opacity-70 hover:opacity-100 transition-opacity' />
                        </button>

                        {isMenuOpen && (
                            <>
                                <div className='fixed inset-0 z-10' onClick={() => setIsMenuOpen(false)} />
                                <div className='absolute top-full right-0 mt-2 z-20 w-40 p-2 rounded-xl bg-dark-surface border border-dark-border shadow-2xl backdrop-blur-xl'>
                                    <button onClick={() => { navigate('/profile'); setIsMenuOpen(false); }} className='w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors'>
                                        Edit Profile
                                    </button>
                                    <div className='h-px bg-white/5 my-1' />
                                    <button onClick={() => { logout(); setIsMenuOpen(false); }} className='w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded-lg transition-colors'>
                                        Logout
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Search Bar */}
                <div className='glass-input rounded-xl flex items-center gap-3 px-4 py-3'>
                    <img src={assets.search_icon} alt="Search" className='w-4 opacity-50' />
                    <input
                        onChange={(e) => setInput(e.target.value)}
                        value={input}
                        type="text"
                        className='bg-transparent border-none outline-none text-white text-sm placeholder-gray-500 w-full font-sans'
                        placeholder='Search users...'
                    />
                </div>
            </div>

            {/* User List */}
            <div className='flex-1 overflow-y-auto pr-2 space-y-1'>
                {filteredUsers.map((user, index) => {
                    const isSelected = selectedUser?._id === user._id;
                    const isOnline = onlineUsers.includes(user._id);
                    return (
                        <div
                            onClick={() => {
                                setSelectedUser(user);
                                setUnseenMessages((prev) => ({ ...prev, [user._id]: 0 }));
                            }}
                            key={user._id || index}
                            className={`group relative flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-200 ${isSelected ? 'bg-brand-500/15 border border-brand-500/30 shadow-[inset_0_0_20px_rgba(99,102,241,0.05)]' : 'hover:bg-white/5 border border-transparent'}`}
                        >
                            <div className="relative">
                                <img src={user?.profilePic || assets.avatar_icon} alt="" className='w-12 h-12 object-cover rounded-full ring-2 ring-transparent group-hover:ring-brand-500/30 transition-all' />
                                {isOnline && (
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-dark-surface rounded-full"></span>
                                )}
                            </div>

                            <div className='flex-1 min-w-0'>
                                <p className={`truncate font-medium text-sm ${isSelected ? 'text-white' : 'text-gray-200'}`}>{user.fullName}</p>
                                <p className={`truncate text-xs mt-0.5 ${isOnline ? 'text-brand-300' : 'text-gray-500'}`}>
                                    {isOnline ? 'Active now' : 'Offline'}
                                </p>
                            </div>

                            {unseenMessages[user._id] > 0 && (
                                <div className='w-5 h-5 flex justify-center items-center rounded-full bg-brand-500 text-[10px] font-bold text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]'>
                                    {unseenMessages[user._id]}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Footer Area - Create Room */}
            <div className='pt-4 mt-2 border-t border-white/5'>
                <button className='w-full btn-primary py-3 text-sm rounded-xl font-medium tracking-wide flex items-center justify-center gap-2' onClick={() => navigate('/MapDashboard')}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Create Spatial Room
                </button>
            </div>
        </div>
    )
}

export default Sidebar