import React, { useEffect, useRef, useState } from 'react';
import { useRender } from '../render';
import "./Lobby.css"
import { Button, TextField } from "@mui/material"
import { global } from '../state';
import { State } from '../../back/src/common/api.interface';
import anime from "animejs"
import { createUser, toast, login } from '../logic';


export default () => {
    const rd = useRender('lobby')
    const lastPage = useRef(global.state.page);

    useEffect(() => {
        if (global.state.page === "lobby") {

        }
    }, [global.state.page])

    return <>
        <div className='lobby-main-cont' style={{
            opacity: global.state.page === "lobby" ? "1" : 0,
        }}>
            {Object.values(global.lobby).map((user, i) => <div key={i}>
                {user.name}
            </div>)}
        </div>
    </>
}
