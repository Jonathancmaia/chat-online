import React, {useState, useEffect} from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import Loading from './components/loading';

function App() {

  const [response, setResponse] = useState(false);

  useEffect(()=>{
    axios.get('http://free-chat-online.cf:7000').then( res => {
      setResponse(`/${res.data}`);
    });
  },[]);

  return (
    <div className="App">
      {response ? <Navigate to={response} /> : <Loading />}
    </div>
  );
}

export default App;
