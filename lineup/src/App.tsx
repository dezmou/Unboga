import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { useRender } from './render';
import state from "./state"
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
    {state.welcomed ? "welcomed" : "not welcomed"}
  </>
    ;
}

export default App;
