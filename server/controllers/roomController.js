import mongoose from "mongoose";
import Room from '../models/Room.js';
import RoomMessage from "../models/RoomMessage.js";
import { io } from "../server.js";

// 1. Create a geo-fenced room
const createRoom = async (req, res) => {
  try {
    const { name, longitude, latitude, radius } = req.body;

    if (!name || longitude === undefined || latitude === undefined) {
      return res.status(400).json({ success: false, message: "Missing required parameters." });
    }
    const parsedRadius = radius ? parseInt(radius, 10) : 500;

    const parsedLng = Number(longitude);
    const parsedLat = Number(latitude);

    if (isNaN(parsedLng) || isNaN(parsedLat)) {
      return res.status(400).json({ success: false, message: "Coordinates must be valid numbers." });
    }

    const newRoom = await Room.create({
      name: name,
      creator: req.user._id, 
      location: {
        type: 'Point',
        coordinates: [parsedLng, parsedLat]
      },
      radius: parsedRadius 
    });

    res.json({ 
      success: true, 
      message: "Chatroom created successfully!", 
      room: newRoom 
    });

  } catch (error) {
    console.error("Room Creation Error Logged:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Internal database server error." 
    });
  }
};

// 2. Fetch nearby allowed rooms
const getVisibleRooms = async (req, res) => {
  try {
    const { lng, lat } = req.query;

    if (!lng || !lat) {
      return res.status(400).json({ success: false, message: "User coordinates (lng, lat) are required." });
    }

    const userLng = parseFloat(lng);
    const userLat = parseFloat(lat);

    const availableRooms = await Room.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [userLng, userLat]
          },
          distanceField: "distanceFromUser",
          spherical: true
        }
      },
      {
        $match: {
          $expr: { $lte: ["$distanceFromUser", "$radius"] }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      rooms: availableRooms
    });
  } catch (error) {
    console.error("Error fetching visible rooms:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// 3. Get detailed info about a single room
const getRoomDetails = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate("creator", "name profilePic");
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found." });
    }
    res.status(200).json({ success: true, room });
  } catch (error) {
    console.error("Error getting room details:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// 4. Get persisted room chat history
const getRoomMessages = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid room id." });
    }

    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found." });
    }

    const messages = await RoomMessage.find({ room: id })
      .populate("senderId", "fullName profilePic")
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("Error getting room messages:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Save and broadcast a room chat message
const sendRoomMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid room id." });
    }

    if (!text?.trim()) {
      return res.status(400).json({ success: false, message: "Message cannot be empty." });
    }

    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found." });
    }

    const newMessage = await RoomMessage.create({
      room: id,
      senderId: req.user._id,
      text: text.trim()
    });

    const populatedMessage = await newMessage.populate("senderId", "fullName profilePic");
    io.to(id.toString()).emit("receive_room_message", populatedMessage);

    res.status(201).json({ success: true, message: populatedMessage });
  } catch (error) {
    console.error("Error sending room message:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Delete room handler
const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found." });
    }

    if (room.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this room." });
    }

    await Room.findByIdAndDelete(req.params.id);
    await RoomMessage.deleteMany({ room: req.params.id });
    res.json({ success: true, message: "Room deleted successfully." });
  } catch (error) {
    console.error("Error deleting room:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  createRoom,
  getVisibleRooms,
  getRoomDetails,
  getRoomMessages,
  sendRoomMessage,
  deleteRoom
};
