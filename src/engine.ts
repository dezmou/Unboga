import { Subject } from "rxjs"

export type CardStatus = "DECK" | "PLAYER1" | "PLAYER2" | "PICK" | "LOST"
export type Player = "PLAYER1" | "PLAYER2"
export const START_NBR_CARDS = 12
export const FIELD_WIDTH = 8
export const FIELD_HEIGHT = 8
export const POINT_MIN_TO_KNOCK = 50
export const FULL_WIN_BONUS = 50;
export const SANCTION_KNOCK_SUPERIOR = 50;
export const START_SCORE = 200

export const HERO_EARLY_KNOCK_ADD = 15;

export const makeId = () => {
  return Math.floor((1 + Math.random()) * 0x100000000000)
    .toString(32)
}

export const engine = () => {
  type Card = ReturnType<typeof getNewBoard>[number][number];

  const op = {
    PLAYER1: "PLAYER2",
    PLAYER2: "PLAYER1",
  } as {
    "PLAYER1": Player
    "PLAYER2": Player
  }

  const heros = {
    alone: {
      id: "alone",
      name: "Lame Gus",
      image: "/heros/alone.jpg",
      text: "This hero has no power",
      cost: 0,
    },
    mirror: {
      id: "mirror",
      name: "Mirror of darkness",
      image: "/heros/mirror.jpg",
      text: "The points on the battlefield are on reverse order.<br/><br/>Only for you",
      cost: 8,
    },
    clone: {
      id: "clone",
      name: "Clones of the dead",
      image: "/heros/clone.jpg",
      text: "Every cards are worth 9 points.<br/><br/>Only for you",
      cost: 7,
    },
    watch: {
      id: "watch",
      name: "Early fang",
      image: "/heros/watch.jpg",
      text: `Can knock with ${POINT_MIN_TO_KNOCK + HERO_EARLY_KNOCK_ADD} points instead of ${POINT_MIN_TO_KNOCK}`,
      cost: 8,
    },
    karen: {
      id: "karen",
      name: "Karen",
      image: "/heros/karen.png",
      text: "You get a new random hand",
      cost: 12,
    },
    leave: {
      id: "leave",
      name: "Deserter jack",
      image: "/heros/leave.jpg",
      text: "Begin with one random card of his hand back to the deck",
      cost: 9,
    },
    count: {
      id: "count",
      name: "Accountant Troll",
      image: "/heros/count.png",
      text: "Cards are worth 1 points less.<br/>And never more that 12 points<br/><br/>Only for you",
      cost: 12,
    },
    mind: {
      id: "mind",
      name: "Mind Alchemist",
      image: "/heros/mind.jpg",
      text: "Know if opponent has less than 30 points",
      cost: 14,
    },
    tank: {
      id: "tank",
      name: "Strong David",
      image: "/heros/tank.jpg",
      text: "When he win the round, win 25% more points",
      cost: 7,
    },
    cloporte: {
      id: "cloporte",
      name: "Weak joe",
      image: "/heros/cloporte.jpg",
      text: "When he loses the round, loses 25% less points",
      cost: 7,
    },
  }

  const state = {
    game: {
      id: "",
      PLAYER1: { seated: false, ready: false, score: START_SCORE },
      PLAYER2: { seated: false, ready: false, score: START_SCORE },
      ready: false,
    },
    board: getNewBoard(),
    playerTurn: "PLAYER1" as "PLAYER1" | "PLAYER2",
    started: false,
    pick: null as null | { x: number, y: number },
    nextAction: "TAKE" as "TAKE" | "GIVE",
    choosingHero: false,
    PLAYER1: { pointsRemaining: [0], total: 0, hero: null as null | keyof typeof heros },
    PLAYER2: { pointsRemaining: [0], total: 0, hero: null as null | keyof typeof heros },
    gameResult: null as null | {
      winner: Player
      score: number
    }
  }

  const stateEvent = new Subject<typeof state>()
  // stateEvent.next(state);

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
        if (state.pick && x === state.pick.x && y === state.pick.y) continue;
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
    stateEvent.next({ ...state });
  }

  const canIPickThisHero = (heroId: keyof typeof heros, player: Player) => {
    return state.game[player].score > heros[heroId].cost;
  }

  const give = (card: Card) => {
    if (!state.started) return;
    if (state.nextAction !== "GIVE") return;
    card.status = "PICK"
    card[op[state.playerTurn]].opDiscarded = true;
    state.pick = { x: card.x, y: card.y };
    card[state.playerTurn].status = "PICK";
    state.board[state.pick.y][state.pick.x][op[state.playerTurn]].opTook = false;
    endAction();
  }

  const takePick = () => {
    if (!state.pick) return;
    if (!state.started) return;
    if (state.nextAction !== "TAKE") return;
    state.board[state.pick.y][state.pick.x].status = state.playerTurn
    state.board[state.pick.y][state.pick.x][state.playerTurn].status = state.playerTurn;
    state.board[state.pick.y][state.pick.x][state.playerTurn].justTook = true;
    state.board[state.pick.y][state.pick.x][op[state.playerTurn]].opTook = true;
    state.board[state.pick!.y][state.pick!.x][op[state.playerTurn]].opDiscarded = false;
    state.pick = null;
    endAction();
  }

  const takeRandom = () => {
    if (!state.started) return;
    if (state.nextAction !== "TAKE") return;
    const card = pickRandomFromDeck();
    state.board[state.pick!.y][state.pick!.x][op[state.playerTurn]].opDiscarded = true;
    state.board[state.pick!.y][state.pick!.x].status = "LOST";
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

  const hasHeroInfoDisplayed = (player: Player) => {
    if (
      state[player].hero === "mind"
      && state.playerTurn === player
    ) {
      return true;
    }
    return false;
  }

  const getCardValue = (card: Card, player: Player) => {
    if (state[player].hero === "mirror") {
      return 18 - card.value;
    }
    if (state[player].hero === "clone") {
      return 9;
    }
    if (state[player].hero === "count") {
      const value = card.value - 1;
      if (value > 12) return 12;
      return value;
    }

    return card.value
  }

  const evaluate = (player: Player) => {
    const horiStreak = []
    const vertiStreak = []
    const board = state.board
    for (let y = 0; y < FIELD_HEIGHT; y++) {
      let streak = [];
      for (let x = 0; x < FIELD_WIDTH; x++) {
        const card = board[y][x]
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
        const card = board[y][x]
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

    for (let line of board) {
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
    for (let line of board) {
      for (let card of line) {
        if (card.status === player && !card[player].inStreak) {
          pointsRemaining.push(getCardValue(card, player));
        }
      }
    }
    pointsRemaining.sort((a, b) => a - b);
    let amount = 0;
    for (let point of pointsRemaining) {
      amount += point;
    }
    state[player].pointsRemaining = pointsRemaining
    state[player].total = amount
  }

  const getPointsForKnock = (player: Player) => {
    return state[player].total
  }

  const chooseHero = (player: Player, hero: keyof typeof heros) => {
    state[player].hero = hero;
    if (hero === "leave") {
      while (true) {
        const x = Math.floor(Math.random() * FIELD_WIDTH);
        const y = Math.floor(Math.random() * FIELD_HEIGHT);
        if (state.board[y][x].status === player) {
          state.board[y][x].status = "DECK";
          state.board[y][x][player].status = "DECK";
          break;
        }
      }
    }
    if (hero === "karen") {
      for (let line of state.board) {
        for (let card of line) {
          if (card.status === player) {
            card.status = "DECK";
            card[player].status = "DECK";
          }
        }
      }
      distribute(player);
    }
    if (state[op[player]].hero) {
      state.game[player].score += -heros[hero].cost;
      state.game[op[player]].score += - heros[state[op[player]].hero as keyof typeof heros].cost
      state.choosingHero = false;
    }
    evaluate("PLAYER1")
    evaluate("PLAYER2")
    stateEvent.next(state)
  }

  const startGame = () => {
    state.playerTurn = state.playerTurn === "PLAYER1" ? "PLAYER2" : "PLAYER1";
    state.board = getNewBoard();
    (["PLAYER1", "PLAYER2"] as Player[]).forEach(player => {
      distribute(player);
    })
    state.started = true;
    state.choosingHero = true;
    state.pick = pickRandomFromDeck();
    state.PLAYER1 = { pointsRemaining: [0], total: 0, hero: null };
    state.PLAYER2 = { pointsRemaining: [0], total: 0, hero: null };
    evaluate("PLAYER1")
    evaluate("PLAYER2")
    state.nextAction = "TAKE";
    state.gameResult = null;
    stateEvent.next(state)
  }

  const canIKnock = (player: Player) => {
    const points = getPointsForKnock(player);
    return (points <= (state[player].hero === "watch" ? (POINT_MIN_TO_KNOCK + HERO_EARLY_KNOCK_ADD) : POINT_MIN_TO_KNOCK))
  }

  const knock = (player: Player) => {
    const points = getPointsForKnock(player);
    const pointsOp = getPointsForKnock(op[player]);
    if (!canIKnock(player)) return;

    let score = 0;
    let winner = player;
    if (points === 0) {
      score += FULL_WIN_BONUS
    }
    const diff = pointsOp - points;

    if (points !== 0 && points >= pointsOp) {
      winner = op[player];
      score += SANCTION_KNOCK_SUPERIOR;
    }

    score += Math.abs(diff);
    const baseScore = score;
    if (state[winner].hero === "tank") {
      score += Math.floor(baseScore * 0.25);
    }
    if (state[op[winner]].hero === "cloporte") {
      score += -Math.floor(baseScore * 0.25);
    }
    state.gameResult = {
      score,
      winner,
    }
    state.game[winner].score += score;
    state.game[op[winner]].score += -score;
    state.game.PLAYER1.ready = false;
    state.game.PLAYER2.ready = false;
    state.started = false;
    stateEvent.next({ ...state });
  }

  const setReady = (player: Player) => {
    state.game[player].ready = true;
    if (state.game.PLAYER1.ready && state.game.PLAYER2.ready) {
      state.game.ready = true;
      startGame()
    }
    stateEvent.next({ ...state });
  }

  const isCardPick = (card: Card) => {
    if (!state.pick) return false;
    return card.x === state.pick.x && card.y === state.pick.y
  }

  return {
    stateEvent,
    state,
    op,
    heros,
    chooseHero,
    takePick,
    startGame,
    isCardClickable,
    give,
    takeRandom,
    isCardPick,
    getPointsForKnock,
    knock,
    setReady,
    canIKnock,
    getCardValue,
    canIPickThisHero,
    hasHeroInfoDisplayed,
  }
}
