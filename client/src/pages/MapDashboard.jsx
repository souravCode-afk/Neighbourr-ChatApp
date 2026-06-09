import React, { useContext, useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { useRoom } from '../../context/RoomContext.jsx'; // Import the new hook
import { AuthContext } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icon configurations
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
  return typeof sender === "object" ? sender._id : sender;
};

function MapDashboard() {
  const [roomName, setRoomName] = useState('');
  const [roomInput, setRoomInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const roomScrollEnd = useRef(null);
  const { authUser } = useContext(AuthContext);

  // Grab values directly from your custom room context layout structure
  const { 
    rooms, 
    selectedRoom,
    roomMessages,
    userLocation, 
    setUserLocation, 
    fetchNearbyRooms, 
    createRoom, 
    setSelectedRoom,
    sendRoomMessage
  } = useRoom();

  // Track coordinates and update your unified context map coordinates
  useEffect(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]); // Stores coordinates globally in context
        fetchNearbyRooms(latitude, longitude); // Hits the pre-configured axios pipeline
      },
      (err) => {
        toast.error("Please enable location services: " + err.message);
      },
      { enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => {
    roomScrollEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [roomMessages, selectedRoom]);

  // Handle Room Creation through context pipeline
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!roomName.trim()) return toast.error("Please enter a room name.");
    if (!userLocation) return toast.error("Location data unavailable.");

    try {
      setIsSubmitting(true);
      
      // Pass standard object signature down to the API context handler
      const success = await createRoom({
        name: roomName,
        latitude: userLocation[0],
        longitude: userLocation[1]
      });

      if (success) {
        setRoomName('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
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
      <div className="h-screen w-full flex items-center justify-center bg-transparent text-white font-medium">
        <div className="text-center bg-gray-900/80 p-6 rounded-lg backdrop-blur">
          <p className="mb-2 animate-pulse">Synchronizing GPS coordinates...</p>
          <span className="text-xs text-gray-400">Unlocking localized chat rooms</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col md:flex-row bg-transparent text-white">
      
      {/* FIRST HALF: INTERFACE COLUMN */}
      <div className="h-1/2 md:h-full md:w-1/2 flex flex-col p-6 bg-gray-900/90 backdrop-blur border-b md:border-b-0 md:border-r border-gray-700 overflow-y-auto">
        <h1 className="text-2xl font-bold tracking-tight mb-6 text-indigo-400">📍 Spatial Chat Core</h1>
        
        {/* Module A: Create Room Form */}
        <div className="bg-gray-800/60 border border-gray-700 p-4 rounded-xl mb-6 shadow-inner">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3">Host a New Anchor Room</h2>
          <form onSubmit={handleCreateRoom} className="space-y-3">
            <div>
              <input 
                type="text" 
                placeholder="Give your local hub a title..." 
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-950 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
              />
            </div>
            <div className="text-xs text-gray-400 flex justify-between px-1">
              <span>Coordinates: {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}</span>
              <span className="text-indigo-400 font-semibold">Fixed Boundary: 500m</span>
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-medium py-2 rounded-lg text-sm transition-all duration-150 shadow"
            >
              {isSubmitting ? "Anchoring Point..." : "Generate Spatial Room"}
            </button>
          </form>
        </div>

        {/* Module B: Available Rooms Hub */}
        <div className="flex-1 flex flex-col min-h-0">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3 flex justify-between items-center">
            <span>{selectedRoom ? selectedRoom.name : "Unlocked Active Chambers"}</span>
            {selectedRoom ? (
              <button
                onClick={() => setSelectedRoom(null)}
                className="bg-gray-950 text-gray-300 border border-gray-700 hover:border-indigo-500 px-3 py-1 rounded-lg text-xs font-semibold transition-colors"
              >
                Back to Rooms
              </button>
            ) : (
              <span className="bg-indigo-950 text-indigo-400 border border-indigo-800 px-2.5 py-0.5 rounded-full text-xs font-bold">{rooms.length} Online</span>
            )}
          </h2>
          
          {selectedRoom ? (
            <div className="flex-1 min-h-0 flex flex-col bg-gray-950/60 border border-gray-800 rounded-xl overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {roomMessages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center text-gray-500 text-sm">
                    Start the local room conversation.
                  </div>
                ) : (
                  roomMessages.map((msg, index) => {
                    const isMine = getSenderId(msg.senderId) === authUser?._id;
                    const senderName = typeof msg.senderId === "object" ? msg.senderId.fullName : msg.senderName;
                    return (
                      <div key={`${msg.createdAt}-${index}`} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${isMine ? "bg-indigo-600 text-white rounded-br-sm" : "bg-gray-800 text-gray-100 rounded-bl-sm"}`}>
                          {!isMine && <p className="text-[11px] font-semibold text-indigo-300 mb-1">{senderName || "Neighbor"}</p>}
                          <p className="break-words">{msg.text}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={roomScrollEnd}></div>
              </div>
              <form onSubmit={handleSendRoomMessage} className="flex items-center gap-2 border-t border-gray-800 p-3">
                <input
                  value={roomInput}
                  onChange={(e) => setRoomInput(e.target.value)}
                  type="text"
                  placeholder="Message this room"
                  className="flex-1 min-w-0 rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  Send
                </button>
              </form>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {rooms.length === 0 ? (
                <div className="text-center py-8 bg-gray-950/40 border border-dashed border-gray-800 rounded-xl text-gray-500 text-sm">
                  No active geo-rooms locked here. Generate a fresh point above to sync up.
                </div>
              ) : (
                rooms.map((room) => (
                  <div key={room._id} className="bg-gray-950/60 border border-gray-800 hover:border-indigo-500 p-4 rounded-xl transition-all duration-200 flex justify-between items-center group">
                    <div>
                      <h3 className="font-semibold text-gray-100 group-hover:text-indigo-400 transition-colors">{room.name}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Approx. {Math.round(room.distanceFromUser)} meters from your signature.</p>
                    </div>
                    <button 
                      onClick={() => handleEnterRoom(room)}
                      className="bg-gray-800 hover:bg-indigo-600 border border-gray-700 hover:border-indigo-500 text-xs font-medium px-4 py-2 rounded-lg transition-all"
                    >
                      Enter Room
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* SECOND HALF: MAP CANVAS */}
      <div className="h-1/2 md:h-full md:w-1/2 w-full relative z-10">
        <MapContainer center={userLocation} zoom={15} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* User's Anchor Location Node */}
          <Marker position={userLocation}>
            <Popup>
              <div className="text-gray-900 font-sans">
                <span className="font-bold">Your Device Anchor</span><br/>
                Filtering room bounds from this radius marker.
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
                  pathOptions={{ color: '#4f46e5', fillColor: '#818cf8', fillOpacity: 0.15, weight: 2 }}
                />
                <Marker position={roomCoords}>
                  <Popup>
                    <div className="text-gray-900 font-sans p-1">
                      <strong className="text-indigo-700 block text-base">{room.name}</strong>
                      <span className="text-xs text-gray-500 block mt-0.5">Range Offset: {Math.round(room.distanceFromUser)}m</span>
                      <button 
                        onClick={() => handleEnterRoom(room)}
                        className="mt-2 w-full bg-indigo-600 text-white text-xs font-semibold py-1.5 px-3 rounded hover:bg-indigo-500 transition-colors"
                      >
                        Launch Interface
                      </button>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>

    </div>
  );
}

export default MapDashboard;
