import React, {useEffect, useContext} from 'react';
import { Peer } from 'peerjs';
import { IoContext } from '../room/index.js';
import { style } from './style.css';

function VideoGrid(props){

  const user = props.user;
  const userList = props.userList;
  let mediaHandler = null;

  const socket = useContext(IoContext);

  useEffect(()=>{
    //Peerjs setup
    const peer = new Peer(
      user, {
        host: '/'
      }
    );

    //Set user media
    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        width: 300,
        height: 300,
        facingMode: 'user'
      }
    }).then( stream => {
      addVideo(stream, user);
      mediaHandler = stream;

      for (let i = 0; i < userList.length; i++){
        if (userList[i] !== user){
          let call = peer.call(userList[i], stream);
          
          call.on('stream', function(stream) {
            addVideo(stream, userList[i]);
          });
        }
      }
    }).catch(function(err) {
      console.log(err);
    });

    peer.on('call', function (call) {
      call.answer(mediaHandler);
      
      call.on('stream', function (stream) {
        addVideo(stream, call.peer);
      });
    });

    function addVideo(stream, id){

      //Video container creation
      let videoContainer = document.createElement('div');
      videoContainer.setAttribute('class', 'videoContainer');
      let userIdSpan = document.createElement('span');
      userIdSpan.textContent = id;
      userIdSpan.setAttribute('class', 'videoId');
      videoContainer.setAttribute('id', id);
      document.getElementById('videoGrid').append(videoContainer);
      document.getElementById(id).append(userIdSpan);

      //Video element creation
      let video = document.createElement('video');
      video.srcObject = stream;
      video.setAttribute('autoPlay', true);
      document.getElementById(id).append(video);
    }

    //Socket event
    socket.on('removeVideo',(id)=>{
      document.getElementById(id).remove();
    });
  },[]);

  return(
    <div id='videoGrid'>
    </div>
  );
};

export default VideoGrid;