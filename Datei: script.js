/**
 * Spiel-Logik für das Desktop-Spiel
 * Implementiert Kollisionserkennung, Scoring, Neustart, Gegner/Hindernisse und mehr
 */

// ==================== KONSTANTEN ====================

// Farben
const COLORS = {
    PLAYER: '#3498db',
    ENEMY: '#e74c3c',
    OBSTACLE: '#2c3e50',
    FOOD: '#2ecc71',
    BACKGROUND: '#ecf0f1',
    TEXT: '#2c3e50',
    GRID: '#bdc3c7'
};

// Schwierigkeitsstufen
const DIFFICULTY = {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard'
};

// Spielkonstanten
const GAME_CONFIG = {
    GRID_SIZE: 20,
    CELL_SIZE: 25,
    INITIAL_SPEED: 150,
    SPEED_INCREMENT: 5,
    ENEMY_SPAWN_INTERVAL: 5000,
    OBSTACLE_COUNT: 5,
    POINTS_PER_FOOD: 10,
    POINTS_PER_ENEMY: 50
};

// ==================== HAUPTKLASSE ====================

class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Spielfeld
        this.gridWidth = GAME_CONFIG.GRID_SIZE;
        this.gridHeight = GAME_CONFIG.GRID_SIZE;
        this.cellSize = GAME_CONFIG.CELL_SIZE;
        
        // Spielzustand
        this.isRunning = false;
        this.isPaused = false;
        this.isGameOver = false;
        this.score = 0;
        this.difficulty = DIFFICULTY.MEDIUM;
        
        // Spielobjekte
        this.player = { x: 0, y: 0 };
        this.food = { x: 0, y: 0 };
        this.enemies = [];
        this.obstacles = [];
        
        // Timer
        this.gameLoop = null;
        this.enemySpawnTimer = null;
        
        // Initialisierung
        this._initEventListeners();
        this._initGame();
    }
    
    // ==================== INITIALISIERUNG ====================
    
    _initGame() {
        this._resetGameState();
        this._generateObstacles();
        this._spawnFood();
        this._spawnInitialEnemies();
        this._draw();
    }
    
    _resetGameState() {
        this.player = { 
            x: Math.floor(this.gridWidth / 2), 
            y: Math.floor(this.gridHeight / 2) 
        };
        this.enemies = [];
        this.obstacles = [];
        this.food = { x: -1, y: -1 };
        this.score = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.isGameOver = false;
    }
    
    _initEventListeners() {
        // Tastatursteuerung
        document.addEventListener('keydown', (e) => this._handleKeyPress(e));
    }
    
    // ==================== SPIELSTEUERUNG ====================
    
    start() {
        if (this.isGameOver) {
            this._initGame();
        }
        this.isRunning = true;
        this.isPaused = false;
        this._startGameLoop();
        this._startEnemySpawner();
    }
    
    stop() {
        this.isRunning = false;
        this._stopGameLoop();
        this._stopEnemySpawner();
    }
    
    restart() {
        this.stop();
        this._initGame();
        this.start();
    }
    
    /**
     * Pause umschalten
     */
    togglePause() {
        if (this.isGameOver) return;
        
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this._stopGameLoop();
            this._stopEnemySpawner();
            this._drawPausedScreen();
        } else {
            this._startGameLoop();
            this._startEnemySpawner();
        }
    }
    
    /**
     * Schwierigkeitsgrad setzen
     * @param {string} level - 'easy', 'medium' oder 'hard'
     */
    setDifficulty(level) {
        if (!Object.values(DIFFICULTY).includes(level)) {
            console.error(`Ungültiger Schwierigkeitsgrad: ${level}`);
            return;
        }
        
        this.difficulty = level;
        
        // Geschwindigkeit basierend auf Schwierigkeit anpassen
        switch (level) {
            case DIFFICULTY.EASY:
                this.gameSpeed = GAME_CONFIG.INITIAL_SPEED + 50;
                this.enemySpawnRate = GAME_CONFIG.ENEMY_SPAWN_INTERVAL * 1.5;
                break;
            case DIFFICULTY.MEDIUM:
                this.gameSpeed = GAME_CONFIG.INITIAL_SPEED;
                this.enemySpawnRate = GAME_CONFIG.ENEMY_SPAWN_INTERVAL;
                break;
            case DIFFICULTY.HARD:
                this.gameSpeed = GAME_CONFIG.INITIAL_SPEED - 50;
                this.enemySpawnRate = GAME_CONFIG.ENEMY_SPAWN_INTERVAL * 0.5;
                break;
        }
        
        console.log(`Schwierigkeitsgrad geändert: ${level}`);
    }
    
    // ==================== GAME LOOP ====================
    
    _startGameLoop() {
        if (this.gameLoop) return;
        
        const loop = () => {
            if (!this.isRunning || this.isPaused || this.isGameOver) return;
            
            this._update();
            this._draw();
            
            this.gameLoop = setTimeout(loop, this.gameSpeed);
        };
        
        loop();
    }
    
    _stopGameLoop() {
        if (this.gameLoop) {
            clearTimeout(this.gameLoop);
            this.gameLoop = null;
        }
    }
    
    _startEnemySpawner() {
        if (this.enemySpawnTimer) return;
        
        this.enemySpawnTimer = setInterval(() => {
            if (!this.isPaused && !this.isGameOver) {
                this._spawnEnemy();
            }
        }, this.enemySpawnRate);
    }
    
    _stopEnemySpawner() {
        if (this.enemySpawnTimer) {
            clearInterval(this.enemySpawnTimer);
            this.enemySpawnTimer = null;
        }
    }
    
    // ==================== SPIELLOGIK ====================
    
    _update() {
        // Kollisionserkennung
        this._checkCollisions();
        
        // Prüfen ob Spiel beendet
        if (this.isGameOver) {
            this._handleGameOver();
        }
    }
    
    /**
     * Kollisionserkennung zwischen Spieler, Gegnern, Hindernissen und Essen
     */
    _checkCollisions() {
        // Kollision mit Essen
        if (this.player.x === this.food.x && this.player.y === this.food.y) {
            this._handleFoodCollision();
        }
        
        // Kollision mit Gegnern
        for (let enemy of this.enemies) {
            if (this.player.x === enemy.x && this.player.y === enemy.y) {
                this._handleEnemyCollision();
                return;
            }
        }
        
        // Kollision mit Hindernissen
        for (let obstacle of this.obstacles) {
            if (this.player.x === obstacle.x && this.player.y === obstacle.y) {
                this._handleObstacleCollision();
                return;
            }
        }
    }
    
    _handleFoodCollision() {
        this.score += GAME_CONFIG.POINTS_PER_FOOD;
        this._spawnFood();
        
        // Geschwindigkeit erhöhen (Schwierigkeit steigern)
        if (this.gameSpeed > 50) {
            this.gameSpeed -= GAME_CONFIG.SPEED_INCREMENT;
        }
        
        console.log(`Essen gegessen! Punktzahl: ${this.score}`);
    }
    
    _handleEnemyCollision() {
        this.isGameOver = true;
        console.log(`Kollision mit Gegner! Spiel beendet.`);
    }
    
    _handleObstacleCollision() {
        this.isGameOver = true;
        console.log(`Kollision mit Hindernis! Spiel beendet.`);
    }
    
    _handleGameOver() {
        this.stop();
        this._drawGameOver();
    }
    
    // ==================== GENERIERUNG ====================
    
    _generateObstacles() {
        this.obstacles = [];
        const count = GAME_CONFIG.OBSTACLE_COUNT;
        
        for (let i = 0; i < count; i++) {
            let obstacle;
            let attempts = 0;
            
            do {
                obstacle = {
                    x: Math.floor(Math.random() * this.gridWidth),
                    y: Math.floor(Math.random() * this.gridHeight)
                };
                attempts++;
            } while (
                this._isPositionOccupied(obstacle.x, obstacle.y) && 
                attempts < 100
            );
            
            if (attempts < 100) {
                this.obstacles.push(obstacle);
            }
        }
    }
    
    _spawnFood() {
        let food;
        let attempts = 0;
        
        do {
            food = {
                x: Math.floor(Math.random() * this.gridWidth),
                y: Math.floor(Math.random() * this.gridHeight)
            };
            attempts++;
        } while (
            this._isPositionOccupied(food.x, food.y) && 
            attempts < 100
        );
        
        if (attempts < 100) {
            this.food = food;
        }
    }
    
    _spawnEnemy() {
        // Gegner spawnen am Rand des Spielfelds
        const edge = Math.floor(Math.random() * 4);
        let enemy = { x: 0, y: 0 };
        
        switch (edge) {
            case 0: // Oben
                enemy.x = Math.floor(Math.random() * this.gridWidth);
                enemy.y = 0;
                break;
            case 1: // Rechts
                enemy.x = this.gridWidth - 1;
                enemy.y = Math.floor(Math.random() * this.gridHeight);
                break;
            case 2: // Unten
                enemy.x = Math.floor(Math.random() * this.gridWidth);
                enemy.y = this.gridHeight - 1;
                break;
            case 3: // Links
                enemy.x = 0;
                enemy.y = Math.floor(Math.random() * this.gridHeight);
                break;
        }
        
        // Gegner nicht auf Spieler, Essen oder Hindernissen spawnen
        if (!this._isPositionOccupied(enemy.x, enemy.y)) {
            this.enemies.push(enemy);
            console.log(`Gegner gespawnt bei (${enemy.x}, ${enemy.y})`);
        }
    }
    
    _spawnInitialEnemies() {
        // Initial 2 Gegner spawnen
        for (let i = 0; i < 2; i++) {
            this._spawnEnemy();
        }
    }
    
    /**
     * Prüfen ob eine Position belegt ist
     */
    _isPositionOccupied(x, y) {
        // Spieler
        if (this.player.x === x && this.player.y === y) return true;
        
        // Essen
        if (this.food.x === x && this.food.y === y) return true;
        
        // Hindernisse
        for (let obs of this.obstacles) {
            if (obs.x === x && obs.y === y) return true;
        }
        
        // Gegner
        for (let enemy of this.enemies) {
            if (enemy.x === x && enemy.y === y) return true;
        }
        
        return false;
    }
    
    // ==================== STEUERUNG ====================
    
    _handleKeyPress(event) {
        // Nur bei laufendem Spiel (nicht Game Over) auf Tasten reagieren
        if (this.isGameOver) {
            if (event.key === 'Enter' || event.key === ' ') {
                this.restart();
            }
            return;
        }
        
        // Pause mit Escape oder P
        if (event.key === 'Escape' || event.key === 'p' || event.key === 'P') {
            this.togglePause();
            return;
        }
        
        // Wenn pausiert, keine Bewegung
        if (this.isPaused) return;
        
        // Spiel starten wenn noch nicht gestartet
        if (!this.isRunning) {
            this.start();
        }
        
        // Bewegung
        let newX = this.player.x;
        let newY = this.player.y;
        
        switch (event.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                newY--;
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                newY++;
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                newX--;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                newX++;
                break;
            default:
                return; // Andere Tasten ignorieren
        }
        
        // Bewegung nur wenn innerhalb des Spielfelds
        if (this._isValidMove(newX, newY)) {
            this.player.x = newX;
            this.player.y = newY;
            
            // Sofortige Kollisionsprüfung nach Bewegung
            this._checkCollisions();
            
            if (!this.isGameOver) {
                this._draw();
            }
        }
    }
    
    _isValidMove(x, y) {
        // Innerhalb des Spielfelds
        if (x < 0 || x >= this.gridWidth || y < 0 || y >= this.gridHeight) {
            return false;
        }
        
        // Nicht auf Hindernis
        for (let obs of this.obstacles) {
            if (obs.x === x && obs.y === y) {
                return false;
            }
        }
        
        return true;
    }
    
    // ==================== ZEICHNEN ====================
    
    _draw() {
        // Canvas-Größe setzen
        this.canvas.width = this.gridWidth * this.cellSize;
        this.canvas.height = this.gridHeight * this.cellSize;
        
        // Hintergrund
        this.ctx.fillStyle = COLORS.BACKGROUND;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Raster zeichnen
        this._drawGrid();
        
        // Hindernisse zeichnen
        this._drawObstacles();
        
        // Essen zeichnen
        this._drawFood();
        
        // Gegner zeichnen
        this._drawEnemies();
        
        // Spieler zeichnen
        this._drawPlayer();
        
        // UI (Score, etc.)
        this._drawUI();
    }
    
    _drawGrid() {
        this.ctx.strokeStyle = COLORS.GRID;
        this.ctx.lineWidth = 0.5;
        
        for (let i = 0; i <= this.gridWidth; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.cellSize, 0);
            this.ctx.lineTo(i * this.cellSize, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let j = 0; j <= this.gridHeight; j++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, j * this.cellSize);
            this.ctx.lineTo(this.canvas.width, j * this.cellSize);
            this.ctx.stroke();
        }
    }
    
    _drawPlayer() {
        this._drawCell(this.player.x, this.player.y, COLORS.PLAYER);
    }
    
    _drawFood() {
        if (this.food.x >= 0 && this.food.y >= 0) {
            this._drawCell(this.food.x, this.food.y, COLORS.FOOD, true);
        }
    }
    
    _drawEnemies() {
        for (let enemy of this.enemies) {
            this._drawCell(enemy.x, enemy.y, COLORS.ENEMY);
        }
    }
    
    _drawObstacles() {
        for (let obstacle of this.obstacles) {
            this._drawCell(obstacle.x, obstacle.y, COLORS.OBSTACLE);
        }
    }
    
    _drawCell(x, y, color, isCircle = false) {
        const padding = 2;
        const px = x * this.cellSize + padding;
        const py = y * this.cellSize + padding;
        const size = this.cellSize - padding * 2;
        
        this.ctx.fillStyle = color;
        
        if (isCircle) {
            this.ctx.beginPath();
            this.ctx.arc(
                px + size / 2,
                py + size / 2,
                size / 2,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
        } else {
            this.ctx.fillRect(px, py, size, size);
        }
    }
    
    _drawUI() {
        this.ctx.fillStyle = COLORS.TEXT;
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 10, 25);
        this.ctx.fillText(`Schwierigkeit: ${this.difficulty}`, 10, 45);
        
        if (!this.isRunning && !this.isGameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = COLORS.TEXT;
            this.ctx.font = '24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                'Drücke eine Pfeiltaste zum Starten',
                this.canvas.width / 2,
                this.canvas.height / 2
            );
            this.ctx.textAlign = 'left';
        }
    }
    
    _drawPausedScreen() {
        this._draw();
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            'PAUSIERT',
            this.canvas.width / 2,
            this.canvas.height / 2
        );
        this.ctx.font = '16px Arial';
        this.ctx.fillText(
            'Drücke Escape oder P zum Fortsetzen',
            this.canvas.width / 2,
            this.canvas.height / 2 + 40
        );
        this.ctx.textAlign = 'left';
    }
    
    /**
     * Game Over Bildschirm zeichnen
     */
    _drawGameOver() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            'SPIEL VORBEI',
            this.canvas.width / 2,
            this.canvas.height / 2 - 20
        );
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText(
            `Endpunktzahl: ${this.score}`,
            this.canvas.width / 2,
            this.canvas.height / 2 + 20
        );
        
        this.ctx.font = '16px Arial';
        this.ctx.fillText(
            'Drücke Enter oder Leertaste für Neustart',
            this.canvas.width / 2,
            this.canvas.height / 2 + 60
        );
        this.ctx.textAlign = 'left';
    }
    
    // ==================== ÖFFENTLICHE METHODEN ====================
    
    /**
     * Punktzahl abrufen
     */
    getScore() {
        return this.score;
    }
    
    /**
     * Spielstatus abrufen
     */
    getGameState() {
        return {
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            isGameOver: this.isGameOver,
            score: this.score,
            difficulty: this.difficulty
        };
    }
}

// ==================== INITIALISIERUNG ====================

// Spiel initialisieren wenn DOM geladen
let game;

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
        game = new Game('gameCanvas');
        
        // Schwierigkeitsgrad setzen (Standard: Medium)
        game.setDifficulty(DIFFICULTY.MEDIUM);
        
        // Initiale Zeichnung
        game._draw();
        
        console.log('Spiel initialisiert. Drücke eine Pfeiltaste zum Starten.');
    } else {
        console.error('Canvas-Element nicht gefunden!');
    }
});

// Export für globale Nutzung
window.Game = Game;
window.game = game;