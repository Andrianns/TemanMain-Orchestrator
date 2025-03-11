const express = require('express');
const app = express();
const port = process.env.PORT || 4000;
const router = require('./routers/index');
const cors = require('cors');
const socket = require('socket.io');
const axios = require('axios');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const baseURLApp = process.env.BASE_URL_APP;
// 'https://temanmain-app-production.up.railway.app';
const baseURLUser = process.env.BASE_URL_USER;
// ('https://temanmain-user-production.up.railway.app');
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(router);
//tst
const server = app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

let io = socket(server, {
  cors: {
    origin: 'https://teman-main-d3ac4.web.app',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  socket.on('join_room', async (data) => {
    socket.join(data.roomName); //Data itu room numbernya
    const { data: chatList } = await axios({
      method: 'GET',
      url: `${baseURLUser}/chats/magnet/${data.magnetId}`,
      headers: {
        access_token: data.access_token,
      },
    });
    socket.emit('init_chat', chatList);
    console.log('user Joined the room ' + data.roomName);
  });
  socket.on('leave_room', (data) => {
    socket.leave(data);
    console.log('user disconnected');
  });
  //   socket.on("leave_room", () => {
  //     console.log("user disconnected");
  //   });

  socket.on('send_message', async (data) => {
    const { data: chat } = await axios({
      method: 'POST',
      url: `${baseURLUser}/chats`,
      headers: {
        access_token: data.access_token,
      },
      data: {
        MagnetId: data.magnetId,
        chat: data.content.chat,
      },
    });
    socket.to(data.room).emit('receive_message', data.content);
  });
});

app.post('/rtctoken', (req, res) => {
  const appID = '9046360bacb641249331f2077a1938b2';
  const appCertificate = 'd2601cd43ea54c98b5ea698a277c806c';
  const expirationTimeInSeconds = 3600;
  const uid = Math.floor(Math.random() * 100000);
  const role = req.body.isPublisher ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
  const channel = req.body.channel;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const expirationTimestamp = currentTimestamp + expirationTimeInSeconds;

  const token = RtcTokenBuilder.buildTokenWithUid(
    appID,
    appCertificate,
    channel,
    uid,
    role,
    expirationTimestamp
  );
  res.send({ uid, token });
});

// module.exports = server;
