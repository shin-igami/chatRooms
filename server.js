const express = require("express");
const path = require("path")
const http = require("http")
const socketio = require("socket.io")
const formatMessage = require("./utils/message")
const {
    userJoin,
    getCurrentuser,
    userLeave,
    getRoomUsers
} = require("./utils/users")


const app = express();
const server = http.createServer(app);
const io = socketio(server);
const admin = "ChatRooms Bot";

//static folder
app.use(express.static(path.join(__dirname, "public")))

//run when someone connect
io.on("connection", socket => {
    socket.on("joinRoom", ({ username, room }) => {
        const user = userJoin(socket.id, username, room);
        socket.join(user.room)

        //welcoming current user
        socket.emit("message", formatMessage(admin, "Welcome to ChatRooms"))

        //emit when a user connects
        socket.broadcast.to(user.room).emit("message", formatMessage(admin, `${user.username} has joined the chat`));

        //send users and room info
        io.to(user.room).emit("roomUsers", {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    })

    //listening for chat message
    socket.on("chatmessage", msg => {
        const user = getCurrentuser(socket.id);
        io.to(user.room).emit("message", formatMessage(user.username, msg));
    })

    //runs when user disconnect
    socket.on("disconnect", () => {
        const user = userLeave(socket.id)
        if (user) {
            io.to(user.room).emit("message", formatMessage(admin, `${user.username} has left the chat`));
        }

        //send users and room info
        io.to(user.room).emit("roomUsers", {
            room: user.room,
            users: getRoomUsers(user.room)
        })

    })
})



const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => {
    console.log(`listening on ${PORT}`)
})