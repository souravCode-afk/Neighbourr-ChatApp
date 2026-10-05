import React, { useContext, useEffect, useRef, useState } from 'react'
import assets from '../assets/assets'
import { formatMessageTime } from '../lib/utils';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

function ChatContainer({ setShowProfile }) {
  const { messages, selectedUser, setSelectedUser, sendMessage, getMessages, deleteMessage } = useContext(ChatContext)
  const { authUser, onlineUsers } = useContext(AuthContext)
  const chatAreaRef = useRef(null);
  const isFirstLoadRef = useRef(true);
  const [input, setInput] = useState("")

  // Handle sending a message
  const handleSendMessage = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (input.trim() === "") return null;
    await sendMessage({ text: input.trim() })
    setInput("")
  }

  // Handle sending an image
  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select an valid image file")
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessage({ image: reader.result })
      e.target.value = ""
    }
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    isFirstLoadRef.current = true;
    if (selectedUser) {
      getMessages(selectedUser._id)
    }
  }, [selectedUser])

  useEffect(() => {
    if (chatAreaRef.current) {
      if (isFirstLoadRef.current) {
        chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
        isFirstLoadRef.current = false;
      } else {
        chatAreaRef.current.scrollTo({
          top: chatAreaRef.current.scrollHeight,
          behavior: "smooth"
        });
      }
    }
  }, [messages])

  return selectedUser ? (
    <div className='h-full min-h-0 overflow-hidden relative flex flex-col bg-dark-bg md:bg-transparent'>
      
      {/*------- header -------*/}
      <div className='flex items-center gap-4 py-4 px-5 border-b border-white/5 bg-dark-surface/50 backdrop-blur-md z-10'>
        <button className='md:hidden p-2 -ml-2 rounded-full hover:bg-white/5 transition-colors' onClick={() => setSelectedUser(null)}>
           <img src={assets.arrow_icon} alt="Back" className='w-5 opacity-70'/>
        </button>
        
        <div 
          onClick={() => setShowProfile(true)} 
          className='flex items-center gap-3 cursor-pointer group flex-1 min-w-0'
        >
          <div className="relative">
             <img src={selectedUser.profilePic || assets.avatar_icon} alt="" className='w-10 h-10 rounded-full object-cover group-hover:ring-2 ring-brand-500/50 transition-all'/>
             {onlineUsers.includes(selectedUser._id) && (
                 <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-dark-surface rounded-full"></span>
             )}
          </div>
          <div className='flex-1 min-w-0'>
             <p className='text-base font-medium text-white truncate font-sans'>{selectedUser.fullName}</p>
             <p className='text-xs text-gray-400 font-sans'>{onlineUsers.includes(selectedUser._id) ? 'Online' : 'Offline'}</p>
          </div>
        </div>

        <button className='p-2 rounded-full hover:bg-white/5 transition-colors hidden md:block' onClick={() => setShowProfile(true)}>
           <img src={assets.help_icon} alt="Info" className='w-5 opacity-50'/>
        </button>
      </div>

      {/* ------- chat area ------- */}
      <div ref={chatAreaRef} className='flex-1 overflow-y-auto p-5 pb-6 space-y-6 custom-scrollbar relative'>
        {messages.map((msg) => {
          const isOwn = msg.senderId === authUser._id;
          return (
            <div key={msg._id} className={`flex items-end gap-3 ${isOwn ? 'justify-end' : 'justify-start'}`}>
              
              {!isOwn && (
                 <img src={selectedUser?.profilePic || assets.avatar_icon} alt="" className='w-8 h-8 rounded-full mb-5 object-cover'/>
              )}
              
              <div className={`flex flex-col gap-1 max-w-[75%] sm:max-w-[65%] md:max-w-[55%] ${isOwn ? 'items-end' : 'items-start'}`}>
                {msg.image ? (
                  <div className={`relative group p-1 rounded-2xl border ${isOwn ? 'border-brand-500/30 bg-brand-500/10' : 'border-white/5 bg-white/5'} backdrop-blur-sm`}>
                    <img src={msg.image} alt="Sent visual" className='w-full object-cover rounded-xl'/>
                  </div>
                ) : (
                  <div className={`relative group px-4 py-3 shadow-lg ${
                      isOwn 
                      ? 'bg-brand-500 text-white rounded-t-2xl rounded-bl-2xl rounded-br-sm shadow-[0_4px_20px_rgba(99,102,241,0.25)]' 
                      : 'bg-white/10 text-gray-100 rounded-t-2xl rounded-br-2xl rounded-bl-sm border border-white/5 backdrop-blur-md'
                    }`}>
                    <p className='text-sm font-sans leading-relaxed break-words'>{msg.text}</p>
                    
                    {isOwn && (
                      <button
                        onClick={() => deleteMessage(msg._id)}
                        className="absolute -left-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-xs text-red-400 hover:text-red-500 bg-dark-surface/80 px-2 py-1 rounded-md transition-all duration-200"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
                <span className={`text-[10px] text-gray-500 px-1 font-medium ${isOwn ? 'text-right' : 'text-left'}`}>
                  {formatMessageTime(msg.createdAt)}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* ------- bottom area ------ */}
      <div className='p-4 bg-dark-surface/80 backdrop-blur-xl border-t border-white/5'>
        <div className='flex items-center gap-3 w-full max-w-4xl mx-auto'>
          
          <div className='flex-1 flex items-center bg-black/20 border border-white/10 rounded-full pl-4 pr-2 py-1.5 focus-within:border-brand-500/50 focus-within:bg-black/40 transition-all duration-300'>
              <input 
                onChange={(e) => setInput(e.target.value)} 
                value={input} 
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey ? handleSendMessage(e) : null} 
                type="text" 
                placeholder="Type a message..." 
                className='flex-1 min-w-0 bg-transparent border-none outline-none text-white placeholder-gray-500 text-sm py-2 font-sans'
              />
              <input onChange={handleSendImage} type="file" id='image' accept='image/png, image/jpeg' hidden/>
              <label htmlFor="image" className='p-2 hover:bg-white/10 rounded-full cursor-pointer transition-colors'>
                <img src={assets.gallery_icon} alt="Gallery" className='w-5 opacity-70 hover:opacity-100'/>
              </label>
          </div>
          
          <button 
             onClick={handleSendMessage} 
             disabled={!input.trim()}
             className={`p-3.5 rounded-full flex items-center justify-center transition-all duration-300 ${input.trim() ? 'bg-brand-500 shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:bg-brand-400 hover:-translate-y-0.5' : 'bg-white/5 opacity-50 cursor-not-allowed'}`}
          >
            <img src={assets.send_button} alt="Send" className={`w-5 ${input.trim() ? 'ml-1' : ''}`}/>
          </button>
        </div>
      </div>

    </div>
  ) : (
    <div className='flex flex-col items-center justify-center h-full gap-6 max-md:hidden relative'>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-500/10 via-dark-bg to-dark-bg z-0"></div>
        <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 bg-teal-500/10 rounded-3xl flex items-center justify-center border border-teal-500/20 shadow-[0_0_40px_rgba(20,184,166,0.35)] mb-6 backdrop-blur-xl">
               <img src={assets.favicon} alt="Neighbourr" className='w-14 h-14 object-contain drop-shadow-[0_0_16px_rgba(20,184,166,0.65)]'/>
            </div>
            <h2 className='text-2xl font-heading font-semibold text-white tracking-tight'>Neighbourr Chat</h2>
            <p className='text-gray-400 mt-2 font-sans'>Select a conversation to start messaging</p>
        </div>
    </div>
  )
}

export default ChatContainer
