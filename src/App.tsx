import React, { useEffect, useState } from 'react';
import Gun from "gun"
import { Subject } from "rxjs"
import "./App.css"

type CardStatus = "DECK" | "PLAYER1" | "PLAYER2" | "GARBAGE"

const START_NBR_CARDS = 10
const FIELD_WIDTH = 13
const FIELD_HEIGHT = 4

const engine = () => {
  const state = {
    board: getNewBoard(),
    playerTurn: "PLAYER1",
    started: false,
    pick: null as null | ReturnType<typeof getNewBoard>[number][number],
    nextAction: "TAKE" as "TAKE" | "GIVE"
  }

  const stateEvent = new Subject<typeof state>()
  stateEvent.next(state);

  function getNewBoard() {
    return Array.from({ length: FIELD_HEIGHT })
      .map((e, y) => Array.from({ length: FIELD_WIDTH })
        .map((ee, x) => ({
          x,
          y,
          status: "DECK",
          isTopPick: false,
        })))
  }

  function pickRandomFromDeck() {
    while (true) {
      const x = Math.floor(Math.random() * FIELD_WIDTH);
      const y = Math.floor(Math.random() * FIELD_HEIGHT);
      if (state.board[y][x].status === "DECK") {
        return state.board[y][x];
      }
    }
  }

  const distribute = (player: string) => {
    for (let i = 0; i < START_NBR_CARDS; i++) {
      const card = pickRandomFromDeck()
      card.status = player;
    }
  }

  const startGame = () => {
    state.playerTurn = state.playerTurn === "PLAYER1" ? "PLAYER2" : "PLAYER1";
    state.board = getNewBoard();
    ["PLAYER1", "PLAYER2"].forEach(player => {
      distribute(player);
    })
    state.started = true;
    state.pick = pickRandomFromDeck();
    state.pick.isTopPick = true;
    stateEvent.next(state)
  }

  return {
    stateEvent,
    state,
    startGame,
  }
}

const game = engine();

function App() {
  const [hero, setHero] = useState("PLAYER1")
  const [state, setState] = useState<ReturnType<typeof engine>["state"]>(game.state)

  const refresh = () => {
    setHero(game.state.playerTurn);
    setState({ ...game.state })
  }

  useEffect(() => {
    // const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
    // const network = gun.get('gin-board').get('987tre');
    const listener = game.stateEvent.subscribe((state) => { refresh() })
    game.startGame()

    return () => {
      listener.unsubscribe();
    }
  }, [])

  return <>
    <div className='board'>
      {state.board.map((line, y) => <div className='board-line' key={y}>
        {line.map((card, x) => <div key={x} className="card-flex-col">
          <div className='card-flex-row'>
            <div className={`
            card-paper
            ${card.status === hero ? "card-player-1" : ""}
            ${card.isTopPick ? "card-top-pick" : ""}
        `}>
            </div>
          </div>
        </div>
        )}

      </div>)}

    </div>
    <div className='buttons'>
      {state.nextAction === "TAKE" && <>
        <div className='button button-take-pick'>
          Take Pick
        </div>
        <div className='button button-take-random'>
          Take Random
        </div>
      </>}
    </div>
  </>
    ;
}

export default App;
