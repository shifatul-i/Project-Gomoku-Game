// Sif Islam
// CSCI 130 Project
// Prof. Hubert Cecotti
// California State University, Fresno

var gomoku = document.getElementById('game');
var timer = document.getElementById('timer');
var totalPieces = document.getElementById('totalPieces');
var p1Pieces = document.getElementById('p1Pieces');
var p2Pieces = document.getElementById('p2Pieces');
var turns = document.getElementById('numTurns');
var hintsBest = document.getElementById('hintsBest');
var hintsWorst = document.getElementById('hintsWorst');
var context = gomoku.getContext('2d');
var player1Turn;
var twoPlayers;
var gameOver;
var count;
var totalWins;
var player1Win;
var player2Win;
var gomokuBoard;
var colorPlayer1, colorPlayer2, colorGrid;
var counter, numTurns, numTotalPieces, numP1Pieces, numP2Pieces;
var interval = null;

var BOARD_SIZE = 460, GAME_SIZE, BOX_WIDTH, BOX_HEIGHT;

var setup = function () {
    numTurns = numTotalPieces = numP1Pieces = numP2Pieces = 0;
    counter = 0;
    timer.innerText = counter;
    turns.innerText = numTurns;
    totalPieces.innerText = numTotalPieces;
    p1Pieces.innerText = numP1Pieces;
    p2Pieces.innerText = numP2Pieces;
    hintsBest.innerText = "Best position: N/A";
    hintsWorst.innerText = "Worst position: N/A";
    clearInterval(interval);
    interval = setInterval(function () {
        var date = new Date(null);
        date.setSeconds(counter++);
        timer.innerText = date.toISOString().substr(11, 8);
    }, 1000);
};

var getHint = function () {
    computerAI(true)
};

var onUpdateGrid = function (val) {
    if (GAME_SIZE !== val) init();
};

function onUpdateType(val) {
    if (twoPlayers !== val) init();
}

var onUpdateColor = function () {
    init();
};
var refreshGameInfo = function () {
    console.log('refreshGameInfo');
    player1Turn = true;
    gameOver = false;
    count = 0;
    totalWins = [];
    player1Win = [];
    player2Win = [];
    gomokuBoard = [];
    twoPlayers = document.getElementById('type2').checked;
    if (document.getElementById('grid19').checked)
        GAME_SIZE = 19;
    else
        GAME_SIZE = 15;
    colorPlayer1 = document.getElementById('color_piece_1').value;
    colorPlayer2 = document.getElementById('color_piece_2').value;
    colorGrid = document.getElementById('color_board').value;
    BOX_WIDTH = BOARD_SIZE / GAME_SIZE;
    BOX_HEIGHT = BOARD_SIZE / GAME_SIZE;
};

var drawChessBoard = function (logo) {
    context.strokeStyle = colorGrid;
    context.drawImage(logo, 0, 0, BOARD_SIZE, BOARD_SIZE);
    context.beginPath();
    for (var i = 0; i < GAME_SIZE; i++) {
        context.moveTo(BOX_WIDTH * i + BOX_WIDTH / 2, BOX_HEIGHT / 2);
        context.lineTo(BOX_WIDTH * i + BOX_WIDTH / 2, BOX_HEIGHT * GAME_SIZE - BOX_HEIGHT / 2);
        context.moveTo(BOX_WIDTH / 2, BOX_HEIGHT * i + BOX_HEIGHT / 2);
        context.lineTo(BOX_WIDTH * GAME_SIZE - BOX_WIDTH / 2, BOX_HEIGHT * i + BOX_HEIGHT / 2);
        context.stroke();
    }
    context.closePath();
};

var oneStep = function (i, j, me) {
    totalPieces.innerText = ++numTotalPieces;
    hintsBest.innerText = "Best position: N/A";
    hintsWorst.innerText = "Worst position: N/A";
    //console.log(me);
    context.beginPath();
    context.arc(BOX_WIDTH / 2 + i * BOX_WIDTH, BOX_HEIGHT / 2 + j * BOX_HEIGHT, (BOX_WIDTH - 4) / 2, 0, 2 * Math.PI);
    //context.closePath();
    if (me) {
        context.fillStyle = colorPlayer1;
        p1Pieces.innerText = ++numP1Pieces;
        turns.innerText = ++numTurns;
    }
    else {
        context.fillStyle = colorPlayer2;
        p2Pieces.innerText = ++numP2Pieces;
    }
    context.stroke();
    context.fill();
    context.closePath();
};

