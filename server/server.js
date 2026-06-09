import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import dns from 'dns'
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
dns.setServers(["1.1.1.1","8.8.8.8"])
import {Server} from "socket.io"
import roomRouter from "./routes/roomsRoutes.js";

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app)

// Initialize socket.io server
export const io = new Server(server,{
    cors: {origin: "*"}
})

// Store online users
export const userSocketMap = {}; // {userId: socketId}

// Socket.io connection handler
io.on("connection",(socket)=>{
    const userId = socket.handshake.query.userId;
    console.log("User Connected",userId);

    if(userId) userSocketMap[userId] = socket.id;

    // Emit online users to all connected client
    io.emit("getOnlineUsers",Object.keys(userSocketMap));

    socket.on("disconnect",()=>{
        console.log("User Disconnected",userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers",Object.keys(userSocketMap))
    })
    // Handle joining a geo-fenced room chat layout
    socket.on("join_room", (roomId) => {
        const normalizedRoomId = roomId?.toString();
        if (!normalizedRoomId) return;

        socket.join(normalizedRoomId);
        console.log(`User ${userId} joined room channel: ${normalizedRoomId}`);
    });

    // Handle leaving a geo-fenced room channel
    socket.on("leave_room", (roomId) => {
        const normalizedRoomId = roomId?.toString();
        if (!normalizedRoomId) return;

        socket.leave(normalizedRoomId);
        console.log(`User ${userId} left room channel: ${normalizedRoomId}`);
    });

    // Handle live messages inside a specific room circle
    socket.on("send_room_message", ({ roomId, text, senderName, clientMessageId }) => {
        const normalizedRoomId = roomId?.toString();
        if (!normalizedRoomId || !text?.trim()) return;

        socket.join(normalizedRoomId);

        // Broadcasts to everyone physically inside this room who joined the socket room channel
        io.to(normalizedRoomId).emit("receive_room_message", {
            _id: clientMessageId || `${socket.id}-${Date.now()}`,
            room: normalizedRoomId,
            senderId: userId,
            senderName,
            text: text.trim(),
            createdAt: new Date()
        });
    });
})

// Middleware setup
app.use(express.json({limit: "10mb"}));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors({
    origin:'https://neighbourr-frontend.vercel.app',
    credentials: true
}));

// Routes setup
app.get("/api/status",(req,res)=>res.send("Server is live"));
app.use("/api/auth",userRouter)
app.use("/api/messages",messageRouter)
app.use("/api/rooms",roomRouter)
//Connect to MongoDB
await connectDB();

const PORT = process.env.PORT || 5000;
server.listen(PORT,()=>console.log("Server is running on PORT:" + PORT));

// Export server for vercel
