/**
 * Tic-Tac-Toe Spiel-Logik
 * Implementiert Kollisionserkennung, Scoring und Neustart
 */

// Spielzustand
const GameState = {
    EMPTY: '',
    PLAYER_X: 'X',
    PLAYER_O: 'O'
};

// Spielstatus
let currentPlayer = GameState.PLAYER_X;
let gameBoard = [];
let gameActive = false;
let scores = {
    playerX: 0,
    playerO: 0,
    draws: 0
};

// Gewinnmuster (alle möglichen Gewinnkombinationen)
const WINNING_COMBINATIONS = [
    [0, 1, 2], // Obere Reihe
    [3, 4, 5], // Mittlere Reihe
    [6, 7, 8], // Untere Reihe
    [0, 3, 6], // Linke Spalte
    [1, 4, 7], // Mittlere Spalte
    [2, 5, 8], // Rechte Spalte
    [0, 4, 8], // Diagonale oben-links nach unten-rechts
    [2, 4, 6]  // Diagonale oben-rechts nach unten-links
];

/**
 * Initialisiert das Spiel
 */
function initGame() {
    gameBoard = Array(9).fill(GameState.EMPTY);
    currentPlayer = GameState.PLAYER_X;
    gameActive = true;
    updateStatus(`Spieler ${currentPlayer} ist am Zug`);
    renderBoard();
}

/**
 * Macht einen Zug an der angegebenen Position
 * @param {number} position - Die Position (0-8) auf dem Spielfeld
 * @returns {boolean} - true wenn der Zug erfolgreich war
 */
function makeMove(position) {
    // Prüfen ob Spiel aktiv und Feld leer ist
    if (!gameActive || gameBoard[position] !== GameState.EMPTY) {
        return false;
    }

    // Zug ausführen
    gameBoard[position] = currentPlayer;
    renderBoard();

    // Kollisionserkennung / Gewinnprüfung
    if (checkCollision()) {
        endGame(currentPlayer);
        return true;
    }

    // Unentschieden prüfen
    if (checkDraw()) {
        endGame(null);
        return true;
        // Spieler wechseln
    } else {
        currentPlayer = currentPlayer === GameState.PLAYER_X 
            ? GameState.PLAYER_O 
            : GameState.PLAYER_X;
        updateStatus(`Spieler ${currentPlayer} ist am Zug`);
    }

    return true;
}

/**
 * Prüft auf Kollision/Gewinn
 * @returns {boolean} - true wenn jemand gewonnen hat
 */
function checkCollision() {
    for (const combination of WINNING_COMBINATIONS) {
        const [a, b, c] = combination;
        
        if (gameBoard[a] !== GameState.EMPTY &&
            gameBoard[a] === gameBoard[b] &&
            gameBoard[b] === gameBoard[c]) {
            return true;
        }
    }
    return false;
}

/**
 * Prüft auf Unentschieden
 * @returns {boolean} - true wenn das Spiel unentschieden endet
 */
function checkDraw() {
    return gameBoard.every(cell => cell !== GameState.EMPTY);
}

/**
 * Gibt die Gewinnkombination zurück (falls vorhanden)
 * @returns {number[]|null} - Array mit den Gewinnpositionen oder null
 */
function getWinningCombination() {
    for (const combination of WINNING_COMBINATIONS) {
        const [a, b, c] = combination;
        
        if (gameBoard[a] !== GameState.EMPTY &&
            gameBoard[a] === gameBoard[b] &&
            gameBoard[b] === gameBoard[c]) {
            return combination;
        }
    }
    return null;
}

/**
 * Beendet das Spiel
 * @param {string|null} winner - Der Gewinner oder null bei Unentschieden
 */
function endGame(winner) {
    gameActive = false;
    
    if (winner === null) {
        scores.draws++;
        updateStatus('Unentschieden!');
        highlightDraw();
    } else {
        if (winner === GameState.PLAYER_X) {
            scores.playerX++;
        } else {
            scores.playerO++;
        }
        updateStatus(`Spieler ${winner} hat gewonnen!`);
        highlightWinner();
    }
    
    updateScoreBoard();
}

/**
 * Aktualisiert die Statusanzeige
 * @param {string} message - Die anzuzeigende Nachricht
 */
function updateStatus(message) {
    const statusElement = document.getElementById('game-status');
    if (statusElement) {
        statusElement.textContent = message;
    }
}

/**
 * Aktualisiert die Score-Anzeige
 */
function updateScoreBoard() {
    const scoreXElement = document.getElementById('score-x');
    const scoreOElement = document.getElementById('score-o');
    const scoreDrawElement = document.getElementById('score-draw');
    
    if (scoreXElement) scoreXElement.textContent = scores.playerX;
    if (scoreOElement) scoreOElement.textContent = scores.playerO;
    if (scoreDrawElement) scoreDrawElement.textContent = scores.draws;
}

