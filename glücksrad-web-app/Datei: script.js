/**
 * TicTacToe Desktop Spiel - Spiel-Logik
 * Implementiert Kollisionserkennung, Scoring, Neustart und alle fehlenden Methoden
 */

// ==================== KONSTANTEN ====================
const GAME_CONSTANTS = {
    // Spielfeldgröße
    GRID_SIZE: 3,
    CELL_SIZE: 100,
    BOARD_PADDING: 20,
    
    // Schwierigkeitsstufen
    DIFFICULTY: {
        EASY: 'easy',
        MEDIUM: 'medium',
        HARD: 'hard'
    },
    
    // Spielzustände
    STATE: {
        MENU: 'menu',
        PLAYING: 'playing',
        PAUSED: 'paused',
        GAME_OVER: 'game_over'
    },
    
    // Farben
    COLORS: {
        BACKGROUND: '#2c3e50',
        BOARD: '#34495e',
        CELL: '#ecf0f1',
        PLAYER_X: '#e74c3c',
        PLAYER_O: '#3498db',
        WIN_LINE: '#f39c12',
        TEXT: '#ecf0f1',
        BUTTON: '#27ae60',
        BUTTON_HOVER: '#2ecc71'
    },
    
    // Symbole
    SYMBOLS: {
        PLAYER: 'X',
        AI: 'O',
        EMPTY: ''
    }
};

// ==================== SPIEL-LOGIK KLASSE ====================
class TicTacToeGame {
    constructor() {
        // Spielbrett (3x3 Matrix)
        this.board = [];
        this.currentPlayer = GAME_CONSTANTS.SYMBOLS.PLAYER;
        this.gameState = GAME_CONSTANTS.STATE.MENU;
        this.winner = null;
        this.winningLine = [];
        this.score = { player: 0, ai: 0, draws: 0 };
        this.difficulty = GAME_CONSTANTS.DIFFICULTY.MEDIUM;
        this.moveCount = 0;
        
        // Logging-System
        this.logger = {
            enabled: true,
            log: (message, level = 'INFO') => {
                if (this.logger.enabled) {
                    const timestamp = new Date().toISOString();
                    console.log(`[${timestamp}] [${level}] ${message}`);
                }
            }
        };
        
        // Initialisiere das Spielbrett
        this.resetBoard();
        
        this.logger.log('Spiel-Logik initialisiert', 'INFO');
    }

    // ==================== GRUNDMETHODEN ====================
    
    /**
     * Setzt das Spielbrett auf den Ausgangszustand zurück
     */
    resetBoard() {
        this.board = Array(GAME_CONSTANTS.GRID_SIZE).fill(null)
            .map(() => Array(GAME_CONSTANTS.GRID_SIZE).fill(GAME_CONSTANTS.SYMBOLS.EMPTY));
        this.currentPlayer = GAME_CONSTANTS.SYMBOLS.PLAYER;
        this.winner = null;
        this.winningLine = [];
        this.moveCount = 0;
        this.logger.log('Spielbrett zurückgesetzt', 'DEBUG');
    }

    /**
     * Startet ein neues Spiel
     */
    startNewGame() {
        this.resetBoard();
        this.gameState = GAME_CONSTANTS.STATE.PLAYING;
        this.logger.log(`Neues Spiel gestartet - Schwierigkeit: ${this.difficulty}`, 'INFO');
        return true;
    }

    /**
     * Überprüft, ob ein Zug gültig ist
     * @param {number} row - Zeile (0-2)
     * @param {number} col - Spalte (0-2)
     * @returns {boolean} - True wenn Zug gültig
     */
    isValidMove(row, col) {
        // Prüfe ob Indizes im gültigen Bereich liegen
        if (row < 0 || row >= GAME_CONSTANTS.GRID_SIZE || 
            col < 0 || col >= GAME_CONSTANTS.GRID_SIZE) {
            this.logger.log(`Ungültiger Zug: Position außerhalb des Spielfelds (${row}, ${col})`, 'WARN');
            return false;
        }
        
        // Prüfe ob Zelle leer ist
        if (this.board[row][col] !== GAME_CONSTANTS.SYMBOLS.EMPTY) {
            this.logger.log(`Ungültiger Zug: Zelle bereits belegt (${row}, ${col})`, 'WARN');
            return false;
        }
        
        // Prüfe ob Spiel aktiv ist
        if (this.gameState !== GAME_CONSTANTS.STATE.PLAYING) {
            this.logger.log(`Ungültiger Zug: Spiel ist nicht aktiv (Status: ${this.gameState})`, 'WARN');
            return false;
        }
        
        return true;
    }

