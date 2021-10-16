const express = require('express');
const app = express();
const socket = require('socket.io');
const moment = require('moment'); 
var sense = require("sense-hat-led").sync;
 
// sense.showMessage("One small step for Pi!");
// sense.showMessage("");
// sense.clear(255, 255, 255);
// sense.clear(0, 0, 0);
// sense.lowLight = true;
// sense.sleep(2);
// sense.lowLight = false; 

// Start Server / Listen to incoming requests 
const port = 3000;  // In prod, will usually use port 80 (http)/443 (https)
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
        // broadcast -> this socket is emitting to all other sockets
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
    
    // to individual socketid (private message)
    // io.to(socketId).emit(/* ... */);
    
    // To individual room - functions as broadcast - every user/connection is in a room with a name equal to their socketid
    // socket.to(room).emit("new-message", message)

    // to do - joining custom rooms
    socket.on('join-room', room =>{
        // users can join multiple rooms
        socket.join(room);
        

    });


});




// Root - Handle GET request
// app.get( '/' , ( req, res, next ) => {
        
//     // REQUEST: req - Object containing info about the request - console.dir(req);
//     console.log("Got a request! Pathname: ", req.path);
//     console.log("Hostname: ", req.hostname);
//     console.log("URL: ", req.url);
//     console.log("Headers: ", req.headers);
//     console.log("Method: ", req.method);
//     console.log("Params: ", req.query);             // local/param1/param1/
//     console.log("Query String: ", req.query);      // local/param1/param1/?query1=yes&query2=no -> {query1 : 'yes', query2 : 'no' }
//     console.log("Req Params: ", req.params);       // similar to req.query but used for matched routed -> https://stackoverflow.com/questions/18524125/req-query-and-req-param-in-expressjs
//     console.log("Req Body: ", req.body);            // Available on some requests only, like POST for example 

//     const { name = 'stranger'} = req.query;
    
//     // RESPONSE : res - Object allowing us to respond 
//     res.send(`<h1>Welcome home ${name}!</h1>`); // Respond with string - text/html - http://localhost:3000/?name=John
//     // Note: instead of using res.write() and res.end() Express allows us to simply use res.send() - headers are assumed/detected
//     // res.send() seems to end script execution as well

//     // Reponse with HTML file
//     // res.sendFile(`./index.html`, { root: __dirname } ); // Respond with html file - text/html
    
// } );




;