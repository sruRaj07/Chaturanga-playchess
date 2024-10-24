// import all the necessry packages(express,socket.io,http,chess,js);
const express = require("express");
const socket = require("socket.io");
const http = require("http");
const { Chess } = require("chess.js");
const path = require("path");


const app = express(); // create app instances
const server = http.createServer(app); // initialize http server with express
const io = socket(server); // it will communicat erealtime

const chess = new Chess(); // create anew object using chess.js
let players = {};
let currentPlayer = "W";

app.set("view engine","ejs"); // now we can use ejs similar to HTML
app.use(express.static(path.join(__dirname,"public"))); // we can use static files like: image,video etc.
// crete the routes
app.get("/",(req,res) => {
    res.render("index",{title:"CV_chase"});
})
// io-wala-part
io.on("connection",function(uniquesocket) {
    console.log("connected...");

    if(!players.white){
        players.white = uniquesocket.id;
        uniquesocket.emit("playerRole","w");
    }
    else if(!players.black){
        players.black = uniquesocket.id;
        uniquesocket.emit("playerRole","b");
    }
    else{
        uniquesocket.emit("spectatorRole");
    }
    // if any player is disconnected to the server:
    uniquesocket.on("disconnect", function(){
        if(uniquesocket.id === players.white){
            delete players.white;
        }
        else if(uniquesocket.id == players.black){
            delete players.black;
        }
    });

    // handle the move events:
    uniquesocket.on("move", function(move){
        // check whether the move is valid-move or not:
        try {
            // checking whether right player is placing the move or not:
            if(chess.turn() == "w" && uniquesocket.id != players.white) return;
            if(chess.turn() == "b" && uniquesocket.id != players.black) return;

            // updating the states
            const result = chess.move(move);
            if(result){
                currentPlayer = chess.turn();
                io.emit("move",move);// move send to the frontend
                io.emit("boardstate",chess.fen()); // boardstate send to frontend
            }
            else{
                console.log("invalid move:",move);
                uniquesocket.emit("invalid Move",move);
            }

        } catch (error) {
            // if something happens which can not be processed by 
            // chess engine, or other technical issue occurs
            console.log(error);
            uniquesocket.mit("Invalid Move: ",move);
        }
    })
});
// start the server
server.listen(3000, function(){
    console.log("listening on Port: 3000")
})