    /**
     * Führt einen Zug aus
     * @param {number} row - Zeile (0-2)
     * @param {number} col - Spalte (0-2)
     * @returns {boolean} - True wenn Zug erfolgreich
     */
    makeMove(row, col) {
        if (!this.isValidMove(row, col)) {
            return false;
        }
        
        // Setze Symbol auf dem Brett
        this.board[row][col] = this.currentPlayer;
        this.moveCount++;
        
        this.logger.log(`Spieler ${this.currentPlayer} setzt auf (${row}, ${col})`, 'INFO');
        
        // Prüfe auf Sieg oder Unentschieden
        if (this.checkWin(this.currentPlayer)) {
            this.handleWin();
            return true;
        }
        
        if (this.checkDraw()) {
            this.handleDraw();
            return true;
        }
        
        // Wechsle Spieler
        this.currentPlayer = this.currentPlayer === GAME_CONSTANTS.SYMBOLS.PLAYER 
            ? GAME_CONSTANTS.SYMBOLS.AI 
            : GAME_CONSTANTS.SYMBOLS.PLAYER;
        
        return true;
    }

    // ==================== KOLLISIONSERKENNUNG ====================
    
    /**
     * Prüft auf Kollision zwischen zwei Zellen
     * @param {number} row1 - Zeile der ersten Zelle
     * @param {number} col1 - Spalte der ersten Zelle
     * @param {number} row2 - Zeile der zweiten Zelle
     * @param {number} col2 - Spalte der zweiten Zelle
     * @returns {boolean} - True wenn Kollision
     */
    checkCollision(row1, col1, row2, col2) {
        return row1 === row2 && col1 === col2;
    }

    /**
     * Prüft ob eine Position mit einem bestimmten Symbol kollidiert
     * @param {number} row - Zu prüfende Zeile
     * @param {number} col - Zu prüfende Spalte
     * @param {string} symbol - Das zu prüfende Symbol
     * @returns {boolean} - True bei Kollision
     */
    checkSymbolCollision(row, col, symbol) {
        if (row < 0 || row >= GAME_CONSTANTS.GRID_SIZE || 
            col < 0 || col >= GAME_CONSTANTS.GRID_SIZE) {
            return false;
        }
        return this.board[row][col] === symbol;
    }

    /**
     * Prüft alle Kollisionen für eine bestimmte Position
     * @param {number} row - Zeile
     * @param {number} col - Spalte
     * @returns {object} - Kollisionsinformationen
     */
    checkAllCollisions(row, col) {
        const collisions = {
            withPlayer: this.checkSymbolCollision(row, col, GAME_CONSTANTS.SYMBOLS.PLAYER),
            withAI: this.checkSymbolCollision(row, col, GAME_CONSTANTS.SYMBOLS.AI),
            isEmpty: this.board[row][col] === GAME_CONSTANTS.SYMBOLS.EMPTY,
            isValid: row >= 0 && row < GAME_CONSTANTS.GRID_SIZE && 
                     col >= 0 && col < GAME_CONSTANTS.GRID_SIZE
        };
        
        collisions.any = collisions.withPlayer || collisions.withAI || !collisions.isEmpty;
        
        return collisions;
    }

    // ==================== SIEG-/UNENTSCHIEDEN-PRÜFUNG ====================
    
    /**
     * Prüft ob der aktuelle Spieler gewonnen hat
     * @param {string} player - Spieler-Symbol
     * @returns {boolean} - True wenn gewonnen
     */
    checkWin(player) {
        const size = GAME_CONSTANTS.GRID_SIZE;
        
        // Prüfe Zeilen
        for (let row = 0; row < size; row++) {
            if (this.board[row].every(cell => cell === player)) {
                this.winningLine = [[row, 0], [row, 1], [row, 2]];
                return true;
            }
        }
        
        // Prüfe Spalten
        for (let col = 0; col < size; col++) {
            if (this.board.every(row => row[col] === player)) {
                this.winningLine = [[0, col], [1, col], [2, col]];
                return true;
            }
        }
        
        // Prüfe Diagonale (links oben nach rechts unten)
        if (this.board.every((row, index) => row[index] === player)) {
            this.winningLine = [[0, 0], [1, 1], [2, 2]];
            return true;
        }
        
        // Prüfe Diagonale (rechts oben nach links unten)
        if (this.board.every((row, index) => row[size - 1 - index] === player)) {
            this.winningLine = [[0, 2], [1, 1], [2, 0]];
            return true;
        }
        
        return false;
    }

