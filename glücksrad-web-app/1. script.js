/**
 * Tic-Tac-Toe Pop-Up Feedback Implementation
 * Zeigt ein Pop-Up nach Spielende mit dem Ergebnis
 */

class TicTacToeGame {
    constructor() {
        this.board = ['', '', '', '', '', '', '', '', ''];
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.winningConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];
        
        this.init();
    }

    init() {
        this.createBoard();
        this.createPopup();
        this.addEventListeners();
    }

    createBoard() {
        const boardElement = document.getElementById('game-board');
        if (!boardElement) return;

        boardElement.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.setAttribute('data-index', i);
            cell.addEventListener('click', () => this.handleCellClick(i));
            boardElement.appendChild(cell);
        }
    }

    createPopup() {
        // Entferne bestehendes Pop-Up falls vorhanden
        const existingPopup = document.getElementById('result-popup');
        if (existingPopup) {
            existingPopup.remove();
        }

        // Erstelle das Pop-Up-Element
        const popup = document.createElement('div');
        popup.id = 'result-popup';
        popup.className = 'popup hidden';
        
        popup.innerHTML = `
            <div class="popup-content">
                <h2 id="popup-title">Spiel beendet!</h2>
                <p id="popup-message"></p>
                <div id="popup-result-icon"></div>
                <button id="restart-btn" class="btn-restart">Nochmal spielen</button>
                <button id="close-popup-btn" class="btn-close">Schließen</button>
            </div>
        `;

        document.body.appendChild(popup);
    }

    addEventListeners() {
        // Restart Button
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.restartGame());
        }

        // Close Button
        const closeBtn = document.getElementById('close-popup-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closePopup());
        }

        // Schließe Pop-Up bei Klick außerhalb
        const popup = document.getElementById('result-popup');
        if (popup) {
            popup.addEventListener('click', (e) => {
                if (e.target === popup) {
                    this.closePopup();
                }
            });
        }
    }

    handleCellClick(index) {
        if (!this.gameActive || this.board[index] !== '') {
            return;
        }

        this.board[index] = this.currentPlayer;
        this.updateCell(index);
        this.checkResult();
        
        if (this.gameActive) {
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        }
    }

    updateCell(index) {
        const cells = document.querySelectorAll('.cell');
        cells[index].textContent = this.board[index];
        cells[index].classList.add(this.currentPlayer.toLowerCase());
    }

    checkResult() {
        let roundWon = false;
        let winningLine = [];

        for (let i = 0; i < this.winningConditions.length; i++) {
            const [a, b, c] = this.winningConditions[i];
            if (this.board[a] === '' || this.board[b] === '' || this.board[c] === '') {
                continue;
            }
            if (this.board[a] === this.board[b] && this.board[b] === this.board[c]) {
                roundWon = true;
                winningLine = [a, b, c];
                break;
            }
        }

        if (roundWon) {
            this.gameActive = false;
            this.showPopup('win', winningLine);
            return;
        }

        if (!this.board.includes('')) {
            this.gameActive = false;
            this.showPopup('draw');
            return;
        }
    }

    showPopup(result, winningLine = []) {
        const popup = document.getElementById('result-popup');
        const title = document.getElementById('popup-title');
        const message = document.getElementById('popup-message');
        const icon = document.getElementById('popup-result-icon');

        if (result === 'win') {
            const winner = this.currentPlayer;
            const isPlayerWin = winner === 'X'; // Spieler ist immer X
            
            title.textContent = isPlayerWin ? '🎉 Gewonnen!' : '💻 Du hast verloren!';
            message.textContent = isPlayerWin 
                ? 'Herzlichen Glückwunsch! Du hast das Spiel gewonnen.' 
                : 'Die Maschine hat gewonnen. Versuche es noch einmal!';
            
            icon.innerHTML = isPlayerWin ? '🏆' : '🤖';
            popup.classList.add('win');
            
            // Markiere Gewinnerzellen
            this.highlightWinningCells(winningLine);
        } else {
            title.textContent = '🤝 Unentschieden!';
            message.textContent = 'Das Spiel endet unentschieden. Versuche es noch einmal!';
            icon.innerHTML = '⚖️';
            popup.classList.add('draw');
        }

        // Zeige Pop-Up mit Animation
        popup.classList.remove('hidden');
        setTimeout(() => {
            popup.classList.add('show');
        }, 10);
    }

    highlightWinningCells(winningLine) {
        const cells = document.querySelectorAll('.cell');
        winningLine.forEach(index => {
            cells[index].classList.add('winner');
        });
    }

    closePopup() {
        const popup = document.getElementById('result-popup');
        popup.classList.remove('show');
        setTimeout(() => {
            popup.classList.add('hidden');
        }, 300);
    }

    restartGame() {
        this.board = ['', '', '', '', '', '', '', '', ''];
        this.currentPlayer = 'X';
        this.gameActive = true;

        // Entferne alle Klassen von Zellen
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o', 'winner');
        });

        // Schließe Pop-Up
        this.closePopup();
    }
}

// Initialisiere das Spiel wenn das DOM geladen ist
document.addEventListener('DOMContentLoaded', () => {
    const game = new TicTacToeGame();
});