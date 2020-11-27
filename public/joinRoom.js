function joinRoom(roomName) {
  // send room name to the server
  nsSocket.emit('joinRoom', roomName);

  nsSocket.on('historyCatchUp', history => {
    const messagesUl = document.querySelector('#messages');
    messagesUl.innerHTML = '';
    history.forEach(msg => {
      messagesUl.innerHTML += buildMsgHTML(msg);
    });
    messagesUl.scrollTo(0, messagesUl.scrollHeight);
  });

  nsSocket.on('updateMembers', num => {
    // update the room member total
    document.querySelector('.curr-room-num-users').innerHTML = `${num}
    <i class="fas fa-user"></i>
    `;

    document.querySelector('.curr-room-text').innerHTML = roomName;
  });

  let searchBox = document.querySelector('#search-box');

  // do this on every input
  searchBox.addEventListener('input', e => {
    let messages = document.querySelectorAll('.message-text');
    messages.forEach(msg => {
      if (
        msg.innerText.toLowerCase().indexOf(e.target.value.toLowerCase()) === -1
      ) {
        // the msg doesn't contain user search term
        msg.style.display = 'none';
      } else {
        msg.style.display = 'block';
      }
    });
  });
}