    /**
     * Prüft auf Unentschieden
     * @returns {boolean} - True wenn unentschieden
     */
    checkDraw() {
        return this.moveCount >= GAME_CONSTANTS.GRID_SIZE * GAME_CONSTANTS.GRID_SIZE && 
               !this.winner;
    }

    /**
     * Behandelt einen Sieg
     */
    handleWin() {
        this.winner = this.currentPlayer;
        this.gameState = GAME_CONSTANTS.STATE.GAME_OVER;
        
        if (this.winner === GAME_CONSTANTS.SYMBOLS.PLAYER) {
            this.score.player++;
            this.logger.log('Spieler hat gewonnen!', 'INFO');
        } else {
            this.score.ai++;
            this.logger.log('KI hat gewonnen!', 'INFO');
        }
        
        this.logger.log(`Aktueller Punktestand - Spieler: ${this.score.player}, KI: ${this.score.ai}, Unentschieden: ${this.score.draws}`, 'INFO');
    }

    /**
     * Behandelt ein Unentschieden
     */
    handleDraw() {
        this.gameState = GAME_CONSTANTS.STATE.GAME_OVER;
        this.score.draws++;
        this.logger.log('Unentschieden!', 'INFO');
    }

    // ==================== PAUSE-FUNKTION ====================
    
    /**
     * Schaltet den Pausenzustand um
     * @returns {boolean} - Neuer Pausenzustand
     */
    togglePause() {
        if (this.gameState === GAME_CONSTANTS.STATE.PLAYING) {
            this.gameState = GAME_CONSTANTS.STATE.PAUSED;
            this.logger.log('Spiel pausiert', 'INFO');
        } else if (this.gameState === GAME_CONSTANTS.STATE.PAUSED) {
            this.gameState = GAME_CONSTANTS.STATE.PLAYING;
            this.logger.log('Spiel fortgesetzt', 'INFO');
        }
        
        return this.gameState === GAME_CONSTANTS.STATE.PAUSED;
    }

    /**
     * Prüft ob das Spiel pausiert ist
     * @returns {boolean}
     */
    isPaused() {
        return this.gameState === GAME_CONSTANTS.STATE.PAUSED;
    }

    // ==================== SCHWIERIGKEIT ====================
    
    /**
     * Setzt die Schwierigkeitsstufe
     * @param {string} difficulty - Schwierigkeitsstufe ('easy', 'medium', 'hard')
     * @returns {boolean} - True wenn erfolgreich
     */
    setDifficulty(difficulty) {
        const validDifficulties = Object.values(GAME_CONSTANTS.DIFFICULTY);
        
        if (!validDifficulties.includes(difficulty)) {
            this.logger.log(`Ungültige Schwierigkeitsstufe: ${difficulty}`, 'WARN');
            return false;
        }
        
        this.difficulty = difficulty;
        this.logger.log(`Schwierigkeitsstufe gesetzt auf: ${difficulty}`, 'INFO');
        return true;
    }

    /**
     * Gibt die aktuelle Schwierigkeitsstufe zurück
     * @returns {string}
     */
    getDifficulty() {
        return this.difficulty;
    }

    /**
     * Gibt Parameter für die KI basierend auf der Schwierigkeit zurück
     * @returns {object}
     */
    getDifficultyParams() {
        const params = {
            [GAME_CONSTANTS.DIFFICULTY.EASY]: {
                randomMoveChance: 0.8,  // 80% Zufallszüge
                winPriority: true,
                blockPriority: true
            },
            [GAME_CONSTANTS.DIFFICULTY.MEDIUM]: {
                randomMoveChance: 0.4,  // 40% Zufallszüge
                winPriority: true,
                blockPriority: true
            },
            [GAME_CONSTANTS.DIFFICULTY.HARD]: {
                randomMoveChance: 0.1,  // 10% Zufallszüge
                winPriority: true,
                blockPriority: true,
                optimalPlay: true  // Minimax-Algorithmus
            }
        };
        
        return params[this.difficulty];
    }

    // ==================== SCORING ====================
    
    /**
     * Gibt den aktuellen Punktestand zurück
     * @returns {object}
     */
    getScore() {
        return { ...this.score };
    }

    /**
     * Aktualisiert den Punktestand
     * @param {string} winner - Gewinner-Symbol
     */
    updateScore(winner) {
        if (winner === GAME_CONSTANTS.SYMBOLS.PLAYER) {
            this.score.player++;
        } else if (winner === GAME_CONSTANTS.SYMBOLS.AI) {
            this.score.ai++;
        } else {
            this.score.draws++;
        }
        
        this.logger.log(`Punktestand aktualisiert: Spieler ${this.score.player} - KI ${this.score.ai}`, 'DEBUG');
    }

