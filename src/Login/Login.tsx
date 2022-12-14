import { Button, TextField } from "@mui/material";
import anime from "animejs";
import { useEffect, useRef, useState } from 'react';
import { createUser, getLang, login, toast } from '../logic';
import { useRender } from '../render';
import { global } from '../state';
import "./Login.css";


export default () => {
    const rd = useRender('login')
    const lastPage = useRef(global.state.page);
    const loginContRef = useRef<HTMLDivElement>(null);
    const loginBackgroundRef = useRef<HTMLDivElement>(null);
    const [field, setField] = useState({ name: "", pass: "" })

    const preValidate = () => {
        const animeTarget = (target: HTMLDivElement) => {
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
                elasticity: 0,
                duration: 1000
            })
        }
        let error = ""
        field.name = field.name.toLowerCase()
        if (field.name === "") {
            const login = (document.querySelector("#login-login")! as HTMLDivElement);
            animeTarget(login);
            error += `${getLang("userEmpty")}<br/>`
        } else {
            if (!field.name.match(/^[0-9a-z]+$/)) {
                const login = (document.querySelector("#login-login")! as HTMLDivElement);
                animeTarget(login);
                error += `${getLang("userAlphaNum")}<br/>`
            }
            if (field.name.length > 15) {
                const login = (document.querySelector("#login-login")! as HTMLDivElement);
                animeTarget(login);
                error += `${getLang("userTooLong")}<br/>`
            }
        }

        if (field.pass === "") {
            const pass = (document.querySelector("#login-pass")! as HTMLDivElement);
            error += `${getLang("passEmpty")}<br/>`
            animeTarget(pass);
        }

        if (error !== "") {
            toast({ color: "#980000", msg: error, opened: true, time: 3000 })
            return false;
        }
        return true;
    }

    const applyLogin = () => {
        if (preValidate()) {
            login(field.name, field.pass)
        }
    }

    const creatUser = () => {
        if (preValidate()) {
            createUser(field.name, field.pass)
        }
    }

    useEffect(() => {
        if (global.state.page === "login") {
            if (lastPage.current !== "login") {
                anime({
                    targets: loginContRef.current!,
                    scale: 1,
                    opacity: 1,
                    duration: 1000
                })
                anime({
                    targets: loginBackgroundRef.current!,
                    opacity: 1,
                    duration: 4000,
                })
            }
        } else {
            if (lastPage.current === "login") {
                anime({
                    targets: loginContRef.current!,
                    scale: 0.5,
                    opacity: 0,
                    duration: 5000
                })
                anime({
                    targets: loginBackgroundRef.current!,
                    opacity: 0,
                    duration: 3000
                })
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
        }
        lastPage.current = global.state.page;
    }, [global.state.page])

    return <>
        <div className='login-main-cont' ref={loginBackgroundRef} style={{
            backgroundImage: `url("/art/background.png")`,
            pointerEvents: global.state.page === "login" ? "initial" : "none",
        }}>
            <div className='login-field-cont' ref={loginContRef}>
                <div>
                    <div id="login-login" className='login-field-div'>
                        <TextField placeholder={getLang("name")} className='login-input' onChange={(e) => {
                            setField(a => ({ ...a, name: e.target.value }))

                        }}></TextField>
                    </div>
                    <div className='login-field-div' id="login-pass">
                        <TextField type="password" placeholder={getLang("password")} className='login-input' onChange={(e) => {
                            setField(a => ({ ...a, pass: e.target.value }))
                        }}></TextField>
                    </div>
                </div>
                <div className='login-button-cont'>
                    <div>
                        <Button style={{
                            backgroundColor: "#8a1414",
                            fontSize: `calc(var(--fontSize) * 0.7)`,
                        }} className='login-button' variant='contained'
                            onClick={() => { applyLogin() }}
                        >{getLang("login")}</Button>
                    </div>
                    <div>
                        <Button style={{
                            backgroundColor: "#8a1414",
                            fontSize: `calc(var(--fontSize) * 0.7)`,
                        }} className='login-button' variant='contained'
                            onClick={() => { creatUser() }}
                        >{getLang("newAccount")}</Button>
                    </div>
                </div>
            </div>
        </div>
    </>
}
