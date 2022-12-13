import { Button } from '@mui/material';
import anime from 'animejs';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BOT_ID, START_GOLD, UserGame } from '../../common/src/game.interface';
import { audios, capitulate, choose, discard, exitLobby, knock, pickgreen, pickPower, pickRandom, ready, revenge } from '../logic';
import { render, useRender } from '../render';
import { global } from '../state';
import { powers } from "./../../common/src/powers";
import "./Game.css";

let selectedPowers: any = {}

const PowerCard = (p: { powerId: keyof typeof powers }) => {
    return <>
        <div className='power-picture grid' >
            <div className='power-picture-content' style={{
                backgroundImage: `url(powers/${powers[p.powerId].image})`
            }}>
            </div>
        </div>
        <div className='power-infos-content'>
            <div className={`power-infos-content-header ${p.powerId === "unknow" ? "blur" : ""}`}>
                <div>
                    {powers[p.powerId].name}
                </div>
                <div className='power-infos-gold'>
                    {powers[p.powerId].cost}
                </div>
            </div>
            <div className='power-infos-desc-flex'>
                <div className={`power-infos-description ${p.powerId === "unknow" ? "blur" : ""}`} dangerouslySetInnerHTML={{ __html: powers[p.powerId].description }}>
                </div>
            </div>
        </div>
    </>
}