    /**
     * Setzt den Punktestand zurück
     */
    resetScore() {
        this.score = { player: 0, ai: 0, draws: 0 };
        this.logger.log('Punktestand zurückgesetzt', 'INFO');
    }

    // ==================== SPIELZUSTAND ====================
    
    /**
     * Gibt den aktuellen Spielzustand zurück
     * @returns {string}
     */
    getGameState() {
        return this.gameState;
    }

    /**
     * Setzt den Spielzustand
     * @param {string} state - Neuer Zustand
     */
    setGameState(state) {
        const validStates = Object.values(GAME_CONSTANTS.STATE);
        
        if (!validStates.includes(state)) {
            this.logger.log(`Ungültiger Spielzustand: ${state}`, 'WARN');
            return false;
        }
        
        this.gameState = state;
        this.logger.log(`Spielzustand geändert zu: ${state}`, 'DEBUG');
        return true;
    }

    /**
     * Prüft ob das Spiel vorbei ist
     * @returns {boolean}
     */
    isGameOver() {
        return this.gameState === GAME_CONSTANTS.STATE.GAME_OVER;
    }

    /**
     * Prüft ob das Spiel läuft
     * @returns {boolean}
     */
    isPlaying() {
        return this.gameState === GAME_CONSTANTS.STATE.PLAYING;
    }

    // ==================== BRETT-INFORMATIONEN ====================
    
    /**
     * Gibt das aktuelle Brett zurück
     * @returns {Array}
     */
    getBoard() {
        return this.board.map(row => [...row]);
    }

    /**
     * Gibt die Gewinnlinie zurück
     * @returns {Array}
     */
    getWinningLine() {
        return [...this.winningLine];
    }

    /**
     * Gibt den aktuellen Spieler zurück
     * @returns {string}
     */
    getCurrentPlayer() {
        return this.currentPlayer;
    }

    /**
     * Gibt den Gewinner zurück
     * @returns {string|null}
     */
    getWinner() {
        return this.winner;
    }

    /**
     * Gibt die Anzahl der Züge zurück
     * @returns {number}
     */
    getMoveCount() {
        return this.moveCount;
    }

    // ==================== STATISTIKEN ====================
    
    /**
     * Gibt Spielstatistiken zurück
     * @returns {object}
     */
    getStatistics() {
        const totalGames = this.score.player + this.score.ai + this.score.draws;
        const playerWinRate = totalGames > 0 ? (this.score.player / totalGames * 100).toFixed(1) : 0;
        const aiWinRate = totalGames > 0 ? (this.score.ai / totalGames * 100).toFixed(1) : 0;
        
        return {
            totalGames,
            playerWins: this.score.player,
            aiWins: this.score.ai,
            draws: this.score.draws,
            playerWinRate: `${playerWinRate}%`,
            aiWinRate: `${aiWinRate}%`,
            currentDifficulty: this.difficulty,
            movesThisGame: this.moveCount
        };
    }

    // ==================== VALIDIERUNG ====================
    
    /**
     * Validiert die Brettstruktur
     * @returns {object} - Validierungsergebnis
     */
    validateBoard() {
        const errors = [];
        
        // Prüfe ob Brett existiert
        if (!this.board || !Array.isArray(this.board)) {
            errors.push('Brett existiert nicht oder ist kein Array');
            return { valid: false, errors };
        }
        
        // Prüfe Größe
        if (this.board.length !== GAME_CONSTANTS.GRID_SIZE) {
            errors.push(`Ungültige Brettgröße: ${this.board.length} (erwartet: ${GAME_CONSTANTS.GRID_SIZE})`);
        }
        
        // Prüfe jede Zeile
        this.board.forEach((row, rowIndex) => {
            if (!Array.isArray(row)) {
                errors.push(`Zeile ${rowIndex} ist kein Array`);
                return;
            }
            
            if (row.length !== GAME_CONSTANTS.GRID_SIZE) {
                errors.push(`Ungültige Zeilengröße in Zeile ${rowIndex}: ${row.length}`);
            }
            
            // Prüfe Zelleninhalte
            row.forEach((cell, colIndex) => {
                const validSymbols = [GAME_CONSTANTS.SYMBOLS.EMPTY, 
                                      GAME_CONSTANTS.SYMBOLS.PLAYER, 
                                      GAME_CONSTANTS.SYMBOLS.AI];
                if (!validSymbols.includes(cell)) {
                    errors.push(`Ungültiger Zelleninhalt bei (${rowIndex}, ${colIndex}): ${cell}`);
                }
            });
        });
        
        return {
            valid: errors.length === 0,
            errors
        };
    }

