import { Button } from "@mui/material";
import { useEffect, useRef } from 'react';
import { LobbyEntry } from '../../back/src/common/api.interface';
import { acceptChallenge, cancelChallenge, challenge, playBot } from '../logic';
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
        if (global.state.page === "lobby") {

        }
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
                <button onClick={() => {
                    playBot()
                }}>play bot</button>

                {Object.values(global.lobby).map((user, i) => <div key={i}>
                    <strong>{user.name}</strong>  (elo : {user.elo}) <span style={{ color: "green" }}>{user.status}</span>
                    <button onClick={() => {
                        clickChallenge(user.id);
                    }}>challenge !</button>
                    {user.challenge && "CHALLENGE !"}
                </div>)}
            </div>
            {global.lobby[global.localState.user!.id].challenge && <>
                <Challenge challenge={global.lobby[global.localState.user!.id].challenge}></Challenge>
            </>}
        </>}
    </>
}
