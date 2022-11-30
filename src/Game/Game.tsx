import { useEffect, useMemo, useRef } from 'react';
import { capitulate } from '../logic';
import { useRender } from '../render';
import { global } from '../state';
import "./Game.css";

const GameContent = () => {
    const board = useMemo(() => global.state.game!.board, [global.state.game!.board])
    const you = useMemo(() => global.state.game!.you, [global.state.game])
    const vilain = useMemo(() => global.state.game!.villain, [global.state.game])


    const getCardColor = (points: number) => {
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

                </div>
                <div className='board-cont-grid grid'>
                    <div className='board-cont' style={{
                        backgroundImage: "url(/wood.webp)",
                    }}>
                        {board.map((line, y) => <div className='board-line' key={y}>
                            {line.map((card, x) => <div className='board-case' key={x} >
                                <div className='board-case-background-effect' style={{
                                    background: getCardColor(card.points),
                                }}>
                                </div>
                                <div className='case-point' >
                                    {card.points}
                                </div>
                                <div className='case-piece-cont grid' >
                                    <div className='case-piece' style={{
                                        backgroundImage: card.status.status === you ? "url(/red_normal.png)" : "none",
                                        boxShadow: card.status.status === you ? `0px 0px 5px 0px #000000` : "none",
                                    }}>
                                    </div>
                                </div>
                            </div>)}
                        </div>)}
                    </div>
                </div>
                <button onClick={() => capitulate()}>Capitulate</button>
            </div>
        </div>
    </>
}

export default () => {
    useRender('game')
    const lastPage = useRef(global.state.page);

    useEffect(() => {
        if (global.state.page === "game") {

        }
    }, [global.state.page])


    return <>
        {global.state.page === "game" && <GameContent></GameContent>}
    </>
}