    // ==================== DEBUG-METHODEN ====================
    
    /**
     * Gibt eine textuelle Darstellung des Brettes zurück
     * @returns {string}
     */
    getBoardAsString() {
        return this.board.map(row => 
            row.map(cell => cell || '.').join(' | ')
        ).join('\n---------\n');
    }

    /**
     * Debug-Ausgabe des aktuellen Spielzustands
     */
    debug() {
        console.group('🔍 TicTacToe Debug Info');
        console.log('Brett:', this.getBoardAsString());
        console.log('Aktueller Spieler:', this.currentPlayer);
        console.log('Spielzustand:', this.gameState);
        console.log('Gewinner:', this.winner);
        console.log('Gewinnlinie:', this.winningLine);
        console.log('Punktestand:', this.score);
        console.log('Schwierigkeit:', this.difficulty);
        console.log('Züge:', this.moveCount);
        console.groupEnd();
    }
}

// ==================== UI-RENDERER KLASSE ====================
class GameRenderer {
    constructor(game) {
        this.game = game;
        this.canvas = null;
        this.ctx = null;
        
        // Farben aus Konstanten
        this.colors = GAME_CONSTANTS.COLORS;
    }

    /**
     * Initialisiert den Canvas
     * @param {HTMLCanvasElement} canvasElement 
     */
    init(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');
        this.logger.log('Renderer initialisiert', 'INFO');
    }

    /**
     * Zeichnet das gesamte Spiel
     */
    draw() {
        // Canvas löschen
        this.ctx.fillStyle = this.colors.BACKGROUND;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        switch (this.game.getGameState()) {
            case GAME_CONSTANTS.STATE.MENU:
                this._drawMenu();
                break;
            case GAME_CONSTANTS.STATE.PLAYING:
            case GAME_CONSTANTS.STATE.PAUSED:
                this._drawBoard();
                this._drawSymbols();
                this._drawUI();
                if (this.game.isPaused()) {
                    this._drawPausedOverlay();
                }
                break;
            case GAME_CONSTANTS.STATE.GAME_OVER:
                this._drawBoard();
                this._drawSymbols();
                this._drawWinningLine();
                this._drawGameOver();
                break;
        }
    }

