import React, { useEffect, useRef, useState } from 'react';
import { useRender } from '../render';
import "./Toast.css"
import { global } from '../state';
import { State } from '../../common/src/api.interface';
import anime from "animejs"

export default () => {
    const rd = useRender("toast")

    useEffect(() => {
        const current = global.localState.toast;
        setTimeout(() => {
            if (global.localState.toast === current) {
                global.localState.toast.opened = false;
                rd();
            }
        }, current.time)
    }, [global.localState.toast])

    return <>
        <div className='toast' style={{
            top: global.localState.toast.opened ? "0px" : "-110px",
        }}>
            <div className='toast-content' style={{
                background: global.localState.toast.color
            }}>
                <div className='toast-text'>
                    <div dangerouslySetInnerHTML={{ __html: global.localState.toast.msg }}>
                    </div>
                </div>
            </div>
        </div>
    </>
}