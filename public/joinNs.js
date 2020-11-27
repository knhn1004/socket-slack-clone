function joinNs(endpoint) {
  if (nsSocket) {
    nsSocket.close();
    // remove event listener
    document
      .querySelector('#user-input')
      .removeEventListener('submit', formHandleSubmit);
  }
  nsSocket = io(`http://localhost:9000${endpoint}`);

  nsSocket.on('nsRoomLoaded', rooms => {
    let roomList = document.querySelector('.room-list');
    roomList.innerHTML = '';
    rooms.forEach(room => {
      roomList.innerHTML += `<li class="room" roomName="${room.roomTitle}">
	${
    room.privateRoom
      ? `
	    <i class="fas fa-lock"></i>
	    `
      : ''
  }
	${room.roomTitle}
	</li>`;
    });
    let roomNodes = document.querySelectorAll('.room');
    roomNodes.forEach(ele => {
      ele.addEventListener('click', e => {
        joinRoom(e.target.getAttribute('roomName'));
      });
    });

    // add room automatically ... first time here
    const topRoom = document.querySelector('.room');
    const topRoomName = topRoom.innerText;
    joinRoom(topRoomName);
  });

  nsSocket.on('messageToClients', msg => {
    console.log(msg);
    const newMsg = buildMsgHTML(msg);
    document.querySelector('#messages').innerHTML += newMsg;
  });

  document
    .querySelector('.message-form')
    .addEventListener('submit', formHandleSubmit);
}

const formHandleSubmit = event => {
  event.preventDefault();
  const messageBox = document.querySelector('#user-message');
  const newMessage = messageBox.value;
  messageBox.value = '';
  nsSocket.emit('newMessageToServer', newMessage);
};