gomoku.onclick = function (e) {
    if (gameOver)
        return;
    if (!player1Turn && !twoPlayers)
        return;
    var x = e.offsetX;
    var y = e.offsetY;
    var i = Math.floor(x / BOX_WIDTH);
    var j = Math.floor(y / BOX_HEIGHT);
    if (gomokuBoard[i][j] === 0) {
        oneStep(i, j, player1Turn);
        gomokuBoard[i][j] = 1;
        for (var k = 0; k < count; k++) {
            if (totalWins[i][j][k]) {
                if (twoPlayers) {
                    if (player1Turn) {
                        player1Win[k]++;
                        player2Win[k] = 6;
                        if (player1Win[k] === 5) {
                            clearInterval(interval);
                            window.alert("Player 1 win! Total time: " + timer.innerText);
                            gameOver = true;
                        }
                    } else {
                        player2Win[k]++;
                        player1Win[k] = 6;
                        if (player2Win[k] === 5) {
                            clearInterval(interval);
                            window.alert("Player 2 win! Total time: " + timer.innerText);
                            gameOver = true;
                        }
                    }
                } else {
                    player1Win[k]++;
                    player2Win[k] = 6;
                    if (player1Win[k] === 5) {
                        clearInterval(interval);
                        window.alert("Player 1 win! Total time: " + timer.innerText);
                        gameOver = true;
                    }
                }
            }
        }
        if (!gameOver) {
            player1Turn = !player1Turn;
            if (!twoPlayers) computerAI(false);
        }
    }
};

var computerAI = function (isHint) {
    var myScore = [];
    var computerScore = [];
    var max = 0, u = 0, v = 0;
    for (var i = 0; i < GAME_SIZE; i++) {
        myScore[i] = [];
        computerScore[i] = [];
        for (var j = 0; j < GAME_SIZE; j++) {
            myScore[i][j] = 0;
            computerScore[i][j] = 0;
        }
    }
    for (i = 0; i < GAME_SIZE; i++) {
        for (j = 0; j < GAME_SIZE; j++) {
            if (gomokuBoard[i][j] === 0) {
                for (k = 0; k < count; k++) {
                    if (totalWins[i][j][k]) {
                        if (player1Win[k] === 1) {
                            myScore[i][j] += 200;
                        } else if (player1Win[k] === 2) {
                            myScore[i][j] += 400;
                        } else if (player1Win[k] === 3) {
                            myScore[i][j] += 2000;
                        } else if (player1Win[k] === 4) {
                            myScore[i][j] += 10000;
                        }

                        if (player2Win[k] === 1) {
                            computerScore[i][j] += 220;
                        } else if (player2Win[k] === 2) {
                            computerScore[i][j] += 420;
                        } else if (player2Win[k] === 3) {
                            computerScore[i][j] += 2100;
                        } else if (player2Win[k] === 4) {
                            computerScore[i][j] += 20000;
                        }
                    }
                }
                if (myScore[i][j] > max) {
                    max = myScore[i][j];
                    u = i;
                    v = j;
                } else if (myScore[i][j] === max) {
                    if (computerScore[i][j] > computerScore[u][v]) {
                        u = i;
                        v = j;
                    }
                }
                if (computerScore[i][j] > max) {
                    max = computerScore[i][j];
                    u = i;
                    v = j;
                } else if (computerScore[i][j] === max) {
                    if (myScore[i][j] > myScore[u][v]) {
                        u = i;
                        v = j;
                    }
                }
            }
        }
    }
    if (!isHint) {
		// if not hint, play
        oneStep(u, v, false);
        gomokuBoard[u][v] = 2;
        for (var k = 0; k < count; k++) {
            if (totalWins[u][v][k]) {
                player2Win[k]++;
                player1Win[k] = 6;
                if (player2Win[k] === 5) {
                    clearInterval(interval);
                    window.alert("Computer win! Total time: " + timer.innerText);
                    gameOver = true;
                }
            }
        }
    } else {
		// only calculate coordinates for showing hint
		var  n = 0, m = 0;
		// calculate worst position
		while (gomokuBoard[n][m] != 0) {
			n++;
			m++;
		}
        hintsBest.innerText = "Best position: (" + u + ", " + v + ")";
        hintsWorst.innerText = "Worst position: (" + n + ", " + m + ")";
    }
    if (!gameOver && !isHint) {
        player1Turn = !player1Turn;
    }
};

var init = function () {
    refreshGameInfo();
    for (var i = 0; i < GAME_SIZE; i++) {
        gomokuBoard[i] = [];
        totalWins[i] = [];
        for (var j = 0; j < GAME_SIZE; j++) {
            gomokuBoard[i][j] = 0;
            totalWins[i][j] = [];
        }
    }

    for (i = 0; i < GAME_SIZE; i++) {
        for (j = 0; j < 11; j++) {
            for (var k = 0; k < 5; k++)
                totalWins[i][j + k][count] = true;
            count++;
        }
    }
    //console.log(count);
    for (i = 0; i < GAME_SIZE; i++) {
        for (j = 0; j < 11; j++) {
            for (k = 0; k < 5; k++)
                totalWins[j + k][i][count] = true;
            count++;
        }
    }
    //console.log(count);
    for (i = 0; i < 11; i++) {
        for (j = 0; j < 11; j++) {
            for (k = 0; k < 5; k++)
                totalWins[i + k][j + k][count] = true;
            count++;
        }
    }
    //console.log(count);
    for (i = 4; i < GAME_SIZE; i++) {
        for (j = 0; j < 11; j++) {
            for (k = 0; k < 5; k++)
                totalWins[i - k][j + k][count] = true;
            count++;
        }
    }
    //console.log(count);
    for (i = 0; i < count; i++) {
        player1Win[i] = 0;
        player2Win[i] = 0;
    }

    var logo = new Image();
    logo.src = "board.png";
    logo.onload = function () {
        drawChessBoard(logo);
    };
    setup();
};

init();
