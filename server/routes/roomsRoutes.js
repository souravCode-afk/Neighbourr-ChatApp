import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { createRoom, getVisibleRooms, getRoomDetails, getRoomMessages, sendRoomMessage, deleteRoom, joinByInviteCode } from "../controllers/roomController.js";

const roomRouter = express.Router();


roomRouter.post("/create", protectRoute, createRoom);


roomRouter.get("/visible-rooms", protectRoute, getVisibleRooms);

// Join a private room via invite code (must be before /:id wildcard)
roomRouter.post("/join-private", protectRoute, joinByInviteCode);


roomRouter.get("/:id/messages", protectRoute, getRoomMessages);
roomRouter.post("/:id/messages", protectRoute, sendRoomMessage);


roomRouter.get("/:id", protectRoute, getRoomDetails);


roomRouter.delete("/:id", protectRoute, deleteRoom);

export default roomRouter;
