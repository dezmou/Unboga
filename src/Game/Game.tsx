import anime from 'animejs';
import { useEffect, useMemo, useRef, useState } from 'react';
import { capitulate, selectPowers } from '../logic';
import { powers } from "./powers"
import { useRender, render } from '../render';
import { global } from '../state';
import "./Game.css";
import { Button } from '@mui/material';

const selectedPowers: any = {}

const GameContent = () => {
    const rd = useRender();

    const board = useMemo(() => global.state.game!.board!, [global.state.game!.board])
    const you = useMemo(() => global.state.game!.you, [global.state.game])
    const vilain = useMemo(() => global.state.game!.villain, [global.state.game])
    const game = useMemo(() => global.state.game!, [global.state.game])

    useEffect(() => {
        const root = document.documentElement
        if (game.nextAction === "selectHero") {
            for (let line of board) {
                for (let card of line) {
                    if (card.status.status === you) {
                        console.log("ANIME", card.id);
                        anime({
                            targets: `#card_${card.id} .case-piece`,
                            scale: "1.9",
                            opacity: 0,
                            duration: 0,
                        })
                        anime({
                            targets: `#card_${card.id} .case-piece`,
                            scale: "1",
                            opacity: 1,
                            // duration: 700,
                            delay: Math.random() * 300,
                            // elasticity: 1000,
                            // easing: "linear",
                        })
                    }
                }
            }
            setTimeout(() => {
                root.style.setProperty('--board-size', `calc(var(--board-width) * 0.6)`);
                root.style.setProperty('--top-height', `var(--top-min-height)`);
            }, 800)
        }
    }, [global.state.game!.id])

    const getBoardColor = (points: number) => {
        points = 14 - points;
        return `rgba(${points * 13},${points * 8},${points * 5},0.9)`;
    }

    return <>
        <div className='game-main-cont' style={{
            opacity: global.state.page === "game" ? "1" : "0",
            pointerEvents: global.state.page === "game" ? "initial" : "none",
        }}>
            <div className='board-main-layout'>
                <div className='game-top-cont'>
                    <div className='game-top-buttons'>
                        <button style={{ height: "100%" }} onClick={() => capitulate()}>Capitulate</button>
                    </div>
                </div>
                <div className='board-cont-grid grid'>
                    <div className='board-cont' style={{
                        backgroundImage: "url(/wood.webp)",
                    }}>
                        {board.map((line, y) => <div className='board-line' key={y}>
                            {line.map((card, x) => <div className={`board-case`} id={`card_${card.id}`} key={x} >
                                <div className='board-case-background-effect' style={{
                                    background: getBoardColor(card.points),
                                }}>
                                </div>
                                <div className='case-point' >
                                    {card.points}
                                </div>
                                <div className='case-piece-cont grid' >
                                    <div className='case-piece' style={{
                                        backgroundImage: card.status.status === you ? "url(/blue_normal.png)" : "none",
                                        boxShadow: card.status.status === you ? `0px 0px 5px 0px #000000` : "none",
                                    }}>
                                    </div>
                                </div>
                            </div>)}
                        </div>)}
                    </div>
                </div>
                <div className='infos-cont grid'>
                    <div>
                        Choose Heros powers<br />
                        2 maximum<br />
                    </div>
                </div>
                <div className='buttons-zone'>
                    {game.nextAction === "selectHero" && <div className='button-cont grid'>
                        <Button style={{
                            backgroundColor: "green",
                        }} className='login-button' variant='contained'
                            onClick={() => { selectPowers(Object.keys(selectedPowers) as any) }}
                        >Ready</Button>
                    </div>}

                </div>
                <div className='bottom-zone'>
                    <div className='power-select-cont'>
                        {Object.values(powers).map((power, i) => <div className='power-cont' style={{
                            background: selectedPowers[power.id] ? "#dadada" : "white"
                        }} key={i} onClick={() => {
                            if (selectedPowers[power.id]) {
                                delete selectedPowers[power.id];
                            } else {
                                if (Object.keys(selectedPowers).length < 2) {
                                    selectedPowers[power.id] = true;
                                }
                            }

                            rd();
                        }}>
                            <div className='power-picture'>

                            </div>
                            {power.name}

                        </div>)}
                    </div>
                </div>
            </div>
        </div>
    </>
}

export default () => {
    useRender('game')
    const lastPage = useRef(global.state.page);

    useEffect(() => {
        if (global.state.page === "game") {
            if (!global.state.game) {
                global.state.page = "lobby"
                render("global");
            }
        }
    }, [global.state.page])


    return <>
        {global.state.page === "game" && global.state.game && <GameContent></GameContent>}
    </>
}