/**
 * Hebt die Gewinnerzeile hervor
 */
function highlightWinner() {
    const winningCombination = getWinningCombination();
    if (!winningCombination) return;
    
    const cells = document.querySelectorAll('.game-cell');
    winningCombination.forEach(index => {
        if (cells[index]) {
            cells[index].classList.add('winner');
        }
    });
}

/**
 * Hebt alle Zellen bei Unentschieden hervor
 */
function highlightDraw() {
    const cells = document.querySelectorAll('.game-cell');
    cells.forEach(cell => {
        cell.classList.add('draw');
    });
}

/**
 * Rendert das Spielfeld
 */
function renderBoard() {
    const boardElement = document.getElementById('game-board');
    if (!boardElement) return;
    
    boardElement.innerHTML = '';
    
    gameBoard.forEach((cell, index) => {
        const cellElement = document.createElement('div');
        cellElement.classList.add('game-cell');
        cellElement.dataset.index = index;
        cellElement.textContent = cell;
        
        if (cell !== GameState.EMPTY) {
            cellElement.classList.add(cell === GameState.PLAYER_X ? 'x' : 'o');
        }
        
        cellElement.addEventListener('click', () => handleCellClick(index));
        boardElement.appendChild(cellElement);
    });
}

/**
 * Behandelt einen Klick auf eine Zelle
 * @param {number} index - Der Index der geklickten Zelle
 */
function handleCellClick(index) {
    if (makeMove(index)) {
        // KI-Zug nach kurzer Verzögerung (falls gegen Computer gespielt wird)
        if (gameActive && currentPlayer === GameState.PLAYER_O) {
            setTimeout(makeComputerMove, 500);
        }
    }
}

/**
 * Einfache KI-Logik für den Computergegner
 */
function makeComputerMove() {
    if (!gameActive) return;
    
    // Strategie: 
    // 1. Versuche zu gewinnen
    // 2. Blockiere den Spieler
    // 3. Nimm das Zentrum falls verfügbar
    // 4. Nimm eine zufällige freie Position
    
    let move = findWinningMove(GameState.PLAYER_O);
    
    if (move === -1) {
        move = findWinningMove(GameState.PLAYER_X);
    }
    
    if (move === -1 && gameBoard[4] === GameState.EMPTY) {
        move = 4;
    }
    
    if (move === -1) {
        const emptyCells = gameBoard
            .map((cell, index) => cell === GameState.EMPTY ? index : -1)
            .filter(index => index !== -1);
        
        if (emptyCells.length > 0) {
            move = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        }
    }
    
    if (move !== -1) {
        makeMove(move);
    }
}

/**
 * Findet einen Gewinnzug für den angegebenen Spieler
 * @param {string} player - Der Spieler (X oder O)
 * @returns {number} - Die Position des Gewinnzugs oder -1
 */
function findWinningMove(player) {
    for (const combination of WINNING_COMBINATIONS) {
        const [a, b, c] = combination;
        
        // Prüfe ob zwei Felder vom Spieler besetzt sind und das dritte leer ist
        const cells = [gameBoard[a], gameBoard[b], gameBoard[c]];
        const playerCount = cells.filter(cell => cell === player).length;
        const emptyCount = cells.filter(cell => cell === GameState.EMPTY).length;
        
        if (playerCount === 2 && emptyCount === 1) {
            if (gameBoard[a] === GameState.EMPTY) return a;
            if (gameBoard[b] === GameState.EMPTY) return b;
            if (gameBoard[c] === GameState.EMPTY) return c;
        }
    }
    return -1;
}

/**
 * Startet das Spiel neu
 */
function restartGame() {
    // Entferne Hervorhebungen
    const cells = document.querySelectorAll('.game-cell');
    cells.forEach(cell => {
        cell.classList.remove('winner', 'draw');
    });
    
    initGame();
}

/**
 * Setzt die Punktestände zurück
 */
function resetScores() {
    scores = {
        playerX: 0,
        playerO: 0,
        draws: 0
    };
    updateScoreBoard();
}

/**
 * Wechselt den Spieler manuell (für Debugging oder Spielmodus-Änderung)
 */
function switchPlayer() {
    currentPlayer = currentPlayer === GameState.PLAYER_X 
        ? GameState.PLAYER_O 
        : GameState.PLAYER_X;
    if (gameActive) {
        updateStatus(`Spieler ${currentPlayer} ist am Zug`);
    }
}

/**
 * Gibt den aktuellen Spielstand zurück
 * @returns {Object} - Aktueller Spielstand
 */
function getGameState() {
    return {
        board: [...gameBoard],
        currentPlayer,
        active: gameActive,
        scores: { ...scores }
    };
}

// Export für Module (falls benötigt)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GameState,
        initGame,
        makeMove,
        checkCollision,
        checkDraw,
        getWinningCombination,
        restartGame,
        resetScores,
        getGameState,
        makeComputerMove
    };
}