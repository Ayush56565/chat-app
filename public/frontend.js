const chatform = document.getElementById('chat-form');
const chatmessages = document.querySelector('.chat-messages');
const roomname = document.getElementById('room-name');
const userlist = document.getElementById('users');

//get username and room id from url
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
})


//join chatrooom

const socket = io();
socket.emit('joinRoom', { username, room });
socket.on('roomusers', ({ room, users }) => {
    outputroomname(room);
    outputusers(users);
});

socket.on('message', (message) => {
    console.log(message);

    outputmessage(message);

    //scroll down
    chatmessages.scrollTop = chatmessages.scrollHeight;
})

chatform.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = e.target.elements.msg.value;

    socket.emit('chatmessage', msg);

    //clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});


//Prompt the user before leave chat room
document.getElementById('leave-btn').addEventListener('click', () => {
    const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
    if (leaveRoom) {
        window.location = '../index.html';
    }
});

function outputmessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta"> ${message.username} <span>${message.time}</span></p>
    <p class="text">
    ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

function outputroomname(room) {
    roomname.innerText = room;
}

function outputusers(users) {
    userlist.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}