const express = require("express");
const http = require("node:http");
const path = require("node:path");
const { Server } = require("socket.io");

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const MAX_PLAYERS = 5;
const ROUND_DURATION_MS = 60_000;
const ROOM_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const rounds = [
  {
    title: "Flood Emergency",
    description: "A major flood has hit your city. How will you protect people and keep essential services running?",
    resources: [
      { name: "Rescue teams", impact: 96 },
      { name: "Hospital protection", impact: 86 },
      { name: "Clean water", impact: 78 },
      { name: "Power restoration", impact: 68 }
    ]
  },
  {
    title: "Greener City",
    description: "Your city is planning its next climate-friendly investments. Where should the limited budget go?",
    resources: [
      { name: "Solar energy", impact: 91 },
      { name: "Tree planting", impact: 80 },
      { name: "Public transport", impact: 94 },
      { name: "Waste reduction", impact: 73 }
    ]
  },
  {
    title: "Community Health",
    description: "A community health crisis is growing. Choose how to direct the response.",
    resources: [
      { name: "Preventive care", impact: 90 },
      { name: "Emergency treatment", impact: 95 },
      { name: "Clean water", impact: 82 },
      { name: "Mental health support", impact: 76 }
    ]
  }
];

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const rooms = new Map();

app.use(express.static(path.join(__dirname, "public")));

function cleanName(value) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ").slice(0, 20);
}

function makeRoomCode() {
  let code;
  do {
    code = Array.from({ length: 5 }, () =>
      ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)]
    ).join("");
  } while (rooms.has(code));
  return code;
}

function sendError(socket, message) {
  socket.emit("action-error", message);
}

function getRoomForSocket(socket) {
  const code = socket.data.roomCode;
  return code ? rooms.get(code) : undefined;
}

function calculateScore(round, allocation) {
  const weightedImpact = round.resources.reduce(
    (total, resource, index) => total + allocation[index] * resource.impact,
    0
  );
  return Math.round(weightedImpact / 100);
}

function roomState(room, playerId) {
  const round = rounds[room.roundIndex];
  const players = [...room.players.values()];

  return {
    code: room.code,
    hostId: room.hostId,
    status: room.status,
    roundIndex: room.roundIndex,
    roundCount: rounds.length,
    endsAt: room.endsAt,
    round: round ? {
      title: round.title,
      description: round.description,
      resources: round.resources
    } : null,
    players: players.map((player) => ({
      id: player.id,
      name: player.name,
      score: player.score,
      submitted: player.submitted,
      allocation: room.status === "results" || room.status === "finished"
        ? player.allocation
        : undefined,
      roundScore: room.status === "results" || room.status === "finished"
        ? player.roundScore
        : undefined,
      timedOut: room.status === "results" || room.status === "finished"
        ? player.timedOut
        : undefined
    })),
    playerId
  };
}

function broadcastRoom(room) {
  for (const player of room.players.values()) {
    io.to(player.id).emit("room-state", roomState(room, player.id));
  }
}

function clearRoundTimer(room) {
  if (room.timer) {
    clearTimeout(room.timer);
    room.timer = null;
  }
}

function finishRound(room) {
  clearRoundTimer(room);
  for (const player of room.players.values()) {
    if (!player.allocation) {
      player.allocation = [25, 25, 25, 25];
      player.timedOut = true;
    }
    player.roundScore = calculateScore(rounds[room.roundIndex], player.allocation);
    player.score += player.roundScore;
  }
  room.endsAt = null;
  room.status = room.roundIndex === rounds.length - 1 ? "finished" : "results";
  broadcastRoom(room);
}

function startRound(room, roundIndex) {
  clearRoundTimer(room);
  room.roundIndex = roundIndex;
  room.status = "playing";
  room.endsAt = Date.now() + ROUND_DURATION_MS;
  for (const player of room.players.values()) {
    player.submitted = false;
    player.allocation = null;
    player.roundScore = null;
    player.timedOut = false;
  }
  room.timer = setTimeout(() => finishRound(room), ROUND_DURATION_MS);
  broadcastRoom(room);
}

