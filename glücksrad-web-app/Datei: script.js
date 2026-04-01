/**
 * Snake-Spiel mit vollständiger Spiel-Logik
 * Implementiert: Kollisionserkennung, Scoring, Neustart, Schwierigkeitsstufen, Pause
 */

// ==================== KONSTANTEN ====================
const GAME_CONFIG = {
    // Spielfeld-Größe
    GRID_WIDTH: 20,
    GRID_HEIGHT: 20,
    CELL_SIZE: 20,
    
    // Schwierigkeitsstufen
    DIFFICULTY: {
        EASY: { speed: 150, name: 'Einfach' },
        MEDIUM: { speed: 100, name: 'Mittel' },
        HARD: { speed: 50, name: 'Schwer' }
    },
    
    // Farben
    COLORS: {
        BACKGROUND: '#1a1a2e',
        GRID: '#16213e',
        SNAKE_HEAD: '#0f3460',
        SNAKE_BODY: '#533483',
        FOOD: '#e94560',
        OBSTACLE: '#6b7280',
        ENEMY: '#f59e0b',
        TEXT: '#ffffff',
        UI_BACKGROUND: 'rgba(0, 0, 0, 0.8)'
    },
    
    // Spielobjekt-Typen
    OBJECT_TYPES: {
        EMPTY: 0,
        SNAKE: 1,
        FOOD: 2,
        OBSTACLE: 3,
        ENEMY: 4
    }
};

// ==================== SPIEL-LOGIK KLASSE ====================
class GameLogic {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Spielfeld
        this.gridWidth = GAME_CONFIG.GRID_WIDTH;
        this.gridHeight = GAME_CONFIG.GRID_HEIGHT;
        this.cellSize = GAME_CONFIG.CELL_SIZE;
        
        // Canvas-Größe setzen
        this.canvas.width = this.gridWidth * this.cellSize;
        this.canvas.height = this.gridHeight * this.cellSize;
        
        // Spielstatus
        this.isRunning = false;
        this.isPaused = false;
        this.isGameOver = false;
        this.score = 0;
        this.difficulty = GAME_CONFIG.DIFFICULTY.MEDIUM;
        this.gameSpeed = this.difficulty.speed;
        
        // Spielobjekte
        this.snake = [];
        this.food = null;
        this.obstacles = [];
        this.enemies = [];
        
        // Spielschleife
        this.gameLoop = null;
        
