import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext.jsx";
import toast from "react-hot-toast";

export const RoomContext = createContext();

const getRoomId = (room) => {
    if (!room) return "";
    const id = typeof room === "object" ? room._id : room;
    return id?.$oid || id?.toString?.() || "";
};

const appendUniqueMessage = (messages, newMessage) => {
    if (messages.some((message) => message._id === newMessage._id)) {
        return messages;
    }

    return [...messages, newMessage];
};

export const RoomProvider = ({ children }) => {
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [roomMessages, setRoomMessages] = useState([]);
    const [userLocation, setUserLocation] = useState(null);

    const { socket, axios } = useContext(AuthContext);

    const fetchNearbyRooms = async (lat, lng) => {
        if (!lat || !lng) return;

        try {
            const { data } = await axios.get(`/api/rooms/visible-rooms?lng=${lng}&lat=${lat}`);
            if (data.success) {
                setRooms(data.rooms);
            }
        } catch (error) {
            console.error("Error loading rooms:", error);
            toast.error("Could not load nearby chatrooms.");
        }
    };

    const createRoom = async (roomData) => {
        try {
            const { data } = await axios.post("/api/rooms/create", roomData);
            if (data.success) {
                toast.success(data.message);
                if (userLocation) {
                    fetchNearbyRooms(userLocation[0], userLocation[1]);
                }
                return true;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to establish room.");
        }

        return false;
    };

    const getRoomMessages = async (roomId) => {
        if (!roomId) return;

        try {
            const { data } = await axios.get(`/api/rooms/${roomId}/messages`);
            if (data.success) {
                setRoomMessages(data.messages);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not load room messages.");
        }
    };

    const sendRoomMessage = async (text) => {
        if (!selectedRoom || !text.trim()) return false;

        try {
            const roomId = getRoomId(selectedRoom);
            const { data } = await axios.post(`/api/rooms/${roomId}/messages`, { text: text.trim() });
            if (data.success) {
                setRoomMessages((prevMessages) => appendUniqueMessage(prevMessages, data.message));
                return true;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not send room message.");
        }

        return false;
    };

    const deleteRoom = async (roomId) => {
    try {
        const { data } = await axios.delete(`/api/rooms/${roomId}`);
        if (data.success) {
            // 1. Update your own local UI array state instantly
            setRooms((prev) => prev.filter((room) => getRoomId(room) !== roomId));
            if (getRoomId(selectedRoom) === roomId) {
                setSelectedRoom(null);
                setRoomMessages([]);
            }

            if (socket) {
                socket.emit("room_deleted", roomId);
            }

            toast.success("Spatial room removed successfully.");
        }
    } catch (error) {
        toast.error(error.response?.data?.message || error.message);
    }
};

    useEffect(() => {
        if (!socket || !selectedRoom) return;

        const roomId = getRoomId(selectedRoom);
        setRoomMessages([]);
        getRoomMessages(roomId);
        socket.emit("join_room", roomId);

        const handleRoomMessage = (newRoomMessage) => {
            if (getRoomId(newRoomMessage.room) === roomId) {
                setRoomMessages((prevMessages) => appendUniqueMessage(prevMessages, newRoomMessage));
            }
        };

        socket.on("receive_room_message", handleRoomMessage);

        return () => {
            socket.emit("leave_room", roomId);
            socket.off("receive_room_message", handleRoomMessage);
        };
    }, [socket, selectedRoom]);
    
    useEffect(() => {
        if (!socket) return;

        const handleRoomRemoved = (deletedRoomId) => {
            // Remove from the dashboard side-list array immediately
            setRooms((prevRooms) => prevRooms.filter((room) => getRoomId(room) !== deletedRoomId));

            // Check if this user is currently sitting inside the blown-up room
            setSelectedRoom((currentRoom) => {
                if (currentRoom && getRoomId(currentRoom) === deletedRoomId) {
                    toast.error("The host has dissolved this spatial room anchor.");
                    setRoomMessages([]);
                    return null; // Boots them out back to room hub
                }
                return currentRoom;
            });
        };

        socket.on("room_was_removed", handleRoomRemoved);

        return () => {
            socket.off("room_was_removed", handleRoomRemoved);
        };
    }, [socket]);

    const value = {
        rooms,
        selectedRoom,
        roomMessages,
        userLocation,
        setRooms,
        setSelectedRoom,
        setRoomMessages,
        setUserLocation,
        fetchNearbyRooms,
        getRoomMessages,
        createRoom,
        deleteRoom,
        sendRoomMessage
    };

    return (
        <RoomContext.Provider value={value}>
            {children}
        </RoomContext.Provider>
    );
};

export const useRoom = () => useContext(RoomContext);
