const app = require("express")();
const {createServer} = require("http");
const {Server} = require("socket.io");
const cors = require("cors");
const {initGame, gameLoop, getUpdatedVelocity} = require("./game");
const {FRAME_RATE} = require("./constants");
const {makeid} = require("./utils");

const state = {};
const clientRooms = {}; //lookup name - map id client_id: room_name

app.use(cors());

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    }
});

const PORT = process.env.PORT || 3000;

io.on("connect", socket => {

    socket.on("keydown", key => {
        const roomName = clientRooms[socket.id];

        if (!roomName) {
            return;
        }

        const vel = getUpdatedVelocity(key);

        if (vel) {
            state[roomName].players[socket.number - 1].vel = vel;
        }
    });

    socket.on("newGame", () => { //we want to create a new socket io room
        let roomName = makeid(5);
        clientRooms[socket.id] = roomName;
        socket.emit('gameCode', roomName);

        state[roomName] = initGame();

        socket.join(roomName);
        socket.number = 1;
        socket.emit("init", 1); // sending to front the player number

    });

    socket.on("joinGame", code => {
        const room = io.sockets.adapter.rooms.get(code); //code == room name
    
        let numClients = 0;
        if (room) {
            numClients = room.size;
        }

        if (numClients == 0) {
            socket.emit("unknownGame");
            return;
        } else if (numClients > 1) {
            socket.emit("tooManyPlayers")
        }

        clientRooms[socket.id] = code;
        socket.join(code);
        socket.number = 2;
        socket.emit("init", 2);
        startGameInterval(code);
    });


});

function startGameInterval(roomName) {
    const intervalId = setInterval(() => {
        const winner = gameLoop(state[roomName]);

        if (!winner) {
            emitGameState(roomName, state[roomName]);
        } else {
            emitGameOver(roomName, winner);
            state[roomName] = null;
            clearInterval(intervalId);
        }
    }, 1000/FRAME_RATE);
}

function emitGameState(roomName, state) {
    io.sockets.in(roomName).emit("gameState", JSON.stringify(state));
}

function emitGameOver(roomName, winner) {
    io.sockets.in(roomName).emit("gameOver", JSON.stringify({winner}));
}

server.listen(PORT, () => console.log("Server up and running"));