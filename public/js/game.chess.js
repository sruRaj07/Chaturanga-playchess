const { Chess } = require("chess.js");

const socket = io(); // to connect fronted and backend in realtime
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

// initialize the values:
let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;


// functions:
const renderBoard = () => {
   const board = chess.board();
   boardElement.innerHTML = "";
   board.forEach((row,rowindex) => {
    row.forEach((square,squareindex) => {
        const squareElement = document.createElement("div");
        squareElement.classList.add(
            "square",
            (rowindex + squareindex) % 2 === 0 ? "light":"dark"
        );

        squareElement.dataset.row = rowindex;
        squareElement.dataset.col = squareindex;

        if(square) {
            const pieceElement = document.createElement("div");
            pieceElement.classList.add(
                "piece", 
                square.color === 'w' ? "white" : "black"
            );
            pieceElement.innerText = getPieceUnicode(square);
            // draggable for the eligible color:
            pieceElement.draggable = playerRole === square.color;

            // dragging start:
            pieceElement.addEventListener("dragstart", function(e) {
                if(pieceElement.draggable){
                    draggedPiece = pieceElement;
                    sourceSquare = {row:rowindex , col:squareindex};
                    e.dataTransfer.setData("text/plain", "");
                }
            });
            // dragging end
            pieceElement.addEventListener("dragend", function(e){
                   draggedPiece = null;
                   sourceSquare = null;
            });
            // attach the piece-element
            squareElement.appendChild(pieceElement);
        }
        // stop invalid moves:
        squareElement.addEventListener("dragover", function(e) {
            e.preventDefault();
        });
        // droping the element
        squareElement.addEventListener("drop",function(e) {
            e.preventDefault();
            if(draggedPiece){
                const targetSource = {
                    row: parseInt(squareElement.dataset.row),
                    col: parseInt(squareElement.dataset.col),
                };

                //move the element:
                handleMove(sourceSquare,targetSource);
            }
        });
        boardElement.appendChild(squareElement);
     });
   });
};

const handleMove = () => {};

// get pieceUnicodes
const getPieceUnicode = (piece) => {
    const unicodePieces = {
        wp: "♙",
        wr: "♖",
        wn: "♘",
        wb: "♗",
        wq: "♕",
        wk: "♔",
        bp: "♟",
        br: "♜",
        bn: "♞",
        bb: "♝",
        bq: "♛",
        bk: "♚",
    };
    return unicodePieces[piece.type] || "";
};
