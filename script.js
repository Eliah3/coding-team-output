/**
 * TicTacToe / Snake Spiel - Vollständige Implementierung
 * Enthält: Kollisionserkennung, Scoring, Neustart, KI-Logik, Pause, Schwierigkeit
 */

// ==================== KONSTANTEN ====================
const GAME_CONFIG = {
    GRID_WIDTH: 20,
    GRID_HEIGHT: 20,
    CELL_SIZE: 20,
    FPS: 10,
    INITIAL_SCORE: 0,
    POINTS_PER_FOOD: 10
};

const DIFFICULTY_LEVELS = {
    EASY: { name: 'Einfach', fps: 5, enemyCount: 1, obstacleCount: 2 },
    MEDIUM: { name: 'Mittel', fps: 10, enemyCount: 3, obstacleCount: 4 },
    HARD: { name: 'Schwer', fps: 15, enemyCount: 5, obstacleCount: 6 }
};

const COLORS = {
    BACKGROUND: '#1a1a2e',
    GRID: '#16213e',
    PLAYER: '#0f3460',
    PLAYER_HEAD: '#e94560',
    FOOD: '#00ff88',
    ENEMY: '#ff6b6b',
    OBSTACLE: '#4a4a4a',
    TEXT: '#ffffff',
    SCORE: '#00ff88',
    GAME_OVER: '#ff4757'
};

