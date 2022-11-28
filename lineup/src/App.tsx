import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { useRender } from './render';
import { global } from "./state"
import Login from './Login/Login';
import Toast from './Toast/Toast';

function App() {
  const rd = useRender("global")

  useEffect(() => {
  }, [])

  return <>
    <div className='all'>
      <div className='view'>
        <Toast></Toast>
        <Login></Login>
      </div>
    </div>
  </>
    ;
}

export default App;
