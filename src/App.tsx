import React, { useEffect, useState } from 'react';
import Gun from "gun"
import { Subject } from "rxjs"
import "./App.css"

type CardStatus = "DECK" | "PLAYER1" | "PLAYER2" | "PICK"
type Player = "PLAYER1" | "PLAYER2"

const START_NBR_CARDS = 12
const FIELD_WIDTH = 8
const FIELD_HEIGHT = 8

const engine = () => {
  type Card = ReturnType<typeof getNewBoard>[number][number];

  const op = {
    PLAYER1: "PLAYER2",
    PLAYER2: "PLAYER1",
  } as {
    "PLAYER1": Player
    "PLAYER2": Player
  }

  const state = {
    board: getNewBoard(),
    playerTurn: "PLAYER1" as "PLAYER1" | "PLAYER2",
    started: false,
    pick: null as null | Card,
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
          value: x + 1 + y + 1,
          status: "DECK" as CardStatus,
          PLAYER1: { justTook: false, opTook: false, opDiscarded: false, status: "DECK" as CardStatus, inStreak: false, hori: false, verti: false },
          PLAYER2: { justTook: false, opTook: false, opDiscarded: false, status: "DECK" as CardStatus, inStreak: false, hori: false, verti: false },
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

  const distribute = (player: Player) => {
    for (let i = 0; i < START_NBR_CARDS; i++) {
      const card = pickRandomFromDeck()
      card.status = player;
      card[player].status = player;
    }
  }

  function endAction() {
    state.nextAction = state.nextAction === "GIVE" ? "TAKE" : "GIVE";
    if (state.nextAction === "TAKE") {
      for (let line of state.board) {
        for (let card of line) {
          card.PLAYER1.justTook = false;
          card.PLAYER2.justTook = false;
        }
      }
      state.playerTurn = state.playerTurn === "PLAYER1" ? "PLAYER2" : "PLAYER1"
    }
    evaluate("PLAYER1")
    evaluate("PLAYER2")
    stateEvent.next(state);
  }

  const give = (card: Card) => {
    if (!state.started) return;
    if (!state.started) return;
    if (state.nextAction !== "GIVE") return;

    card.status = "PICK"
    card[op[state.playerTurn]].opDiscarded = true;
    state.pick = card;
    card[state.playerTurn].status = "PICK";
    state.pick[op[state.playerTurn]].opTook = false;
    endAction();
  }

  const takePick = () => {
    if (!state.pick) return;
    if (!state.started) return;
    if (state.nextAction !== "TAKE") return;
    state.pick.status = state.playerTurn
    state.pick[state.playerTurn].status = state.playerTurn;
    state.pick[state.playerTurn].justTook = true;
    state.pick[op[state.playerTurn]].opTook = true;
    state.pick = null;
    endAction();
  }

  const takeRandom = () => {
    if (!state.started) return;
    if (state.nextAction !== "TAKE") return;
    const card = pickRandomFromDeck();
    state.pick![op[state.playerTurn]].opDiscarded = true;
    card.status = state.playerTurn;
    card[state.playerTurn].status = state.playerTurn;
    card[state.playerTurn].justTook = true;
    state.pick = null;
    endAction();
  }

  const isCardClickable = (card: Card, player: Player) => {
    return (
      state.playerTurn === player
      && state.nextAction === "GIVE"
      && card.status === player
    )
  }

  const evaluate = (player: Player) => {
    const horiStreak = []
    const vertiStreak = []
    for (let y = 0; y < FIELD_HEIGHT; y++) {
      let streak = [];
      for (let x = 0; x < FIELD_WIDTH; x++) {
        const card = state.board[y][x]
        if (card.status === player) {
          streak.push(card);
        }
        if (card.status !== player || x + 1 === FIELD_WIDTH) {
          if (streak.length >= 3) {
            horiStreak.push(streak);
          }
          streak = [];
        }
      }
    }

    for (let x = 0; x < FIELD_WIDTH; x++) {
      let streak = [];
      for (let y = 0; y < FIELD_HEIGHT; y++) {
        const card = state.board[y][x]
        if (card.status === player) {
          streak.push(card);
        }
        if (card.status !== player || y + 1 === FIELD_HEIGHT) {
          if (streak.length >= 3) {
            vertiStreak.push(streak);
          }
          streak = [];
        }
      }
    }

    for (let line of state.board) {
      for (let card of line) {
        card[player].inStreak = false;
        card[player].hori = false;
        card[player].verti = false;
      }
    }

    for (let hori of horiStreak) {
      for (let card of hori) {
        card[player].inStreak = true;
        card[player].hori = true;
      }
    }
    for (let verti of vertiStreak) {
      for (let card of verti) {
        card[player].inStreak = true;
        card[player].verti = true;
      }
    }

    const pointsRemaining = [];
    for (let line of state.board) {
      for (let card of line) {
        if (!card[player].inStreak) {
          pointsRemaining.push(card.value);
        }
      }
    }
    console.log(pointsRemaining);
  }

  const startGame = () => {
    state.playerTurn = state.playerTurn === "PLAYER1" ? "PLAYER2" : "PLAYER1";
    state.board = getNewBoard();
    (["PLAYER1", "PLAYER2"] as Player[]).forEach(player => {
      distribute(player);
    })
    state.started = true;
    state.pick = pickRandomFromDeck();
    evaluate("PLAYER1")
    evaluate("PLAYER2")
    stateEvent.next(state)
  }

  return {
    stateEvent,
    state,
    takePick,
    startGame,
    isCardClickable,
    give,
    takeRandom,
  }
}

const game = engine();

function Board(p: { hero: Player }) {
  const [state, setState] = useState<ReturnType<typeof engine>["state"]>(game.state)

  const refresh = () => {
    setState({ ...game.state })
  }

  useEffect(() => {
    // const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
    // const network = gun.get('gin-board').get('987tre');
    const listener = game.stateEvent.subscribe((state) => { refresh() })

    if (game.state.playerTurn === p.hero) {
      setTimeout(() => {
        game.startGame()
      }, 0)
    }

    return () => {
      listener.unsubscribe();
    }
  }, [])

  return <>
    <div className="board-flex">
      <div className='board'>
        {state.board.map((line, y) => <div className='board-line' key={y}>
          {line.map((card, x) => <div key={x} className="card-flex-col">
            <div className='card-flex-row'>
              <div className={`
            card-paper
            ${card[p.hero].status === p.hero ? "card-player-1" : ""}
            ${card[p.hero].status === p.hero && card[p.hero].justTook ? "card-just-took" : ""}
            ${card[p.hero].opTook ? "card-op-took" : ""}
            ${card === game.state.pick && game.state.playerTurn === p.hero ? "card-top-pick" : ""}
            ${game.isCardClickable(card, p.hero) ? "card-clickable" : ""}
        `}
                style={{
                  cursor: game.isCardClickable(card, p.hero) ? "pointer" : "inherit"
                }}
                onClick={() => {
                  if (!game.isCardClickable(card, p.hero)) return;
                  game.give(card);
                }}
              >
                {card[p.hero].opDiscarded && <div className='op-discarded-flex-col'>
                  <div className='op-discarded-flex-row'>
                    <div className='op-discarded'></div>
                  </div>
                </div>}
                <div className='value'>{card.value}</div>
                {card[p.hero].verti && <div className='streak-verti'></div>}
                {card[p.hero].hori && <div className='streak-hori'></div>}
              </div>
            </div>
          </div>
          )}

        </div>)}

      </div>
    </div>
    <div className='bottom'>
      {state.playerTurn === p.hero && <>
        <div className='buttons'>
          {state.nextAction === "TAKE" && state.playerTurn === p.hero && <>
            <div className='button button-take-pick' onClick={() => {
              game.takePick()
            }}>
              Take Pick
            </div>
            <div className='button button-take-random' onClick={() => {
              game.takeRandom()
            }}>
              Take Random
            </div>
          </>}
          {state.nextAction === "GIVE" && <>
            redonne une carte
          </>}

        </div>
        {state.playerTurn !== p.hero && <div>
          A l'autre de jouer et tout
        </div>}
      </>}
    </div>
  </>
}

function App() {
  return <>
    <Board hero='PLAYER1'></Board>
    <Board hero='PLAYER2'></Board>
  </>
}

export default App;
