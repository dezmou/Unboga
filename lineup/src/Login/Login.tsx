import React, { useEffect, useRef } from 'react';
import { useRender } from '../render';
import "./Login.css"
import { Button, TextField } from "@mui/material"
import { global } from '../state';
import { State } from '../../back/src/common/api.interface';


export default () => {
    const rd = useRender('login')
    const lastPage = useRef(global.state.page);
    const loginContRef = useRef<HTMLDivElement>(null);
    const loginBackgroundRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (global.state.page === "login") {
            if (global.state.page !== lastPage.current) {
                console.log("SPIN");
                loginContRef.current!.style.animation = "login-appear 0.7s ease forwards"
                loginBackgroundRef.current!.style.animation = "login-background-appear 2s ease forwards"
                lastPage.current = global.state.page;
            }
        }
    })

    return <>
        <div className='login-main-cont' ref={loginBackgroundRef} style={{
            backgroundImage: `url("/art/background.png")`,
        }}>
            <div className='login-field-cont' ref={loginContRef}>
                <div>
                    <div className='login-field-div'>
                        <TextField placeholder='User name' className='login-input' onChange={(e) => {
                            console.log(e.target.value);
                        }}></TextField>
                    </div>
                    <div className='login-field-div'>
                        <TextField type="password" placeholder='Password' className='login-input' onChange={(e) => {
                            console.log(e.target.value);
                        }}></TextField>
                    </div>
                </div>
                <div className='login-button-cont'>
                    <div>
                        <Button style={{
                            backgroundColor: "#8a1414",
                        }} className='login-button' variant='contained'>Login</Button>
                    </div>
                    <div>
                        <Button style={{
                            backgroundColor: "#8a1414",
                        }} className='login-button' variant='contained'>New Account</Button>
                    </div>
                </div>
            </div>
        </div>
    </>
}
