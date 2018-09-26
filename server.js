const express = require('express');
const socket = require('socket.io');
// App setup
const app = express();
const server = app.listen(5000, function(){
    console.log('listening for requests on port 5000!');
});

// set view engine
app.set('view engine', 'ejs');
// Static files
app.use(express.static('public'));

app.get('/', function (req, res, next) {
    //res.sendFile(__dirname + '/index.html');
    res.render('peertopeer');
});

// Socket setup & pass server
const io = socket(server);
io.on('connection', (socket)=> {
    console.log('made socket connection', socket.id);

    io.to(`${socket.id}`).emit('news', { 
        userId: socket.id 
    });

    socket.on('candidate', function(data){
        "use strict";
        // console.log(data);
        console.log('handle candidate!')
        socket.broadcast.emit('msg', data);
    });

    socket.on('sdp', function(data){
        "use strict";
        // console.log(data);
        console.log('handle sdp!')
        socket.broadcast.emit('msg', data);
    });
});
