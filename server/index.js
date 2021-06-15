const express = require('express')
const cors = require('cors')
const socket = require('socket.io')

const app = express();
app.use(cors);
app.use(express.json)
const frontEndOrigin= "http://localhost:3000"

const port = '3001'

const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})

io = socket(server, {
    cors: {
      origin: frontEndOrigin
    }
  });

io.on('connection', socket => {
    console.log('connected!')
    console.log(socket.id);

    socket.on('join_room',(data) => {
        socket.join(data);
        console.log('User joined room: ', data)
    });

    socket.on('send_message',(data) => {
        console.log(data)
        socket.to(data.room).emit("receive_message", data.content)
    });


    socket.on('disconnect', () => {
        console.log('User Disconnected')
    })
})