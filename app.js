const express = require('express');
const app = express();
const socket = require('socket.io');
const moment = require('moment'); 

// Start Server / Listen to incoming requests 
const port = 3000;  // In prod, will usually use port 80 (http)/443 (https)
const server = app.listen( port, ()=>console.log(`Listening on ${port}...`));

// Socket Setup
const serverOpts = { 
        cors: { origin: '*' }
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
        socket.broadcast.emit('enteredChat', username);

    });
    
    socket.on('nottyping', sid => {
        // broadcast -> this socket is emitting to all other sockets
        io.emit('nottyping', sid);

    });

    socket.on('sendMsg', data => {
        // emit to all
        const time = moment().calendar();  
        io.emit('sendMsg', {...data, time} );

    });

    socket.on('disconnect', data => io.emit('leaving', connectedUsers[socketId]));

    // to individual socketid (private message)
    io.to(socketId).emit(/* ... */);

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