import React, { useEffect, useRef, useState } from 'react';
import { useRender } from '../render';
import "./Toast.css"
import { global } from '../state';
import { State } from '../../back/src/common/api.interface';
import anime from "animejs"

export default () => {
    useRender("toast")
    return <>
        <div className='toast' style={{
            top: global.localState.toast.opened ? "-100px" : "0px",
        }}>
            chien
        </div>
    </>
}