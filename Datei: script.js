/**
 * Spiel-Logik für Tic-Tac-Toe / Snake-Spiel
 * Enthält: Kollisionserkennung, Scoring, Neustart, Pause, Schwierigkeitsgrade
 */

// ==================== KONSTANTEN ====================
const GAME_CONFIG = {
    // Spielfeldgröße
    GRID_WIDTH: 20,
    GRID_HEIGHT: 20,
    CELL_SIZE: 20,
    
    // Schwierigkeitsstufen
    DIFFICULTY: {
        EASY: 'easy',
        MEDIUM: 'medium',
        HARD: 'hard'
    },
    
    // Geschwindigkeit basierend auf Schwierigkeit (ms zwischen Updates)
    SPEED: {
        easy: 200,
        medium: 150,
        hard: 100
    },
    
    // Anzahl der Gegner/Hindernisse basierend auf Schwierigkeit
    ENEMY_COUNT: {
        easy: 3,
        medium: 5,
        hard: 8
    },
    
    OBSTACLE_COUNT: {
        easy: 2,
        medium: 4,
        hard: 6
    }
};

// Farbkonstanten
const COLORS = {
    PLAYER: '#4CAF50',      // Grün
    ENEMY: '#F44336',       // Rot
    OBSTACLE: '#9E9E9E',    // Grau
    FOOD: '#FFEB3B',        // Gelb
    BACKGROUND: '#212121',  // Dunkelgrau
    GRID: '#333333',        // Hellgrau
    TEXT: '#FFFFFF',        // Weiß
    UI_BG: 'rgba(0, 0, 0, 0.8)'
};

