/**
 * Tic-Tac-Toe JavaScript
 * Korrigierte Zeilenenden und saubere Struktur
 */

// Spielzustand
const gameState = {
    board: ['', '', '', '', '', '', '', '', ''],
    currentPlayer: 'X',
    gameActive: true,
    vsAI: false,
    scores: { X: 0, O: 0 }
};

// Gewinnkombinationen
const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Zeilen
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Spalten
    [0, 4, 8], [2, 4, 6]             // Diagonalen
];

// DOM-Elemente
const cells = document.querySelectorAll('.cell');
const statusDisplay = document.getElementById('status');
const restartBtn = document.getElementById('restartBtn');
const aiModeBtn = document.getElementById('aiModeBtn');
const modeText = document.getElementById('modeText');
const scoreX = document.getElementById('scoreX');
const scoreO = document.getElementById('scoreO');

// Event Listener initialisieren
function initEventListeners() {
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });
    
    restartBtn.addEventListener('click', restartGame);
    aiModeBtn.addEventListener('click', toggleAIMode);
}

// Zellklick behandeln
function handleCellClick(e) {
    const clickedCell = e.target;
    const cellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (gameState.board[cellIndex] !== '' || !gameState.gameActive) {
        return;
    }

    makeMove(cellIndex, gameState.currentPlayer);

    if (gameState.gameActive && gameState.vsAI && gameState.currentPlayer === 'O') {
        setTimeout(makeAIMove, 500);
    }
}

// Zug ausführen
function makeMove(index, player) {
    gameState.board[index] = player;
    const cell = cells[index];
    cell.textContent = player;
    cell.classList.add(player.toLowerCase());

    if (checkWin(player)) {
        endGame(false, player);
    } else if (checkDraw()) {
        endGame(true);
    } else {
        switchPlayer();
    }
}

// Spieler wechseln
function switchPlayer() {
    gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
    statusDisplay.textContent = `Spieler ${gameState.currentPlayer} ist dran`;
}

// Auf Gewinn prüfen
function checkWin(player) {
    return winningCombinations.some(combination => {
        return combination.every(index => {
            return gameState.board[index] === player;
        });
    });
}

// Auf Unentschieden prüfen
function checkDraw() {
    return gameState.board.every(cell => cell !== '');
}

// Spiel beenden
function endGame(draw, winner = null) {
    gameState.gameActive = false;
    
    if (draw) {
        statusDisplay.textContent = 'Unentschieden!';
    } else {
        statusDisplay.textContent = `Spieler ${winner} hat gewonnen!`;
        gameState.scores[winner]++;
        updateScoreBoard();
        highlightWinningCells(winner);
    }
}

// Gewonnene Zellen hervorheben
function highlightWinningCells(player) {
    winningCombinations.forEach(combination => {
        if (combination.every(index => gameState.board[index] === player)) {
            combination.forEach(index => {
                cells[index].classList.add('winning');
            });
        }
    });
}

// Punktestand aktualisieren
function updateScoreBoard() {
    scoreX.textContent = gameState.scores.X;
    scoreO.textContent = gameState.scores.O;
}

// Spiel neu starten
function restartGame() {
    gameState.board = ['', '', '', '', '', '', '', '', ''];
    gameState.currentPlayer = 'X';
    gameState.gameActive = true;
    
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'winning');
    });
    
    statusDisplay.textContent = 'Spieler X ist dran';
}

// KI-Modus umschalten
function toggleAIMode() {
    gameState.vsAI = !gameState.vsAI;
    modeText.textContent = gameState.vsAI ? 'Modus: Spieler vs KI' : 'Modus: Spieler vs Spieler';
    aiModeBtn.textContent = gameState.vsAI ? 'Gegen Spieler spielen' : 'Gegen KI spielen';
    restartGame();
}

// KI-Zug berechnen (Minimax-Algorithmus)
function makeAIMove() {
    if (!gameState.gameActive) return;

    let bestScore = -Infinity;
    let bestMove;

    for (let i = 0; i < 9; i++) {
        if (gameState.board[i] === '') {
            gameState.board[i] = 'O';
            let score = minimax(gameState.board, 0, false);
            gameState.board[i] = '';
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }

    makeMove(bestMove, 'O');
}

// Minimax-Algorithmus für optimale KI-Entscheidungen
function minimax(board, depth, isMaximizing) {
    let result = checkWinnerForMinimax();
    if (result !== null) {
        return result;
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                let score = minimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                let score = minimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

// Gewinner für Minimax prüfen
function checkWinnerForMinimax() {
    for (let combo of winningCombinations) {
        const [a, b, c] = combo;
        if (gameState.board[a] && 
            gameState.board[a] === gameState.board[b] && 
            gameState.board[a] === gameState.board[c]) {
            return gameState.board[a] === 'O' ? 10 : -10;
        }
    }
    if (checkDraw()) {
        return 0;
    }
    return null;
}

// Anwendung initialisieren
initEventListeners();