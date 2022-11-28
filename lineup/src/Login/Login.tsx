import React, { useEffect, useRef, useState } from 'react';
import { useRender } from '../render';
import "./Login.css"
import { Button, TextField } from "@mui/material"
import { global } from '../state';
import { State } from '../../back/src/common/api.interface';
import anime from "animejs"


export default () => {
    const rd = useRender('login')
    const lastPage = useRef(global.state.page);
    const loginContRef = useRef<HTMLDivElement>(null);
    const loginBackgroundRef = useRef<HTMLDivElement>(null);
    const [field, setField] = useState({ name: "", pass: "" })

    const preValidate = () => {
        const animeTarget = (target : HTMLDivElement) => {
            anime({
                targets: target,
                keyframes: [
                    {
                        scale: 1.1,
                    },
                    {
                        scale: 1,
                    }
                ],
                elasticity : 0,
                duration: 1000
            })
        }

        if (field.name === "") {
            const login = (document.querySelector("#login-login")! as HTMLDivElement);
            animeTarget(login);
        }
        if (field.pass === "") {
            const pass = (document.querySelector("#login-pass")! as HTMLDivElement);
            animeTarget(pass);
        }
        console.log(field);
        return true;
    }

    useEffect(() => {
        if (global.state.page === "login") {
            if (global.state.page !== lastPage.current) {
                console.log("ANIME");
                anime({
                    targets: loginContRef.current!,
                    scale: 1,
                    opacity: 1,
                    duration: 1000
                })
                anime({
                    targets: loginBackgroundRef.current!,
                    opacity: 1,
                    duration: 4000
                })
                lastPage.current = global.state.page;
            }
        } else {
            anime({
                targets: loginContRef.current!,
                scale: 0.5,
                opacity: 0,
                duration: 0
            })
            anime({
                targets: loginBackgroundRef.current!,
                opacity: 0,
                duration: 0
            })
        }
    }, [global.state.page])

    return <>
        <div className='login-main-cont' ref={loginBackgroundRef} style={{
            backgroundImage: `url("/art/background.png")`,
        }}>
            <div className='login-field-cont' ref={loginContRef}>
                <div>
                    <div id="login-login" className='login-field-div'>
                        <TextField placeholder='User name' className='login-input' onChange={(e) => {
                            setField(a => ({ ...a, name: e.target.value }))

                        }}></TextField>
                    </div>
                    <div className='login-field-div' id="login-pass">
                        <TextField type="password" placeholder='Password' className='login-input' onChange={(e) => {
                            setField(a => ({ ...a, pass: e.target.value }))
                        }}></TextField>
                    </div>
                </div>
                <div className='login-button-cont'>
                    <div>
                        <Button style={{
                            backgroundColor: "#8a1414",
                        }} className='login-button' variant='contained'
                            onClick={() => {
                                if (preValidate()) {

                                }
                            }}
                        >Login</Button>
                    </div>
                    <div>
                        <Button style={{
                            backgroundColor: "#8a1414",
                        }} className='login-button' variant='contained'
                            onClick={() => {
                                if (preValidate()) {

                                }
                            }}
                        >New Account</Button>
                    </div>
                </div>
            </div>
        </div>
    </>
}
