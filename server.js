var cookie = require('cookie')
  , app = require('./app.js').app
  , sessionStore = require('./app.js').sessionStore;

var io = require('socket.io').listen(app);


/*
 * WebSocket server
 */
 
io.configure(function() {
  io.set('authorization', function(handshakeData, callback) {
    if (handshakeData.headers.cookie) {
      var cookies = handshakeData.headers.cookie;
      var sessionID = cookie.parse(cookies)['connect.sid'];
      sessionID = sessionID.split("s:")[1].split('.')[0];
      // check the express session store
      handshakeData.sessionID = sessionID;
      sessionStore.get(sessionID, function(err, session) {
        if (err) {
          // not found
          callback(err.message, false);
        } else {
          // found
          handshakeData.session = session;
          callback(null, true);
        }
      });
    } else {
      return callback(null, true);
      // socket.io-client from node process dosen't has cookie
      // return callback('Cookie dosen\'t found', false);
    }
  });
});

io.configure('production', function() {
  // io.enable('browser client etag');
  io.set('log level', 1);
  io.set('transports', [
    'websocket'
  , 'flashsocket'
  , 'xhr-polling'
  , 'htmlfile'
  , 'jsonp-polling'
  ]);
  io.set('browser client minification', true);
  io.set('browser client gzip', true);
});

io.configure('development', function() {
  //io.set('log level', 1);
  io.set('transports', [
    'websocket'
  , 'flashsocket'
  , 'xhr-polling'
  , 'htmlfile'
  , 'jsonp-polling'
  ]);
//  io.set('transports', ['websocket']);
});

var viewer = 0;

io.sockets.on('connection', function(socket) {

  // count viewer
  viewer++;
  socket.broadcast.emit('viewer', viewer);
  socket.emit('viewer', viewer);
  socket.on('disconnect', function() {
    viewer > 2 ? viewer--: false;
    socket.broadcast.emit('viewer', viewer);
  	socket.emit('viewer', viewer);
  	socket.broadcast.emit('mouse hide', socket.handshake.sessionID);
    console.log('disconnected');
  });

  // move slide by admin
  socket.on('go', function(to) {
    if (!socket.handshake.session) return false;
    if (!socket.handshake.session.admin) return false;
    socket.broadcast.emit('go', to);
  });

  // send camera image
  socket.on('img send', function(data) {
    socket.volatile.broadcast.emit('img push', {img:data.img});
    socket.volatile.emit('img push', {img:data.img});
  });
  
  
  socket.on('mouse onmove', function(data) {
    data.sid = socket.handshake.sessionID;    
    socket.volatile.broadcast.emit('mouse onmove', data);
  });  

  socket.on('dropbomb', function(data) {
  	console.log(data);
    socket.broadcast.emit('dropbomb', data);
  });  

  socket.on('reset', function() {
    if (!socket.handshake.session) return false;
    if (!socket.handshake.session.admin) return false;
    socket.broadcast.emit('reset');
    socket.emit('reset');
  });  
  
});

process.on('uncaughtException', function(err) {
  console.error('uncoughtException: ' + err);
});