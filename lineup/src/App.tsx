import React, { useEffect } from 'react';
import logo from './logo.svg';
import {io,connect} from "socket.io-client"
import './App.css';

function App() {

  useEffect(() => {
    console.log(window.location.origin);
    const socket = io(`${window.location.origin}`, {path : "/api"});
    console.log("CHIEN");
    // socket.on('chien', function(msg) {
    //   console.log(msg);
    // });

    // fetch("http://localhost:3001").then(res => {
    //   res.text().then(r => {
    //     console.log(r);
    //   })
    // })
  }, [])



  return <>
    chien
  </>
    ;
}

export default App;
