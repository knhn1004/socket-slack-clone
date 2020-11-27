const express = require('express');
const socketio = require('socket.io');

const app = express();

app.use(express.static(__dirname + '/public'));

const expressServer = app.listen(9000);

const io = socketio(expressServer);

let namespaces = require('./data/namespaces');

io.on('connection', socket => {
  console.log(socket.handshake);
  let nsData = namespaces.map(({ img, endpoint }) => ({
    img,
    endpoint,
  }));
  // console.log(nsData);

  // send the nsData back to client
  // use socket instead of io because we want only to the specific client
  socket.emit('nsList', nsData);
});

// loop through each namespace and listen for a connection
namespaces.forEach(ns => {
  io.of(ns.endpoint).on('connection', nsSocket => {
    console.log(`${nsSocket.id} has joined ${ns.endpoint}`);
    const username = nsSocket.handshake.query.username;

    nsSocket.emit('nsRoomLoaded', ns.rooms);

    nsSocket.on('joinRoom', roomToJoin => {
      // deal with history...
      const roomToLeave = Array.from(nsSocket.rooms)[0];
      nsSocket.leave(roomToLeave);
      updateUsersInRoom(ns, roomToLeave);
      nsSocket.join(roomToJoin);
      // numberOfUsersCB(clientsNum); // number of users

      updateUsersInRoom(ns, roomToJoin);

      const nsRoom = ns.rooms.find(room => room.roomTitle === roomToJoin);
      nsSocket.emit('historyCatchUp', nsRoom.history);
    });

    nsSocket.on('newMessageToServer', msg => {
      const fullMsg = {
        text: msg,
        time: Date.now(),
        username,
        avatar: '/user.png',
      };

      // send message to all the sockets in the room

      // the user will be in the 2nd room in the obj list
      // because the sockett always join its own room on connection
      const roomTitle = Array.from(nsSocket.rooms)[0];

      // find the room object for this room
      const nsRoom = ns.rooms.find(room => room.roomTitle === roomTitle);
      nsRoom.addMessage(fullMsg);

      io.of(ns.endpoint).to(roomTitle).emit('messageToClients', fullMsg);
    });
  });
});

async function updateUsersInRoom(ns, roomToJoin) {
  const clients = await io.of(ns.endpoint).in(roomToJoin).allSockets();
  const clientsNum = Array.from(clients).length;
  // send back the num of users num
  io.of(ns.endpoint).in(roomToJoin).emit('updateMembers', clientsNum);
}
