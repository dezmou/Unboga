import { BOARD_SIZE, CardStatus, FULL_POINTS, Game, INITIAL_CARD_AMOUNT, MAX_POWER_NUMBER, MIN_TO_KNOCK, Player, SANCTION_POINTS, START_GOLD, UserCard, UserGame } from "../../common/src/game.interface"
import { powers } from "../../common/src/powers"

const makeId = () => {
    return Math.floor((1 + Math.random()) * 0x1000000000000000)
        .toString(32)
}

export const gameEngine = () => {
    const state = {} as { game: Game }

    const op = {
        player1: "player2" as Player,
        player2: "player1" as Player,
    }

    const getNewBoard = () => {
        const getBasePoint = (x: number, y: number) => {
            if (x >= 4) x += -1
            if (y >= 4) y += -1
            return ((Math.abs(x - 3) + Math.abs(y - 3)) * 2) + 1
        }

        const board: Game["board"] = [];

        const initCardStatus = (x: number, y: number): UserCard => ({
            status: "deck",
            villainRefused: false,
            points: getBasePoint(x, y),
            hori: false,
            inStreak: false,
            verti: false,
        })

        for (let y = 0; y < BOARD_SIZE; y++) {
            const line: Game["board"][number] = [];
            for (let x = 0; x < BOARD_SIZE; x++) {
                line.push({
                    id: `${x}_${y}`,
                    player1: initCardStatus(x, y),
                    player2: initCardStatus(x, y),
                    status: "deck",
                    x,
                    y,
                    basePoints: getBasePoint(x, y)
                })
            }
            board.push(line);
        }
        return board;
    }

    const getRandomFromDeck = () => {
        while (true) {
            const card = state.game.board[Math.floor(Math.random() * BOARD_SIZE)][Math.floor(Math.random() * BOARD_SIZE)]
            if (card.status === "deck") return card
        }
    }

    const distribute = (player: Player) => {
        for (let i = 0; i < INITIAL_CARD_AMOUNT; i++) {
            const card = getRandomFromDeck()
            card.status = player
            card[player].status = player
        }
    }

    const getCardValue = (card: Game["board"][number][number], player: Player) => {
        let points = card.basePoints;
        if (state.game[player].powers.includes("eye")) {
            points = card.basePoints * 2;
        }

        if (state.game[player].powers.includes("mirror")) {
            if (state.game[player].powers.includes("eye")) {
                points = 28 - points;
            } else {
                points = 14 - points;
            }
        }
        return points;
    }

    const getAllDiagonal = () => {
        const board = state.game.board;
        const max_col = board[0].length
        const max_row = board.length

        const cols = Array.from({ length: max_col }).map(e => [] as typeof board[number]);
        const rows = Array.from({ length: max_row }).map(e => [] as typeof board[number]);
        const fdiag = Array.from({ length: max_row + max_col - 1 }).map(e => [] as typeof board[number]);
        const bdiag = Array.from({ length: fdiag.length }).map(e => [] as typeof board[number])
        const min_bdiag = -max_row + 1;
        for (let x = 0; x < max_col; x++) {
            for (let y = 0; y < max_row; y++) {
                cols[x].push(board[y][x])
                rows[y].push(board[y][x])
                fdiag[x + y].push(board[y][x])
                bdiag[x - y - min_bdiag].push(board[y][x])
            }
        }
        return [...fdiag, ...bdiag];
    }

    const evaluate = (player: Player) => {
        const horiStreak = []
        const vertiStreak = []
        const diagStreak: typeof board = []

        const board = state.game.board
        for (let y = 0; y < BOARD_SIZE; y++) {
            let streak = [];
            for (let x = 0; x < BOARD_SIZE; x++) {
                const card = board[y][x]
                if (card.status === player) {
                    streak.push(card);
                }
                if (card.status !== player || x + 1 === BOARD_SIZE) {
                    if (streak.length >= 3) {
                        horiStreak.push(streak);
                    }
                    streak = [];
                }
            }
        }

        for (let x = 0; x < BOARD_SIZE; x++) {
            let streak = [];
            for (let y = 0; y < BOARD_SIZE; y++) {
                const card = board[y][x]
                if (card.status === player) {
                    streak.push(card);
                }
                if (card.status !== player || y + 1 === BOARD_SIZE) {
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

        if (state.game[player].powers.includes("chimist")) {
            const diags = getAllDiagonal()
            for (let diag of diags) {
                let streak: typeof board[number] = [];
                diag.forEach((card, i) => {
                    if (card.status === player) {
                        streak.push(card);
                    }
                    if (card.status !== player || i + 1 === diag.length) {
                        if (streak.length >= 3) {
                            diagStreak.push(streak)
                        }
                        streak = [];
                    }
                })
            }
            for (let diag of diagStreak) {
                for (let card of diag) {
                    card[player].inStreak = true;
                }
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
        state.game[player].points = amount
    }

    // TODO no duplicate code
    const newRound = () => {
        state.game = {
            ...state.game,
            roundId: makeId(),
            board: getNewBoard(),
            nextAction: "selectHero",
            nextActionPlayer: ["player1" as Player, "player2" as Player][Math.floor(Math.random() * 2)],
            player1: { gold: state.game.player1.gold, powers: [], powerReady: false, points: 0, ready: true },
            player2: { gold: state.game.player2.gold, powers: [], powerReady: false, points: 0, ready: true },
            choose: [],
            chooseIndex: 0,
            pickHeroTurn: 0,
        }
        distribute("player1");
        distribute("player2");
        evaluate("player1")
        evaluate("player2")
        const pick = getRandomFromDeck();
        state.game.pick = { x: pick.x, y: pick.y }
    }

    // TODO no duplicate code
    const newGame = (id: string, player1: string, player2: string) => {
        state.game = {
            id,
            roundId: makeId(),
            pick: { x: 0, y: 0 },
            board: getNewBoard(),
            nextAction: "selectHero",
            nextActionPlayer: ["player1" as Player, "player2" as Player][Math.floor(Math.random() * 2)],
            player1Id: player1,
            player2Id: player2,
            player1: { gold: START_GOLD, powers: [], powerReady: false, points: 0, ready: true },
            player2: { gold: START_GOLD, powers: [], powerReady: false, points: 0, ready: true },
            misc: {
                player1: { elo: 0, name: "", roundWon: 0 },
                player2: { elo: 0, name: "", roundWon: 0 },
                endGameProcessed: false,
            },
            choose: [],
            chooseIndex: 0,
            pickHeroTurn: 0,
        }
        distribute("player1");
        distribute("player2");
        evaluate("player1")
        evaluate("player2")
        const pick = getRandomFromDeck();
        state.game.pick = { x: pick.x, y: pick.y }
    }

    const loadGame = (loadedGame: Game) => {
        state.game = loadedGame
    }

    const getPlayerById = (playerId: string) => {
        return state.game.player1Id === playerId ? "player1" : "player2" as Player
    }

    const canKnock = (player: Player) => {
        if (state.game.nextActionPlayer === player && state.game.nextAction === "discard") {
            if (state.game[player].powers.includes("final")) {
                return true;
            }
            if (state.game[player].points - (state.game[player].powers.filter(e => e === "watch").length * 10) <= MIN_TO_KNOCK) {
                return true;
            }
        }
        return false
    }

    const getAllCard = () => {
        const final = [];
        for (let line of state.game.board) {
            for (let card of line) {
                final.push(card);
            }
        }
        return final;
    }

    const applyHeros = () => {
        const game = state.game
        const baseFirstPlayer = game.nextActionPlayer;
        const hurrys = { player1: 0, player2: 0 }
        for (let player of ["player1" as Player, "player2" as Player]) {
            game[player].powers = game[player].powers.map(power => {
                if (power === "fox") {
                    const choices = (Object.keys(powers) as (keyof typeof powers)[]).filter(e => e !== "fox" && e !== "curse" && e !== "unknow")
                    return choices[Math.floor(Math.random() * choices.length)];
                }
                return power;
            })
        }

        if (game.player1.powers.includes("karen") || game.player2.powers.includes("karen")) {
            game.board = getNewBoard()
            distribute("player1");
            distribute("player2");
            evaluate("player1")
            evaluate("player2")
            const pick = getRandomFromDeck();
            game.pick = { x: pick.x, y: pick.y }
        }

        for (let player of ["player1", "player2"] as Player[]) {
            for (let powerStr of state.game[player].powers) {
                if (powerStr === "deserterJack") {
                    ; (() => {
                        while (true) {
                            const card = game.board[Math.floor(Math.random() * BOARD_SIZE)][Math.floor(Math.random() * BOARD_SIZE)];
                            if (card.status === player) {
                                card.status = "deck";
                                card[player].status = "deck"
                                return;
                            }
                        }
                    })()
                }

                if (powerStr === "steve") {
                    hurrys[player] += 1;
                }

                if (powerStr === "pact") {
                    game.choose.push({
                        player1: { choosed: false, x: 0, y: 0 },
                        player2: { choosed: false, x: 0, y: 0 },
                        done: false,
                    })
                }

                if (powerStr === "monkeys") {
                    for (let i = 0; i < 2; i++) {
                        const cards = getAllCard()
                            .filter(c => c.status === player)
                            .sort((a, b) => getCardValue(a, player) - getCardValue(b, player))
                        const minCards = cards.filter(c => getCardValue(c, player) === getCardValue(cards[0], player))
                        const target = minCards[Math.floor(Math.random() * minCards.length)];
                        target.status = "deck";
                        target[player].status = "deck"
                    }
                }
            }
        }
        if (hurrys.player1 !== hurrys.player2) {
            state.game.nextActionPlayer = hurrys.player1 > hurrys.player2 ? "player1" : "player2"
        }

    }

    const pickPower = (playerId: string, selectedPower: (keyof typeof powers)) => {
        const player = getPlayerById(playerId);
        state.game[player].powers.push(selectedPower);
        state.game[player].powerReady = true;
        if (state.game[op[player]].powerReady) {
            if (
                !(state.game.player1.powers[state.game.pickHeroTurn] === "curse"
                    && state.game.player2.powers[state.game.pickHeroTurn] === "curse")
            ) {
                for (let player of ["player1" as Player, "player2" as Player]) {
                    if (state.game[player].powers[state.game.pickHeroTurn] === "curse") {
                        state.game[op[player]].powers[state.game.pickHeroTurn] = "lucien"
                    }
                }
            }

            state.game.pickHeroTurn += 1;
            if (state.game.pickHeroTurn === 3) {
                onPowersSelected();
            } else {
                state.game.player1.powerReady = false;
                state.game.player2.powerReady = false;
            }
        }
    }

    const onPowersSelected = () => {
        applyHeros()
        const nbrChoose = state.game.player1.powers.filter(e => e === "pact").length + state.game.player2.powers.filter(e => e === "pact").length;
        if (nbrChoose > 0) {
            state.game.choose = Array.from({ length: nbrChoose }).map(() => ({
                done: false,
                player1: { choosed: false, x: 0, y: 0 },
                player2: { choosed: false, x: 0, y: 0 },
            }))
            console.log(state.game.choose);
            state.game.nextAction = "choose"
        } else {
            state.game.nextAction = "pick"
        }
        evaluate("player1")
        evaluate("player2")
    }

    const capitulate = (playerId: string) => {
        const player = getPlayerById(playerId);
        state.game.gameResult = {
            winner: op[player],
            revenge: { player1: "ask", player2: "ask" },
            reason: "capitulate"
        }
    }

    const onRoundEnd = () => {
        state.game.justPicked = undefined;
        state.game.player1.ready = false;
        state.game.player2.ready = false;

        const result = state.game.roundResult!;

        if (result.reason === "knock_win") {
            result.pointsWin += (state.game[result.winner].powers.filter(e => e === "watch").length) * 10
        }

        const basePointsWin = result.pointsWin;
        for (let player of ["player1", "player2"] as Player[]) {
            for (let power of state.game[player].powers) {
                state.game[player].gold += -powers[power as keyof typeof powers].cost;
            }
            if (state.game[player].powers.includes("phone")) {
                result.pointsWin += Math.floor(basePointsWin * state.game[player].powers.filter(e => e === "phone").length * 0.3)
            }
        }

        state.game[result.winner].gold += result.pointsWin;
        state.game[op[result.winner]].gold += -result.pointsWin;

        if (state.game.player1.gold <= 0 && state.game.player2.gold <= 0) {
            state.game.player1.gold = 0
            state.game.player2.gold = 0
            state.game.gameResult = {
                winner: "draw",
                revenge: { player1: "ask", player2: "ask" },
                reason: "win"
            }
        } else if (state.game.player1.gold <= 0) {
            state.game.player1.gold = 0
            state.game.gameResult = {
                winner: "player2",
                revenge: { player1: "ask", player2: "ask" },
                reason: "win"
            }
        } else if (state.game.player2.gold <= 0) {
            state.game.player2.gold = 0
            state.game.gameResult = {
                winner: "player1",
                revenge: { player1: "ask", player2: "ask" },
                reason: "win"
            }
        }
    }

    const onZeroPoint = (player: Player) => {
        if (state.game[player].points !== 0) throw "not zero points"

        const points = state.game[player].points;
        const pointsOp = state.game[op[player]].points;
        let result: Game["roundResult"] = {
            pointsWin: FULL_POINTS,
            reason: "knock_full",
            winner: player,
            knocker: player
        };
        const diff = pointsOp - points;
        result.pointsWin += Math.abs(diff);
        state.game.roundResult = result;
        onRoundEnd();
    }

    const discard = (playerId: string, x: number, y: number) => {
        const player = getPlayerById(playerId)
        if (state.game.nextActionPlayer !== player) throw "not you to play"
        if (state.game.nextAction !== "discard") throw "not discard time"
        const card = state.game.board[y][x];
        if (card.status !== player) throw "not your card"
        card.status = "deck"
        card[player].status = "deck"
        card[op[player]].villainRefused = true;
        state.game.pick = { x, y };
        state.game.justPicked = undefined;

        state.game.nextAction = "pick"
        state.game.nextActionPlayer = op[player];
        evaluate("player1")
        evaluate("player2")

        if (state.game[player].points === 0) {
            onZeroPoint(player)
        }
    }

    const knock = (playerId: string) => {
        const player = getPlayerById(playerId)
        if (state.game.nextActionPlayer !== player) throw "not you to play"
        if (state.game.nextAction !== "discard") throw "not pick time"
        if (!canKnock(player)) throw "cannot knock"

        const points = state.game[player].points;
        const pointsOp = state.game[op[player]].points;
        let result: Game["roundResult"] = {
            pointsWin: 0,
            reason: "knock_win",
            winner: player,
            knocker: player
        };
        const diff = pointsOp - points;

        if (points >= pointsOp) {
            result.reason = "knock_lost"
            result.winner = op[player];
            result.pointsWin += SANCTION_POINTS;
        }
        result.pointsWin += Math.abs(diff);
        state.game.roundResult = result;
        onRoundEnd()
    }

    const setReady = (playerId: string) => {
        const player = getPlayerById(playerId)
        if (!state.game.roundResult) throw "not the time to be ready"
        state.game[player].ready = true;

        if (state.game.player1.ready && state.game.player2.ready) {
            newRound();
            state.game.roundResult = undefined;
        }
    }

    const pickRandom = (playerId: string) => {
        const player = getPlayerById(playerId)
        if (state.game.nextActionPlayer !== player) throw "not you to play"
        if (state.game.nextAction !== "pick") throw "not pick time"
        const pick = state.game.board[state.game.pick!.y][state.game.pick!.x]
        pick.status = "lost"
        pick[op[player]].villainRefused = true;
        pick[player].status = "lost";
        pick[op[player]].status = "lost";

        let totalRemaining = 0;
        for (let line of state.game.board) {
            for (let piece of line) {
                if (piece.status === "deck") {
                    totalRemaining += 1;
                }
            }
        }
        if (totalRemaining === 0) {
            for (let line of state.game.board) {
                for (let piece of line) {
                    if (piece.status === "lost") {
                        piece.status = "deck"
                        piece.player1.status = "deck"
                        piece.player1.villainRefused = false
                        piece.player2.status = "deck"
                        piece.player2.villainRefused = false
                    }
                }
            }
        }

        const card = getRandomFromDeck();
        state.game.justPicked = { x: card.x, y: card.y }
        card.status = player
        card[player].status = player

        evaluate("player1")
        evaluate("player2")
        state.game.pick = undefined
        state.game.nextAction = "discard"
        if (state.game[player].points === 0) {
            onZeroPoint(player)
        }
    }

    // TODO onZeroPoints
    const choose = (playerId: string, x: number, y: number) => {
        const player = getPlayerById(playerId)
        if (state.game.nextAction !== "choose") throw "not choose time"
        if (state.game.nextActionPlayer !== player) throw "not you to play"
        const cho = state.game.choose[state.game.chooseIndex];
        cho[player].choosed = true;
        cho[player].x = x;
        cho[player].y = y;

        const piece = state.game.board[y][x];
        // if (piece.status === op[player]) {
        piece[op[player]].status = player;
        // }
        piece.status = player;
        piece[player].status = player;

        cho[player].choosed = true;
        if (cho.player1.choosed && cho.player2.choosed) {
            state.game.chooseIndex += 1;
            cho.done = true;
        }
        if (state.game.chooseIndex > state.game.choose.length - 1) {
            state.game.nextAction = "pick";
        }
        state.game.nextActionPlayer = op[player];
        evaluate("player1")
        evaluate("player2")
    }

    const pickGreen = (playerId: string) => {
        const player = getPlayerById(playerId)
        if (state.game.nextActionPlayer !== player) throw "not you to play"
        if (state.game.nextAction !== "pick") throw "not pick time"
        const gameCard = state.game.board[state.game.pick!.y][state.game.pick!.x]
        state.game.justPicked = { x: gameCard.x, y: gameCard.y }

        gameCard.status = player;
        gameCard[player].status = player;
        gameCard[op[player]].status = player;
        evaluate("player1")
        evaluate("player2")
        state.game.pick = undefined
        state.game.nextAction = "discard"
        if (state.game[player].points === 0) {
            onZeroPoint(player)
        }
    }

    const getUserGame = (playerId: string) => {
        const you = state.game.player1Id === playerId ? "player1" : "player2";
        const villain = state.game.player1Id === playerId ? "player2" : "player1";

        const getVillainStatus = (): UserGame["opStatus"] => {
            const getVillainPowers = () => {
                const pows = state.game[villain].powers.map(pow => {
                    if (state.game.roundResult) {
                        return pow;
                    }
                    if (state.game[villain].powers.includes("fog")) {
                        if (pow !== "fog") {
                            return "unknow";
                        }
                    }
                    return pow;
                })

                if (state.game.nextAction === "selectHero") {
                    return pows.filter((e, i) => i < state.game.pickHeroTurn);
                }

                return pows;
            }

            return {
                ...state.game[villain],
                points: (state.game.roundResult || state.game[you].powers.includes("eye")) ? state.game[villain].points : undefined,
                powers: getVillainPowers(),
            }
        }
        const possibleKnock = canKnock(you);

        const getInfos = (): UserGame["infos"] => {
            if (state.game.roundResult) {
                let line2 = ""
                let line1 = ""
                if (state.game.roundResult.reason === "knock_full") {
                    line1 = `${state.game.roundResult.knocker === you ? "Vous rentrez le FULL et gagnez" : "Le fumier rentre le FULL et gagne"} ${state.game.roundResult.pointsWin} gold`
                } else if (state.game.roundResult.reason === "knock_win") {
                    line1 = `${state.game.roundResult.knocker === you ? "Vous knockez avec" : "Le Fumier knock avec"} ${state.game[state.game.roundResult.knocker].points} points`
                    line2 = `${state.game.roundResult.knocker === you ? "vous gagnez" : "il gagne"} ${state.game.roundResult.pointsWin} gold`
                } else {
                    line1 = `${state.game.roundResult.knocker === you ? "Vous knockez" : "Le fumier knock"} avec ${state.game[state.game.roundResult.knocker].points} points`
                    line2 = `${state.game.roundResult.knocker === you ? "Le fumier contre knock et gagne" : "vous contre knockez et gagnez"} ${state.game.roundResult.pointsWin} gold`
                }
                return {
                    line1,
                    line2
                }
            } else {
                if (state.game.nextAction === "choose") {
                    return {
                        line1: `War Pact ${state.game.chooseIndex + 1} / ${state.game.choose.length}`,
                        line2: state.game.nextActionPlayer === you ? `Choisissez une case vide` : "C'est au fumier de choisir une case vide",
                    }
                } else if (state.game.nextAction === "selectHero") {
                    if (!state.game[you].powerReady) {
                        return {
                            line1: `Choisissez un pouvoir (${state.game[you].powers.length + 1}/${MAX_POWER_NUMBER})`,
                            line2: `Vous jouez en ${state.game.nextActionPlayer === you ? "premier" : "deuxieme"}`,
                        }
                    } else {
                        return {
                            line1: "On attend le fumier qu'il choisisse son pouvoir",
                            line2: "Il prend un temps fou",
                        }
                    }
                } else if (state.game.nextAction === "pick") {
                    if (state.game.nextActionPlayer === you) {
                        return {
                            line1: "Choisissez la piece verte",
                            line2: "Ou choisissez une piece aleatoire"
                        }
                    } else {
                        return {
                            line1: "C'est au tour du fumier de jouer",
                            line2: ""
                        }
                    }
                } else if (state.game.nextAction === "discard") {
                    if (state.game.nextActionPlayer === you) {
                        return {
                            line1: "Defaussez vous d'une piece bleu",
                            line2: possibleKnock ? `...ou knockez pour ${state.game[you].points} points` : ""
                        }
                    } else {
                        return {
                            line1: "C'est au tour du fumier",
                            line2: "de se debarasser d'une piece"
                        }
                    }
                }
            }
            return {
                line1: "",
                line2: "",
            }
        }


        const getUserCard = (card: Game["board"][number][number]) => {
            let streak = false;
            const iCanSeeOp = (state.game.roundResult || state.game[you].powers.includes("eye"))
                && state.game?.nextAction !== "selectHero"
                && state.game?.nextAction !== "choose"

            if (card.status === you && card[you].inStreak) {
                streak = true;
            }
            if (iCanSeeOp && card.status === villain && card[villain].inStreak) {
                streak = true;
            }

            const res = {
                ...card,
                player1: undefined,
                player2: undefined,
                status: {
                    ...card[you],
                    status: iCanSeeOp ? card.status : card[you].status,
                    inStreak: streak,
                } as UserCard,
                points: getCardValue(card, you),
            };
            return res;
        }

        const userGame: UserGame = {
            ...state.game,
            you,
            villain,
            board: state.game.board.map(line => line.map(card => getUserCard(card))),
            justPicked: state.game.nextActionPlayer === you ? state.game.justPicked : undefined,
            player1: undefined,
            player2: undefined,
            youStatus: state.game[you],
            opStatus: getVillainStatus(),
            infos: getInfos(),
            canKnock: possibleKnock
        }
        return userGame;
    }

    return {
        state,
        funcs: {
            newGame,
            loadGame,
            getUserGame,
            pickPower,
            pickGreen,
            pickRandom,
            discard,
            knock,
            setReady,
            getPlayerById,
            capitulate,
            getAllCard,
            choose,
        }
    }
}
