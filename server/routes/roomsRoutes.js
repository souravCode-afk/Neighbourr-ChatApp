import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { createRoom, getVisibleRooms, getRoomDetails, getRoomMessages, sendRoomMessage, deleteRoom } from "../controllers/roomController.js";

const roomRouter = express.Router();

// 1. Create a new geo-fenced room
roomRouter.post("/create", protectRoute, createRoom);

// 2. Fetch rooms visible to the user based on query coordinates (?lng=XX&lat=XX)
roomRouter.get("/visible-rooms", protectRoute, getVisibleRooms);

//  3. Persisted chat history and sends for a room
roomRouter.get("/:id/messages", protectRoute, getRoomMessages);
roomRouter.post("/:id/messages", protectRoute, sendRoomMessage);

//  4. Get detailed info about a specific room (Optional but highly useful)
roomRouter.get("/:id", protectRoute, getRoomDetails);

//  5. Delete a room (Optional - e.g., if the creator wants to close it)
roomRouter.delete("/:id", protectRoute, deleteRoom);

export default roomRouter;
