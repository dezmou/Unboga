import React, { useEffect, useState } from 'react';
import Gun from "gun"
import "./App.css"

type CardStatus = "DECK" | "PLAYER1" | "PLAYER2"

const FIELD_WIDTH = 13
const FIELD_HEIGHT = 4

const engine = () => {
  const state = {
    board: getNewBoard(),
    playerTurn: "PLAYER1",
  }

  function getNewBoard() {
    return Array.from({ length: FIELD_HEIGHT })
      .map((e, y) => Array.from({ length: FIELD_WIDTH })
        .map((ee, x) => ({
          x,
          y,
          status: "DECK",
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
    for (let i = 0; i < 1; i++) {
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
  }



  return {
    state,
    startGame,
  }
}

const game = engine();

function App() {

  const [gameState, setGameState] = useState<ReturnType<typeof engine>["state"]>(game.state)
  const [board, setBoard] = useState(game.state.board);

  const refresh = () => {
    setBoard([...game.state.board]);
  }

  useEffect(() => {
    // const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
    // const network = gun.get('gin-board').get('987tre');
    game.startGame()
    console.log(game.state.board);
    refresh();
  }, [])

  return <>
    <div className='board'>
      {board.map((line, y) => <div className='board-line' key={y}>
        {line.map((card, x) => <div key={x} className={`
        card 
        ${card.status === "PLAYER1" || card.status === "PLAYER2" ? "card-player" : ""}
        ${card.status === "PLAYER1" ? "card-player-1" : ""}
        ${card.status === "PLAYER2" ? "card-player-2" : ""}
        `}>

        </div>

        )}

      </div>)}

    </div>
  </>
    ;
}

export default App;
