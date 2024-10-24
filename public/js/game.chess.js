const { Chess } = require("chess.js");

const socket = io(); // to connect fronted and backend in realtime
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");