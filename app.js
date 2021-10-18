const express = require('express');
const app = express();
const socket = require('socket.io');
const moment = require('moment'); 
// var sense = require("sense-hat-led").sync;
 
// sense.showMessage("One small step for Pi!");
// sense.showMessage("");
// sense.clear(255, 255, 255);
// sense.clear(0, 0, 0);
// sense.lowLight = true;
// sense.sleep(2);
// sense.lowLight = false; 

// Start Server / Listen to incoming requests 
const port = 5000 || process.env.PORT;  
const server = app.listen( port, ()=>console.log(`Listening on ${port}...`));

// Socket Setup
const serverOpts = { 
        cors: {
             origin: '*' 
            //  , origin: ['http://localhost:300', 'https://admin.socket.io/']
        }
        
    };
const io = socket(server, serverOpts);

// Two methods to initialize socket
    // Method 1
        // const socket = require('socket.io');
        // const io = socket(server);
    // Method 2
        // const { Server } = require("socket.io");
        // const io = new Server(server)
    // Method 3
        // const io = require("socket.io")(3000);



// Home Dir
app.get('/', (req, res, next)=>{
    res.sendFile(`${__dirname}/public/index.html`);
});

// Static files
app.use(express.static('public'));    

const connectedUsers = {};

io.on('connection', socket =>{

    const socketId = socket.id;
    console.log('made connection!', socketId);
    
    
    socket.on('typing', username => {
        // broadcast -> this socket is emitting to all other sockets
        socket.broadcast.emit('typing', username);

    });
    
    socket.on('enteredChat', username => {
        connectedUsers[socketId] = username;
        io.emit('enteredChat', username, connectedUsers);

    });
    
    socket.on('nottyping', sid => {
        // broadcast -> this socket is emitting to all other sockets
        io.emit('nottyping', sid);

    });

    socket.on('sendMsg', data => {
        // emit to all
        const time = moment().calendar();  
        io.emit('sendMsg', {...data, time} );
        // sense.showMessage(data.message, 0.07, [11,160,215]);
        // sense.clear(0, 0, 0);

    });
    
    socket.on('disconnect', data =>{
        const deletedUser = connectedUsers[socketId];
        delete connectedUsers[socketId];
        io.emit('leavingChat', deletedUser, connectedUsers )
    });

    
    ///// EMITTING OPTIONS

    // // Emit to call connected sockets
    // io.emit('enteredChat', username, connectedUsers);

    // // from this socket to individual socketid (private message)
    // io.to(socketId).emit(/* ... */);
    
    // // from this socket to self (same socket)
    // socket.emit('something', 'Hey!');

    // // broadcast -> from this socket to all other sockets other than itself
    // socket.broadcast.emit('typing', username);
    
    
    
    ///// ROOM OPTIONS
    
    // // broadcast -> from this socket to all other sockets in this room other than itself
    // socket.broadcast.to(room).emit("new-message", message)
    
    // // broadcast -> from this socket to all sockets in this room including itself
    // socket.to(room).emit("new-message", message)

    // // to do - joining custom rooms
    // socket.on('join-room', room =>{
    //     // users can join multiple rooms
    //     socket.join(room);
    // });


});

