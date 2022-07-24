import React, { useEffect, useState, createContext } from "react";
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import style from './style.css';
import VideoGrid from '../videoGrid/index.js';

export const IoContext = createContext();

function Room (){

  const [socket, setSocket] = useState(null);

  const [user, setUser] = useState(false);
  const [userList, setUserList] = useState(false);
  const [chat, setChat] = useState(false);

  let { room } = useParams();

  useEffect(()=>{

    //Socket connection
    const socket = io.connect('http://www.free-chat-online.cf:8080/', {query: {"room": room}});
    setSocket(socket);

    //Socket event emitters
    socket.emit('newUserConnected');
    
    //Socket event listeners
    socket.on('getUser',(arg)=>{
      setUser(arg);
    });

    socket.on('getUserList',(arg)=>{
      setUserList(arg);
    });

    socket.on('getChat', (arg)=>{
      setChat(arg)
    });
  },[]);

  const sendMessage = (message)=>{
    socket.emit('newMessage', {message: message, user: user});
  };

  return (
    <>
      {user && userList ? 
        <IoContext.Provider value={socket}>
          <VideoGrid user={user} userList={userList}/>
        </IoContext.Provider>
      : 
        <></>
      }
      <hr/>
      <div>
        room: {room}
        <br/>
        user: {user ? user : <>Loading...</>}
        <br/>
        usuários na sala: {
          userList ?
            userList.map((user)=><li>{user}</li>)
            :
            <>Caregando...</>
        }
      </div>
      <div>
        <hr/>
        <div id='chatContainer'>
          {
            chat ?
            chat.map((message) => <div 
              className={message.user === user ? 'userMessage' : 'othersMessage'}
            >
              {message.user}
              <br/>
              {message.message}
            </div>)
            :
            <></>
          }
        </div>
        <input id='messageField' />
        <button id='sendButton' onClick={(e)=>{
          sendMessage(document.getElementById('messageField').value);
          document.getElementById('messageField').value = '';
        }}>Enviar</button>
      </div>
    </>
  );
}

export default Room;