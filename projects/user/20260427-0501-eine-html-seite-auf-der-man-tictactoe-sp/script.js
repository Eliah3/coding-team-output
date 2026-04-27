/**
 * TicTacToe - Client-side Logic
 * Implementiert nach dem Orchestrator-Plan.
 */
(() => {
    // --- Konstanten ---
    const CELLS = 9;
    const WINNING_COMBOS = [
        [0, 1, 2], // Reihen
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6], // Spalten
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8], // Diagonalen
        [2, 4, 6]
    ];

    // --- State ---
    let board = Array(CELLS).fill(null);
    let currentPlayer = 'X';
    let gameOver = false;

    // --- DOM-Elemente ---
    const boardEl = document.getElementById('board');
    const statusEl = document.getElementById('status');
    const resetBtn = document.getElementById('reset-btn');

    // --- Initialisierung ---
    function init() {
        resetBtn.addEventListener('click', resetGame);
        renderBoard();
        updateStatus(`Spieler ${currentPlayer} ist am Zug`);
    }

    /**
     * Rendert das Spielfeld neu basierend auf dem board-Array.
     */
    function renderBoard() {
        boardEl.innerHTML = ''; // Clear current board

        board.forEach((cell, index) => {
            const btn = document.createElement('button');
            btn.textContent = cell || ''; // Zeigt X oder O, sonst leer
            btn.dataset.index = index;

            // Barrierefreiheit: Dynamisches Label
            // "Zelle 1, X" oder "Zelle 1, leer"
            const cellLabel = cell ? `Zelle ${index + 1}, ${cell}` : `Zelle ${index + 1}, leer`;
            btn.setAttribute('aria-label', cellLabel);

            // Deaktivieren wenn belegt oder Spiel vorbei
            if (cell || gameOver) {
                btn.disabled = true;
            } else {
                btn.addEventListener('click', handleCellClick);
            }

            boardEl.appendChild(btn);
        });
    }

    /**
     * Verarbeitet einen Klick auf eine Zelle.
     */
    function handleCellClick(e) {
        const index = Number(e.target.dataset.index);

        // Sicherheitscheck (sollte durch disabled-Attribut redundant sein)
        if (board[index] || gameOver) return;

        // Spielzug ausführen
        board[index] = currentPlayer;
        
        // UI Update
        renderBoard();

        // Sieg-Prüfung
        const winningCombo = checkWin(currentPlayer);
        if (winningCombo) {
            handleWin(winningCombo);
            return;
        }

        // Unentschieden-Prüfung
        if (board.every(cell => cell !== null)) {
            handleDraw();
            return;
        }

        // Spieler wechseln
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateStatus(`Spieler ${currentPlayer} ist am Zug`);
    }

    /**
     * Prüft, ob der aktuelle Spieler gewonnen hat.
     * @param {string} player - 'X' oder 'O'
     * @returns {number[]|null} - Array mit Indizes der Gewinnreihe oder null
     */
    function checkWin(player) {
        for (const combo of WINNING_COMBOS) {
            const [a, b, c] = combo;
            if (board[a] === player && board[b] === player && board[c] === player) {
                return combo; // Gewinnkombination zurückgeben
            }
        }
        return null;
    }

    /**
     * Behandelt den Gewinnfall.
     */
    function handleWin(combo) {
        gameOver = true;
        updateStatus(`Spieler ${currentPlayer} gewinnt!`);
        
        // Gewinnzellen visuell hervorheben
        const buttons = boardEl.querySelectorAll('button');
        combo.forEach(index => {
            buttons[index].classList.add('win');
        });
    }

    /**
     * Behandelt den Unentschieden-Fall.
     */
    function handleDraw() {
        gameOver = true;
        updateStatus('Unentschieden!');
    }

    /**
     * Setzt den Status-Text und informiert Screen Reader.
     * @param {string} message 
     */
    function updateStatus(message) {
        statusEl.textContent = message;
    }

    /**
     * Setzt das gesamte Spiel zurück.
     */
    function resetGame() {
        board = Array(CELLS).fill(null);
        currentPlayer = 'X';
        gameOver = false;
        updateStatus('Spieler X ist am Zug');
        renderBoard();
    }

    // Starten
    init();
})();