const BG_COLOR = "#231f20";
const SNAKE_COLOUR = "#c2c2c2";
const FOOD_COLOR = "#e66916";

const socket = io("http://localhost:3000");

socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('unknownGame', handleUnknownGame);
socket.on('tooManyPlayers', handleTooManyPlayers);

const gameScreen = document.getElementById("game-board");
const initialScreen = document.getElementById("initialScreen");
const newGameBtn = document.getElementById("new-game-btn");
const joinGameBtn = document.getElementById("join-btn");
const gameCode = document.getElementById("game-code");
const gameCodeDisplay = document.getElementById("game-code-display");
let cvs, ctx, playerNumber;
let gameActive = false;

newGameBtn.addEventListener("click", newGame);
joinGameBtn.addEventListener("click", joinGame);

function newGame() {
    socket.emit("newGame");
    init();
}

function joinGame() {
    const code = gameCode.value;
    socket.emit("joinGame", code);
    init();
}

function init() {
    initialScreen.style.display = "none";
    gameScreen.style.display = "block";
    cvs = document.getElementById("canvas");
    ctx = cvs.getContext("2d");
    cvs.width = cvs.height = 600;

    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, cvs.width, cvs.height);

    document.addEventListener("keydown", keydown);
    gameActive = true;
}

function keydown(e) {
    socket.emit('keydown', e.key)
}

function paintGame(state) {
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, cvs.width, cvs.height);

    const food = state.food;
    const gridSize = state.gridSize;
    const size = cvs.width / gridSize;

    ctx.fillStyle = FOOD_COLOR;
    ctx.fillRect(food.x * size, food.y * size, size, size);

    paintPlayer(state.players[0], size, SNAKE_COLOUR);
    paintPlayer(state.players[1], size, 'red');
}

function paintPlayer(playerState, size, color) {
    const {snake} = playerState;

    ctx.fillStyle = color;
    for (let cell of snake) {
        ctx.fillRect(cell.x * size, cell.y * size, size, size);
    }
}

function handleInit(number) {
    playerNumber = number;
}

function handleGameState(gameState) {
    if (!gameActive) {
        return;
    }
    
    gameState = JSON.parse(gameState);

    requestAnimationFrame(() => paintGame(gameState));
}

function handleGameOver(data) {
    if (!gameActive) {
        return;
    }

    data = JSON.parse(data);
    if (data.winner === playerNumber) {
        alert("You win");
    } else {
        alert("You lose");
    }
    gameActive = false;
}

function handleGameCode(code) {
    gameCodeDisplay.innerText = code;
}

function handleUnknownGame() {
    reset();
    alert("unknown game code");
}

function handleTooManyPlayers() {
    reset();
    alert("this game is already in progress");
}

function reset() {
    playerNumber = null;
    gameCode.value = "";
    gameCodeDisplay.innerText = "";
    initialScreen.style.display = "block";
    gameScreen.style.display = "none";
}