function leaveRoom(socket) {
  const room = getRoomForSocket(socket);
  if (!room) return;

  room.players.delete(socket.id);
  socket.leave(room.code);
  delete socket.data.roomCode;

  if (room.players.size === 0) {
    clearRoundTimer(room);
    rooms.delete(room.code);
    return;
  }

  if (room.hostId === socket.id) {
    room.hostId = room.players.keys().next().value;
  }
  broadcastRoom(room);
}

io.on("connection", (socket) => {
  socket.on("create-room", (rawName) => {
    if (socket.data.roomCode) return sendError(socket, "Leave your current room before creating another.");
    const name = cleanName(rawName);
    if (!name) return sendError(socket, "Enter a name before creating a room.");

    const code = makeRoomCode();
    const player = {
      id: socket.id,
      name,
      score: 0,
      roundScore: null,
      allocation: null,
      submitted: false,
      timedOut: false
    };
    const room = {
      code,
      hostId: socket.id,
      players: new Map([[socket.id, player]]),
      status: "waiting",
      roundIndex: -1,
      endsAt: null,
      timer: null
    };
    rooms.set(code, room);
    socket.data.roomCode = code;
    socket.join(code);
    broadcastRoom(room);
  });

  socket.on("join-room", (payload) => {
    if (socket.data.roomCode) return sendError(socket, "Leave your current room before joining another.");
    const rawName = payload && typeof payload === "object" ? payload.name : undefined;
    const rawCode = payload && typeof payload === "object" ? payload.code : undefined;
    const name = cleanName(rawName);
    const code = typeof rawCode === "string" ? rawCode.trim().toUpperCase() : "";
    const room = rooms.get(code);
    if (!name) return sendError(socket, "Enter a name before joining a room.");
    if (!room) return sendError(socket, "That room code was not found.");
    if (room.status !== "waiting") return sendError(socket, "This game has already started.");
    if (room.players.size >= MAX_PLAYERS) return sendError(socket, "This room is full.");

    room.players.set(socket.id, {
      id: socket.id,
      name,
      score: 0,
      roundScore: null,
      allocation: null,
      submitted: false,
      timedOut: false
    });
    socket.data.roomCode = code;
    socket.join(code);
    broadcastRoom(room);
  });

  socket.on("start-game", () => {
    const room = getRoomForSocket(socket);
    if (!room) return sendError(socket, "Create or join a room first.");
    if (room.hostId !== socket.id) return sendError(socket, "Only the host can start the game.");
    if (room.status !== "waiting") return sendError(socket, "The game has already started.");
    if (room.players.size < 2) return sendError(socket, "At least two players are needed to start.");
    startRound(room, 0);
  });

  socket.on("submit-decision", (allocation) => {
    const room = getRoomForSocket(socket);
    if (!room || room.status !== "playing") return sendError(socket, "There is no active round to submit.");
    const player = room.players.get(socket.id);
    if (!player || player.submitted) return sendError(socket, "Your decision has already been submitted.");
    if (
      !Array.isArray(allocation) ||
      allocation.length !== 4 ||
      allocation.some((amount) =>
        !Number.isInteger(amount) || amount < 0 || amount > 100 || amount % 5 !== 0
      ) ||
      allocation.reduce((total, amount) => total + amount, 0) !== 100
    ) {
      return sendError(socket, "Allocate exactly 100 points in steps of 5 across the four choices.");
    }

    player.allocation = allocation;
    player.submitted = true;
    broadcastRoom(room);
    if ([...room.players.values()].every((entry) => entry.submitted)) finishRound(room);
  });

  socket.on("next-round", () => {
    const room = getRoomForSocket(socket);
    if (!room) return sendError(socket, "Create or join a room first.");
    if (room.hostId !== socket.id) return sendError(socket, "Only the host can continue.");
    if (room.status !== "results") return sendError(socket, "The next round is not ready.");
    startRound(room, room.roundIndex + 1);
  });

  socket.on("leave-room", () => leaveRoom(socket));
  socket.on("disconnect", () => leaveRoom(socket));
});

server.listen(PORT, HOST, () => {
  console.log(`Impact Quest is running at http://localhost:${PORT}`);
});
