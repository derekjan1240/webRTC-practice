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

// create home route
app.get('/host', (req, res) => {
    res.render('main', { user: 'host' });
});

app.get('/', (req, res) => {

    res.render('main', { user: 'guest' });
});

// Socket setup & pass server
const io = socket(server);
io.on('connection', (socket) => {

    console.log('made socket connection', socket.id);
    
    io.to(`${socket.id}`).emit('news', { 
        userId: socket.id 
    });

    // Handle typing event
    socket.on('readyStream', function(data){
        console.log('readyStream server!');
        socket.emit('startStream');
    });

    // Handle typing event
    socket.on('sendStream', function(data){
        console.log('sendStream!')
        console.log('content:', data.stream);
        // socket.broadcast.emit('showStream', data.stream);
        io.sockets.emit('showStream', data.stream);
    });

    // Handle typing event
    socket.on('againStream', function(data){
        console.log('againStream server!');
        socket.emit('againStream');
    });

});
