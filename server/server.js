const {instrument} = require("@socket.io/admin-ui")
const io = require("socket.io")(9000,{
    cors:{
        origin:['http://localhost:8080','https://admin.socket.io/'],
    }
})

//namespaces
const userInfo = io.of('/user')
userInfo.on('connection',(socket)=>{
    console.log('Connected user space of User Name:',socket.username)
})

//middleware
userInfo.use((socket,next)=>{
   if(socket.handshake.auth.token){
      socket.username = getUsernameFromToken(socket.handshake.auth.token)
      next()
   }else{
       next(new Error('Please send token 😀'))
   }
// console.log(socket.handshake.auth.token)
})

function getUsernameFromToken(token){
  return token  
}

io.on("connection",socket => {
    console.log(socket.id)
    socket.on('send-message',(message,room)=>{
        //broadcast is send message to other socket connnection expect sender
        if(room === ''){
            socket.broadcast.emit("receive-message",message)
        }else{
            //private room
            socket.to(room).emit("receive-message",message)
        }
    })
    socket.on('join-room',(room,callBackFun) =>{
        //joining custom room
        socket.join(room)
        if(room === '') return
        callBackFun(`Joined ${room}`)
    })
})


instrument(io,{auth:false})