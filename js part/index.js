// Setup basic express server
var fs=require('fs');
fs.chmodSync('public/words.json', '777');
var data=fs.readFileSync('public/words.json');
var wordsbank=JSON.parse(data);
console.log(wordsbank);

var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var keeptrack = [];
var locationdic={};
server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, 'public')));

// Chatroom

var numUsers = 0;

io.on('connection', function (socket) {
  var addedUser = false;
  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    keeptrack.unshift(data);
    //console.log(keeptrack);

    if(keeptrack.length>10){
      keeptrack.pop();
    }
    //console.log(keeptrack);
    wordsbank["1"].unshift(data);
    if(wordsbank["1"].length>20){
      wordsbank["1"].pop();
    }
    console.log(wordsbank);
    var data1=JSON.stringify(wordsbank,null,2);
    fs.writeFile('public/words.json',data1,finished);
    function finished(err){
      console.log('all set.');
    }
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
    socket.broadcast.emit('addstring', data);
  });

  socket.on('new catcher', function (data) {
    //console.log("pppp",data);
    // we tell the client to execute 'new message'
    locationdic[data.username]={x1:data.x1,y1:data.y1,color:data.color};
    //console.log(locationdic);
    
    socket.broadcast.emit('catcher',locationdic);
  });

  socket.on('returnmsg', function (data) {
    // we tell the client to execute 'new message'
    console.log("recevied:",data);
    //socket.broadcast.emit('returnmsgclient',{username:data.username,message:data.sentence,typing:false});
    socket.broadcast.emit('returnmsgclient',{username:"",message:keeptrack[Math.floor((Math.random() * keeptrack.length))],typing:false});
  });

  socket.on('removeentry', function (data) {
    //console.log("pppp",data);
    // we tell the client to execute 'new message'
    delete locationdic[data.username];
    socket.broadcast.emit('catcher',locationdic);
  });

  
  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});
