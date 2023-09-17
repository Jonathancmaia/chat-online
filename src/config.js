const dev = false;

let socketServer = "";
let peerServer = "";
let https = "";

if (dev) {
  socketServer = "http://localhost:7000";
  peerServer = "localhost";
  https = false;
} else {
  socketServer = "https://vps49384.publiccloud.com.br:7000";
  peerServer = "vps49384.publiccloud.com.br";
  https = true;
}

export default {
  socketServer: socketServer,
  peerServer: peerServer,
  https: https,
};