// ==================== SPIELKLASSE ====================
class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Spielfeld-Größe setzen
        this.canvas.width = GAME_CONFIG.GRID_WIDTH * GAME_CONFIG.CELL_SIZE;
        this.canvas.height = GAME_CONFIG.GRID_HEIGHT * GAME_CONFIG.CELL_SIZE;
        
        // Spielzustand
        this.isRunning = false;
        this.isPaused = false;
        this.score = GAME_CONFIG.INITIAL_SCORE;
        this.difficulty = DIFFICULTY_LEVELS.MEDIUM;
        this.gameLoop = null;
        
        // Spielobjekte
        this.player = null;
        this.food = null;
        this.enemies = [];
        this.obstacles = [];
        
        // Event-Listener
        this._setupEventListeners();
        
        // Initialisierung
        this._init();
    }

    // ==================== INITIALISIERUNG ====================
    _init() {
        this._initPlayer();
        this._generateFood();
        this._generateObstacles();
        this._generateEnemies();
        this.score = GAME_CONFIG.INITIAL_SCORE;
        this.isRunning = true;
        this.isPaused = false;
        
        // Spielschleife starten
        this._startGameLoop();
    }

    _initPlayer() {
        // Spieler in der Mitte starten
        const startX = Math.floor(GAME_CONFIG.GRID_WIDTH / 2);
        const startY = Math.floor(GAME_CONFIG.GRID_HEIGHT / 2);
        
        this.player = {
            x: startX,
            y: startY,
            direction: { x: 1, y: 0 }, // Nach rechts bewegen
            body: [
                { x: startX, y: startY },
                { x: startX - 1, y: startY },
                { x: startX - 2, y: startY }
            ]
        };
    }

    // ==================== GENERIERUNG VON SPIELOBJEKTEN ====================
    _generateFood() {
        let validPosition = false;
        let x, y;

        while (!validPosition) {
            x = Math.floor(Math.random() * GAME_CONFIG.GRID_WIDTH);
            y = Math.floor(Math.random() * GAME_CONFIG.GRID_HEIGHT);
            validPosition = this._isValidPosition(x, y);
        }

        this.food = { x, y };
    }

    _generateObstacles() {
        this.obstacles = [];
        const count = this.difficulty.obstacleCount;

        for (let i = 0; i < count; i++) {
            let validPosition = false;
            let x, y;

            while (!validPosition) {
                x = Math.floor(Math.random() * GAME_CONFIG.GRID_WIDTH);
                y = Math.floor(Math.random() * GAME_CONFIG.GRID_HEIGHT);
                validPosition = this._isValidPosition(x, y);
            }

            this.obstacles.push({ x, y });
        }
    }

    _generateEnemies() {
        this.enemies = [];
        const count = this.difficulty.enemyCount;

        for (let i = 0; i < count; i++) {
            let validPosition = false;
            let x, y;

            while (!validPosition) {
                x = Math.floor(Math.random() * GAME_CONFIG.GRID_WIDTH);
                y = Math.floor(Math.random() * GAME_CONFIG.GRID_HEIGHT);
                validPosition = this._isValidPosition(x, y);
            }

            this.enemies.push({
                x,
                y,
                direction: {
                    x: Math.random() > 0.5 ? 1 : -1,
                    y: Math.random() > 0.5 ? 1 : -1
                }
            });
        }
    }

    _isValidPosition(x, y) {
        // Prüfen ob Position nicht vom Spieler besetzt ist
        if (this.player && this.player.body) {
            for (const segment of this.player.body) {
                if (segment.x === x && segment.y === y) return false;
            }
        }

        // Prüfen ob Position nicht von Hindernissen besetzt ist
        for (const obs of this.obstacles) {
            if (obs.x === x && obs.y === y) return false;
        }

        // Prüfen ob Position nicht von Feind besetzt ist
        for (const enemy of this.enemies) {
            if (enemy.x === x && enemy.y === y) return false;
        }

        return true;
    }

    // ==================== KOLLISIONSERKENNUNG ====================
    _checkCollisions() {
        const head = this.player.body[0];

        // 1. Kollision mit Wänden
        if (head.x < 0 || head.x >= GAME_CONFIG.GRID_WIDTH ||
            head.y < 0 || head.y >= GAME_CONFIG.GRID_HEIGHT) {
            return true;
        }

        // 2. Kollision mit eigenem Körper
        for (let i = 1; i < this.player.body.length; i++) {
            if (head.x === this.player.body[i].x && head.y === this.player.body[i].y) {
                return true;
            }
        }

        // 3. Kollision mit Hindernissen
        for (const obstacle of this.obstacles) {
            if (head.x === obstacle.x && head.y === obstacle.y) {
                return true;
            }
        }

        // 4. Kollision mit Feinden
        for (const enemy of this.enemies) {
            if (head.x === enemy.x && head.y === enemy.y) {
                return true;
            }
        }

        return false;
    }

    _checkFoodCollision() {
        const head = this.player.body[0];

        if (head.x === this.food.x && head.y === this.food.y) {
            // Punkt hinzufügen
            this._addScore(GAME_CONFIG.POINTS_PER_FOOD);
            
            // Spieler wächst
            this.player.body.push({ ...this.player.body[this.player.body.length - 1] });
            
            // Neues Fressen generieren
            this._generateFood();
            
            return true;
        }
        return false;
    }

    _checkEnemyCollision() {
        const head = this.player.body[0];

        for (const enemy of this.enemies) {
            if (head.x === enemy.x && head.y === enemy.y) {
                return true;
            }
        }
        return false;
    }

    // ==================== BEWEGUNG ====================
    _movePlayer() {
        const head = this.player.body[0];
        const newHead = {
            x: head.x + this.player.direction.x,
            y: head.y + this.player.direction.y
        };

        // Neuen Kopf hinzufügen
        this.player.body.unshift(newHead);

        // Schwanz entfernen (wenn kein Fressen gegessen wurde)
        if (!this._checkFoodCollision()) {
            this.player.body.pop();
        }
    }

    _moveEnemies() {
        for (const enemy of this.enemies) {
            // Zufällige Richtungsänderung mit geringer Wahrscheinlichkeit
            if (Math.random() < 0.1) {
                const directions = [
                    { x: 1, y: 0 }, { x: -1, y: 0 },
                    { x: 0, y: 1 }, { x: 0, y: -1 }
                ];
                enemy.direction = directions[Math.floor(Math.random() * directions.length)];
            }

            let newX = enemy.x + enemy.direction.x;
            let newY = enemy.y + enemy.direction.y;

            // An Wänden abprallen
            if (newX < 0 || newX >= GAME_CONFIG.GRID_WIDTH) {
                enemy.direction.x *= -1;
                newX = enemy.x;
            }
            if (newY < 0 || newY >= GAME_CONFIG.GRID_HEIGHT) {
                enemy.direction.y *= -1;
                newY = enemy.y;
            }

            // Nicht in Hindernisse oder Spieler bewegen
            let blocked = false;
            for (const obs of this.obstacles) {
                if (newX === obs.x && newY === obs.y) {
                    enemy.direction.x *= -1;
                    enemy.direction.y *= -1;
                    blocked = true;
                    break;
                }
            }

            if (!blocked) {
                enemy.x = newX;
                enemy.y = newY;
            }
        }
    }

    // ==================== SCORING ====================
    _addScore(points) {
        this.score += points;
        this._updateScoreDisplay();
    }

    _updateScoreDisplay() {
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
    }

    // ==================== SPIELSTEUERUNG ====================
    _startGameLoop() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }

        const interval = 1000 / this.difficulty.fps;
        this.gameLoop = setInterval(() => this._update(), interval);
    }

    _update() {
        if (!this.isRunning || this.isPaused) return;

        // Spieler bewegen
        this._movePlayer();

        // Feinde bewegen
        this._moveEnemies();

        // Kollisionserkennung
        if (this._checkCollisions() || this._checkEnemyCollision()) {
            this._gameOver();
            return;
        }

        // Rendern
        this._render();
    }

    // ==================== PAUSE ====================
    toggle_pause() {
        this.isPaused = !this.isPaused;
        
        const pauseOverlay = document.getElementById('pause-overlay');
        if (pauseOverlay) {
            pauseOverlay.style.display = this.isPaused ? 'flex' : 'none';
        }
        
        return this.isPaused;
    }

    // ==================== SCHWIERIGKEIT ====================
    set_difficulty(level) {
        const validLevels = ['EASY', 'MEDIUM', 'HARD'];
        
        if (!validLevels.includes(level)) {
            console.error(`Ungültige Schwierigkeitsstufe: ${level}`);
            return false;
        }

        this.difficulty = DIFFICULTY_LEVELS[level];
        
        // Spiel neu starten mit neuer Schwierigkeit
        if (this.isRunning) {
            this.restart();
        }
        
        return true;
    }

    // ==================== NEUSTART ====================
    restart() {
        // Altes Spiel beenden
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }

        // Spiel zurücksetzen
        this._init();
        this._render();
        
        console.log('Spiel neu gestartet');
    }

    // ==================== GAME OVER ====================
    _gameOver() {
        this.isRunning = false;
        
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }

        this._draw_game_over();
        console.log(`Spiel beendet! Endpunktzahl: ${this.score}`);
    }

    // ==================== EVENT LISTENERS ====================
    _setupEventListeners() {
        // Tastatursteuerung
        document.addEventListener('keydown', (e) => this._handle_keyboard(e));
    }

    _handle_keyboard(event) {
        // Nur bei laufendem Spiel (nicht pausiert) auf Tasten reagieren
        if (!this.isRunning) {
            // Leertaste startet das Spiel neu
            if (event.code === 'Space') {
                this.restart();
            }
            return;
        }

        // P-Taste für Pause
        if (event.code === 'KeyP') {
            this.toggle_pause();
            return;
        }

        // Wenn pausiert, keine Bewegung möglich
        if (this.isPaused) return;

        const key = event.key.toLowerCase();
        
        // Pfeiltasten oder WASD für Bewegung
        switch (key) {
            case 'arrowup':
            case 'w':
                if (this.player.direction.y !== 1) {
                    this.player.direction = { x: 0, y: -1 };
                    this._addScore(1); // Punkte für Bewegung
                }
                break;
            case 'arrowdown':
            case 's':
                if (this.player.direction.y !== -1) {
                    this.player.direction = { x: 0, y: 1 };
                    this._addScore(1);
                }
                break;
            case 'arrowleft':
            case 'a':
                if (this.player.direction.x !== 1) {
                    this.player.direction = { x: -1, y: 0 };
                    this._addScore(1);
                }
                break;
            case 'arrowright':
            case 'd':
                if (this.player.direction.x !== -1) {
                    this.player.direction = { x: 1, y: 0 };
                    this._addScore(1);
                }
                break;
            case 'r':
                this.restart();
                break;
        }
    }

    // ==================== RENDERING ====================
    _render() {
        // Hintergrund löschen
        this.ctx.fillStyle = COLORS.BACKGROUND;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Gitter zeichnen
        this._drawGrid();

        // Hindernisse zeichnen
        this._drawObstacles();

        // Fressen zeichnen
        this._drawFood();

        // Feinde zeichnen
        this._drawEnemies();

        // Spieler zeichnen
        this._drawPlayer();

        // Score anzeigen
        this._drawScore();
    }

    _drawGrid() {
        this.ctx.strokeStyle = COLORS.GRID;
        this.ctx.lineWidth = 0.5;

        for (let x = 0; x <= GAME_CONFIG.GRID_WIDTH; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * GAME_CONFIG.CELL_SIZE, 0);
            this.ctx.lineTo(x * GAME_CONFIG.CELL_SIZE, this.canvas.height);
            this.ctx.stroke();
        }

        for (let y = 0; y <= GAME_CONFIG.GRID_HEIGHT; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * GAME_CONFIG.CELL_SIZE);
            this.ctx.lineTo(this.canvas.width, y * GAME_CONFIG.CELL_SIZE);
            this.ctx.stroke();
        }
    }

    _drawPlayer() {
        if (!this.player || !this.player.body) return;

        // Körper zeichnen
        this.ctx.fillStyle = COLORS.PLAYER;
        for (let i = 1; i < this.player.body.length; i++) {
            const segment = this.player.body[i];
            this.ctx.fillRect(
                segment.x * GAME_CONFIG.CELL_SIZE,
                segment.y * GAME_CONFIG.CELL_SIZE,
                GAME_CONFIG.CELL_SIZE - 2,
                GAME_CONFIG.CELL_SIZE - 2
            );
        }

        // Kopf hervorheben
        const head = this.player.body[0];
        this.ctx.fillStyle = COLORS.PLAYER_HEAD;
        this.ctx.fillRect(
            head.x * GAME_CONFIG.CELL_SIZE,
            head.y * GAME_CONFIG.CELL_SIZE,
            GAME_CONFIG.CELL_SIZE - 2,
            GAME_CONFIG.CELL_SIZE - 2
        );
    }

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

    _drawEnemies() {
        this.ctx.fillStyle = COLORS.ENEMY;
        for (const enemy of this.enemies) {
            this.ctx.fillRect(
                enemy.x * GAME_CONFIG.CELL_SIZE,
                enemy.y * GAME_CONFIG.CELL_SIZE,
                GAME_CONFIG.CELL_SIZE - 2,
                GAME_CONFIG.CELL_SIZE - 2
            );
        }
    }

    _drawObstacles() {
        this.ctx.fillStyle = COLORS.OBSTACLE;
        for (const obstacle of this.obstacles) {
            this.ctx.fillRect(
                obstacle.x * GAME_CONFIG.CELL_SIZE,
                obstacle.y * GAME_CONFIG.CELL_SIZE,
                GAME_CONFIG.CELL_SIZE - 2,
                GAME_CONFIG.CELL_SIZE - 2
            );
        }
    }

    _drawScore() {
        this.ctx.fillStyle = COLORS.SCORE;
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`Punkte: ${this.score}`, 10, 25);
    }

    _draw_game_over() {
        // Halbtransparenter Hintergrund
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Game Over Text
        this.ctx.fillStyle = COLORS.GAME_OVER;
        this.ctx.font = 'bold 40px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('SPIEL VORBEI', this.canvas.width / 2, this.canvas.height / 2 - 20);

        // Punktestand
        this.ctx.fillStyle = COLORS.TEXT;
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Endpunktzahl: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);

        // Neustart-Hinweis
        this.ctx.font = '16px Arial';
        this.ctx.fillText('Drücke LEERTASTE für Neustart', this.canvas.width / 2, this.canvas.height / 2 + 60);

        // Textausrichtung zurücksetzen
        this.ctx.textAlign = 'left';
    }
}

// ==================== INITIALISIERUNG BEIM SEITENLADEN ====================
document.addEventListener('DOMContentLoaded', () => {
    // Spiel-Instanz erstellen
    window.game = new Game('game-canvas');
    
    // Buttons für Schwierigkeit
    const easyBtn = document.getElementById('btn-easy');
    const mediumBtn = document.getElementById('btn-medium');
    const hardBtn = document.getElementById('btn-hard');
    const restartBtn = document.getElementById('btn-restart');
    const pauseBtn = document.getElementById('btn-pause');

    if (easyBtn) {
        easyBtn.addEventListener('click', () => window.game.set_difficulty('EASY'));
    }
    if (mediumBtn) {
        mediumBtn.addEventListener('click', () => window.game.set_difficulty('MEDIUM'));
    }
    if (hardBtn) {
        hardBtn.addEventListener('click', () => window.game.set_difficulty('HARD'));
    }
    if (restartBtn) {
        restartBtn.addEventListener('click', () => window.game.restart());
    }
    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => window.game.toggle_pause());
    }

    console.log('Spiel initialisiert');
});