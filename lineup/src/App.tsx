import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { useRender } from './render';
import { global } from "./state"
import { isLoggued } from "./logic"

function Login() {
  const rd = useRender()

  return <>
    chien
  </>
}

function App() {
  const rd = useRender("global")

  useEffect(() => {
    isLoggued();
  }, [])

  return <>
    {global.localState.ready && <>
      <div className='all'>
        <div className='view'>
          <Login></Login>
        </div>
      </div>
    </>}
  </>
    ;
}

export default App;
