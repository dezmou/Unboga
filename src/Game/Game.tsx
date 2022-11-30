import { useEffect, useRef } from 'react';
import { useRender } from '../render';
import { global } from '../state';
import "./Game.css";

export default () => {
    useRender('game')
    const lastPage = useRef(global.state.page);

    useEffect(() => {
        if (global.state.page === "game") {

        }
    }, [global.state.page])


    return <>
        <div className='game-main-cont grid' style={{
            opacity: global.state.page === "game" ? "1" : "0",
            pointerEvents: global.state.page === "game" ? "initial" : "none",
        }}></div>
        chien
    </>
}