        // Logging
        this.logger = {
            info: (msg) => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`),
            warn: (msg) => console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`),
            error: (msg) => console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`)
        };
        
        // Event-Listener für Tastatur
        this._setupKeyboardListeners();
        
        // Initialisierung
        this._init();
    }
    
    /**
     * Initialisiert das Spiel
     */
    _init() {
        this.logger.info('Spiel-Initialisierung gestartet');
        this._resetGame();
        this._draw();
        this.logger.info('Spiel-Initialisierung abgeschlossen');
    }
    
    /**
     * Setzt das Spiel zurück
     */
    _resetGame() {
        this.snake = [
            { x: Math.floor(this.gridWidth / 2), y: Math.floor(this.gridHeight / 2) },
            { x: Math.floor(this.gridWidth / 2) - 1, y: Math.floor(this.gridHeight / 2) },
            { x: Math.floor(this.gridWidth / 2) - 2, y: Math.floor(this.gridHeight / 2) }
        ];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.score = 0;
        this.isGameOver = false;
        this.isPaused = false;
        
        // Generiere Objekte
        this._generateFood();
        this._generateObstacles();
        this._generateEnemies();
        
        this.logger.info('Spiel zurückgesetzt');
    }
    
    /**
     * Generiert Nahrung an einer zufälligen Position
     */
    _generateFood() {
        let validPosition = false;
        let newFood;
        
        while (!validPosition) {
            newFood = {
                x: Math.floor(Math.random() * this.gridWidth),
                y: Math.floor(Math.random() * this.gridHeight)
            };
            
            validPosition = !this._isPositionOccupied(newFood.x, newFood.y);
        }
        
        this.food = newFood;
        this.logger.info(`Nahrung generiert bei (${newFood.x}, ${newFood.y})`);
    }
    
    /**
     * Generiert Hindernisse basierend auf der Schwierigkeit
     */
    _generateObstacles() {
        this.obstacles = [];
        const obstacleCount = this._getObstacleCount();
        
        for (let i = 0; i < obstacleCount; i++) {
            let validPosition = false;
            let obstacle;
            
            while (!validPosition) {
                obstacle = {
                    x: Math.floor(Math.random() * this.gridWidth),
                    y: Math.floor(Math.random() * this.gridHeight)
                };
                
                // Nicht auf der Schlange oder dem Essen
                validPosition = !this._isPositionOccupied(obstacle.x, obstacle.y) &&
                               !this._isNearStart(obstacle);
            }
            
            this.obstacles.push(obstacle);
        }
        
        this.logger.info(`${obstacleCount} Hindernisse generiert`);
    }
    
    /**
     * Generiert Gegner basierend auf der Schwierigkeit
     */
    _generateEnemies() {
        this.enemies = [];
        const enemyCount = this._getEnemyCount();
        
        for (let i = 0; i < enemyCount; i++) {
            let validPosition = false;
            let enemy;
            
            while (!validPosition) {
                enemy = {
                    x: Math.floor(Math.random() * this.gridWidth),
                    y: Math.floor(Math.random() * this.gridHeight),
                    direction: { x: Math.random() > 0.5 ? 1 : -1, y: 0 }
                };
                
                validPosition = !this._isPositionOccupied(enemy.x, enemy.y) &&
                               !this._isNearStart(enemy);
            }
            
            this.enemies.push(enemy);
        }
        
        this.logger.info(`${enemyCount} Gegner generiert`);
    }
    
    /**
     * Gibt die Anzahl der Hindernisse basierend auf der Schwierigkeit zurück
     */
    _getObstacleCount() {
        switch (this.difficulty) {
            case GAME_CONFIG.DIFFICULTY.EASY:
                return 3;
            case GAME_CONFIG.DIFFICULTY.MEDIUM:
                return 6;
            case GAME_CONFIG.DIFFICULTY.HARD:
                return 10;
            default:
                return 6;
        }
    }
    
    /**
     * Gibt die Anzahl der Gegner basierend auf der Schwierigkeit zurück
     */
    _getEnemyCount() {
        switch (this.difficulty) {
            case GAME_CONFIG.DIFFICULTY.EASY:
                return 1;
            case GAME_CONFIG.DIFFICULTY.MEDIUM:
                return 2;
            case GAME_CONFIG.DIFFICULTY.HARD:
                return 4;
            default:
                return 2;
        }
    }
    
    /**
     * Prüft, ob eine Position besetzt ist
     */
    _isPositionOccupied(x, y) {
        // Prüfe Schlangen-Körper
        for (const segment of this.snake) {
            if (segment.x === x && segment.y === y) return true;
        }
        
        // Prüfe Nahrung
        if (this.food && this.food.x === x && this.food.y === y) return true;
        
        // Prüfe Hindernisse
        for (const obs of this.obstacles) {
            if (obs.x === x && obs.y === y) return true;
        }
        
        // Prüfe Gegner
        for (const enemy of this.enemies) {
            if (enemy.x === x && enemy.y === y) return true;
        }
        
        return false;
    }
    
    /**
     * Prüft, ob eine Position nahe am Start ist
     */
    _isNearStart(pos) {
        const startX = Math.floor(this.gridWidth / 2);
        const startY = Math.floor(this.gridHeight / 2);
        return Math.abs(pos.x - startX) < 3 && Math.abs(pos.y - startY) < 3;
    }
    
    /**
     * Kollisionserkennung
     */
    _checkCollision(x, y) {
        // Wand-Kollision
        if (x < 0 || x >= this.gridWidth || y < 0 || y >= this.gridHeight) {
            this.logger.warn(`Wand-Kollision bei (${x}, ${y})`);
            return true;
        }
        
        // Selbst-Kollision
        for (let i = 0; i < this.snake.length; i++) {
            if (this.snake[i].x === x && this.snake[i].y === y) {
                this.logger.warn(`Selbst-Kollision bei (${x}, ${y})`);
                return true;
            }
        }
        
        // Hindernis-Kollision
        for (const obs of this.obstacles) {
            if (obs.x === x && obs.y === y) {
                this.logger.warn(`Hindernis-Kollision bei (${x}, ${y})`);
                return true;
            }
        }
        
        // Gegner-Kollision
        for (const enemy of this.enemies) {
            if (enemy.x === x && enemy.y === y) {
                this.logger.warn(`Gegner-Kollision bei (${x}, ${y})`);
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Aktualisiert die Position der Gegner
     */
    _updateEnemies() {
        for (const enemy of this.enemies) {
            // Zufällige Richtungsänderung
            if (Math.random() < 0.1) {
                const directions = [
                    { x: 1, y: 0 },
                    { x: -1, y: 0 },
                    { x: 0, y: 1 },
                    { x: 0, y: -1 }
                ];
                enemy.direction = directions[Math.floor(Math.random() * directions.length)];
            }
            
            // Neue Position berechnen
            let newX = enemy.x + enemy.direction.x;
            let newY = enemy.y + enemy.direction.y;
            
            // Bei Wand: Richtung umkehren
            if (newX < 0 || newX >= this.gridWidth) {
                enemy.direction.x *= -1;
                newX = enemy.x + enemy.direction.x;
            }
            if (newY < 0 || newY >= this.gridHeight) {
                enemy.direction.y *= -1;
                newY = enemy.y + enemy.direction.y;
            }
            
            // Prüfen, ob die neue Position nicht mit der Schlange kollidiert
            if (!this._checkCollision(newX, newY)) {
                enemy.x = newX;
                enemy.y = newY;
            }
        }
    }
    
    /**
     * Startet das Spiel
     */
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.isPaused = false;
            this.isGameOver = false;
            this._gameLoop();
            this.logger.info('Spiel gestartet');
        }
    }
    
    /**
     * Stoppt das Spiel
     */
    stop() {
        this.isRunning = false;
        if (this.gameLoop) {
            clearTimeout(this.gameLoop);
            this.gameLoop = null;
        }
        this.logger.info('Spiel gestoppt');
    }
    
    /**
     * Pausiert oder setzt das Spiel fort
     */
    toggle_pause() {
        if (this.isGameOver) {
            this.logger.warn('Spiel ist beendet, kann nicht pausiert werden');
            return;
        }
        
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.logger.info('Spiel pausiert');
        } else {
            this.logger.info('Spiel fortgesetzt');
            this._gameLoop();
        }
    }
    
    /**
     * Setzt die Schwierigkeitsstufe
     * @param {string} level - 'easy', 'medium' oder 'hard'
     */
    set_difficulty(level) {
        const levelMap = {
            'easy': GAME_CONFIG.DIFFICULTY.EASY,
            'medium': GAME_CONFIG.DIFFICULTY.MEDIUM,
            'hard': GAME_CONFIG.DIFFICULTY.HARD
        };
        
        if (levelMap[level]) {
            this.difficulty = levelMap[level];
            this.gameSpeed = this.difficulty.speed;
            this.logger.info(`Schwierigkeit gesetzt auf: ${this.difficulty.name}`);
            
            // Wenn das Spiel läuft, neu starten
            if (this.isRunning) {
                this._resetGame();
                this._draw();
            }
        } else {
            this.logger.error(`Ungültige Schwierigkeitsstufe: ${level}`);
        }
    }
    
    /**
     * Startet das Spiel neu
     */
    restart() {
        this.stop();
        this._resetGame();
        this._draw();
        this.start();
        this.logger.info('Spiel neu gestartet');
    }
    
    /**
     * Haupt-Spielschleife
     */
    _gameLoop() {
        if (!this.isRunning || this.isPaused || this.isGameOver) {
            return;
        }
        
        this._update();
        this._draw();
        
        this.gameLoop = setTimeout(() => this._gameLoop(), this.gameSpeed);
    }
    
    /**
     * Aktualisiert den Spielzustand
     */
    _update() {
        // Richtung aktualisieren
        this.direction = { ...this.nextDirection };
        
        // Neue Kopfposition berechnen
        const head = this.snake[0];
        const newHead = {
            x: head.x + this.direction.x,
            y: head.y + this.direction.y
        };
        
        // Kollisionserkennung
        if (this._checkCollision(newHead.x, newHead.y)) {
            this._handleGameOver();
            return;
        }
        
        // Schlange bewegen
        this.snake.unshift(newHead);
        
        // Nahrung essen
        if (newHead.x === this.food.x && newHead.y === this.food.y) {
            this._handleEatFood();
        } else {
            this.snake.pop();
        }
        
        // Gegner aktualisieren
        this._updateEnemies();
        
        // Gegner-Kollision nach Bewegung prüfen
        for (const enemy of this.enemies) {
            if (newHead.x === enemy.x && newHead.y === enemy.y) {
                this._handleGameOver();
                return;
            }
        }
    }
    
    /**
     * Behandelt das Essen von Nahrung
     */
    _handleEatFood() {
        this.score += 10;
        this.logger.info(`Nahrung gegessen! Punktzahl: ${this.score}`);
        this._generateFood();
        
        // Gelegentlich neue Gegner hinzufügen
        if (this.score % 50 === 0 && this.enemies.length < this._getEnemyCount() + 2) {
            this._generateEnemies();
        }
    }
    
    /**
     * Behandelt Game Over
     */
    _handleGameOver() {
        this.isGameOver = true;
        this.isRunning = false;
        this.logger.info(`Spiel beendet! Endpunktzahl: ${this.score}`);
        this._draw();
    }
    
    /**
     * Zeichnet das Spiel
     */
    _draw() {
        // Hintergrund
        this.ctx.fillStyle = GAME_CONFIG.COLORS.BACKGROUND;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Gitter zeichnen
        this._drawGrid();
        
        // Hindernisse zeichnen
        this._drawObstacles();
        
        // Nahrung zeichnen
        this._drawFood();
        
        // Gegner zeichnen
        this._drawEnemies();
        
        // Schlange zeichnen
        this._drawSnake();
        
        // UI-Elemente
        this._drawScore();
        
        // Game Over Overlay
        if (this.isGameOver) {
            this._drawGameOver();
        }
        
        // Pause Overlay
        if (this.isPaused && !this.isGameOver) {
            this._drawPaused();
        }
    }
    
    /**
     * Zeichnet das Gitter
     */
    _drawGrid() {
        this.ctx.strokeStyle = GAME_CONFIG.COLORS.GRID;
        this.ctx.lineWidth = 0.5;
        
        for (let x = 0; x <= this.gridWidth; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.cellSize, 0);
            this.ctx.lineTo(x * this.cellSize, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.gridHeight; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.cellSize);
            this.ctx.lineTo(this.canvas.width, y * this.cellSize);
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
            
            this.ctx.fillStyle = isHead ? 
                GAME_CONFIG.COLORS.SNAKE_HEAD : 
                GAME_CONFIG.COLORS.SNAKE_BODY;
            
            this.ctx.fillRect(
                segment.x * this.cellSize + 1,
                segment.y * this.cellSize + 1,
                this.cellSize - 2,
                this.cellSize - 2
            );
            
            // Augen für den Kopf
            if (isHead) {
                this._drawSnakeEyes(segment);
            }
        }
    }
    
    /**
     * Zeichnet die Augen der Schlange
     */
    _drawSnakeEyes(head) {
        this.ctx.fillStyle = '#ffffff';
        const eyeSize = this.cellSize / 5;
        const offset = this.cellSize / 4;
        
        // Linkes Auge
        this.ctx.beginPath();
        this.ctx.arc(
            head.x * this.cellSize + offset,
            head.y * this.cellSize + offset,
            eyeSize,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        
        // Rechtes Auge
        this.ctx.beginPath();
        this.ctx.arc(
            head.x * this.cellSize + this.cellSize - offset,
            head.y * this.cellSize + offset,
            eyeSize,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
    }
    
    /**
     * Zeichnet die Nahrung
     */
    _drawFood() {
        if (!this.food) return;
        
        this.ctx.fillStyle = GAME_CONFIG.COLORS.FOOD;
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.cellSize + this.cellSize / 2,
            this.food.y * this.cellSize + this.cellSize / 2,
            this.cellSize / 2 - 2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
    }
    
    /**
     * Zeichnet die Hindernisse
     */
    _drawObstacles() {
        this.ctx.fillStyle = GAME_CONFIG.COLORS.OBSTACLE;
        
        for (const obs of this.obstacles) {
            this.ctx.fillRect(
                obs.x * this.cellSize + 1,
                obs.y * this.cellSize + 1,
                this.cellSize - 2,
                this.cellSize - 2
            );
        }
    }
    
    /**
     * Zeichnet die Gegner
     */
    _drawEnemies() {
        for (const enemy of this.enemies) {
            this.ctx.fillStyle = GAME_CONFIG.COLORS.ENEMY;
            
            // Dreieck für Gegner
            this.ctx.beginPath();
            this.ctx.moveTo(
                enemy.x * this.cellSize + this.cellSize / 2,
                enemy.y * this.cellSize + 2
            );
            this.ctx.lineTo(
                enemy.x * this.cellSize + 2,
                enemy.y * this.cellSize + this.cellSize - 2
            );
            this.ctx.lineTo(
                enemy.x * this.cellSize + this.cellSize - 2,
                enemy.y * this.cellSize + this.cellSize - 2
            );
            this.ctx.closePath();
            this.ctx.fill();
        }
    }
    
    /**
     * Zeichnet die Punktzahl
     */
    _drawScore() {
        this.ctx.fillStyle = GAME_CONFIG.COLORS.TEXT;
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`Punkte: ${this.score}`, 10, 25);
        this.ctx.fillText(`Schwierigkeit: ${this.difficulty.name}`, 10, 45);
    }
    
    /**
     * Zeichnet den Game Over Screen
     */
    _drawGameOver() {
        // Halbtransparenter Hintergrund
        this.ctx.fillStyle = GAME_CONFIG.COLORS.UI_BACKGROUND;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Game Over Text
        this.ctx.fillStyle = GAME_CONFIG.COLORS.TEXT;
        this.ctx.font = 'bold 32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('SPIEL VORBEI', this.canvas.width / 2, this.canvas.height / 2 - 30);
        
        // Punktzahl
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Endpunktzahl: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 10);
        
        // Neustart-Anweisung
        this.ctx.font = '16px Arial';
        this.ctx.fillText('Drücke R für Neustart', this.canvas.width / 2, this.canvas.height / 2 + 50);
        
        // Textausrichtung zurücksetzen
        this.ctx.textAlign = 'left';
    }
    
    /**
     * Zeichnet den Pause Screen
     */
    _drawPaused() {
        // Halbtransparenter Hintergrund
        this.ctx.fillStyle = GAME_CONFIG.COLORS.UI_BACKGROUND;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Pause Text
        this.ctx.fillStyle = GAME_CONFIG.COLORS.TEXT;
        this.ctx.font = 'bold 32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSIERT', this.canvas.width / 2, this.canvas.height / 2);
        
        // Fortsetzungs-Anweisung
        this.ctx.font = '16px Arial';
        this.ctx.fillText('Drücke P zum Fortsetzen', this.canvas.width / 2, this.canvas.height / 2 + 40);
        
        // Textausrichtung zurücksetzen
        this.ctx.textAlign = 'left';
    }
    
    /**
     * Richtungsänderung basierend auf Tastatureingabe
     */
    _handleKeyboard(event) {
        // Verhindern, dass die Pfeiltasten das Fenster scrollen
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
            event.preventDefault();
        }
        
        switch (event.key) {
            case 'ArrowUp':
                if (this.direction.y !== 1) {
                    this.nextDirection = { x: 0, y: -1 };
                }
                break;
            case 'ArrowDown':
                if (this.direction.y !== -1) {
                    this.nextDirection = { x: 0, y: 1 };
                }
                break;
            case 'ArrowLeft':
                if (this.direction.x !== 1) {
                    this.nextDirection = { x: -1, y: 0 };
                }
                break;
            case 'ArrowRight':
                if (this.direction.x !== -1) {
                    this.nextDirection = { x: 1, y: 0 };
                }
                break;
            case 'p':
            case 'P':
                this.toggle_pause();
                break;
            case 'r':
            case 'R':
                this.restart();
                break;
            case ' ':
                // Leertaste startet das Spiel
                if (!this.isRunning && !this.isGameOver) {
                    this.start();
                } else if (this.isGameOver) {
                    this.restart();
                }
                break;
        }
    }
    
    /**
     * Richtet die Tastatur-Event-Listener ein
     */
    _setupKeyboardListeners() {
        document.addEventListener('keydown', (event) => this._handleKeyboard(event));
    }
    
    /**
     * Gibt den aktuellen Spielstand zurück
     */
    getGameState() {
        return {
            score: this.score,
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            isGameOver: this.isGameOver,
            difficulty: this.difficulty.name,
            snakeLength: this.snake.length,
            enemyCount: this.enemies.length,
            obstacleCount: this.obstacles.length
        };
    }
}

// ==================== INITIALISIERUNG ====================
// Wenn das DOM geladen ist, Spiel initialisieren
document.addEventListener('DOMContentLoaded', () => {
    const game = new GameLogic('gameCanvas');
    
    // Buttons für UI-Interaktion
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
    
    // Globales Spiel-Objekt für Debugging
    window.game = game;
});

/**
 * Unit-Tests für die Spiel-Logik
 */
class GameLogicTests {
    static runTests() {
        console.log('Starte Unit-Tests...');
        
        // Test 1: Kollisionserkennung
        this.testCollisionDetection();
        
        // Test 2: Schwierigkeitsstufen
        this.testDifficultyLevels();
        
        // Test 3: Position Belegung
        this.testPositionOccupied();
        
        console.log('Alle Tests abgeschlossen!');
    }
    
    static testCollisionDetection() {
        console.log('Teste Kollisionserkennung...');
        
        const game = new GameLogic('testCanvas');
        game.gridWidth = 10;
        game.gridHeight = 10;
        game.snake = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }];
        
        // Test Wand-Kollision
        console.assert(game._checkCollision(-1, 5) === true, 'Wand-Kollision links fehlgeschlagen');
        console.assert(game._checkCollision(10, 5) === true, 'Wand-Kollision rechts fehlgeschlagen');
        console.assert(game._checkCollision(5, -1) === true, 'Wand-Kollision oben fehlgeschlagen');
        console.assert(game._checkCollision(5, 10) === true, 'Wand-Kollision unten fehlgeschlagen');
        
        // Test Selbst-Kollision
        console.assert(game._checkCollision(4, 5) === true, 'Selbst-Kollision fehlgeschlagen');
        
        // Test keine Kollision
        console.assert(game._checkCollision(6, 5) === false, 'Keine Kollision fehlgeschlagen');
        
        console.log('Kollisionserkennung: OK');
    }
    
    static testDifficultyLevels() {
        console.log('Teste Schwierigkeitsstufen...');
        
        const game = new GameLogic('testCanvas');
        
        game.set_difficulty('easy');
        console.assert(game.difficulty === GAME_CONFIG.DIFFICULTY.EASY, 'Einfach fehlgeschlagen');
        
        game.set_difficulty('medium');
        console.assert(game.difficulty === GAME_CONFIG.DIFFICULTY.MEDIUM, 'Mittel fehlgeschlagen');
        
        game.set_difficulty('hard');
        console.assert(game.difficulty === GAME_CONFIG.DIFFICULTY.HARD, 'Schwer fehlgeschlagen');
        
        console.log('Schwierigkeitsstufen: OK');
    }
    
    static testPositionOccupied() {
        console.log('Teste Positionsbelegung...');
        
        const game = new GameLogic('testCanvas');
        game.snake = [{ x: 5, y: 5 }];
        game.food = { x: 3, y: 3 };
        game.obstacles = [{ x: 2, y: 2 }];
        
        console.assert(game._isPositionOccupied(5, 5) === true, 'Schlange fehlgeschlagen');
        console.assert(game._isPositionOccupied(3, 3) === true, 'Nahrung fehlgeschlagen');
        console.assert(game._isPositionOccupied(2, 2) === true, 'Hindernis fehlgeschlagen');
        console.assert(game._isPositionOccupied(1, 1) === false, 'Leere Position fehlgeschlagen');
        
        console.log('Positionsbelegung: OK');
    }
}

// Tests ausführen (nur im Entwicklungsmodus)
if (window.location.search.includes('test=true')) {
    GameLogicTests.runTests();
}