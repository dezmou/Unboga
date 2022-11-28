import React, { useEffect } from 'react';
import { useRender } from '../render';
import "./Login.css"
import { Button, TextField } from "@mui/material"


export default () => {
    const rd = useRender('login')

    return <>
        <div className='login-main-cont' style={{
            backgroundImage: `url("/art/background.png")`,
        }}>
            <div className='login-field-cont'>
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
