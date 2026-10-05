import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import dns from 'dns'
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
dns.setServers(["1.1.1.1", "8.8.8.8"])
import { Server } from "socket.io"
import roomRouter from "./routes/roomsRoutes.js";


const app = express();
const server = http.createServer(app)


const clientUrl = process.env.CLIENT_URL || "*";

export const io = new Server(server, {
    cors: { origin: clientUrl, credentials: true }
})


export const userSocketMap = {}; 


io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log("User Connected", userId);

    if (userId) userSocketMap[userId] = socket.id;

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log("User Disconnected", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap))
    })

    socket.on("join_room", (roomId) => {
        const normalizedRoomId = roomId?.toString();
        if (!normalizedRoomId) return;

        socket.join(normalizedRoomId);
        console.log(`User ${userId} joined room channel: ${normalizedRoomId}`);
    });


    socket.on("leave_room", (roomId) => {
        const normalizedRoomId = roomId?.toString();
        if (!normalizedRoomId) return;

        socket.leave(normalizedRoomId);
        console.log(`User ${userId} left room channel: ${normalizedRoomId}`);
    });
    
    socket.on("room_deleted", (roomId) => {
        if (!roomId) return;
        io.emit("room_was_removed", roomId);
    });

    socket.on("send_room_message", ({ roomId, text, senderName, clientMessageId }) => {
        const normalizedRoomId = roomId?.toString();
        if (!normalizedRoomId || !text?.trim()) return;

        socket.join(normalizedRoomId);

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


app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors({ origin: clientUrl, credentials: true }));


app.get("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/auth", userRouter)
app.use("/api/messages", messageRouter)
app.use("/api/rooms", roomRouter)

await connectDB();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log("Server is running on PORT:" + PORT));

