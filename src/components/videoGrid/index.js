import React, { useEffect, useContext } from "react";
import { Peer } from "peerjs";
import { IoContext } from "../room/index.js";
import { style } from "./style.css";
import Enviroment from "../../config.js";

function VideoGrid(props) {
  const user = props.user;
  const userList = props.userList;
  let mediaHandler = null;

  const socket = useContext(IoContext);

  useEffect(() => {
    //Peerjs setup
    const peer = new Peer(user, {
      host: Enviroment.peerServer,
      port: 9000,
      path: "/",
      secure: Enviroment.https,
      debug: true,
    });

    //Start videos events
    document.addEventListener("addedVideo", (e) => {
      let userVideo = e.detail.user;
      let video = document
        .getElementById(e.detail.user)
        .getElementsByTagName("video")[0];
      video.muted = true;
      video.play();

      //Video vollume control creation
      if (e.detail.user !== user) {
        let vollumeController = document.createElement("span");
        vollumeController.setAttribute("class", "vollumeController");
        document.getElementById(e.detail.user).append(vollumeController);
        let vollumeRange = document.createElement("input");
        vollumeRange.setAttribute("type", "range");
        vollumeRange.setAttribute("class", "vollumeRange");
        vollumeRange.setAttribute("min", "0");
        vollumeRange.setAttribute("max", "100");
        vollumeRange.setAttribute("value", "0");
        vollumeRange.setAttribute("orient", "vertical");

        vollumeController.append(vollumeRange);
        vollumeController.addEventListener("change", (e) => {
          if (video.muted) {
            video.muted = false;
            video.volume = parseFloat(vollumeRange.value / 100);
          } else {
            video.volume = parseFloat(vollumeRange.value / 100);
          }
        });
      }
    });

    //Set user media
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: {
          width: 300,
          height: 300,
          facingMode: "user",
        },
      })
      .then((stream) => {
        addVideo(stream, user);
        mediaHandler = stream;

        for (let i = 0; i < userList.length; i++) {
          if (userList[i] !== user) {
            let call = peer.call(userList[i], stream);

            call.on("stream", function(stream) {
              if (document.getElementById(userList[i]) === null) {
                addVideo(stream, userList[i]);
              }
            });
          }
        }
      })
      .catch(function() {
        //USER HAVENT CAMERA
        navigator.mediaDevices
          .getUserMedia({
            audio: true,
            video: false,
          })
          .then((stream) => {
            addVideo(stream, user);
            mediaHandler = stream;

            for (let i = 0; i < userList.length; i++) {
              if (userList[i] !== user) {
                let call = peer.call(userList[i], stream);

                call.on("stream", function(stream) {
                  if (document.getElementById(userList[i]) === null) {
                    addVideo(stream, userList[i]);
                  }
                });
              }
            }
          })
          .catch(function() {
            //CLIENT HAVENT CAMERA AND MICROPHONE
            for (let i = 0; i < userList.length; i++) {
              if (userList[i] !== user) {
                peer.connect(userList[i]);
              }
            }
          });
      });

    peer.on("call", function(call) {
      call.answer(mediaHandler);

      call.on("stream", function(stream) {
        if (document.getElementById(call.peer) === null) {
          addVideo(stream, call.peer);
        }
      });
    });

    //Call to a non video/audio user
    peer.on("connection", function(conn) {
      if (mediaHandler !== null) {
        peer.call(conn.peer, mediaHandler);
      }
    });

    function addVideo(stream, id) {
      //Video container creation
      let videoContainer = document.createElement("div");
      videoContainer.setAttribute("class", "videoContainer");
      let userIdSpan = document.createElement("span");
      userIdSpan.textContent = id;
      userIdSpan.setAttribute("class", "videoId");
      videoContainer.setAttribute("id", id);
      document.getElementById("videoGrid").append(videoContainer);
      document.getElementById(id).append(userIdSpan);

      //Video element creation
      let video = document.createElement("video");

      try {
        video.setAttribute("width", "250");
        video.setAttribute("height", "250");
        video.srcObject = stream;
      } catch (err) {
        console.log(err);
      }

      if (id === user) {
        video.muted = true;
      }

      document.getElementById(id).append(video);

      //Start video event
      let addedVideo = new CustomEvent("addedVideo", { detail: { user: id } });
      document.dispatchEvent(addedVideo);

      //Create an AudioContext and AnalyserNode for the video stream
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;

      source.connect(analyser);

      //Create a function to calculate the sound level in decibels
      function calculateDbLevel() {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        const values = dataArray.reduce((acc, val) => acc + val, 0);
        const average = values / dataArray.length;
        const dbLevel = 20 * Math.log10(average / 128);
        return dbLevel;
      }

      //Add a CSS class to the video element when the sound level reaches a certain threshold
      const THRESHOLD_DB = -40;
      const INTERVAL_MS = 100;
      setInterval(() => {
        const dbLevel = calculateDbLevel();
        if (dbLevel > THRESHOLD_DB) {
          video.classList.add("sound-active");
          console.log(dbLevel);
        } else {
          video.classList.remove("sound-active");
          console.log(dbLevel);
        }
      }, INTERVAL_MS);
    }

    //Socket event
    socket.on("removeVideo", (id) => {
      if (document.getElementById(id) !== null) {
        document.getElementById(id).remove();
      }
    });
  }, []);

  return <div id="videoGrid"></div>;
}

export default VideoGrid;
