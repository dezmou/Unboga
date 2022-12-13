import { Button } from "@mui/material";
import { useEffect, useRef } from 'react';
import { LobbyEntry } from '../../common/src/api.interface';
import { acceptChallenge, audios, cancelChallenge, challenge, playBot } from '../logic';
import { useRender } from '../render';
import { global } from '../state';
import "./Lobby.css";

const Challenge = (p: { challenge: LobbyEntry["challenge"] }) => {

    return <>
        <div className='challenge-main-cont' style={{
            opacity: p.challenge ? "1" : "0",
            pointerEvents: p.challenge ? "initial" : "none",
        }}>
            <div className='challenge-cont'>
                <div>
                    {p.challenge!.initiator === global.localState.user!.id && <>
                        <div className='challenge-text'>
                            You challenged {global.lobby[p.challenge!.player2].name} ({global.lobby[p.challenge!.player2].elo} ELO) !
                        </div>
                        <div className='challenge-buttons'>
                            <div>
                                <Button style={{
                                    backgroundColor: "#8a1414",
                                }} className='login-button' variant='contained'
                                    onClick={() => { cancelChallenge() }}
                                >Cancel</Button>
                            </div>
                        </div>
                    </>}
                    {p.challenge!.initiator !== global.localState.user!.id && <>
                        <div className='challenge-text'>
                            {global.lobby[p.challenge!.player1].name} ({global.lobby[p.challenge!.player1].elo} ELO) challenged you !
                        </div>
                        <div className='challenge-buttons-victim'>

                            <div>
                                <Button style={{
                                    backgroundColor: "green",
                                }} className='login-button' variant='contained'
                                    onClick={() => { acceptChallenge() }}
                                >Accept</Button>
                            </div>
                            <div style={{ marginLeft: "10px" }}>
                                <Button style={{
                                    backgroundColor: "#8a1414",
                                }} className='login-button' variant='contained'
                                    onClick={() => { cancelChallenge() }}
                                >Decline</Button>
                            </div>
                        </div>
                    </>}
                </div>
            </div>
        </div>
    </>
}

export default () => {
    useRender('lobby')
    const lastPage = useRef(global.state.page);

    useEffect(() => {
        // if (global.state.page !== lastPage.current && lastPage.current === "game" && global.state.page === "lobby") {
        //     audios.close.play()
        // }
        // lastPage.current = global.state.page;
    }, [global.state.page])

    const clickChallenge = (userId: string) => {
        challenge(userId);
    }

    return <>
        {global.state.page === "lobby" && global.lobby[global.localState.user!.id] && <>

            <div className='lobby-main-cont' style={{
                opacity: global.state.page === "lobby" ? "1" : 0,
                pointerEvents: global.state.page === "lobby" ? "initial" : "none",
            }}>

                <div className="lobby-title-cont">
                    <span style={{ color: "#4b0000" }}>Un</span>
                    nammed <span style={{ color: "#4b0000" }}>Bo</span>ard <span style={{ color: "#4b0000" }}>Ga</span>me

                </div>
                <div className="lobby-playbot-cont grid">
                    <div>
                        <Button style={{
                            backgroundColor: "#53ac62",
                            width: "calc( var(--width) * 0.5)",
                            height: "calc(var( --line-height) * 1)",
                            fontSize: `calc(var(--fontSize) * 0.7)`,
                        }} className='login-button' variant='contained'
                            onClick={() => { playBot() }}
                        >Play against computer</Button>
                    </div>

                </div>

                <div className="lobby-tab-cont">
                    <div className="lobby-users-cont">
                        {Object.values(global.lobby).sort((a, b) => b.elo - a.elo).map((user, i) => <div className="lobby-user-line" style={{
                            backgroundColor: i % 2 === 0 ? "#f5f5f5" : "#ffffff",
                        }} key={i}>
                            <div className="lobby-line-name">
                                <div style={{
                                    marginLeft: "7px"
                                }}></div>
                                {user.name}
                            </div>
                            <div className="lobby-line-elo">
                                {user.elo} ELO
                            </div>
                            <div className="lobby-line-status">
                                {(() => {
                                    if (user.challenge) return <span style={{ color: "orange" }}>challenging..</span>
                                    if (user.status === "online") return <span style={{ color: "green" }}>online</span>
                                    if (user.status === "inGame") return <span style={{ color: "red" }}>in game</span>
                                })()}
                            </div>
                            <div className="lobby-line-button">
                                {user.status === "online"
                                    && !user.challenge
                                    && user.id !== global.state.user!.id
                                    && !global.lobby[global.localState.user!.id].challenge
                                    && <>
                                        <Button style={{
                                            backgroundColor: "#53ac62",
                                            width: "calc( var(--challenge-button-width) * 0.8)",
                                            height: "calc(var( --line-height)) * 0.8 ",
                                            fontSize: `calc(var(--fontSize) * 0.7)`,
                                        }} className='login-button' variant='contained'
                                            onClick={() => { clickChallenge(user.id) }}
                                        >Challenge</Button>
                                    </>}
                            </div>
                        </div>)}

                    </div>
                </div>

            </div>
            {global.lobby[global.localState.user!.id].challenge && <>
                <Challenge challenge={global.lobby[global.localState.user!.id].challenge}></Challenge>
            </>}
        </>}
    </>
}
