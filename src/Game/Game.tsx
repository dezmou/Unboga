import anime from 'animejs';
import { useEffect, useMemo, useRef, useState } from 'react';
import { capitulate, discard, knock, pickgreen, pickRandom, selectPowers } from '../logic';
import { powers } from "./powers"
import { useRender, render } from '../render';
import { global } from '../state';
import "./Game.css";
import { Button } from '@mui/material';
import { Game, UserCard, UserGame } from '../../back/src/common/game.interface';

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
                            delay: Math.random() * 300,
                        })
                    }
                }
            }
            setTimeout(() => {
                root.style.setProperty('--board-size', `calc(var(--board-width) * 0.6)`);
                root.style.setProperty('--top-height', `var(--top-min-height)`);
            }, 800)
        }
    }, [global.state.game!.roundId])

    useEffect(() => {
        const root = document.documentElement
        if (game.youStatus.powerReady) {
            root.style.setProperty('--board-size', `var(--board-width)`);
            root.style.setProperty('--top-height', `var(--top-base-height)`);
        }
    }, [game])

    const getBoardColor = (piece: UserGame["board"][number][number]) => {
        if ((game.justPicked && game.justPicked.x === piece.x && game.justPicked.y === piece.y)) {
            return `#051aa099`;
        }
        let points = piece.points;
        points = 14 - points;
        return `rgba(${points * 13},${points * 8},${points * 5},0.9)`;
    }

    const getPiecePicture = (piece: UserGame["board"][number][number]) => {
        if (piece.status.status === you) {
            if (piece.status.inStreak) {
                return "url(/blue_lined.png)"
            } else {
                return "url(/blue_normal.png)"
            }
        } else if (piece.status.status === vilain) {
            if (piece.status.inStreak) {
                return "url(/red_lined.png)"
            } else {
                return "url(/red_normal.png)"
            }
        } else if (piece.status.status === "lost") {
            return "url(/empty.png)"
        }
        if (game.pick) {
            if (game.pick.x === piece.x && game.pick.y === piece.y) {
                return "url(/target.png)"
            }
        }
        return "none"
    }

    const clickPiece = (piece: UserGame["board"][number][number]) => {
        if (isPieceClickable(piece)) {
            discard(piece.x, piece.y)
        }
    }

    const isPieceClickable = (piece: UserGame["board"][number][number]) => {
        if (game.nextActionPlayer === you
            && game.nextAction === "discard"
            && !game.roundResult
            && piece.status.status === you
        ) {
            return true;
        }
        return false
    }

    return <>
        <div className='game-main-cont' style={{
            opacity: global.state.page === "game" ? "1" : "0",
            pointerEvents: global.state.page === "game" ? "initial" : "none",
            backgroundImage: "url(/velvet.jfif)"
        }}>
            <div className='board-main-layout'>
                <div className='game-top-cont'>
                    <div className='game-top-buttons'>
                        <button style={{ height: "100%" }} onClick={() => {
                            if (window.confirm("capitulate ??")) {
                                capitulate()
                            }
                        }}>Capitulate</button>
                    </div>
                </div>
                <div className='points-cont'>
                    <div className='point-value'>
                        {game.youStatus.points} points
                    </div>
                    <div className='point-value'>
                        {game.opStatus.points && <>{game.opStatus.points} points</>}
                    </div>
                </div>
                <div className='board-cont-grid grid'>
                    <div className='board-cont' style={{
                        backgroundImage: "url(/wood.webp)",
                    }}>
                        {board.map((line, y) => <div className='board-line' key={y}>
                            {line.map((card, x) => <div className={`board-case`} id={`card_${card.id}`} key={x}
                                onClick={() => {
                                    clickPiece(card)
                                }}
                            >
                                <div className='board-case-background-effect' style={{
                                    background: getBoardColor(card),
                                }}>
                                </div>

                                <div className='case-point' >
                                    {card.points}
                                </div>
                                <div className='case-piece-cont grid' >
                                    <div className='case-piece' style={{
                                        // backgroundImage: card.status.status === you ? "url(/blue_normal.png)" : "none",
                                        backgroundImage: getPiecePicture(card),
                                        // boxShadow: card.status.status === you ? `0px 0px 5px 0px #000000` : "none",
                                        cursor: isPieceClickable(card) ? "pointer" : "initial",
                                        transform: isPieceClickable(card) ? "scale(1.1)" : "none"
                                    }}>
                                    </div>
                                </div>
                            </div>)}
                        </div>)}
                    </div>
                </div>
                <div className='buttons-zone'>
                    {!game.roundResult && <>
                        {game.nextAction === "selectHero" && !game.youStatus.powerReady && <div className='button-cont grid'>
                            <Button style={{
                                backgroundColor: "green",
                            }} className='login-button' variant='contained'
                                onClick={() => { selectPowers(Object.keys(selectedPowers) as any) }}
                            >Ready</Button>
                        </div>}
                        {game.nextActionPlayer === you && <>
                            {game.nextAction === "pick" && <>
                                <div className='pick-buttons'>
                                    <div>
                                        <Button style={{
                                            backgroundColor: "green",
                                            width: "calc(var(--width) * 0.5)",
                                            height: "var(--button-zone-heigth)",
                                        }} className='login-button' variant='contained'
                                            onClick={() => { pickgreen() }}
                                        >Pick green</Button>
                                    </div>
                                    <div>
                                        <Button style={{
                                            backgroundColor: "#a0641d",
                                            width: "calc(var(--width) * 0.5)",
                                            height: "var(--button-zone-heigth)",
                                        }} className='login-button' variant='contained'
                                            onClick={() => { pickRandom() }}
                                        >Pick Random</Button>
                                    </div>
                                </div>
                            </>}
                            {game.canKnock && <>
                                <div className='pick-knock'>
                                    <div>
                                        <Button style={{
                                            backgroundColor: "green",
                                            width: "calc(var(--width) * 0.5)",
                                            height: "var(--button-zone-heigth)",
                                        }} className='login-button' variant='contained'
                                            onClick={() => { knock() }}
                                        >Knock {game.youStatus.points}</Button>
                                    </div>
                                </div>
                            </>}
                        </>}
                    </>}
                    {game.roundResult && <>
                        <div className='pick-knock'>
                            <div>
                                <Button style={{
                                    backgroundColor: "green",
                                    width: "calc(var(--width) * 0.5)",
                                    height: "var(--button-zone-heigth)",
                                }} className='login-button' variant='contained'
                                    onClick={() => { knock() }}
                                >Ready</Button>
                            </div>
                        </div>
                    </>}
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
                <div className='infos-cont grid'>
                    <div>
                        <div className='info-line'>{game.infos.line1}</div>
                        <div className='info-line'>{game.infos.line2}</div>
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
