const dev = false;

let socketServer = '';
let peerServer = '';

if (dev) {
  socketServer = 'http://localhost:7000';
  peerServer = 'localhost';
} else {
  socketServer = 'https://free-chat-online.cf:7000';
  peerServer = 'free-chat-online.cf';
}

export default {
  socketServer: socketServer,
  peerServer: peerServer,
};