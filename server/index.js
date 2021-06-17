const express = require('express')
const cors = require('cors')
const socket = require('socket.io')
const mongoose = require ('mongoose');

const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors);
app.use(express.json)
const frontEndOrigin= "http://localhost:3000"
const chatRooms = {}

const port = '3001'

const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})

mongoose.connect(process.env.MONGO_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  });

  const roomSchema = new mongoose.Schema({
    roomName: String,
    chats: [{}]
  });
  const ChatRoom = new mongoose.model("ChatRoom", roomSchema);

io = socket(server, {
    cors: {
      origin: frontEndOrigin
    }
  });

io.on('connection', socket => {
    console.log('connected: ', socket.id)

    socket.on('join_room', (data) => {
        socket.join(data)
        console.log(socket.id + " now in rooms ", socket.rooms);
        ChatRoom.findOne({roomName: data}, (err, chats) => {
            if(err){
                console.log('error: ', err);
            } else {
                console.log('chats: ', chats);
                if(chats){
                    chatRooms[data] = chats;
                } else {
                    chatRooms[data] = new ChatRoom ({
                        roomName: data
                    });
                }
                
                io.to(data).emit("populate_chats", chatRooms[data].chats)
                console.log(socket.id + " now in rooms ", socket.rooms);

            
                console.log('chatroom data: ', chatRooms[data].chats);
            }
        })

    });

    socket.on('send_message',(data) => {
        console.log(data)
        chatRooms[data.room].chats.push(data.content);
        chatRooms[data.room].save( err => {
            if(!err){
                socket.to(data.room).emit("populate_chats", chatRooms[data.room].chats);
            }
        })

        
    });


    socket.on('disconnect', () => {
        console.log('User Disconnected')
    })
})