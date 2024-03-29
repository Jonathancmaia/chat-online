import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Room from './components/room';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import { style } from './reset-style.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <BrowserRouter basename='/free-chat-online/'>
    <Routes>
      <Route path='/' element={<App />} />
      <Route path='/:room' element={<Room />} />
    </Routes>
  </BrowserRouter>
);