    /**
     * Zeichnet das Menü
     */
    _drawMenu() {
        this.ctx.fillStyle = this.colors.TEXT;
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('TicTacToe', this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Drücke ENTER um zu starten', this.canvas.width / 2, this.canvas.height / 2 + 20);
    }

    /**
     * Zeichnet das Spielfeld
     */
    _drawBoard() {
        const cellSize = GAME_CONSTANTS.CELL_SIZE;
        const padding = GAME_CONSTANTS.BOARD_PADDING;
        
        // Hintergrund des Brettes
        this.ctx.fillStyle = this.colors.BOARD;
        this.ctx.fillRect(padding, padding, 
            cellSize * 3 + 10, cellSize * 3 + 10);
        
        // Gitterlinien
        this.ctx.strokeStyle = this.colors.CELL;
        this.ctx.lineWidth = 3;
        
        // Vertikale Linien
        for (let i = 1; i <= 2; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(padding + i * cellSize, padding);
            this.ctx.lineTo(padding + i * cellSize, padding + cellSize * 3);
            this.ctx.stroke();
        }
        
        // Horizontale Linien
        for (let i = 1; i <= 2; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(padding, padding + i * cellSize);
            this.ctx.lineTo(padding + cellSize * 3, padding + i * cellSize);
            this.ctx.stroke();
        }
    }

    /**
     * Zeichnet die Symbole (X und O)
     */
    _drawSymbols() {
        const cellSize = GAME_CONSTANTS.CELL_SIZE;
        const padding = GAME_CONSTANTS.BOARD_PADDING;
        
        for (let row = 0; row < GAME_CONSTANTS.GRID_SIZE; row++) {
            for (let col = 0; col < GAME_CONSTANTS.GRID_SIZE; col++) {
                const symbol = this.game.board[row][col];
                if (symbol === GAME_CONSTANTS.SYMBOLS.EMPTY) continue;
                
                const x = padding + col * cellSize + cellSize / 2;
                const y = padding + row * cellSize + cellSize / 2;
                
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.font = 'bold 60px Arial';
                
                if (symbol === GAME_CONSTANTS.SYMBOLS.PLAYER) {
                    this.ctx.fillStyle = this.colors.PLAYER_X;
                } else {
                    this.ctx.fillStyle = this.colors.PLAYER_O;
                }
                
                this.ctx.fillText(symbol, x, y);
            }
        }
    }

    /**
     * Zeichnet die Gewinnlinie
     */
    _drawWinningLine() {
        const winningLine = this.game.getWinningLine();
        if (winningLine.length !== 3) return;
        
        const cellSize = GAME_CONSTANTS.CELL_SIZE;
        const padding = GAME_CONSTANTS.BOARD_PADDING;
        
        this.ctx.strokeStyle = this.colors.WIN_LINE;
        this.ctx.lineWidth = 5;
        
        const startX = padding + winningLine[0][1] * cellSize + cellSize / 2;
        const startY = padding + winningLine[0][0] * cellSize + cellSize / 2;
        const endX = padding + winningLine[2][1] * cellSize + cellSize / 2;
        const endY = padding + winningLine[2][0] * cellSize + cellSize / 2;
        
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
    }

    /**
     * Zeichnet die UI-Elemente (Punktestand, Spieler)
     */
    _drawUI() {
        const score = this.game.getScore();
        
        this.ctx.fillStyle = this.colors.TEXT;
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'left';
        
        // Punktestand
        this.ctx.fillText(`Spieler X: ${score.player}`, 20, 30);
        this.ctx.fillText(`KI O: ${score.ai}`, 20, 55);
        this.ctx.fillText(`Unentschieden: ${score.draws}`, 20, 80);
        
        // Aktueller Spieler
        this.ctx.textAlign = 'right';
        const currentPlayer = this.game.getCurrentPlayer();
        this.ctx.fillText(`Aktueller Spieler: ${currentPlayer}`, this.canvas.width - 20, 30);
        
        // Schwierigkeit
        this.ctx.fillText(`Schwierigkeit: ${this.game.getDifficulty()}`, this.canvas.width - 20, 55);
    }

    /**
     * Zeichnet die Pause-Overlay
     */
    _drawPausedOverlay() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = this.colors.TEXT;
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSIERT', this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Drücke P zum Fortsetzen', this.canvas.width / 2, this.canvas.height / 2 + 50);
    }

    /**
     * Zeichnet die Spielende-Anzeige
     * BEHEBUNG: Syntaxfehler behoben (entfernt 'te' am Ende)
     */
    _drawGameOver() {
        // Halbtransparenter Hintergrund
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = this.colors.TEXT;
        this.ctx.textAlign = 'center';
        
        const winner = this.game.getWinner();
        
        if (winner) {
            this.ctx.font = 'bold 48px Arial';
            const winnerText = winner === GAME_CONSTANTS.SYMBOLS.PLAYER ? 'DU HAST GEWONNEN!' : 'KI HAT GEWONNEN!';
            this.ctx.fillStyle = winner === GAME_CONSTANTS.SYMBOLS.PLAYER ? 
                this.colors.PLAYER_X : this.colors.PLAYER_O;
            this.ctx.fillText(winnerText, this.canvas.width / 2, this.canvas.height / 2 - 30);
        } else {
            this.ctx.font = 'bold 48px Arial';
            this.ctx.fillStyle = this.colors.WIN_LINE;
            this.ctx.fillText('UNENTSCHIEDEN!', this.canvas.width / 2, this.canvas.height / 2 - 30);
        }
        
        this.ctx.font = '24px Arial';
        this.ctx.fillStyle = this.colors.TEXT;
        this.ctx.fillText('Drücke ENTER für neues Spiel', this.canvas.width / 2, this.canvas.height / 2 + 30);
        this.ctx.fillText('Drücke M für Menü', this.canvas.width / 2, this.canvas.height / 2 + 65);
    }

    /**
     * Zeichnet einen Maus-Hover-Effekt
     * @param {number} row 
     * @param {number} col 
     */
    drawHover(row, col) {
        if (this.game.getGameState() !== GAME_CONSTANTS.STATE.PLAYING) return;
        
        const cellSize = GAME_CONSTANTS.CELL_SIZE;
        const padding = GAME_CONSTANTS.BOARD_PADDING;
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.fillRect(
            padding + col * cellSize + 2,
            padding + row * cellSize + 2,
            cellSize - 4,
            cellSize - 4
        );
    }
}

// ==================== HAUPTSTEUERUNG ====================
class GameController {
    constructor() {
        this.game = new TicTacToeGame();
        this.renderer = new GameRenderer(this.game);
        this.canvas = null;
        this.isRunning = false;
        
        // Event-Listener für Tastatur
        this.keyboardHandlers = {};
    }

