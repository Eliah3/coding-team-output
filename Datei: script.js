/**
 * Snake-Spiel mit vollständiger Spiel-Logik
 * Implementiert: Kollisionserkennung, Scoring, Neustart, Pause, Schwierigkeitsstufen
 */

// ==================== KONSTANTEN ====================
const GAME_CONFIG = {
    GRID_SIZE: 20,
    CELL_SIZE: 20,
    INITIAL_SPEED: 150,
    MIN_SPEED: 50,
    SPEED_DECREMENT: 10,
    ENEMY_SPAWN_INTERVAL: 5000,
    OBSTACLE_SPAWN_INTERVAL: 3000,
};

const DIFFICULTY_LEVELS = {
    EASY: { name: 'Einfach', speed: 200, enemyCount: 2, obstacleCount: 3 },
    MEDIUM: { name: 'Mittel', speed: 150, enemyCount: 4, obstacleCount: 5 },
    HARD: { name: 'Schwer', speed: 100, enemyCount: 6, obstacleCount: 8 },
};

const COLORS = {
    BACKGROUND: '#1a1a2e',
    GRID: '#16213e',
    PLAYER: '#0f3460',
    PLAYER_HEAD: '#e94560',
    FOOD: '#ffd700',
    ENEMY: '#ff6b6b',
    OBSTACLE: '#4a4a4a',
    TEXT: '#ffffff',
    PAUSE_OVERLAY: 'rgba(0, 0, 0, 0.7)',
};

