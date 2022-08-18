const express = require('express');
const http = require('http');
const { Server } = require('socket.io')
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv')

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['Get', 'post']
  }
})

const parties = []
app.use(cors())
dotenv.config({ path: './app.env' })

const PORT = process.env.PORT || 5000

io.on('connection', (socket) => {

  // sending the meeting code 
  socket.on('me', (data) => {
    socket.emit('getid', data)
  })


  // on user join the meething room
  socket.on('join', (room, id, name) => {
    socket.join(room)

    if (!parties.includes(id)) {
      parties.push({ id, name })
    }
    
    // for chacking how many users are there in meeting
    const size = io.sockets.adapter.rooms.get(room).size
    // console.log(size)

    // sending the user id to other users to make the call
    socket.broadcast.to(room).emit('user-connect', id, size, name)
    
    // tell the name to other
    socket.on('tellname', (name, id) => {
      socket.broadcast.to(room).emit('addname', name, id)
    })


    // disconnect event
    socket.on('disconnect', () => {
      const index = parties.findIndex((peer) => peer.id = id)
      if (index > -1) { // only splice array when item is found
        parties.splice(index, 1); // 2nd parameter means remove one item only
      }
      socket.broadcast.to(room).emit("user-disconnected", id)
    }) 
  })

  
  // user leave the meeting
  socket.on('user-left',(id, room) => {
      socket.leave(room)
      socket.disconnect()
      socket.broadcast.to(room).emit('user-disconnected',id)
  })


});


// <==========================Deployment====================================>
const __dirname1 = path.resolve()

if (process.env.Node_env === 'production') {

  app.use(express.static(path.join(__dirname1, 'frontend/my-app/build')))
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname1, 'frontend', 'my-app', 'build', 'index.html'))
  })

} else {
  app.get('/', (req, res) => {
    res.send('welcome')
  });
}

// </==========================Deployment===================================>


server.listen(PORT, () => {
  console.log('server is runing');
});

