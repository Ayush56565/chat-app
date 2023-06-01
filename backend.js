const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const formatmessage = require('./utils/messages');
const { userjoin, getcurrentuser, getroomusers, userleave } = require('./utils/users');
const botname = 'Chatbot';

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {

    socket.on('joinRoom', ({ username, room }) => {
        const user = userjoin(socket.id, username, room);
        socket.join(user.room);
        socket.emit('message', formatmessage(botname, 'Welcome to ChatApp!'));
        socket.broadcast.to(user.room).emit('message', formatmessage(botname, `${user.username} has joined the chat.`));

        io.to(user.room).emit('roomusers', {
            room: user.room,
            users: getroomusers(user.room)
        });
    })


    socket.on('chatmessage', (message) => {
        const user = getcurrentuser(socket.id);
        io.to(user.room).emit('message', formatmessage(user.username, message));
    });

    socket.on('disconnect', () => {
        const user = userleave(socket.id);
        if (user) {
            io.to(user.room).emit('message', formatmessage(botname, `${user.username} has left the chat.`));

            io.to(user.room).emit('roomusers', {
                room: user.room,
                users: getroomusers(user.room)
            });
        }
    });
})
const PORT = 5000 || process.env.PORT;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}
);