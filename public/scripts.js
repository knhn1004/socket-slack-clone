const username = prompt('what is your username?');

const socket = io('http://localhost:9000', {
  query: {
    username,
  },
}); // the 'namespace / endpoint'
let nsSocket = '';

socket.on('nsList', nsData => {
  console.log('the list of namespaces arrived!', nsData);
  let nsDiv = document.querySelector('.namespaces');
  nsDiv.innerHTML = '';

  nsData.forEach(ns => {
    nsDiv.innerHTML += `<div class="namespace" ns=${ns.endpoint}><img src="${ns.img}" /></div>`;
  });

  // add event listener
  document.querySelectorAll('.namespace').forEach(ele => {
    ele.addEventListener('click', () => {
      const nsEndpoint = ele.getAttribute('ns');
      // console.log(`${nsEndpoint}, I should go to now!`);
      joinNs(nsEndpoint);
    });
  });
});

function buildMsgHTML(msg) {
  const parsedDate = new Date(msg.time).toLocaleString();
  const msgHTML = `
    <li>
      <div class="user-image">
	<img src="${msg.avatar}" />
      </div>
      <div class="user-message">
	<div class="user-name-time">${msg.username} <span>${parsedDate}</span></div>
	<div class="message-text">${msg.text}</div>
      </div>
    </li>
  `;
  return msgHTML;
}