// ==================== SPIELKLASSE ====================
class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Spielfeld
        this.width = GAME_CONFIG.GRID_WIDTH;
        this.height = GAME_CONFIG.GRID_HEIGHT;
        this.cellSize = GAME_CONFIG.CELL_SIZE;
        
        // Canvas-Größe setzen
        this.canvas.width = this.width * this.cellSize;
        this.canvas.height = this.height * this.cellSize;
        
        // Spielstatus
        this.isRunning = false;
        this.isPaused = false;
        this.isGameOver = false;
        this.score = 0;
        this.difficulty = GAME_CONFIG.DIFFICULTY.MEDIUM;
        
        // Spielobjekte
        this.player = null;
        this.enemies = [];
        this.obstacles = [];
        this.food = null;
        
        // Timer für Spielschleife
        this.gameLoop = null;
        this.lastUpdateTime = 0;
        
        // Logging
        this.logger = {
            info: (msg) => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`),
            warn: (msg) => console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`),
            error: (msg) => console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`)
        };
        
        // Event-Listener für Tastatur
        this._setupKeyboardListeners();
        
        this.logger.info('Spiel initialisiert');
    }
    
    // ==================== EVENT LISTENER ====================
    _setupKeyboardListeners() {
        document.addEventListener('keydown', (e) => this._handleKeydown(e));
    }
    
    _handleKeydown(event) {
        // Verhindert Standard-Scrolling bei Pfeiltasten
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
            event.preventDefault();
        }
        
        // Leertaste: Pause umschalten
        if (event.key === ' ') {
            this.togglePause();
            return;
        }
        
        // R: Neustart
        if (event.key === 'r' || event.key === 'R') {
            this.restart();
            return;
        }
        
        // Nur bewegen wenn nicht pausiert und Spiel läuft
        if (!this.isPaused && this.isRunning && !this.isGameOver) {
            this._handleMovement(event.key);
        }
    }
    
    /**
     * Behandelt die Spielerbewegung basierend auf Tastatureingaben
     * @param {string} key - Gedrückte Taste
     */
    _handleMovement(key) {
        if (!this.player) return;
        
        let newDirection = null;
        
        switch (key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                newDirection = { x: 0, y: -1 };
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                newDirection = { x: 0, y: 1 };
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                newDirection = { x: -1, y: 0 };
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                newDirection = { x: 1, y: 0 };
                break;
        }
        
        // Verhindere 180-Grad-Drehung
        if (newDirection) {
            const currentDir = this.player.direction;
            if (currentDir && 
                newDirection.x === -currentDir.x && 
                newDirection.y === -currentDir.y) {
                return;
            }
            this.player.direction = newDirection;
            this.logger.info(`Spieler bewegt sich: (${newDirection.x}, ${newDirection.y})`);
        }
    }
    
    // ==================== SPIELSTEUERUNG ====================
    
    /**
     * Startet das Spiel
     */
    start() {
        if (this.isRunning) return;
        
        this._initializeGame();
        this.isRunning = true;
        this.isPaused = false;
        this.isGameOver = false;
        
        this.logger.info('Spiel gestartet');
        this._gameLoop();
    }
    
    /**
     * Initialisiert das Spiel (Spieler, Gegner, Hindernisse, Essen)
     */
    _initializeGame() {
        this.score = 0;
        this.enemies = [];
        this.obstacles = [];
        
        // Spieler in der Mitte initialisieren
        this.player = {
            x: Math.floor(this.width / 2),
            y: Math.floor(this.height / 2),
            direction: { x: 1, y: 0 },
            body: [
                { x: Math.floor(this.width / 2), y: Math.floor(this.height / 2) },
                { x: Math.floor(this.width / 2) - 1, y: Math.floor(this.height / 2) },
                { x: Math.floor(this.width / 2) - 2, y: Math.floor(this.height / 2) }
            ]
        };
        
        // Gegner generieren
        this._generateEnemies();
        
        // Hindernisse generieren
        this._generateObstacles();
        
        // Essen generieren
        this._generateFood();
        
        this.logger.info('Spielobjekte initialisiert');
    }
    
    /**
     * Generiert Gegner an zufälligen Positionen
     */
    _generateEnemies() {
        const enemyCount = GAME_CONFIG.ENEMY_COUNT[this.difficulty];
        
        for (let i = 0; i < enemyCount; i++) {
            let position;
            let validPosition = false;
            
            // Finde gültige Position (nicht auf Spieler oder anderen Gegnern)
            while (!validPosition) {
                position = {
                    x: Math.floor(Math.random() * this.width),
                    y: Math.floor(Math.random() * this.height)
                };
                
                validPosition = this._isValidSpawnPosition(position, [this.player?.body || []]);
            }
            
            this.enemies.push({
                x: position.x,
                y: position.y,
                direction: this._getRandomDirection(),
                color: COLORS.ENEMY
            });
        }
        
        this.logger.info(`${enemyCount} Gegner generiert`);
    }
    
    /**
     * Generiert Hindernisse an zufälligen Positionen
     */
    _generateObstacles() {
        const obstacleCount = GAME_CONFIG.OBSTACLE_COUNT[this.difficulty];
        
        for (let i = 0; i < obstacleCount; i++) {
            let position;
            let validPosition = false;
            
            while (!validPosition) {
                position = {
                    x: Math.floor(Math.random() * this.width),
                    y: Math.floor(Math.random() * this.height)
                };
                
                const occupiedPositions = [
                    ...(this.player?.body || []),
                    ...this.enemies,
                    ...this.obstacles
                ];
                
                validPosition = this._isValidSpawnPosition(position, occupiedPositions);
            }
            
            this.obstacles.push({
                x: position.x,
                y: position.y,
                color: COLORS.OBSTACLE
            });
        }
        
        this.logger.info(`${obstacleCount} Hindernisse generiert`);
    }
    
    /**
     * Generiert Essen an zufälliger Position
     */
    _generateFood() {
        let position;
        let validPosition = false;
        
        while (!validPosition) {
            position = {
                x: Math.floor(Math.random() * this.width),
                y: Math.floor(Math.random() * this.height)
            };
            
            const occupiedPositions = [
                ...(this.player?.body || []),
                ...this.enemies,
                ...this.obstacles
            ];
            
            validPosition = this._isValidSpawnPosition(position, occupiedPositions);
        }
        
        this.food = {
            x: position.x,
            y: position.y,
            color: COLORS.FOOD
        };
        
        this.logger.info('Essen generiert');
    }
    
    /**
     * Prüft ob eine Position gültig für Spawn ist
     * @param {Object} position - Zu prüfende Position {x, y}
     * @param {Array} occupiedPositions - Array von besetzten Positionen
     * @returns {boolean}
     */
    _isValidSpawnPosition(position, occupiedPositions) {
        return !occupiedPositions.some(pos => 
            pos.x === position.x && pos.y === position.y
        );
    }
    
    /**
     * Gibt eine zufällige Richtung zurück
     * @returns {Object} Richtung {x, y}
     */
    _getRandomDirection() {
        const directions = [
            { x: 0, y: -1 }, // Hoch
            { x: 0, y: 1 },  // Runter
            { x: -1, y: 0 }, // Links
            { x: 1, y: 0 }   // Rechts
        ];
        return directions[Math.floor(Math.random() * directions.length)];
    }
    
    /**
     * Pausiert oder setzt das Spiel fort
     */
    togglePause() {
        if (!this.isRunning || this.isGameOver) return;
        
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.logger.info('Spiel pausiert');
        } else {
            this.logger.info('Spiel fortgesetzt');
            this._gameLoop();
        }
    }
    
    /**
     * Setzt den Schwierigkeitsgrad
     * @param {string} difficulty - 'easy', 'medium' oder 'hard'
     */
    setDifficulty(difficulty) {
        if (!Object.values(GAME_CONFIG.DIFFICULTY).includes(difficulty)) {
            this.logger.warn(`Ungültiger Schwierigkeitsgrad: ${difficulty}`);
            return;
        }
        
        this.difficulty = difficulty;
        this.logger.info(`Schwierigkeitsgrad gesetzt: ${difficulty}`);
        
        // Wenn Spiel läuft, neu starten
        if (this.isRunning) {
            this.restart();
        }
    }
    
    /**
     * Startet das Spiel neu
     */
    restart() {
        this.logger.info('Spiel wird neu gestartet');
        
        // Alten Loop stoppen
        if (this.gameLoop) {
            clearTimeout(this.gameLoop);
        }
        
        this.isRunning = false;
        this.isPaused = false;
        this.isGameOver = false;
        
        this.start();
    }
    
    // ==================== SPIELLOOP ====================
    
    /**
     * Haupt-Spielschleife
     */
    _gameLoop() {
        if (!this.isRunning || this.isPaused || this.isGameOver) return;
        
        const currentTime = Date.now();
        const speed = GAME_CONFIG.SPEED[this.difficulty];
        
        if (currentTime - this.lastUpdateTime >= speed) {
            this._update();
            this._draw();
            this.lastUpdateTime = currentTime;
        }
        
        this.gameLoop = requestAnimationFrame(() => this._gameLoop());
    }
    
    /**
     * Aktualisiert den Spielzustand
     */
    _update() {
        if (!this.player) return;
        
        // Spieler bewegen
        this._movePlayer();
        
        // Gegner bewegen
        this._moveEnemies();
        
        // Kollisionserkennung
        this._checkCollisions();
        
        // Essen einsammeln
        this._checkFoodCollection();
    }
    
    /**
     * Bewegt den Spieler
     */
    _movePlayer() {
        if (!this.player || !this.player.direction) return;
        
        const head = { ...this.player.body[0] };
        head.x += this.player.direction.x;
        head.y += this.player.direction.y;
        
        // Wand-Kollision (Wrap-Around)
        if (head.x < 0) head.x = this.width - 1;
        if (head.x >= this.width) head.x = 0;
        if (head.y < 0) head.y = this.height - 1;
        if (head.y >= this.height) head.y = 0;
        
        // Körper bewegen
        this.player.body.unshift(head);
        this.player.body.pop();
        
        this.logger.debug(`Spieler bewegt zu: (${head.x}, ${head.y})`);
    }
    
    /**
     * Bewegt die Gegner
     */
    _moveEnemies() {
        this.enemies.forEach(enemy => {
            // Zufällige Richtungsänderung mit 20% Wahrscheinlichkeit
            if (Math.random() < 0.2) {
                enemy.direction = this._getRandomDirection();
            }
            
            enemy.x += enemy.direction.x;
            enemy.y += enemy.direction.y;
            
            // Wrap-Around für Gegner
            if (enemy.x < 0) enemy.x = this.width - 1;
            if (enemy.x >= this.width) enemy.x = 0;
            if (enemy.y < 0) enemy.y = this.height - 1;
            if (enemy.y >= this.height) enemy.y = 0;
        });
    }
    
    // ==================== KOLLISIONSERKENNUNG ====================
    
    /**
     * Prüft alle Kollisionen
     */
    _checkCollisions() {
        if (!this.player || !this.player.body[0]) return;
        
        const playerHead = this.player.body[0];
        
        // 1. Kollision mit Gegnern
        for (const enemy of this.enemies) {
            if (this._checkCollision(playerHead, enemy)) {
                this.logger.warn('Kollision mit Gegner!');
                this._gameOver();
                return;
            }
        }
        
        // 2. Kollision mit Hindernissen
        for (const obstacle of this.obstacles) {
            if (this._checkCollision(playerHead, obstacle)) {
                this.logger.warn('Kollision mit Hindernis!');
                this._gameOver();
                return;
            }
        }
        
        // 3. Kollision mit eigenem Körper (ab Index 1)
        for (let i = 1; i < this.player.body.length; i++) {
            if (this._checkCollision(playerHead, this.player.body[i])) {
                this.logger.warn('Kollision mit eigenem Körper!');
                this._gameOver();
                return;
            }
        }
    }
    
    /**
     * Prüft ob zwei Positionen kollidieren
     * @param {Object} pos1 - Erste Position {x, y}
     * @param {Object} pos2 - Zweite Position {x, y}
     * @returns {boolean}
     */
    _checkCollision(pos1, pos2) {
        return pos1.x === pos2.x && pos1.y === pos2.y;
    }
    
    /**
     * Prüft ob Essen eingesammelt wurde
     */
    _checkFoodCollection() {
        if (!this.player || !this.player.body[0] || !this.food) return;
        
        const playerHead = this.player.body[0];
        
        if (this._checkCollision(playerHead, this.food)) {
            this._addScore(10);
            this._growPlayer();
            this._generateFood();
            
            this.logger.info(`Essen eingesammelt! Punktzahl: ${this.score}`);
        }
    }
    
    /**
     * Lässt den Spieler wachsen
     */
    _growPlayer() {
        const tail = { ...this.player.body[this.player.body.length - 1] };
        this.player.body.push(tail);
    }
    
    /**
     * Fügt Punkte zum Score hinzu
     * @param {number} points - Punkte die hinzugefügt werden sollen
     */
    _addScore(points) {
        this.score += points;
        
        // Bonus-Punkte basierend auf Schwierigkeit
        const multiplier = {
            [GAME_CONFIG.DIFFICULTY.EASY]: 1,
            [GAME_CONFIG.DIFFICULTY.MEDIUM]: 1.5,
            [GAME_CONFIG.DIFFICULTY.HARD]: 2
        };
        
        this.score += Math.floor(points * (multiplier[this.difficulty] - 1));
    }
    
    // ==================== GAME OVER ====================
    
    /**
     * Beendet das Spiel
     */
    _gameOver() {
        this.isGameOver = true;
        this.isRunning = false;
        
        this.logger.info(`Spiel beendet! Endpunktzahl: ${this.score}`);
        
        // Zeichne Game Over Bildschirm
        this._drawGameOver();
    }
    
    // ==================== RENDERING ====================
    
    /**
     * Zeichnet den gesamten Spielzustand
     */
    _draw() {
        // Hintergrund
        this.ctx.fillStyle = COLORS.BACKGROUND;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Gitter
        this._drawGrid();
        
        // Hindernisse
        this._drawObstacles();
        
        // Essen
        this._drawFood();
        
        // Gegner
        this._drawEnemies();
        
        // Spieler
        this._drawPlayer();
        
        // UI (Score, Pause-Status)
        this._drawUI();
    }
    
    /**
     * Zeichnet das Gitter
     */
    _drawGrid() {
        this.ctx.strokeStyle = COLORS.GRID;
        this.ctx.lineWidth = 0.5;
        
        for (let x = 0; x <= this.width; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.cellSize, 0);
            this.ctx.lineTo(x * this.cellSize, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.height; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.cellSize);
            this.ctx.lineTo(this.canvas.width, y * this.cellSize);
            this.ctx.stroke();
        }
    }
    
    /**
     * Zeichnet den Spieler
     */
    _drawPlayer() {
        if (!this.player || !this.player.body) return;
        
        this.ctx.fillStyle = COLORS.PLAYER;
        
        this.player.body.forEach((segment, index) => {
            const x = segment.x * this.cellSize;
            const y = segment.y * this.cellSize;
            
            // Kopf etwas größer
            const size = index === 0 ? this.cellSize - 2 : this.cellSize - 4;
            const offset = index === 0 ? 1 : 2;
            
            this.ctx.fillRect(x + offset, y + offset, size, size);
        });
    }
    
    /**
     * Zeichnet die Gegner
     */
    _drawEnemies() {
        this.ctx.fillStyle = COLORS.ENEMY;
        
        this.enemies.forEach(enemy => {
            const x = enemy.x * this.cellSize + 2;
            const y = enemy.y * this.cellSize + 2;
            const size = this.cellSize - 4;
            
            // Gegner als Kreis zeichnen
            this.ctx.beginPath();
            this.ctx.arc(
                x + size / 2,
                y + size / 2,
                size / 2,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
        });
    }
    
    /**
     * Zeichnet die Hindernisse
     */
    _drawObstacles() {
        this.ctx.fillStyle = COLORS.OBSTACLE;
        
        this.obstacles.forEach(obstacle => {
            const x = obstacle.x * this.cellSize + 2;
            const y = obstacle.y * this.cellSize + 2;
            const size = this.cellSize - 4;
            
            this.ctx.fillRect(x, y, size, size);
        });
    }
    
    /**
     * Zeichnet das Essen
     */
    _drawFood() {
        if (!this.food) return;
        
        this.ctx.fillStyle = COLORS.FOOD;
        
        const x = this.food.x * this.cellSize + this.cellSize / 2;
        const y = this.food.y * this.cellSize + this.cellSize / 2;
        const radius = this.cellSize / 2 - 2;
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    /**
     * Zeichnet die UI-Elemente (Score, Pause-Status)
     */
    _drawUI() {
        this.ctx.fillStyle = COLORS.TEXT;
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Score: ${this.score}`, 10, 25);
        this.ctx.fillText(`Schwierigkeit: ${this.difficulty}`, 10, 50);
        
        // Pause-Indikator
        if (this.isPaused) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = COLORS.TEXT;
            this.ctx.font = '32px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSIERT', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.font = '16px Arial';
            this.ctx.fillText('Drücke LEERTASTE zum Fortsetzen', this.canvas.width / 2, this.canvas.height / 2 + 40);
        }
    }
    
    /**
     * Zeichnet den Game Over Bildschirm
     */
    _drawGameOver() {
        // Halbtransparenter Hintergrund
        this.ctx.fillStyle = COLORS.UI_BG;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Game Over Text
        this.ctx.fillStyle = COLORS.ENEMY;
        this.ctx.font = 'bold 36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('SPIEL VORBEI', this.canvas.width / 2, this.canvas.height / 2 - 30);
        
        // Punktzahl
        this.ctx.fillStyle = COLORS.TEXT;
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Endpunktzahl: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
        
        // Anleitung zum Neustart
        this.ctx.font = '16px Arial';
        this.ctx.fillText('Drücke R zum Neustarten', this.canvas.width / 2, this.canvas.height / 2 + 60);
        this.ctx.fillText('Drücke LEERTASTE zum Pausieren', this.canvas.width / 2, this.canvas.height / 2 + 85);
        
        this.logger.info('Game Over Bildschirm angezeigt');
    }
}

// ==================== INITIALISIERUNG ====================

// Globale Spielinstanz
let game;

/**
 * Initialisiert das Spiel wenn das DOM geladen ist
 */
document.addEventListener('DOMContentLoaded', () => {
    // Canvas-Element finden oder erstellen
    let canvas = document.getElementById('gameCanvas');
    
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'gameCanvas';
        document.body.appendChild(canvas);
    }
    
    // Spiel instanziieren
    game = new Game('gameCanvas');
    
    // Start-Button Event Listener
    const startButton = document.getElementById('startButton');
    if (startButton) {
        startButton.addEventListener('click', () => game.start());
    }
    
    // Schwierigkeitsgrad-Buttons
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    difficultyButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const difficulty = e.target.dataset.difficulty;
            game.setDifficulty(difficulty);
        });
    });
    
    console.log('Spiel initialisiert. Drücke R zum Neustarten.');
});

// Export für Tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Game, GAME_CONFIG, COLORS };
}