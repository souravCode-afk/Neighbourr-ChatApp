import React, { useContext, useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { useRoom } from '../../context/RoomContext.jsx'; 
import { AuthContext } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import assets from '../assets/assets';
import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const getSenderId = (sender) => {
  if (!sender) return "";
  const id = typeof sender === "object" ? (sender._id || sender) : sender;
  return id?.$oid || id?.toString?.() || String(id);
};

const getRoomCreatorId = (room) => {
  if (!room || !room.creator) return "";
  const creator = room.creator;
  const id = typeof creator === "object" ? (creator._id || creator) : creator;
  return id?.$oid || id?.toString?.() || String(id);
};

function MapDashboard() {
  const [roomName, setRoomName] = useState('');
  const [roomRadius, setRoomRadius] = useState(500);
  const [roomInput, setRoomInput] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteInput, setInviteInput] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const roomChatAreaRef = useRef(null);
  const { authUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const { 
    rooms, 
    selectedRoom,
    roomMessages,
    userLocation, 
    setUserLocation, 
    fetchNearbyRooms, 
    createRoom, 
    setSelectedRoom,
    sendRoomMessage,
    deleteRoom,
    joinByInviteCode
  } = useRoom();

  useEffect(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]); 
        fetchNearbyRooms(latitude, longitude); 
      },
      (err) => {
        toast.error("Please enable location services: " + err.message);
      },
      { enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => {
    if (roomChatAreaRef.current) {
      roomChatAreaRef.current.scrollTop = roomChatAreaRef.current.scrollHeight;
    }
  }, [roomMessages, selectedRoom]);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!roomName.trim()) return toast.error("Please enter a room name.");
    if (!userLocation) return toast.error("Location data unavailable.");

    try {
      setIsSubmitting(true);
      
      const result = await createRoom({
        name: roomName,
        latitude: userLocation[0],
        longitude: userLocation[1],
        radius: roomRadius,
        isPrivate
      });

      if (result) {
        setRoomName('');
        setIsPrivate(false);
        // For private rooms, admin is auto-joined via RoomContext.
        // The invite code is shown in the chat header strip.
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinPrivate = async (e) => {
    e.preventDefault();
    if (!inviteInput.trim()) return toast.error("Please enter an invite code.");
    setIsJoining(true);
    await joinByInviteCode(inviteInput);
    setIsJoining(false);
    setInviteInput('');
  };

  const handleEnterRoom = (room) => {
    setSelectedRoom(room);
    toast.success(`Entered ${room.name}`);
  };

  const handleSendRoomMessage = async (e) => {
    e.preventDefault();
    if (!roomInput.trim()) return;

    const sent = await sendRoomMessage(roomInput);
    if (sent) {
      setRoomInput('');
    } else {
      toast.error("Could not send room message.");
    }
  };

  if (!userLocation) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-dark-bg text-white font-sans">
        <div className="glass-panel p-8 rounded-[2rem] text-center max-w-sm flex flex-col items-center">
          <div className="w-16 h-16 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin mb-6"></div>
          <p className="text-lg font-heading font-medium">Acquiring Satellites...</p>
          <span className="text-sm text-gray-400 mt-2">Connecting to your local grid to find rooms nearby.</span>
        </div>
      </div>
    );
  }

  return (
    
    <div className="h-screen w-full flex flex-col md:flex-row bg-dark-bg text-white relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-[20%] left-[-10%] w-[30%] h-[40%] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* FIRST HALF: INTERFACE COLUMN */}
      <div className="h-1/2 md:h-full md:w-1/2 lg:w-[45%] flex flex-col p-6 lg:p-8 bg-dark-surface/80 backdrop-blur-2xl border-b md:border-b-0 md:border-r border-white/5 z-10 shadow-2xl overflow-y-auto custom-scrollbar">
        
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-heading font-bold tracking-tight flex items-center gap-3">
              <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-full hover:bg-white/5 transition-colors">
                <img src={assets.arrow_icon} alt="Back" className="w-5 opacity-70"/>
              </button>
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shadow-[0_0_18px_rgba(20,184,166,0.4)]">
                <img src={assets.favicon} alt="Neighbourr" className="w-5 h-5 object-contain drop-shadow-[0_0_8px_rgba(20,184,166,0.6)]" />
              </div>
              Spatial Hub
            </h1>
        </div>
        {/* Module A: Create Room Form — compact */}
        <div className="glass-panel p-4 rounded-2xl mb-4 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-brand-500"></div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-brand-400 mb-3 flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
             Host Local Room
          </h2>
          <form onSubmit={handleCreateRoom} className="space-y-3">
            <div className='flex gap-2'>
              <input 
                type="text" 
                placeholder="Room Title..." 
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-2/3 glass-input px-3 py-2 rounded-xl text-white placeholder-gray-500 text-sm font-sans"
              />
              <input 
                type="number" 
                placeholder='Radius (m)'
                value={roomRadius}
                onChange={(e) => setRoomRadius(e.target.value)}
                className="w-1/3 glass-input px-3 py-2 rounded-xl text-white placeholder-gray-500 text-sm font-sans"
              />
            </div>
            {/* Public / Private Toggle */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsPrivate(false)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  !isPrivate
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                    : 'glass-input text-gray-400 hover:text-gray-200'
                }`}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                </svg>
                Public
              </button>
              <button
                type="button"
                onClick={() => setIsPrivate(true)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  isPrivate
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'glass-input text-gray-400 hover:text-gray-200'
                }`}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Private
              </button>
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${
                isSubmitting
                  ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                  : isPrivate
                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20'
                    : 'btn-primary'
              }`}
            >
              {isSubmitting ? "Anchoring..." : isPrivate ? "🔒 Create Private Room" : "Generate Hub"}
            </button>
          </form>
        </div>

        {/* Module B: Available Rooms Hub */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex justify-between items-end mb-4 px-1">
             <div className="min-w-0 flex-1 mr-3">
               <h2 className="text-sm font-heading font-semibold text-gray-200 truncate">
                 {selectedRoom ? selectedRoom.name : "Active Local Rooms"}
               </h2>
               {selectedRoom && (
                 <div className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                   <span className="text-brand-400">Zone Active</span>
                   <span>•</span>
                   {getRoomCreatorId(selectedRoom) === getSenderId(authUser?._id) ? (
                     <span className="text-amber-400 font-semibold flex items-center gap-1">
                       <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                       You are Admin
                     </span>
                   ) : (
                     <span className="text-gray-400">
                       Admin: <span className="text-amber-300 font-medium">{selectedRoom.creatorName || "Room Creator"}</span>
                     </span>
                   )}
                 </div>
               )}
             </div>
             {selectedRoom ? (
               <button
                 onClick={() => setSelectedRoom(null)}
                 className="text-xs text-brand-400 hover:text-brand-300 transition-colors font-medium shrink-0"
               >
                 Back to Directory
               </button>
             ) : (
               <span className="bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded-md text-xs font-bold border border-brand-500/30">
                 {rooms.length} Found
               </span>
             )}
          </div>
          
          {selectedRoom ? (
            <div className="flex-1 min-h-0 flex flex-col glass-panel rounded-[1.5rem] overflow-hidden border border-white/5 shadow-2xl shadow-black/50">
              {/* private room indicator strip */}
              {selectedRoom.isPrivate && (
                <div className="flex items-center gap-2 px-4 py-2 bg-purple-600/10 border-b border-purple-500/20">
                  <svg className="w-3.5 h-3.5 text-purple-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-xs text-purple-400 font-medium">Private Room — Invite Only</span>
                  {selectedRoom.inviteCode && (
                    <button
                      onClick={() => { navigator.clipboard.writeText(selectedRoom.inviteCode); toast.success("Invite code copied!"); }}
                      className="ml-auto text-[10px] bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 text-purple-300 px-2 py-1 rounded-md transition-colors font-mono tracking-wider"
                    >
                      {selectedRoom.inviteCode} 📋
                    </button>
                  )}
                </div>
              )}
              <div ref={roomChatAreaRef} className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                {roomMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 text-sm gap-2">
                    <span className="text-2xl">💬</span>
                    <p>Be the first to speak in this zone.</p>
                    {getRoomCreatorId(selectedRoom) === getSenderId(authUser?._id) && (
                      <p className="text-xs text-amber-400/80">You created this room as Admin</p>
                    )}
                  </div>
                ) : (
                  roomMessages.map((msg, index) => {
                    const roomCreatorId = getRoomCreatorId(selectedRoom);
                    const currentUserId = getSenderId(authUser?._id);
                    const msgSenderId = getSenderId(msg.senderId);
                    const isMine = Boolean(msgSenderId && currentUserId && msgSenderId === currentUserId);
                    const isSenderAdmin = Boolean(roomCreatorId && msgSenderId && roomCreatorId === msgSenderId);

                    const senderFullName = typeof msg.senderId === "object" ? msg.senderId?.fullName : msg.senderName;
                    const displayName = isMine 
                      ? (authUser?.fullName ? `${authUser.fullName} (You)` : "You")
                      : (senderFullName || "Neighbor");
                    const senderAvatar = typeof msg.senderId === "object" ? msg.senderId?.profilePic : (isMine ? authUser?.profilePic : null);

                    return (
                      <div
                        key={`${msg.createdAt || msg._id}-${index}`}
                        className={`flex items-end gap-2.5 ${isMine ? "justify-end" : "justify-start"}`}
                      >
                        {!isMine && (
                          <img
                            src={senderAvatar || assets.avatar_icon}
                            alt={displayName}
                            className="w-8 h-8 rounded-full object-cover border border-white/10 mb-4 shrink-0"
                          />
                        )}

                        <div className={`flex flex-col gap-1 max-w-[80%] sm:max-w-[70%] ${isMine ? "items-end" : "items-start"}`}>
                          {/* Sender Name & Admin Badge */}
                          <div className={`flex items-center gap-1.5 px-1 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
                            <span className={`text-xs font-medium font-sans ${isMine ? "text-brand-300" : "text-gray-300"}`}>
                              {displayName}
                            </span>
                            {isSenderAdmin && (
                              <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1">
                                <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                Admin
                              </span>
                            )}
                          </div>

                          {/* Message Bubble */}
                          <div
                            className={`relative px-4 py-2.5 shadow-md ${
                              isMine
                                ? "bg-brand-500 text-white rounded-2xl rounded-tr-sm shadow-[0_4px_15px_rgba(99,102,241,0.25)]"
                                : "bg-white/10 text-gray-100 rounded-2xl rounded-tl-sm border border-white/5 backdrop-blur-md"
                            }`}
                          >
                            <p className="font-sans text-sm leading-relaxed break-words">{msg.text}</p>
                          </div>

                          {/* Timestamp */}
                          <span className={`text-[10px] text-gray-500 px-1 font-medium ${isMine ? "text-right" : "text-left"}`}>
                            {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                          </span>
                        </div>

                        {isMine && (
                          <img
                            src={authUser?.profilePic || assets.avatar_icon}
                            alt="You"
                            className="w-8 h-8 rounded-full object-cover border border-brand-500/40 mb-4 shrink-0"
                          />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              
              <div className="p-3 bg-dark-surface/90 backdrop-blur-xl border-t border-white/5">
                 <form onSubmit={handleSendRoomMessage} className="flex items-center gap-2">
                   <input
                     value={roomInput}
                     onChange={(e) => setRoomInput(e.target.value)}
                     type="text"
                     placeholder="Message local zone..."
                     className="flex-1 min-w-0 rounded-full glass-input px-4 py-2.5 text-sm text-white placeholder-gray-500"
                   />
                   <button
                     type="submit"
                     disabled={!roomInput.trim()}
                     className={`p-2.5 rounded-full flex items-center justify-center transition-all ${roomInput.trim() ? 'bg-brand-500 hover:bg-brand-400 hover:-translate-y-0.5 shadow-lg shadow-brand-500/30' : 'bg-white/5 opacity-50 cursor-not-allowed'}`}
                   >
                     <img src={assets.send_button} alt="Send" className="w-4 ml-0.5" />
                   </button>
                 </form>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar pb-2">
              {rooms.length === 0 ? (
                <div className="text-center py-10 glass-panel rounded-[1.5rem] text-gray-500 text-sm border-dashed">
                  <div className="w-12 h-12 bg-white/5 rounded-full mx-auto flex items-center justify-center mb-4">
                     <span className="text-xl">📡</span>
                  </div>
                  No active signal found in this radius.<br/>Generate a new hub.
                </div>
              ) : (
                rooms.map((room) => {
                  const isOwner = getRoomCreatorId(room) === getSenderId(authUser?._id);

                  return (
                    <div key={room._id} onClick={() => handleEnterRoom(room)} className="glass-panel hover:bg-white/5 border border-white/5 hover:border-brand-500/50 p-5 rounded-2xl transition-all duration-300 flex justify-between items-center group cursor-pointer shadow-lg shadow-black/20">
                      <div>
                        <h3 className="font-semibold font-heading text-lg text-white group-hover:text-brand-400 transition-colors">{room.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          <p className="text-xs text-gray-400 font-sans">~{Math.round(room.distanceFromUser)}m away</p>
                          {room.creatorName && (
                            <>
                              <span className="text-gray-600">•</span>
                              <p className="text-xs text-amber-400/80 font-sans">Host: {room.creatorName}</p>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center group-hover:bg-brand-500 group-hover:text-white transition-colors">
                           <img src={assets.arrow_icon} alt="Enter" className="w-4 rotate-180 opacity-80" />
                        </div>

                        {isOwner && (
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (window.confirm(`Are you sure you want to permanently close "${room.name}"?`)) {
                                await deleteRoom(room._id);
                              }
                            }}
                            className="w-8 h-8 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                            title="Close Room"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {/* Join Private Room Section */}
              <div className="mt-4 glass-panel rounded-2xl border border-purple-500/20 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-purple-500/10">
                  <svg className="w-3.5 h-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-xs font-semibold uppercase tracking-widest text-purple-400">Join Private Room</span>
                </div>
                <form onSubmit={handleJoinPrivate} className="flex gap-2 p-3">
                  <input
                    type="text"
                    value={inviteInput}
                    onChange={(e) => setInviteInput(e.target.value.toUpperCase())}
                    placeholder="NEIGH-XXXXXX"
                    className="flex-1 min-w-0 glass-input px-3 py-2.5 rounded-xl text-white placeholder-gray-600 text-xs font-mono tracking-wider"
                    maxLength={12}
                  />
                  <button
                    type="submit"
                    disabled={isJoining || !inviteInput.trim()}
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isJoining || !inviteInput.trim()
                        ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20'
                    }`}
                  >
                    {isJoining ? '...' : 'Join'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECOND HALF: MAP CANVAS */}
      <div className="h-1/2 md:h-full md:w-1/2 lg:w-[55%] w-full relative z-0 border-l border-white/5">
        <MapContainer center={userLocation} zoom={15} style={{ height: '100%', width: '100%', background: '#0f172a' }}>
          <TileLayer
            className="map-dark-tiles"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* User's Anchor Location Node */}
          <Marker position={userLocation}>
            <Popup className="premium-popup">
              <div className="text-white font-sans p-2">
                <span className="font-semibold font-heading text-brand-400 text-sm">Your Location</span><br/>
                <span className="text-xs text-gray-300">Searching from this point.</span>
              </div>
            </Popup>
          </Marker>

          {/* Map through active rooms and visually project fence markers */}
          {rooms.map((room) => {
            const roomCoords = [room.location.coordinates[1], room.location.coordinates[0]];
            return (
              <React.Fragment key={room._id}>
                <Circle 
                  center={roomCoords} 
                  radius={room.radius || 500} 
                  pathOptions={{ color: '#6366f1', fillColor: '#6366f1', fillOpacity: 0.1, weight: 1, dashArray: '4' }}
                />
                <Marker position={roomCoords}>
                  <Popup className="premium-popup">
                    <div className="text-white font-sans p-1 min-w-[120px]">
                      <strong className="text-brand-400 block text-base font-heading">{room.name}</strong>
                      <span className="text-xs text-gray-400 block mt-1">{Math.round(room.distanceFromUser)}m Offset</span>
                      <button 
                        onClick={() => handleEnterRoom(room)}
                        className="mt-3 w-full bg-brand-500 text-white text-xs font-semibold py-2 px-3 rounded-lg hover:bg-brand-400 transition-colors"
                      >
                        Launch
                      </button>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}
        </MapContainer>
        
        {/* Custom CSS to inject to override leaflet popup for dark mode */}
        <style dangerouslySetInnerHTML={{__html: `
          .leaflet-popup-content-wrapper {
            background: rgba(15, 23, 42, 0.9);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255,255,255,0.1);
            color: white;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          }
          .leaflet-popup-tip {
            background: rgba(15, 23, 42, 0.9);
            border: 1px solid rgba(255,255,255,0.1);
          }
          .leaflet-container a.leaflet-popup-close-button {
            color: #94a3b8;
          }
          .leaflet-control-zoom a {
            background-color: rgba(15, 23, 42, 0.9) !important;
            color: white !important;
            border-color: rgba(255,255,255,0.1) !important;
          }
          .map-dark-tiles {
            filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7);
          }
        `}} />
      </div>
    </div>
  );
}

export default MapDashboard;