// ==================== HAUPTKLASSE ====================
class SnakeGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Spielfeld-Größe
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.gridWidth = Math.floor(this.width / GAME_CONFIG.CELL_SIZE);
        this.gridHeight = Math.floor(this.height / GAME_CONFIG.CELL_SIZE);
        
        // Spielstatus
        this.isRunning = false;
        this.isPaused = false;
        this.score = 0;
        this.difficulty = DIFFICULTY_LEVELS.MEDIUM;
        
        // Spielobjekte
        this.snake = [];
        this.food = null;
        this.enemies = [];
        this.obstacles = [];
        
        // Timer
        this.gameLoop = null;
        this.enemySpawnTimer = null;
        this.obstacleSpawnTimer = null;
        
        // Logging
        this.logger = {
            info: (msg) => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`),
            warn: (msg) => console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`),
            error: (msg) => console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`),
        };
        
        // Event Listener für Tastatur
        this._setupKeyboardControls();
        
        this.logger.info('Spiel initialisiert');
    }

    // ==================== SPIELSTEUERUNG ====================
    
    /**
     * Startet das Spiel
     */
    start() {
        if (this.isRunning) {
            this.logger.warn('Spiel läuft bereits');
            return;
        }
        
        this._resetGame();
        this.isRunning = true;
        this.isPaused = false;
        
        this._startGameLoop();
        this._startEnemySpawner();
        this._startObstacleSpawner();
        
        this.logger.info('Spiel gestartet');
    }

    /**
     * Stoppt das Spiel
     */
    stop() {
        this.isRunning = false;
        this._stopGameLoop();
        this._stopSpawners();
        this.logger.info('Spiel gestoppt');
    }

    /**
     * Pausiert das Spiel
     */
    toggle_pause() {
        if (!this.isRunning) {
            this.logger.warn('Spiel läuft nicht - kann nicht pausieren');
            return;
        }
        
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this._stopGameLoop();
            this._stopSpawners();
            this._drawPauseScreen();
            this.logger.info('Spiel pausiert');
        } else {
            this._startGameLoop();
            this._startEnemySpawner();
            this._startObstacleSpawner();
            this.logger.info('Spiel fortgesetzt');
        }
    }

    /**
     * Setzt die Schwierigkeitsstufe
     * @param {string} level - 'EASY', 'MEDIUM' oder 'HARD'
     */
    set_difficulty(level) {
        const validLevels = Object.keys(DIFFICULTY_LEVELS);
        
        if (!validLevels.includes(level)) {
            this.logger.error(`Ungültige Schwierigkeitsstufe: ${level}`);
            return;
        }
        
        this.difficulty = DIFFICULTY_LEVELS[level];
        this.logger.info(`Schwierigkeit gesetzt auf: ${this.difficulty.name}`);
        
        // Wenn das Spiel läuft, neu starten
        if (this.isRunning) {
            this.stop();
            this.start();
        }
    }

    /**
     * Startet das Spiel neu
     */
    restart() {
        this.stop();
        this._resetGame();
        this.isRunning = true;
        this.isPaused = false;
        
        this._startGameLoop();
        this._startEnemySpawner();
        this._startObstacleSpawner();
        
        this.logger.info('Spiel neu gestartet');
    }

    // ==================== PRIVATE METHODEN ====================

    /**
     * Setzt das Spiel zurück
     */
    _resetGame() {
        this.score = 0;
        this.snake = this._createInitialSnake();
        this.food = this._generateFood();
        this.enemies = [];
        this.obstacles = [];
        this.isPaused = false;
        
        this.logger.info('Spielzustand zurückgesetzt');
    }

    /**
     * Erstellt die initiale Schlange
     */
    _createInitialSnake() {
        const startX = Math.floor(this.gridWidth / 2);
        const startY = Math.floor(this.gridHeight / 2);
        
        return [
            { x: startX, y: startY },
            { x: startX - 1, y: startY },
            { x: startX - 2, y: startY },
        ];
    }

    /**
     * Generiert Futter an einer zufälligen Position
     */
    _generateFood() {
        let position;
        let isValid = false;
        
        while (!isValid) {
            position = {
                x: Math.floor(Math.random() * this.gridWidth),
                y: Math.floor(Math.random() * this.gridHeight),
            };
            
            isValid = this._isValidPosition(position);
        }
        
        return position;
    }

    /**
     * Generiert einen Gegner
     */
    _generateEnemy() {
        let position;
        let isValid = false;
        
        while (!isValid) {
            position = {
                x: Math.floor(Math.random() * this.gridWidth),
                y: Math.floor(Math.random() * this.gridHeight),
            };
            
            isValid = this._isValidPosition(position);
        }
        
        // Gegner bewegt sich in eine zufällige Richtung
        const directions = [
            { dx: 1, dy: 0 },
            { dx: -1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: 0, dy: -1 },
        ];
        
        return {
            x: position.x,
            y: position.y,
            direction: directions[Math.floor(Math.random() * directions.length)],
        };
    }

    /**
     * Generiert ein Hindernis
     */
    _generateObstacle() {
        let position;
        let isValid = false;
        
        while (!isValid) {
            position = {
                x: Math.floor(Math.random() * this.gridWidth),
                y: Math.floor(Math.random() * this.gridHeight),
            };
            
            isValid = this._isValidPosition(position);
        }
        
        return position;
    }

    /**
     * Prüft ob eine Position gültig ist (nicht auf Schlange, Futter, Gegner, Hindernis)
     */
    _isValidPosition(position) {
        // Prüfe Schlange
        for (const segment of this.snake) {
            if (segment.x === position.x && segment.y === position.y) {
                return false;
            }
        }
        
        // Prüfe Futter
        if (this.food && this.food.x === position.x && this.food.y === position.y) {
            return false;
        }
        
        // Prüfe Gegner
        for (const enemy of this.enemies) {
            if (enemy.x === position.x && enemy.y === position.y) {
                return false;
            }
        }
        
        // Prüfe Hindernisse
        for (const obstacle of this.obstacles) {
            if (obstacle.x === position.x && obstacle.y === position.y) {
                return false;
            }
        }
        
        return true;
    }

    // ==================== GAME LOOP ====================

    /**
     * Startet die Spielschleife
     */
    _startGameLoop() {
        const speed = this.difficulty.speed;
        
        this.gameLoop = setInterval(() => {
            if (!this.isPaused) {
                this._update();
                this._draw();
            }
        }, speed);
    }

    /**
     * Stoppt die Spielschleife
     */
    _stopGameLoop() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
    }

    /**
     * Startet den Gegner-Spawner
     */
    _startEnemySpawner() {
        this.enemySpawnTimer = setInterval(() => {
            if (!this.isPaused && this.enemies.length < this.difficulty.enemyCount) {
                this.enemies.push(this._generateEnemy());
                this.logger.info(`Gegner hinzugefügt. Anzahl: ${this.enemies.length}`);
            }
        }, GAME_CONFIG.ENEMY_SPAWN_INTERVAL);
    }

    /**
     * Startet den Hindernis-Spawner
     */
    _startObstacleSpawner() {
        this.obstacleSpawnTimer = setInterval(() => {
            if (!this.isPaused && this.obstacles.length < this.difficulty.obstacleCount) {
                this.obstacles.push(this._generateObstacle());
                this.logger.info(`Hindernis hinzugefügt. Anzahl: ${this.obstacles.length}`);
            }
        }, GAME_CONFIG.OBSTACLE_SPAWN_INTERVAL);
    }

    /**
     * Stoppt die Spawner
     */
    _stopSpawners() {
        if (this.enemySpawnTimer) {
            clearInterval(this.enemySpawnTimer);
            this.enemySpawnTimer = null;
        }
        
        if (this.obstacleSpawnTimer) {
            clearInterval(this.obstacleSpawnTimer);
            this.obstacleSpawnTimer = null;
        }
    }

    // ==================== SPIELLOGIK ====================

    /**
     * Aktualisiert den Spielzustand
     */
    _update() {
        this._moveSnake();
        this._checkCollisions();
        this._updateEnemies();
        this._checkEnemyCollisions();
    }

    /**
     * Bewegt die Schlange
     */
    _moveSnake() {
        const head = this.snake[0];
        const newHead = {
            x: head.x + this.direction.x,
            y: head.y + this.direction.y,
        };
        
        // Wrap around am Spielfeldrand
        if (newHead.x < 0) newHead.x = this.gridWidth - 1;
        if (newHead.x >= this.gridWidth) newHead.x = 0;
        if (newHead.y < 0) newHead.y = this.gridHeight - 1;
        if (newHead.y >= this.gridHeight) newHead.y = 0;
        
        this.snake.unshift(newHead);
        
        // Prüfen ob Futter gegessen wurde
        if (this._checkFoodCollision(newHead)) {
            this._handleFoodEaten();
        } else {
            this.snake.pop();
        }
    }

    /**
     * Prüft Kollision mit Futter
     */
    _checkFoodCollision(head) {
        return head.x === this.food.x && head.y === this.food.y;
    }

    /**
     * Behandelt das Essen von Futter
     */
    _handleFoodEaten() {
        this.score += 10;
        this.food = this._generateFood();
        this.logger.info(`Futter gegessen. Punktzahl: ${this.score}`);
        
        // Geschwindigkeit erhöhen (Schwierigkeit steigern)
        this._increaseSpeed();
    }

    /**
     * Erhöht die Geschwindigkeit
     */
    _increaseSpeed() {
        const currentSpeed = this.difficulty.speed;
        const newSpeed = Math.max(GAME_CONFIG.MIN_SPEED, currentSpeed - GAME_CONFIG.SPEED_DECREMENT);
        
        if (newSpeed !== currentSpeed) {
            this.difficulty.speed = newSpeed;
            this._stopGameLoop();
            this._startGameLoop();
            this.logger.info(`Geschwindigkeit erhöht auf: ${newSpeed}ms`);
        }
    }

    /**
     * Aktualisiert die Gegner
     */
    _updateEnemies() {
        for (const enemy of this.enemies) {
            // Bewege Gegner
            enemy.x += enemy.direction.dx;
            enemy.y += enemy.direction.dy;
            
            // Wrap around
            if (enemy.x < 0) enemy.x = this.gridWidth - 1;
            if (enemy.x >= this.gridWidth) enemy.x = 0;
            if (enemy.y < 0) enemy.y = this.gridHeight - 1;
            if (enemy.y >= this.gridHeight) enemy.y = 0;
            
            // Zufällige Richtungsänderung (10% Chance)
            if (Math.random() < 0.1) {
                const directions = [
                    { dx: 1, dy: 0 },
                    { dx: -1, dy: 0 },
                    { dx: 0, dy: 1 },
                    { dx: 0, dy: -1 },
                ];
                enemy.direction = directions[Math.floor(Math.random() * directions.length)];
            }
        }
    }

    /**
     * Prüft Kollisionen
     */
    _checkCollisions() {
        const head = this.snake[0];
        
        // Kollision mit eigenem Körper
        for (let i = 1; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                this._handleGameOver('Kollision mit eigenem Körper');
                return;
            }
        }
        
        // Kollision mit Hindernissen
        for (const obstacle of this.obstacles) {
            if (head.x === obstacle.x && head.y === obstacle.y) {
                this._handleGameOver('Kollision mit Hindernis');
                return;
            }
        }
    }

    /**
     * Prüft Kollision mit Gegnern
     */
    _checkEnemyCollisions() {
        const head = this.snake[0];
        
        for (const enemy of this.enemies) {
            if (head.x === enemy.x && head.y === enemy.y) {
                this._handleGameOver('Kollision mit Gegner');
                return;
            }
        }
    }

    /**
     * Behandelt Game Over
     */
    _handleGameOver(reason) {
        this.isRunning = false;
        this._stopGameLoop();
        this._stopSpawners();
        
        this.logger.info(`Game Over: ${reason}. Endpunktzahl: ${this.score}`);
        this._drawGameOver(reason);
    }

    // ==================== RENDERING ====================

    /**
     * Zeichnet das gesamte Spiel
     */
    _draw() {
        this._clearCanvas();
        this._drawGrid();
        this._drawObstacles();
        this._drawEnemies();
        this._drawFood();
        this._drawSnake();
        this._drawScore();
    }

    /**
     * Löscht den Canvas
     */
    _clearCanvas() {
        this.ctx.fillStyle = COLORS.BACKGROUND;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    /**
     * Zeichnet das Gitter
     */
    _drawGrid() {
        this.ctx.strokeStyle = COLORS.GRID;
        this.ctx.lineWidth = 0.5;
        
        for (let x = 0; x <= this.width; x += GAME_CONFIG.CELL_SIZE) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.height; y += GAME_CONFIG.CELL_SIZE) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
    }

    /**
     * Zeichnet die Schlange
     */
    _drawSnake() {
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            const isHead = i === 0;
            
            this.ctx.fillStyle = isHead ? COLORS.PLAYER_HEAD : COLORS.PLAYER;
            this.ctx.fillRect(
                segment.x * GAME_CONFIG.CELL_SIZE,
                segment.y * GAME_CONFIG.CELL_SIZE,
                GAME_CONFIG.CELL_SIZE - 2,
                GAME_CONFIG.CELL_SIZE - 2
            );
        }
    }

    /**
     * Zeichnet das Futter
     */
    _drawFood() {
        if (!this.food) return;
        
        this.ctx.fillStyle = COLORS.FOOD;
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * GAME_CONFIG.CELL_SIZE + GAME_CONFIG.CELL_SIZE / 2,
            this.food.y * GAME_CONFIG.CELL_SIZE + GAME_CONFIG.CELL_SIZE / 2,
            GAME_CONFIG.CELL_SIZE / 2 - 2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
    }

    /**
     * Zeichnet die Gegner
     */
    _drawEnemies() {
        for (const enemy of this.enemies) {
            this.ctx.fillStyle = COLORS.ENEMY;
            this.ctx.fillRect(
                enemy.x * GAME_CONFIG.CELL_SIZE,
                enemy.y * GAME_CONFIG.CELL_SIZE,
                GAME_CONFIG.CELL_SIZE - 2,
                GAME_CONFIG.CELL_SIZE - 2
            );
            
            // Augen zeichnen
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(
                enemy.x * GAME_CONFIG.CELL_SIZE + 4,
                enemy.y * GAME_CONFIG.CELL_SIZE + 4,
                4,
                4
            );
            this.ctx.fillRect(
                enemy.x * GAME_CONFIG.CELL_SIZE + 12,
                enemy.y * GAME_CONFIG.CELL_SIZE + 4,
                4,
                4
            );
        }
    }

    /**
     * Zeichnet die Hindernisse
     */
    _drawObstacles() {
        for (const obstacle of this.obstacles) {
            this.ctx.fillStyle = COLORS.OBSTACLE;
            this.ctx.fillRect(
                obstacle.x * GAME_CONFIG.CELL_SIZE,
                obstacle.y * GAME_CONFIG.CELL_SIZE,
                GAME_CONFIG.CELL_SIZE - 2,
                GAME_CONFIG.CELL_SIZE - 2
            );
        }
    }

    /**
     * Zeichnet die Punktzahl
     */
    _drawScore() {
        this.ctx.fillStyle = COLORS.TEXT;
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Punkte: ${this.score}`, 10, 30);
        this.ctx.fillText(`Schwierigkeit: ${this.difficulty.name}`, 10, 60);
    }

    /**
     * Zeichnet den Pause-Bildschirm
     */
    _drawPauseScreen() {
        this.ctx.fillStyle = COLORS.PAUSE_OVERLAY;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.fillStyle = COLORS.TEXT;
        this.ctx.font = '40px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSIERT', this.width / 2, this.height / 2);
        
        this.ctx.font = '20px Arial';
        this.ctx.fillText('Drücke P zum Fortsetzen', this.width / 2, this.height / 2 + 40);
        this.ctx.textAlign = 'left';
    }

    /**
     * Zeichnet den Game Over Bildschirm
     */
    _drawGameOver(reason) {
        this.ctx.fillStyle = COLORS.PAUSE_OVERLAY;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.fillStyle = COLORS.TEXT;
        this.ctx.font = '40px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('SPIEL VORBEI', this.width / 2, this.height / 2 - 20);
        
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Grund: ${reason}`, this.width / 2, this.height / 2 + 20);
        this.ctx.fillText(`Endpunktzahl: ${this.score}`, this.width / 2, this.height / 2 + 50);
        
        this.ctx.fillText('Drücke R für Neustart', this.width / 2, this.height / 2 + 90);
        this.ctx.textAlign = 'left';
    }

    // ==================== TASTATURSTEUERUNG ====================

    /**
     * Richtungsvektor für die Bewegung
     */
    get direction() {
        return this._direction;
    }

    set direction(value) {
        this._direction = value;
    }

    /**
     * Richtet die Tastatursteuerung ein
     */
    _setupKeyboardControls() {
        this._direction = { x: 1, y: 0 };
        
        document.addEventListener('keydown', (e) => this._handleKeyboard(e));
    }

    /**
     * Behandelt Tastatureingaben
     */
    _handleKeyboard(event) {
        if (!this.isRunning && !this.isPaused && (event.key === 'r' || event.key === 'R')) {
            this.restart();
            return;
        }
        
        if (event.key === 'p' || event.key === 'P') {
            this.toggle_pause();
            return;
        }
        
        if (!this.isRunning || this.isPaused) return;
        
        const key = event.key;
        
        // Richtungsänderung (verhindert 180° Drehung)
        if (key === 'ArrowUp' || key === 'w' || key === 'W') {
            if (this._direction.y !== 1) {
                this._direction = { x: 0, y: -1 };
                this.logger.info('Richtung: Hoch');
            }
        } else if (key === 'ArrowDown' || key === 's' || key === 'S') {
            if (this._direction.y !== -1) {
                this._direction = { x: 0, y: 1 };
                this.logger.info('Richtung: Runter');
            }
        } else if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
            if (this._direction.x !== 1) {
                this._direction = { x: -1, y: 0 };
                this.logger.info('Richtung: Links');
            }
        } else if (key === 'ArrowRight' || key === 'd' || key === 'D') {
            if (this._direction.x !== -1) {
                this._direction = { x: 1, y: 0 };
                this.logger.info('Richtung: Rechts');
            }
        }
    }
}

// ==================== INITIALISIERUNG ====================

// Globale Spielinstanz
let game;

/**
 * Initialisiert das Spiel wenn die Seite geladen ist
 */
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    
    if (!canvas) {
        console.error('Canvas-Element nicht gefunden!');
        return;
    }
    
    game = new SnakeGame('gameCanvas');
    
    // UI-Event-Listener
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const restartBtn = document.getElementById('restartBtn');
    const difficultySelect = document.getElementById('difficultySelect');
    
    if (startBtn) {
        startBtn.addEventListener('click', () => game.start());
    }
    
    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => game.toggle_pause());
    }
    
    if (restartBtn) {
        restartBtn.addEventListener('click', () => game.restart());
    }
    
    if (difficultySelect) {
        difficultySelect.addEventListener('change', (e) => {
            game.set_difficulty(e.target.value);
        });
    }
    
    console.log('Spiel bereit! Drücke Start um zu spielen.');
});

// Export für Tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SnakeGame, GAME_CONFIG, DIFFICULTY_LEVELS, COLORS };
}