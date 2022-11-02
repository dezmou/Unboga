import React, { useEffect, useState } from 'react';
import Gun from "gun"
import "./App.css"
import { engine, FIELD_HEIGHT, FIELD_WIDTH, makeId, Player, START_GOLD } from "./engine"


const game = engine();

// root.style.setProperty('--mainframe-margin-left', `${marginLeft}px`);

function Hero(p: { hero: typeof game.heros[(keyof (typeof game.heros))] }) {
  return <><div className='hero-header'>
    {p.hero.name}
  </div>
    <div className='hero-gold-flex'>
      <div className='hero-gold-image' style={{
        backgroundImage: `url(/gold.png)`,
      }}>

      </div>
      <div className='hero-gold-value'>
        {p.hero.cost}
      </div>
    </div>
    <div className='hero-image-grid'>
      <div className='hero-image' style={{
        backgroundImage: `url(${p.hero.image})`
      }}>
      </div>
    </div>
    <div className='hero-text' dangerouslySetInnerHTML={{ __html: p.hero.text }}>
    </div>
  </>
}

function Board(p: { state: ReturnType<typeof engine>["state"], player: Player }) {
  const [infos, setInfos] = useState("")

  useEffect(() => {
    if (game.state.playerTurn === p.player) {
      setTimeout(() => {
        // game.startGame()
      }, 0)
    }

  }, [])

  useEffect(() => {
    const getInfos = () => {
      if (p.state.gameResult) {
        if (p.state.gameResult.finalWinner) {
          if (p.state.gameResult.finalWinner === p.player) return `<span style="color : green;font-weight:bold;">You won the game !`
          if (p.state.gameResult.finalWinner !== p.player) return `<span style="color : red;font-weight:bold;">Scumbag won the game !`
        }
        const winner = p.state.gameResult.winner === p.player ? "You" : "Scumbag"
        return `${winner} won ${p.state.gameResult.score} gold`
      }
      if (p.state.choosingHero) {
        if (p.state[p.player].hero && !p.state[game.op[p.player]].hero) {
          return "Waiting for scumbag to choose hero"
        }
        return `Choose a Hero, you will play ${p.state.playerTurn === p.player ? "first" : "second"}`;
      }
      if (p.state.playerTurn !== p.player) {
        return "It is the scumbag turn to play"
      }
      if (p.state.nextAction === "TAKE") {
        return "Take the green card or a random card"
      }
      if (p.state.nextAction === "GIVE") {
        return "Throw a card or knock"
      }
      return ""
    }
    setInfos(getInfos())

  }, [p.state])

  return <>
    <div className="board-flex">
      <div className='selected-hero-cont'>
        <div className='selected-hero-cont-cont'>
          <div className='user-avatar-flex'>
            <div className='user-avatar you-avatar'>
              <div className='user-avatar-score'>
                {p.state.game[p.player].tableScore}
              </div>
            </div>
          </div>
          {!p.state.choosingHero && p.state[p.player].hero && <>
            <Hero hero={game.heros[p.state[p.player].hero!]}></Hero>
          </>}
        </div>
      </div>

      <div className='board'>
        <div className='score'>
          <div className='score-item' style={{
            width: `${(p.state.game[p.player].gold / (START_GOLD * 2)) * 100}%`,
            background: "#16ff29",
          }}>
            <div className="score-text">
              {p.state.game[p.player].gold}
            </div>

          </div>
          <div className='score-item score-item-op' style={{
            width: `${(p.state.game[game.op[p.player]].gold / (START_GOLD * 2)) * 100}%`,
            background: "red",
          }}>
            <div className="score-text-op">
              {p.state.game[game.op[p.player]].gold}
            </div>
          </div>
        </div>

        {p.state.board.map((line, y) => <div className='board-line' key={y}>
          {line.map((card, x) => <div key={x} className="card-flex-col">
            <div className='card-flex-row'>
              <div className={`
            card-paper
            ${(card[p.player].status === "DECK" || card[p.player].status === "PICK")
                  && (!card[p.player].opTook
                    && !(p.state.gameResult && card.status === game.op[p.player])) ? "card-empty" : ""}
            ${card.status === "LOST" ? "card-empty-lost" : ""}
            ${card[p.player].status === p.player ? "card-player-1" : ""}
            ${card[p.player].status === p.player && card[p.player].justTook ? "card-just-took" : ""}
            ${card[p.player].opTook ? "card-op-took" : ""}
            ${game.isCardPick(card) ? "card-top-pick" : ""}
            ${game.isCardClickable(card, p.player) ? "card-clickable" : ""}
            ${p.state.gameResult && card.status === game.op[p.player] ? "card-op-took" : ""}
            ${p.state.started && !p.state.choosingHero && p.state[p.player].hero === "eye" && card.status === game.op[p.player] ? "card-op-took" : ""}
        `}
                style={{
                  cursor: game.isCardClickable(card, p.player) ? "pointer" : "inherit"
                }}
                onClick={() => {
                  if (!game.isCardClickable(card, p.player)) return;
                  game.give(card);
                }}
              >
                {card[p.player].opDiscarded && <div className='op-discarded-flex-col'>
                  <div className='op-discarded-flex-row'>
                    <div className='op-discarded'></div>
                  </div>
                </div>}
                <div className='value'>
                  <div className='value-text'>
                    {game.getCardValue(card, p.player)}
                  </div>
                  {/* <div className='value-bar'>
                    <div className='value-bar-top' style={{
                      height: `${100 - Math.floor(card.value / 16 * 100)}%`
                    }}>
                    </div>
                  </div> */}

                </div>

                {(card[p.player].verti || (
                  ((p.state.gameResult || (p.state.started && !p.state.choosingHero && p.state[p.player].hero === "eye")) && card[game.op[p.player]].verti)
                )) && <div className='streak-verti'></div>}
                {(card[p.player].hori || ((p.state.gameResult || (p.state.started && !p.state.choosingHero && p.state[p.player].hero === "eye")) && card[game.op[p.player]].hori)) && <div className='streak-hori'></div>}
              </div>
            </div>
          </div>
          )}

        </div>)}
        <div className='infos'>
          {p.state[p.player].total} points
        </div>
        <div className='infos' dangerouslySetInnerHTML={{ __html: infos }}>
        </div>
      </div>

      <div className='selected-hero-cont'>
        <div className='selected-hero-cont-cont'>
          <div className='user-avatar-flex'>
            <div className='user-avatar scum-avatar'>
              <div className='user-avatar-score'>
                {p.state.game[game.op[p.player]].tableScore}
              </div>
            </div>
          </div>
          {!p.state.choosingHero && p.state[game.op[p.player]].hero && <>
            <Hero hero={game.heros[p.state[game.op[p.player]].hero!]}></Hero>
          </>}
        </div>
      </div>
    </div>

    {p.state.started && <>
      <div className='bottom'>
        {p.state.choosingHero && !p.state[p.player].hero && <>
          <div className='hero-cont'>
            {Object.values(game.heros)
              .sort((a, b) => a.cost - b.cost)
              .map((hero, i) => <div key={i} className="hero"
                onClick={() => {
                  game.chooseHero(p.player, hero.id as keyof typeof game.heros)
                }}
                style={{
                  pointerEvents: game.canIPickThisHero(hero.id as keyof typeof game.heros, p.player) ? "initial" : "none",
                  opacity: game.canIPickThisHero(hero.id as keyof typeof game.heros, p.player) ? "1" : "0.3",
                }}
              >
                <Hero hero={hero}></Hero>
              </div>

              )}
          </div>
        </>}
        {game.hasHeroInfoDisplayed(p.player) && <>
          <div className='hero-power-flex'>
            <div className='hero-power'>
              <div className='hero-power-avatar' style={{
                backgroundImage: `url(${game.heros[p.state[p.player].hero as keyof typeof game.heros].image})`,
              }}>
              </div>
              <div className='hero-power-content'>
                {p.state[p.player].hero === "mind" && <>
                  {p.state[game.op[p.player]].total >= 30 && <span style={{ color: `#1f7c11` }}>Scumbag has 30 points or more</span>}
                  {p.state[game.op[p.player]].total < 30 && <span style={{ color: `#7c1111` }}>Scumbag has less than 30 points !</span>}
                </>}
                {p.state[p.player].hero === "goat" && <>
                  Scumbag started with {p.state[game.op[p.player]].startedWith} points
                </>}
                {p.state[p.player].hero === "monk" && <>
                  Scumbag has {p.state[game.op[p.player]].total} points
                </>}
                {p.state[p.player].hero === "eye" && <>
                  Scumbag has {p.state[game.op[p.player]].total} points
                </>}

              </div>
            </div>
          </div>
        </>}
        {!p.state.choosingHero && <>
          {p.state.playerTurn === p.player && <>
            <div className='buttons'>
              {p.state.nextAction === "TAKE" && p.state.playerTurn === p.player && <>
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
              {p.state.nextAction === "GIVE" && <>
                <div className='give-flex'>
                  <div className='knock'
                    onClick={() => {
                      game.knock(p.player)
                    }}
                    style={{
                      opacity: !game.canIKnock(p.player) ? "0.3" : "1",
                      pointerEvents: !game.canIKnock(p.player) ? "none" : "initial",
                    }}>
                    Knock {game.getPointsForKnock(p.player)}
                  </div>
                </div>
              </>}

            </div>
          </>}
        </>}
      </div>
    </>}
  </>
}

// const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
// const gun = Gun(['http://51.15.246.203:8765/gun']);
// const gun = Gun(['https://board.modez.pro/gun']);
const gun = Gun({
  localStorage: false,
  peers: ['https://board.modez.pro/gun'],
});


const queryString = window.location.search;
const urlRoomId = new URLSearchParams(queryString).get("game");

function App() {
  const [state, setState] = useState<ReturnType<typeof engine>["state"]>(game.state)
  const [player, setPlayer] = useState<Player>("PLAYER1");

  const updateNet = async () => {
    const net = gun.get('gin-board').get(game.state.game.id);
    net.put(JSON.stringify(game.state))
  }

  const listenNet = (id: string) => {
    const net = gun.get('gin-board').get(id);
    net.on((value) => {
      const data = JSON.parse(value) as ReturnType<typeof engine>["state"];
      Object.keys(game.state).forEach((key) => {
        (game.state as any)[key] = (data as any)[key];
      })
      console.log("listen net :", game);
      setState({ ...game.state })
    })

  }

  const newGame = async () => {
    const gameId = makeId();
    console.log(1);
    console.log("GAME ID", gameId);
    const net = gun.get('gin-board').get(gameId);
    console.log(2);
    localStorage.setItem(gameId, "PLAYER1")
    console.log(3);
    setPlayer("PLAYER1")
    console.log(4);
    game.state.game.id = gameId;
    console.log(5);
    game.state.game.PLAYER1.seated = true;
    console.log(6);
    await updateNet()
    console.log(7);
    console.log(`window.location.href = ${window.location.origin}?game=${game.state.game.id}`);
    window.location.href = `${window.location.origin}?game=${game.state.game.id}`
    console.log(8);
  }

  const openGame = (gameId: string) => {
    const net = gun.get('gin-board').get(gameId);
    let viewed = false;
    console.log("GAME ID", gameId);

    net.on((value) => {
      if (!viewed) {
        viewed = true;
        const data = JSON.parse(value) as ReturnType<typeof engine>["state"];
        Object.keys(game.state).forEach((key) => {
          (game.state as any)[key] = (data as any)[key];
        })
        const localPlayer = localStorage.getItem(gameId) as Player;
        if (!localPlayer && game.state.game.PLAYER1.seated && game.state.game.PLAYER2.seated) {
          alert("Table pleine, degage");
          window.location.href = `${window.location.origin}`
        }
        if (!localPlayer) {
          localStorage.setItem(gameId, "PLAYER2")
          game.state.game.PLAYER2.seated = true;
          setPlayer("PLAYER2")
        } else {
          setPlayer(localPlayer as Player)
          game.state.game[localPlayer].seated = true;
        }
        window.history.replaceState(null, "", `${window.location.origin}?game=${game.state.game.id}`);
        updateNet()
        listenNet(gameId);
      }
    })
  }

  useEffect(() => {
    const listener = game.stateEvent.subscribe((state) => {
      updateNet()
    })

    if (urlRoomId) {
      openGame(urlRoomId);
    }

    ; (async () => {
      let currentWidth = 0;
      let currentHeight = 0;
      const root = document.documentElement

      root.style.setProperty('amount-card-width', `${FIELD_WIDTH}`);
      root.style.setProperty('amount-card-height', `${FIELD_HEIGHT}`);

      while (true) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        let changed = false;
        if (currentWidth !== width) {
          currentWidth = width;
          changed = true;
        }
        if (currentHeight !== height) {
          currentHeight = height;
          changed = true;
        }
        if (changed) {
          root.style.setProperty('--width', `${width}px`);
          root.style.setProperty('--width', `${width}px`);

        }
        await new Promise(r => requestAnimationFrame(r))
      }
    })()

    return () => {
      listener.unsubscribe();
    }
  }, [])

  return <>
    {!state.game.id && <div>
      <button onClick={() => {
        newGame()

      }}>New online game</button>
    </div>}
    {state.game.id && <>
      {state.game.ready && <>
        <Board state={state} player={player}></Board>
        {/* <Board state={state} hero={player === "PLAYER1" ? "PLAYER2" : "PLAYER1"}></Board> */}
      </>}
      {!state.game.PLAYER1.seated || !state.game.PLAYER2.seated && <div>
        Waiting for player 2... <br />
        invitation link : {window.location.href}
      </div>}
      {/* {state.game.PLAYER1.seated && state.game.PLAYER2.seated && (!state.game[game.op[player]].ready) && <div>
        Waiting for all player to be ready
      </div>} */}
      {!state.started && state.game.PLAYER1.seated && state.game.PLAYER2.seated && !state.game[player].ready && <>
        <div className='button ready' onClick={() => {
          game.setReady(player);
        }}>
          I am ready
        </div>
      </>}
    </>}
  </>
}

export default App;