    /**
     * Initialisiert das Spiel
     * @param {string} canvasId - ID des Canvas-Elements
     */
    init(canvasId) {
        this.canvas = document.getElementById(canvasId);
        
        if (!this.canvas) {
            console.error('Canvas nicht gefunden!');
            return false;
        }
        
        this.renderer.init(this.canvas);
        
        // Event-Listener für Tastatur
        document.addEventListener('keydown', (e) => this._handleKeyPress(e));
        
        // Event-Listener für Mausklicks
        this.canvas.addEventListener('click', (e) => this._handleClick(e));
        
        // Mausbewegung für Hover-Effekt
        this.canvas.addEventListener('mousemove', (e) => this._handleMouseMove(e));
        
        this.logger.log('Spiel-Controller initialisiert', 'INFO');
        return true;
    }

    /**
     * Startet das Spiel
     */
    start() {
        this.isRunning = true;
        this.game.startNewGame();
        this.gameLoop();
        this.logger.log('Spiel gestartet', 'INFO');
    }

    /**
     * Haupt-Spielschleife
     */
    gameLoop() {
        if (!this.isRunning) return;
        
        this.renderer.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    /**
     * Behandelt Tastendruck
     * @param {KeyboardEvent} event 
     */
    _handleKeyPress(event) {
        const key = event.key.toLowerCase();
        
        switch (key) {
            case 'enter':
                if (this.game.getGameState() === GAME_CONSTANTS.STATE.MENU ||
                    this.game.getGameState() === GAME_CONSTANTS.STATE.GAME_OVER) {
                    this.game.startNewGame();
                }
                break;
                
            case 'p':
                if (this.game.getGameState() === GAME_CONSTANTS.STATE.PLAYING ||
                    this.game.getGameState() === GAME_CONSTANTS.STATE.PAUSED) {
                    this.game.togglePause();
                }
                break;
                
            case 'm':
                if (this.game.getGameState() === GAME_CONSTANTS.STATE.GAME_OVER) {
                    this.game.setGameState(GAME_CONSTANTS.STATE.MENU);
                }
                break;
                
            case '1':
                this.game.setDifficulty(GAME_CONSTANTS.DIFFICULTY.EASY);
                break;
                
            case '2':
                this.game.setDifficulty(GAME_CONSTANTS.DIFFICULTY.MEDIUM);
                break;
                
            case '3':
                this.game.setDifficulty(GAME_CONSTANTS.DIFFICULTY.HARD);
                break;
                
            case 'r':
                if (event.ctrlKey || event.metaKey) {
                    // Strg+R oder Cmd+R verhindern
                    event.preventDefault();
                    this.game.resetScore();
                    this.game.startNewGame();
                }
                break;
        }
    }

    /**
     * Behandelt Mausklicks
     * @param {MouseEvent} event 
     */
    _handleClick(event) {
        if (this.game.getGameState() !== GAME_CONSTANTS.STATE.PLAYING) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const cellSize = GAME_CONSTANTS.CELL_SIZE;
        const padding = GAME_CONSTANTS.BOARD_PADDING;
        
        // Berechne Zeile und Spalte
        const col = Math.floor((x - padding) / cellSize);
        const row = Math.floor((y - padding) / cellSize);
        
        // Prüfe ob Klick im gültigen Bereich
        if (row >= 0 && row < GAME_CONSTANTS.GRID_SIZE &&
            col >= 0 && col < GAME_CONSTANTS.GRID_SIZE) {
            
            // Spielerzug ausführen
            if (this.game.makeMove(row, col)) {
                this.logger.log(`Spieler hat auf (${row}, ${col}) geklickt`, 'DEBUG');
                
                // Wenn KI am Zug ist, führe KI-Zug aus
                if (this.game.getGameState() === GAME_CONSTANTS.STATE.PLAYING &&
                    this.game.getCurrentPlayer() === GAME_CONSTANTS.SYMBOLS.AI) {
                    setTimeout(() => this._makeAIMove(), 500);
                }
            }
        }
    }

    /**
     * Behandelt Mausbewegung für Hover-Effekt
     * @param {MouseEvent} event 
     */
    _handleMouseMove(event) {
        // Hover-Effekt wird in der Render-Schleife gehandhabt
        // Hier können zusätzliche Logik hinzugefügt werden
    }

    /**
     * Führt einen KI-Zug aus
     */
    _makeAIMove() {
        if (this.game.getGameState() !== GAME_CONSTANTS.STATE.PLAYING) return;
        
        const difficultyParams = this.game.getDifficultyParams();
        let move = null;
        
        // Minimax für schwere Schwierigkeit
        if (difficultyParams.optimalPlay) {
            move = this._getBestMove();
        } else {
            // Prüfe auf Gewinnmöglichkeit
            if (difficultyParams.winPriority) {
                move = this._findWinningMove(GAME_CONSTANTS.SYMBOLS.AI);
            }
            
            // Prüfe auf Blockierung des Spielers
            if (!move && difficultyParams.blockPriority) {
                move = this._findWinningMove(GAME_CONSTANTS.SYMBOLS.PLAYER);
            }
            
            // Zufälliger Zug
            if (!move && Math.random() < difficultyParams.randomMoveChance) {
                move = this._getRandomMove();
            }
            
            // Wenn kein Zug gefunden, nimm besten verfügbaren
            if (!move) {
                move = this._getBestMove();
            }
        }
        
        if (move) {
            this.game.makeMove(move.row, move.col);
        }
    }

    /**
     * Findet einen Gewinnzug für einen Spieler
     * @param {string} player - Spieler-Symbol
     * @returns {object|null} - Position oder null
     */
    _findWinningMove(player) {
        for (let row = 0; row < GAME_CONSTANTS.GRID_SIZE; row++) {
            for (let col = 0; col < GAME_CONSTANTS.GRID_SIZE; col++) {
                if (this.game.board[row][col] === GAME_CONSTANTS.SYMBOLS.EMPTY) {
                    // Simuliere Zug
                    this.game.board[row][col] = player;
                    const wins = this.game.checkWin(player);
                    this.game.board[row][col] = GAME_CONSTANTS.SYMBOLS.EMPTY;
                    
                    if (wins) {
                        return { row, col };
                    }
                }
            }
        }
        return null;
    }

    /**
     * Findet einen zufälligen gültigen Zug
     * @returns {object|null}
     */
    _getRandomMove() {
        const emptyCells = [];
        
        for (let row = 0; row < GAME_CONSTANTS.GRID_SIZE; row++) {
            for (let col = 0; col < GAME_CONSTANTS.GRID_SIZE; col++) {
                if (this.game.board[row][col] === GAME_CONSTANTS.SYMBOLS.EMPTY) {
                    emptyCells.push({ row, col });
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const randomIndex = Math.floor(Math.random() * emptyCells.length);
            return emptyCells[randomIndex];
        }
        
        return null;
    }

    /**
     * Findet den besten Zug (einfache Bewertung)
     * @returns {object|null}
     */
    _getBestMove() {
        // Priorität: Mitte > Ecken > Kanten
        const priorities = [
            { row: 1, col: 1 },  // Mitte
            { row: 0, col: 0 }, { row: 0, col: 2 },  // Obere Ecken
            { row: 2, col: 0 }, { row: 2, col: 2 },  // Untere Ecken
            { row: 0, col: 1 }, { row: 1, col: 0 },  // Kanten oben/links
            { row: 1, col: 2 }, { row: 2, col: 1 }   // Kanten rechts/unten
        ];
        
        for (const pos of priorities) {
            if (this.game.board[pos.row][pos.col] === GAME_CONSTANTS.SYMBOLS.EMPTY) {
                return pos;
            }
        }
        
        return this._getRandomMove();
    }

    /**
     * Stoppt das Spiel
     */
    stop() {
        this.isRunning = false;
        this.logger.log('Spiel gestoppt', 'INFO');
    }

    /**
     * Gibt den Logger zurück
     */
    get logger() {
        return this.game.logger;
    }
}

// ==================== EXPORT FÜR VERWENDUNG ====================
// Exportiere die Klassen für externe Verwendung
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TicTacToeGame,
        GameRenderer,
        GameController,
        GAME_CONSTANTS
    };
}

// ==================== INITIALISIERUNG BEIM SEITENLADEN ====================
document.addEventListener('DOMContentLoaded', () => {
    const controller = new GameController();
    
    if (controller.init('gameCanvas')) {
        controller.start();
        
        // Debug-Info in der Konsole
        console.log('🎮 TicTacToe Spiel geladen!');
        console.log('Steuerung:');
        console.log('  ENTER - Neues Spiel / Starten');
        console.log('  P - Pause umschalten');
        console.log('  M - Zum Menü');
        console.log('  1 - Einfach');
        console.log('  2 - Mittel');
        console.log('  3 - Schwer');
        console.log('  Strg+R - Punktestand zurücksetzen und neu starten');
    }
});