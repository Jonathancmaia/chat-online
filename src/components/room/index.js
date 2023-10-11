import React, { useEffect, useState, createContext } from "react";
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import style from './style.css';
import VideoGrid from '../videoGrid/index.js';
import Enviroment from '../../config.js';

export const IoContext = createContext();

function Room (){

  const [socket, setSocket] = useState(null);

  const [user, setUser] = useState(false);
  const [userList, setUserList] = useState(false);
  const [chat, setChat] = useState(false);
  const [nicknames, setNicknames] = useState(false);

  let { room } = useParams();

  useEffect(()=>{

    //Socket connection
    const socket = io.connect(Enviroment.socketServer, {query: {"room": room}});
    setSocket(socket);

    //Socket default event emitters
    socket.emit('newUserConnected');
    
    //Socket event listeners
    socket.on('getUser',(arg)=>{
      setUser(arg);
      document.getElementById('nickname').value = arg;
    });

    socket.on('getUserList',(arg)=>{
      setUserList(arg);
    });

    socket.on('getChat', (arg)=>{
      setChat(arg)
    });

    socket.on('getNickname', (arg)=>{
        setNicknames(arg);
    });
  },[]);

  const sendMessage = (message)=>{
    if ( message !== '' && message !== null && message !== undefined && message.length <= 100)
    socket.emit('newMessage', {message: message, user: user});
    document.getElementById('messageField').value = '';
  };

  const sendNickname = (nickname)=>{
    if(nickname !== '' && nickname !== null && nickname !== undefined && nickname.length <= 42){
      socket.emit('sendNickname', {nickname: nickname, user: user});
    }
  };

  const searchNickname = (id) => {
    let index;

    if (nicknames){
      index = nicknames.findIndex((obj) => {if (obj !== null) {
        return obj.user === id}
      });
    } else {
      index = -1;
    }
    
    if (index !== -1){
      return nicknames[index].nickname;
    } else {
      return id;
    }
  };

  return (
    <div className='room-container'>
      <div className='header'>
        ROOM: {room}
      </div>
      <div className='cam-n-text-container'>
        {user && userList ? 
          <IoContext.Provider value={socket}>
            <VideoGrid user={user} userList={userList}/>
          </IoContext.Provider>
        : 
          <></>
        }
        <div className='text-container'>
          <div className='gray-text chat-container'>
            <div className='chat-header'>
              <div>USER:</div>
              <div className='nickname-input-field'>
                <input id="nickname" placeholder="Set a nickname" className='nickname-input' onKeyDown={(e)=>{
                  var key = e.which || e.keyCode;
                  if (key == 13){
                    sendNickname(document.getElementById('nickname').value);
                  }
                }}/>
                <button className='nickname-button' onClick={(e)=>{
                  sendNickname(document.getElementById('nickname').value);
                }}>
                  Ok
                </button>
              </div>
            </div>
            <div className='chat-users'>
              USUÁRIOS NA SALA: {
                userList ?
                  userList.map((user)=><li>{
                    searchNickname(user)
                  }</li>)
                  :
                  <>Caregando...</>
              }
            </div>
            <div id='chatContainer'>
              {
                chat ?
                chat.slice(0).reverse().map((message) => <div 
                  className={message.user === user ? 'userMessage' : 'othersMessage'}
                >
                  <span className='sender-message'>{searchNickname(message.user)}</span>
                  <br/>
                  {message.message}
                </div>)
                :
                <></>
              }
            </div>
          </div>
          <input id='messageField' placeholder="Escreva sua mensagem..." onKeyDown={(e)=>{
            var key = e.which || e.keyCode;
            if (key == 13){
              sendMessage(document.getElementById('messageField').value);
            }
          }}/>
          <button id='sendButton' onClick={(e)=>{
            sendMessage(document.getElementById('messageField').value);
          }}>
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}

export default Room;