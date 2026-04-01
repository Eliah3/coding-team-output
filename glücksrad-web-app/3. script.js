/**
 * Tic-Tac-Toe Spiel mit KI
 * Implementiert Minimax-Algorithmus für unbesiegbare KI
 */

class TicTacToe {
    constructor() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X'; // X ist der Spieler, O ist die KI
        this.gameActive = true;
        this.scores = { X: 0, O: 0 };
        this.difficulty = 'normal'; // 'easy', 'normal', 'hard'
        
        // Gewinnkombinationen
        this.winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Zeilen
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Spalten
            [0, 4, 8], [2, 4, 6]             // Diagonalen
        ];
        
        this.init();
    }
    
    init() {
        this.cells = document.querySelectorAll('.cell');
        this.restartBtn = document.getElementById('restartBtn');
        this.difficultyBtn = document.getElementById('difficultyBtn');
        this.messageEl = document.getElementById('message');
        this.currentPlayerEl = document.getElementById('currentPlayer');
        this.scoreXEl = document.getElementById('scoreX');
        this.scoreOEl = document.getElementById('scoreO');
        
        this.addEventListeners();
        this.updateCurrentPlayerDisplay();
    }
    
    addEventListeners() {
        this.cells.forEach(cell => {
            cell.addEventListener('click', (e) => this.handleCellClick(e));
        });
        
        this.restartBtn.addEventListener('click', () => this.restartGame());
        this.difficultyBtn.addEventListener('click', () => this.cycleDifficulty());
    }
    
    handleCellClick(e) {
        const index = parseInt(e.target.dataset.index);
        
        // Prüfen ob Zug gültig ist
        if (this.board[index] !== null || !this.gameActive || this.currentPlayer !== 'X') {
            return;
        }
        
        // Spieler setzt X
        this.makeMove(index, 'X');
        
        // Prüfen auf Spielende
        if (this.gameActive) {
            // KI ist am Zug
            this.currentPlayer = 'O';
            this.updateCurrentPlayerDisplay();
            
            // Kleine Verzögerung für bessere UX
            setTimeout(() => {
                this.aiMove();
            }, 500);
        }
    }
    
    makeMove(index, player) {
        this.board[index] = player;
        this.cells[index].textContent = player;
        this.cells[index].classList.add('taken', player.toLowerCase());
        
        // Prüfen auf Gewinn
        const winner = this.checkWinner();
        
        if (winner) {
            this.endGame(winner);
        } else if (this.board.every(cell => cell !== null)) {
            this.endGame('draw');
        } else {
            // Spieler wechseln
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
            this.updateCurrentPlayerDisplay();
        }
    }
    
    checkWinner() {
        for (const combo of this.winningCombinations) {
            const [a, b, c] = combo;
            if (this.board[a] && 
                this.board[a] === this.board[b] && 
                this.board[a] === this.board[c]) {
                return { winner: this.board[a], combo };
            }
        }
        return null;
    }
    
    endGame(result) {
        this.gameActive = false;
        
        if (result === 'draw') {
            this.showMessage('Unentschieden!', 'draw');
        } else {
            this.scores[result.winner]++;
            this.updateScoreBoard();
            this.highlightWinner(result.combo);
            this.showMessage(`${result.winner} hat gewonnen!`, 'win');
        }
        
        // Alle Zellen als nicht mehr klickbar markieren
        this.cells.forEach(cell => cell.classList.add('game-over'));
    }
    
    highlightWinner(combo) {
        combo.forEach(index => {
            this.cells[index].classList.add('winner');
        });
    }
    
    showMessage(text, type) {
        this.messageEl.textContent = text;
        this.messageEl.className = `game-message show ${type}`;
    }
    
    hideMessage() {
        this.messageEl.className = 'game-message';
    }
    
    updateCurrentPlayerDisplay() {
        const playerSymbol = this.currentPlayer === 'X' ? 'X' : 'O';
        const playerClass = this.currentPlayer === 'X' ? 'player-x' : 'player-o';
        this.currentPlayerEl.innerHTML = `<span class="${playerClass}">${playerSymbol}</span> ist dran`;
    }
    
    updateScoreBoard() {
        this.scoreXEl.textContent = this.scores.X;
        this.scoreOEl.textContent = this.scores.O;
    }
    
    restartGame() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameActive = true;
        
        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
        });
        
        this.hideMessage();
        this.updateCurrentPlayerDisplay();
    }
    
    cycleDifficulty() {
        const difficulties = ['easy', 'normal', 'hard'];
        const currentIndex = difficulties.indexOf(this.difficulty);
        this.difficulty = difficulties[(currentIndex + 1) % difficulties.length];
        
        const labels = {
            easy: 'Einfach',
            normal: 'Normal',
            hard: 'Unbesiegbar'
        };
        
        this.difficultyBtn.textContent = `Schwierigkeit: ${labels[this.difficulty]}`;
    }
    
    // KI-Logik
    aiMove() {
        if (!this.gameActive) return;
        
        let move;
        
        switch (this.difficulty) {
            case 'easy':
                move = this.getRandomMove();
                break;
            case 'normal':
                // 50% Chance für optimalen Zug
                move = Math.random() < 0.5 ? this.getBestMove() : this.getRandomMove();
                break;
            case 'hard':
                move = this.getBestMove();
                break;
        }
        
        this.makeMove(move, 'O');
    }
    
    getRandomMove() {
        const available = this.board
            .map((cell, index) => cell === null ? index : null)
            .filter(index => index !== null);
        
        return available[Math.floor(Math.random() * available.length)];
    }
    
    getBestMove() {
        let bestScore = -Infinity;
        let bestMove = null;
        
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === null) {
                this.board[i] = 'O';
                const score = this.minimax(this.board, 0, false);
                this.board[i] = null;
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        
        return bestMove;
    }
    
    minimax(board, depth, isMaximizing) {
        const result = this.checkWinner();
        
        if (result) {
            return result.winner === 'O' ? 10 - depth : depth - 10;
        }
        
        if (board.every(cell => cell !== null)) {
            return 0;
        }
        
        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === null) {
                    board[i] = 'O';
                    const score = this.minimax(board, depth + 1, false);
                    board[i] = null;
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === null) {
                    board[i] = 'X';
                    const score = this.minimax(board, depth + 1, true);
                    board[i] = null;
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }
}

// Spiel initialisieren wenn DOM geladen ist
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
});