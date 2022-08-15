import React, {useState, useEffect} from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import Loading from './components/loading';
import Enviroment from './config.js';

function App() {

  const [response, setResponse] = useState(false);

  useEffect(()=>{
    axios.get(Enviroment.socketServer).then( res => {
      setResponse(`/${res.data}`);
    });
  },[]);

  return (
    <div className="app">
      {response ? <Navigate to={response} /> : <Loading />}
    </div>
  );
}

export default App;