const GameContent = () => {
    const rd = useRender();

    const board = useMemo(() => global.state.game!.board!, [global.state.game!.board])
    const you = useMemo(() => global.state.game!.you, [global.state.game])
    const vilain = useMemo(() => global.state.game!.villain, [global.state.game])
    const game = useMemo(() => global.state.game!, [global.state.game])

    const [overHero, setOverHero] = useState<undefined | keyof typeof powers>()

    useEffect(() => {
        if (!game.roundResult && !game.gameResult) {
            // if (game.nextAction === "discard" && game.nextActionPlayer === you) {
            //     audios.pomp.play()
            // }
            if ((game.nextAction === "pick" || game.nextAction === "choose") && game.nextActionPlayer === you) {
                if (game.player2Id === BOT_ID) {
                    // audios.pomp.play()
                } else {
                    audios.you.play()
                }
            }
        }
        if (game.gameResult) {
            if (game.gameResult.reason === "capitulate") {
                audios.close.play();
            }
        }

        if (game.roundResult) {
            if ((game.opStatus.ready || game.youStatus.ready) && game.player2Id !== BOT_ID) {

            } else {
                if (game.roundResult.reason === "knock_win") {
                    audios.knock.play()
                }
                if (game.roundResult.reason === "knock_lost") {
                    audios.fool.play()
                }
                if (game.roundResult.reason === "knock_full") {
                    audios.full.play()
                }
            }
        }

    }, [global.state.game])

    useEffect(() => {
        const root = document.documentElement
        if (game.nextAction === "selectHero") {
            for (let line of board) {
                for (let card of line) {
                    const delay = Math.random() * 300;
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
                            delay,
                        })
                    }
                }
            }
            audios.shuffle.play()
            setTimeout(() => {
                root.style.setProperty('--board-size', `calc(var(--board-width) * 0.45)`);
                root.style.setProperty('--top-height', `var(--top-min-height)`);
                if (!game.gameResult) {
                    root.style.setProperty('--button-zone-heigth', `3px`);
                }
                selectedPowers = {};
                rd();
            }, 800)
        }
    }, [global.state.game!.roundId])

    useEffect(() => {
        const root = document.documentElement
        if (game.nextAction !== "selectHero") {
            root.style.setProperty('--board-size', `var(--board-width)`);
            root.style.setProperty('--top-height', `var(--top-base-height)`);
            root.style.setProperty('--button-zone-heigth', `calc(var(--width) * 0.14)`);
        }
        if (game.gameResult) {
            root.style.setProperty('--button-zone-heigth', `calc(var(--width) * 0.14)`);
        }
    }, [game])

    const getBoardColor = (piece: UserGame["board"][number][number]) => {
        let points = piece.points;
        if (game.youStatus.powers.includes("eye")) {
            points = Math.floor(points / 2);
        }
        if ((game.justPicked && game.justPicked.x === piece.x && game.justPicked.y === piece.y)) {
            return `#051aa099`;
        }
        points = 14 - points;
        return `rgba(${points * 13},${points * 8},${points * 5},0.9)`;
    }

    const getPiecePicture = (piece: UserGame["board"][number][number]) => {
        if (game.pick) {
            if (game.pick.x === piece.x && game.pick.y === piece.y) {
                if (piece.status.inStreak) {
                    return "url(/green_lined.png)"
                } else {
                    return "url(/target.png)"
                }
            }
        }
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
        return "none"
    }

    const clickPiece = (piece: UserGame["board"][number][number]) => {
        if (isPieceClickable(piece)) {
            if (game.nextAction === "choose") {
                audios.pomp.play()
                choose(piece.x, piece.y)
            } else {
                audios.pomp.play()
                discard(piece.x, piece.y)
            }
        }
    }

    const isPieceClickable = (piece: UserGame["board"][number][number]) => {
        if (game.nextAction === "choose" && game.nextActionPlayer === you) {
            if (piece.status.status === "deck" && !(game.pick!.x === piece.x && game.pick!.y === piece.y)) {
                return true;
            }
            return false;
        }
        if (game.nextActionPlayer === you
            && game.nextAction === "discard"
            && !game.roundResult
            && piece.status.status === you
        ) {
            return true;
        }
        return false
    }

    const lineColors = {
        "futur": "green",
        "you": "blue",
        "none": "none",
    }

    const getSidePowers = (pows: (keyof typeof powers)[], you: boolean) => {
        return <div className='side-power'>
            <div className='side-power-center'>
                {pows.map((power, i) => <div
                    onMouseEnter={() => { setOverHero(power as keyof typeof powers) }}
                    onMouseLeave={() => { setOverHero(undefined) }}

                    key={i} className="power-circle" style={{
                        backgroundImage: `url(powers/${powers[power as keyof typeof powers].image})`,
                        marginTop: `calc(var(--width) * 0.02)`
                    }}>
                </div>)}
                {/* {Array.from({ length: 3 - pows.length }).map((e, i) => <div
                    key={i} className="power-circle" style={{
                        marginTop: `calc(var(--width) * 0.02)`,
                        background: you ? "#0c305b" : "#870000",
                    }}>
                </div>)} */}
            </div>
        </div>
    }

    return <>
        <div className='game-main-cont' style={{
            opacity: global.state.page === "game" ? "1" : "0",
            pointerEvents: global.state.page === "game" ? "initial" : "none",
            backgroundImage: "url(/velvet.jfif)"
        }}>
            <div className='board-main-layout'>
                {game.gameResult && <div className='endGame-cont grid'>
                    <div className='endGame-popup grid'>
                        <div>
                            <div className='endGame-title'>
                                GAME OVER
                            </div>
                            <div className='endGame-result'>
                                {(() => {
                                    if (game.gameResult.winner === "draw") {
                                        return <span style={{ color: "orange" }}>DRAW</span>
                                    } else {
                                        if (game.gameResult.winner === you && game.gameResult.reason === "win") {
                                            return <span style={{ color: "green" }}>YOU WON</span>
                                        } else if (game.gameResult.winner === you && game.gameResult.reason === "capitulate") {
                                            return <span style={{ color: "green" }}>SCUM CAPITULATED</span>
                                        } else if (game.gameResult.winner === vilain && game.gameResult.reason === "win") {
                                            return <span style={{ color: "red" }}>YOU LOST</span>
                                        } else if (game.gameResult.winner === vilain && game.gameResult.reason === "capitulate") {
                                            return <span style={{ color: "red" }}>YOU CAPITULATED</span>
                                        }
                                    }
                                    return <></>
                                })()}
                            </div>
                        </div>

                    </div>
                </div>}
                <div className='game-top-cont'>
                    <div className='game-top-buttons'>
                        <div className='game-top-button-player game-top-button-player1'>
                            {game.misc[you].name} ({game.misc[you].elo})
                        </div>
                        <div className='game-top-button-option'>
                            {!game.gameResult && <>
                                <Button style={{
                                    backgroundColor: "#a60000",
                                    width: "100%",
                                    height: "calc(var(--top-min-height) * 0.8) ",
                                }} className='login-button' variant='contained'
                                    onClick={() => {
                                        if (window.confirm("Capitulate ?")) {
                                            capitulate()
                                        }
                                    }
                                    }
                                >CAPITULATE</Button>
                            </>}
                        </div>
                        <div className='game-top-button-player game-top-button-player2'>
                            ({game.misc[vilain].elo}) {game.misc[vilain].name}
                        </div>
                    </div>
                    {game.nextAction !== "selectHero" && <>
                        <div className='top-power-cont'>
                            <div className='top-power-flex'>
                                <div className='top-powers'>
                                    {game.youStatus.powers!.map((power, i) => <div
                                        onMouseEnter={() => { setOverHero(power as keyof typeof powers) }}
                                        onMouseLeave={() => { setOverHero(undefined) }}

                                        key={i} className="power-circle" style={{
                                            backgroundImage: `url(powers/${powers[power as keyof typeof powers].image})`
                                        }}>
                                    </div>)}
                                </div>
                                <div className='top-powers'>
                                    {game.opStatus.powers && <>
                                        {[...game.opStatus.powers].reverse().map((power, i) => <div
                                            onMouseEnter={() => { setOverHero(power as keyof typeof powers) }}
                                            onMouseLeave={() => { setOverHero(undefined) }}
                                            key={i} className="power-circle" style={{
                                                backgroundImage: `url(powers/${powers[power as keyof typeof powers].image})`
                                            }}>
                                        </div>)}
                                    </>}

                                </div>
                            </div>
                        </div>

                    </>}
                </div>
                <div className='gold-cont'>
                    <div className='gold-value-cont'>
                        <div className='gold-value-flex'>
                            <div className='gold-value'>{game.youStatus.gold}</div>
                            <div className='gold-value-symb'></div>
                        </div>
                        <div className='gold-bar-cont'>
                            <div className='gold-bar-cont-little'>
                                <div className='gold-bar gold-bar-player1' style={{
                                    width: game.youStatus.gold <= 0 ? "0%" : `${Math.floor(game.youStatus.gold / (START_GOLD * 2) * 99)}%`
                                }}></div>
                                <div className='gold-bar gold-bar-player2' style={{
                                    width: game.opStatus.gold <= 0 ? "0%" : `${Math.floor(game.opStatus.gold / (START_GOLD * 2) * 99)}%`
                                }}></div>
                            </div>

                        </div>
                        <div className='gold-value-flex'>
                            <div className='gold-value-symb' style={{
                                filter: !game.roundResult && game.opStatus.powers && game.opStatus.powers.includes("fog") && game.opStatus.powers.length > 1 ? "blur(2px)" : "none"
                            }}></div>
                            <div className='gold-value' >{game.opStatus.gold}</div>
                        </div>
                    </div>
                </div>

                {overHero && <>
                    <div className='over-power-cont'>
                        <div className='power-content' style={{
                            // background: selectedPowers[power.id] ? "#259838" : "#0c305b",
                            // cursor: Object.keys(selectedPowers).length < 2 || selectedPowers[power.id] ? "pointer" : "initial",
                        }}>
                            <PowerCard powerId={overHero}></PowerCard>
                        </div>
                    </div>
                </>}

                <div className='points-cont'>
                    <div className='point-value'>
                        {game.youStatus.points} points
                    </div>
                    <div className='point-value'>
                        {game.opStatus.points !== undefined && <>{game.opStatus.points} points</>}
                    </div>
                </div>
                <div className='board-cont-grid grid'>
                    <div className='board-flex'>
                        {game.nextAction === "selectHero" && getSidePowers(game.youStatus.powers, true)}
                        <div className='board-cont' style={{
                            backgroundImage: "url(/wood.webp)",
                        }}>
                            {board.map((line, y) => <div className='board-line' key={y}>
                                {line.map((card, x) => <div className={`board-case`} id={`card_${card.id}`} key={x}
                                    onClick={() => {
                                        clickPiece(card)
                                    }}
                                // style={{
                                //     opacity : game.nextAction === "choose" ? (
                                //         card.status.status === "deck" ? "1" : "0.5"
                                //     ) : "1"
                                // }}
                                >

                                    <div className='board-case-background-effect' style={{
                                        background: getBoardColor(card),
                                    }}>
                                    </div>
                                    <div className='board-case-line-paint-cont'>
                                        <div className='board-case-line-paint-middle'>
                                            <div className='board-case-line' style={{
                                                opacity: card.status.hori !== "none" ? "0.8" : "0",
                                                background: card.status.status === vilain ? "#a20000" : lineColors[card.status.hori],
                                                transform: "scaleX(0.95)",
                                            }}></div>
                                            <div className='board-case-line' style={{
                                                opacity: card.status.verti !== "none" ? "0.8" : "0",
                                                transform: "rotate(90deg) scaleX(0.95)",
                                                background: card.status.status === vilain ? "#a20000" : lineColors[card.status.verti]
                                            }}></div>

                                            <div className='board-case-line' style={{
                                                opacity: card.status.diagNeg !== "none" ? "0.8" : "0",
                                                transform: "rotate(135deg) scaleX(1.2)",
                                                background: card.status.status === vilain ? "#a20000" : lineColors[card.status.diagNeg]
                                            }}></div>
                                            <div className='board-case-line' style={{
                                                opacity: card.status.diagPos !== "none" ? "0.8" : "0",
                                                transform: "rotate(45deg) scaleX(1.2)",
                                                background: card.status.status === vilain ? "#a20000" : lineColors[card.status.diagPos]
                                            }}></div>


                                        </div>
                                    </div>

                                    {card.status.villainRefused && <div className='case-forbid'>
                                    </div>
                                    }

                                    <div className='case-point' >
                                        {card.points}
                                    </div>
                                    <div className='case-piece-cont grid' >
                                        <div className='case-piece' style={{
                                            // backgroundImage: card.status.status === you ? "url(/blue_normal.png)" : "none",
                                            backgroundImage: getPiecePicture(card),
                                            // boxShadow: card.status.status === you ? `0px 0px 5px 0px #000000` : "none",
                                            cursor: isPieceClickable(card) ? "pointer" : "initial",
                                            boxShadow: (
                                                game.nextAction === "choose" &&
                                                game.nextActionPlayer === you &&
                                                card.status.status === "deck") ? "0px 0px 5px 0px #000000" : "none"
                                        }}>
                                        </div>
                                    </div>
                                </div>)}
                            </div>)}
                        </div>
                        {game.nextAction === "selectHero" && getSidePowers(game.opStatus.powers ? game.opStatus.powers : [], false)}
                    </div>

                </div>
                <div className='buttons-zone' style={{
                    opacity: global.localState.hideButtons ? "0" : 1,
                    pointerEvents: global.localState.hideButtons ? "none" : "initial",
                }}>
                    {!game.gameResult && <>
                        {!game.roundResult && <>
                            {/* {game.nextAction === "selectHero" && !game.youStatus.powerReady && <div className='button-cont grid'>
                                <Button style={{
                                    backgroundColor: "green",
                                }} className='login-button' variant='contained'
                                    onClick={() => { selectPowers(Object.keys(selectedPowers) as any) }}
                                >Ready</Button>
                            </div>} */}
                            {game.nextActionPlayer === you && <>
                                {game.nextAction === "pick" && <>
                                    <div className='pick-buttons'>
                                        <div>
                                            <Button style={{
                                                backgroundColor: "green",
                                                width: "calc(var(--width) * 0.5)",
                                                height: "var(--button-zone-heigth)",
                                            }} className='login-button' variant='contained'
                                                onClick={() => {
                                                    audios.pomp.play()
                                                    pickgreen()
                                                }}
                                            >Piece verte</Button>
                                        </div>
                                        <div>
                                            <Button style={{
                                                backgroundColor: "#a0641d",
                                                width: "calc(var(--width) * 0.5)",
                                                height: "var(--button-zone-heigth)",
                                            }} className='login-button' variant='contained'
                                                onClick={() => {
                                                    audios.pomp.play()
                                                    pickRandom()
                                                }}
                                            >Piece aleatoire</Button>
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
                        {game.roundResult && !game.youStatus.ready && <>
                            <div className='pick-knock'>
                                <div>
                                    <Button style={{
                                        backgroundColor: "green",
                                        width: "calc(var(--width) * 0.5)",
                                        height: "var(--button-zone-heigth)",
                                    }} className='login-button' variant='contained'
                                        onClick={() => { ready() }}
                                    >Round suivant</Button>
                                </div>
                            </div>
                        </>}
                    </>}
                    {game.gameResult && <>
                        <>
                            <div className='pick-buttons'>
                                <div>
                                    <Button style={{
                                        backgroundColor: "red",
                                        width: "calc(var(--width) * 0.5)",
                                        height: "var(--button-zone-heigth)",
                                    }} className='login-button' variant='contained'
                                        onClick={() => { exitLobby() }}
                                    >Retour au lobby</Button>
                                </div>
                                <div>
                                    {game.gameResult.revenge[vilain] !== "no" && <>
                                        <Button style={{
                                            backgroundColor: "green",
                                            width: "calc(var(--width) * 0.5)",
                                            height: "var(--button-zone-heigth)",
                                            opacity: game.gameResult.revenge[you] === "yes" ? "0.5" : "1",
                                            pointerEvents: game.gameResult.revenge[you] === "yes" ? "none" : "initial",
                                        }} className='login-button' variant='contained'
                                            onClick={() => { revenge() }}
                                        >Revanche</Button>
                                    </>}
                                </div>
                            </div>
                        </>
                    </>}

                </div>
                <div className='bottom-zone'>
                    <div className='power-select-cont' style={{
                        opacity: game.nextAction === "selectHero" && !game.youStatus.powerReady ? "1" : "0.5",
                        // pointerEvents: game.nextAction === "selectHero" && !game.youStatus.powerReady ? "initial" : "none",
                    }}>

                        {(Object.values(powers))
                            .filter(e => e.id !== "unknow")
                            .sort((a, b) => a.cost - b.cost)
                            .map((power, i) => <div className='power-cont grid' key={i} onClick={() => {
                                if (game.nextAction === "selectHero"
                                    && !game.youStatus.powerReady
                                    && !(game.youStatus.powers.filter(e => e === power.id).length === power.max)
                                ) {
                                    audios.choose.play();
                                    pickPower(power.id as keyof typeof powers)
                                }
                            }}
                                style={{
                                    opacity: game.youStatus.powers.filter(e => e === power.id).length === power.max ? "0.5" : "1",
                                    cursor: game.youStatus.powers.filter(e => e === power.id).length === power.max ? "initial" : "pointer",
                                    // pointerEvents: game.youStatus.powers.filter(e => e === power.id).length === power.max ? "none" : "initial",
                                }}
                            >
                                <div className='power-content' style={{
                                    // background: selectedPowers[power.id] ? "#259838" : "#0c305b",
                                    // cursor: Object.keys(selectedPowers).length < MAX_POWER_NUMBER || selectedPowers[power.id] ? "pointer" : "initial",
                                }}>
                                    <PowerCard powerId={power.id as keyof typeof powers}></PowerCard>
                                </div>
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
