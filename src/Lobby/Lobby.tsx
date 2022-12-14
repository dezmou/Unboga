import { Button } from "@mui/material";
import { useEffect, useRef } from 'react';
import { LobbyEntry } from '../../common/src/api.interface';
import { acceptChallenge, cancelChallenge, challenge, getLang, playBot } from '../logic';
import { useRender, render } from '../render';
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
                            {getLang("you_challenge")} {global.lobby[p.challenge!.player2].name} ({global.lobby[p.challenge!.player2].elo} ELO) !
                        </div>
                        <div className='challenge-buttons'>
                            <div>
                                <Button style={{
                                    backgroundColor: "#8a1414",
                                }} className='login-button' variant='contained'
                                    onClick={() => { cancelChallenge() }}
                                >{getLang("cancel")}</Button>
                            </div>
                        </div>
                    </>}
                    {p.challenge!.initiator !== global.localState.user!.id && <>
                        <div className='challenge-text'>
                            {global.lobby[p.challenge!.player1].name} ({global.lobby[p.challenge!.player1].elo} ELO) {getLang("he_challenge")}
                        </div>
                        <div className='challenge-buttons-victim'>

                            <div>
                                <Button style={{
                                    backgroundColor: "green",
                                }} className='login-button' variant='contained'
                                    onClick={() => { acceptChallenge() }}
                                >{getLang("accept")}</Button>
                            </div>
                            <div style={{ marginLeft: "10px" }}>
                                <Button style={{
                                    backgroundColor: "#8a1414",
                                }} className='login-button' variant='contained'
                                    onClick={() => { cancelChallenge() }}
                                >{getLang("decline")}</Button>
                            </div>
                        </div>
                    </>}
                </div>
            </div>
        </div>
    </>
}

// https://github.com/dezmou/Unboga/blob/master/rules/rules-fr.md
// https://github.com/dezmou/Unboga/blob/master/rules/rules.md

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
                <div className="langage">
                    <div className="langage-center">
                        <div className="langage-flag" style={{
                            backgroundImage: `url(en_flag.png)`,
                            opacity: global.localState.langage === "fr" ? "1" : "0.4",
                            cursor: global.localState.langage === "fr" ? "pointer" : "initial",
                        }} onClick={() => {
                            global.localState.langage = "en"
                            localStorage.setItem("lang", "en");
                            render(["global"])
                        }}>
                        </div>
                        <div className="langage-flag" style={{
                            backgroundImage: `url(fr_flag.png)`,
                            opacity: global.localState.langage === "fr" ? "0.4" : "1",
                            cursor: global.localState.langage === "fr" ? "initial" : "pointer",
                        }} onClick={() => {
                            global.localState.langage = "fr"
                            localStorage.setItem("lang", "fr");
                            render(["global"])
                        }}>
                        </div>
                    </div>

                </div>
                <div className="lobby-playbot-cont grid">
                    <div>
                        <a style={{
                            textDecoration: "none",
                        }} href={global.localState.langage === "fr" ? "https://github.com/dezmou/Unboga/blob/master/rules/rules-fr.md" : "https://github.com/dezmou/Unboga/blob/master/rules/rules.md"}>
                            <Button style={{
                                backgroundColor: "#53ac62",
                                width: "calc( var(--width) * 0.5)",
                                height: "calc(var( --line-height) * 1)",
                                fontSize: `calc(var(--fontSize) * 0.7)`,
                            }} className='login-button' variant='contained'
                                onClick={() => { }}
                            >{getLang("rules")}</Button>
                        </a>
                    </div>

                    <div style={{
                        marginTop: "10px",
                    }}>
                        <Button style={{
                            backgroundColor: "#53ac62",
                            width: "calc( var(--width) * 0.5)",
                            height: "calc(var( --line-height) * 1)",
                            fontSize: `calc(var(--fontSize) * 0.7)`,
                        }} className='login-button' variant='contained'
                            onClick={() => { playBot() }}
                        >{getLang("playbot")}</Button>

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
                                    if (user.challenge) return <span style={{ color: "orange" }}>{getLang("challenging")}</span>
                                    if (user.status === "online") return <span style={{ color: "green" }}>{getLang("online")}</span>
                                    if (user.status === "inGame") return <span style={{ color: "red" }}>{getLang("ingame")}</span>
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
