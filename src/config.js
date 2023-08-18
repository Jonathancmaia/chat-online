const dev = false;

let socketServer = "";
let peerServer = "";
let https = "";

if (dev) {
  socketServer = "http://localhost:7000";
  peerServer = "localhost";
  https = false;
} else {
  socketServer = "http://ec2-3-12-148-178.us-east-2.compute.amazonaws.com:7000";
  peerServer = "ec2-3-12-148-178.us-east-2.compute.amazonaws.com";
  https = false;
}

export default {
  socketServer: socketServer,
  peerServer: peerServer,
};
