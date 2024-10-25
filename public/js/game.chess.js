const { Chess } = require("chess.js");

const socket = io(); // to connect fronted and backend in realtime
//const Chess = new Chess();
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
   if(playerRole === "b"){
    boardElement.classList.add("flipped");
   }
   else{
    boardElement.classList.remove("flipped");
   }
};

// handle the moves:
const handleMove = (source,target) => {
    const move = {
        from:`${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to:`${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion:`q`,
    };
    // send the move to backend
    socket.emit("move",move);
};


// get pieceUnicodes
const getPieceUnicode = (piece) => {
    const unicodePieces = {
        p: "♙",
        r: "♖",
        n: "♘",
        b: "♗",
        q: "♕",
        k: "♔",
        P: "♟",
        R: "♜",
        N: "♞",
        B: "♝",
        Q: "♛",
        K: "♚",
    };
    return unicodePieces[piece.type] || "";
};


// socket io: send the data to backend:
socket.on("playerRole", function(role){
    playerRole = role;
    renderBoard();
});

socket.on("spectatorRole",function(){
    playerRole = null;
    renderBoard();
})

socket.on("boardState", function(fen){
    chess.load(fen);
    renderBoard();
})

// update the move and render board:
socket.on("move", function(move){
    chess.move(move);
    renderBoard();
})
renderBoard();
