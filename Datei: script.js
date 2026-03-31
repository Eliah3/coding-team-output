/**
 * Spiel-Logik für das Desktop-Spiel
 * Enthält: Kollisionserkennung, Scoring, Neustart, Gegner/Hindernisse, Pause, Schwierigkeit
 */

// ==================== KONSTANTEN ====================
const GAME_CONSTANTS = {
    // Spielfeldgröße
    GRID_WIDTH: 800,
    GRID_HEIGHT: 600,
    CELL_SIZE: 40,
    
    // Schwierigkeitsstufen
    DIFFICULTY: {
        EASY: 'easy',
        MEDIUM: 'medium',
        HARD: 'hard'
    },
    
    // Geschwindigkeit basierend auf Schwierigkeit
    SPEED: {
        easy: 3,
        medium: 5,
        hard: 7
    },
    
    // Spawn-Intervalle (in Millisekunden)
    SPAWN_INTERVAL: {
        easy: 3000,
        medium: 2000,
        hard: 1000
    },
    
    // Farben
    COLORS: {
        PLAYER: '#00FF00',
        ENEMY: '#FF0000',
        OBSTACLE: '#FFA500',
        BACKGROUND: '#000000',
        TEXT: '#FFFFFF',
        UI_BACKGROUND: 'rgba(0, 0, 0, 0.8)'
    },
    
    // Spielergröße
    PLAYER_SIZE: 30,
    ENEMY_SIZE: 25,
    OBSTACLE_SIZE: 35
};

// ==================== HAUPTKLASSE ====================
class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Spielfeld
        this.width = GAME_CONSTANTS.GRID_WIDTH;
        this.height = GAME_CONSTANTS.GRID_HEIGHT;
        
        // Spielstatus
        this.isRunning = false;
        this.isPaused = false;
        this.isGameOver = false;
        this.score = 0;
        this.difficulty = GAME_CONSTANTS.DIFFICULTY.MEDIUM;
        
        // Spielobjekte
        this.player = null;
        this.enemies = [];
        this.obstacles = [];
        
        // Timer für Spawning
        this.spawnTimer = null;
        this.gameLoopId = null;
        
        // Initialisierung
        this._init();
    }
    
    /**
     * Initialisiert das Spiel
     */
    _init() {
        this._setupCanvas();
        this._createPlayer();
        this._setupEventListeners();
        this._drawInitialScreen();
    }
    
    /**
     * Richtet den Canvas ein
     */
    _setupCanvas() {
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }
    
    /**
     * Erstellt den Spieler
     */
    _createPlayer() {
        this.player = {
            x: this.width / 2,
            y: this.height / 2,
            size: GAME_CONSTANTS.PLAYER_SIZE,
            speed: GAME_CONSTANTS.SPEED[this.difficulty],
            dx: 0,
            dy: 0
        };
    }
    
    /**
     * Richtet Event-Listener ein
     */
    _setupEventListeners() {
        // Tastatursteuerung
        document.addEventListener('keydown', (e) => this._handleKeyDown(e));
        document.addEventListener('keyup', (e) => this._handleKeyUp(e));
    }
    
    /**
     * Behandelt Tastendruck
     */
    _handleKeyDown(e) {
        if (this.isGameOver) {
            if (e.key === 'Enter' || e.key === ' ') {
                this.restart();
            }
            return;
        }
        
        if (e.key === 'p' || e.key === 'P') {
            this.togglePause();
            return;
        }
        
        if (this.isPaused) return;
        
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                this.player.dy = -this.player.speed;
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                this.player.dy = this.player.speed;
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                this.player.dx = -this.player.speed;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                this.player.dx = this.player.speed;
                break;
        }
    }
    
    /**
     * Behandelt Tastenloslassung
     */
    _handleKeyUp(e) {
        if (this.isPaused || this.isGameOver) return;
        
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
            case 'ArrowDown':
            case 's':
            case 'S':
                this.player.dy = 0;
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
            case 'ArrowRight':
            case 'd':
            case 'D':
                this.player.dx = 0;
                break;
        }
    }
    
    /**
     * Zeichnet den anfänglichen Bildschirm
     */
    _drawInitialScreen() {
        this._clearCanvas();
        this.ctx.fillStyle = GAME_CONSTANTS.COLORS.TEXT;
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Drücke ENTER um zu starten', this.width / 2, this.height / 2);
        this.ctx.font = '20px Arial';
        this.ctx.fillText('P: Pause | WASD/ Pfeiltasten: Bewegung', this.width / 2, this.height / 2 + 40);
    }
    
    /**
     * Startet das Spiel
     */
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.isPaused = false;
        this.isGameOver = false;
        this.score = 0;
        
        this._createPlayer();
        this.enemies = [];
        this.obstacles = [];
        
        this._startSpawning();
        this._gameLoop();
    }
    
    /**
     * Startet das Spawnen von Gegnern und Hindernissen
     */
    _startSpawning() {
        if (this.spawnTimer) {
            clearInterval(this.spawnTimer);
        }
        
        const interval = GAME_CONSTANTS.SPAWN_INTERVAL[this.difficulty];
        
        this.spawnTimer = setInterval(() => {
            if (!this.isPaused && !this.isGameOver) {
                this._spawnEnemy();
                // Auch Hindernisse spawnen (seltener)
                if (Math.random() < 0.3) {
                    this._spawnObstacle();
                }
            }
        }, interval);
    }
    
    /**
     * Erstellt einen neuen Gegner
     */
    _spawnEnemy() {
        const side = Math.floor(Math.random() * 4);
        let x, y;
        
        switch(side) {
            case 0: // Oben
                x = Math.random() * this.width;
                y = -GAME_CONSTANTS.ENEMY_SIZE;
                break;
            case 1: // Rechts
                x = this.width + GAME_CONSTANTS.ENEMY_SIZE;
                y = Math.random() * this.height;
                break;
            case 2: // Unten
                x = Math.random() * this.width;
                y = this.height + GAME_CONSTANTS.ENEMY_SIZE;
                break;
            case 3: // Links
                x = -GAME_CONSTANTS.ENEMY_SIZE;
                y = Math.random() * this.height;
                break;
        }
        
        // Richtung zum Spieler berechnen
        const angle = Math.atan2(this.player.y - y, this.player.x - x);
        const speed = GAME_CONSTANTS.SPEED[this.difficulty] * 0.7;
        
        this.enemies.push({
            x: x,
            y: y,
            size: GAME_CONSTANTS.ENEMY_SIZE,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed
        });
    }
    
    /**
     * Erstellt ein neues Hindernis
     */
    _spawnObstacle() {
        const x = Math.random() * (this.width - GAME_CONSTANTS.OBSTACLE_SIZE * 2) + GAME_CONSTANTS.OBSTACLE_SIZE;
        const y = Math.random() * (this.height - GAME_CONSTANTS.OBSTACLE_SIZE * 2) + GAME_CONSTANTS.OBSTACLE_SIZE;
        
        // Nicht zu nah am Spieler spawnen
        const distToPlayer = Math.hypot(x - this.player.x, y - this.player.y);
        if (distToPlayer < 100) return;
        
        this.obstacles.push({
            x: x,
            y: y,
            size: GAME_CONSTANTS.OBSTACLE_SIZE
        });
    }
    
    /**
     * Haupt-Spielschleife
     */
    _gameLoop() {
        if (!this.isRunning) return;
        
        if (!this.isPaused && !this.isGameOver) {
            this._update();
            this._draw();
        }
        
        this.gameLoopId = requestAnimationFrame(() => this._gameLoop());
    }
    
    /**
     * Aktualisiert den Spielzustand
     */
    _update() {
        this._updatePlayer();
        this._updateEnemies();
        this._checkCollisions();
        this._updateScore();
    }
    
    /**
     * Aktualisiert die Spielerposition
     */
    _updatePlayer() {
        this.player.x += this.player.dx;
        this.player.y += this.player.dy;
        
        // Spielfeldgrenzen
        this.player.x = Math.max(this.player.size / 2, 
            Math.min(this.width - this.player.size / 2, this.player.x));
        this.player.y = Math.max(this.player.size / 2, 
            Math.min(this.height - this.player.size / 2, this.player.y));
    }
    
    /**
     * Aktualisiert die Gegnerpositionen
     */
    _updateEnemies() {
        this.enemies.forEach(enemy => {
            enemy.x += enemy.dx;
            enemy.y += enemy.dy;
            
            // Gegner zum Spieler bewegen (Tracking)
            const angle = Math.atan2(this.player.y - enemy.y, this.player.x - enemy.x);
            const trackingSpeed = GAME_CONSTANTS.SPEED[this.difficulty] * 0.3;
            enemy.dx += Math.cos(angle) * trackingSpeed * 0.1;
            enemy.dy += Math.sin(angle) * trackingSpeed * 0.1;
            
            // Geschwindigkeit begrenzen
            const maxSpeed = GAME_CONSTANTS.SPEED[this.difficulty];
            const speed = Math.hypot(enemy.dx, enemy.dy);
            if (speed > maxSpeed) {
                enemy.dx = (enemy.dx / speed) * maxSpeed;
                enemy.dy = (enemy.dy / speed) * maxSpeed;
            }
        });
        
        // Entferne Gegner außerhalb des Bildschirms
        this.enemies = this.enemies.filter(enemy => {
            return enemy.x > -50 && enemy.x < this.width + 50 &&
                   enemy.y > -50 && enemy.y < this.height + 50;
        });
    }
    
    /**
     * Prüft Kollisionen zwischen Objekten
     */
    _checkCollisions() {
        // Kollision mit Gegnern
        for (const enemy of this.enemies) {
            if (this._checkCircleCollision(this.player, enemy)) {
                this._gameOver();
                return;
            }
        }
        
        // Kollision mit Hindernissen
        for (const obstacle of this.obstacles) {
            if (this._checkCircleCollision(this.player, obstacle)) {
                this._handleObstacleCollision(obstacle);
            }
        }
    }
    
    /**
     * Prüft Kollision zwischen zwei kreisförmigen Objekten
     */
    _checkCircleCollision(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        const distance = Math.hypot(dx, dy);
        return distance < (obj1.size / 2 + obj2.size / 2);
    }
    
    /**
     * Behandelt Kollision mit Hindernis
     */
    _handleObstacleCollision(obstacle) {
        // Spieler wird zurückgeschoben
        const dx = this.player.x - obstacle.x;
        const dy = this.player.y - obstacle.y;
        const distance = Math.hypot(dx, dy);
        
        if (distance > 0) {
            const pushDistance = 10;
            this.player.x += (dx / distance) * pushDistance;
            this.player.y += (dy / distance) * pushDistance;
        }
        
        // Kleine Strafe für Kollision mit Hindernis
        this.score = Math.max(0, this.score - 5);
    }
    
    /**
     * Aktualisiert den Score
     */
    _updateScore() {
        // Score basierend auf Zeit erhöhen
        this.score += 1;
    }
    
    /**
     * Zeichnet das Spiel
     */
    _draw() {
        this._clearCanvas();
        this._drawObstacles();
        this._drawEnemies();
        this._drawPlayer();
        this._drawUI();
    }
    
    /**
     * Löscht den Canvas
     */
    _clearCanvas() {
        this.ctx.fillStyle = GAME_CONSTANTS.COLORS.BACKGROUND;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    /**
     * Zeichnet den Spieler
     */
    _drawPlayer() {
        this.ctx.beginPath();
        this.ctx.arc(this.player.x, this.player.y, this.player.size / 2, 0, Math.PI * 2);
        this.ctx.fillStyle = GAME_CONSTANTS.COLORS.PLAYER;
        this.ctx.fill();
        this.ctx.closePath();
        
        // Spieler-Outline
        this.ctx.beginPath();
        this.ctx.arc(this.player.x, this.player.y, this.player.size / 2 + 2, 0, Math.PI * 2);
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.closePath();
    }
    
    /**
     * Zeichnet die Gegner
     */
    _drawEnemies() {
        this.enemies.forEach(enemy => {
            this.ctx.beginPath();
            this.ctx.arc(enemy.x, enemy.y, enemy.size / 2, 0, Math.PI * 2);
            this.ctx.fillStyle = GAME_CONSTANTS.COLORS.ENEMY;
            this.ctx.fill();
            this.ctx.closePath();
            
            // Gefährlicher Schein
            this.ctx.beginPath();
            this.ctx.arc(enemy.x, enemy.y, enemy.size / 2 + 5, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            this.ctx.closePath();
        });
    }
    
    /**
     * Zeichnet die Hindernisse
     */
    _drawObstacles() {
        this.obstacles.forEach(obstacle => {
            this.ctx.beginPath();
            this.ctx.rect(
                obstacle.x - obstacle.size / 2,
                obstacle.y - obstacle.size / 2,
                obstacle.size,
                obstacle.size
            );
            this.ctx.fillStyle = GAME_CONSTANTS.COLORS.OBSTACLE;
            this.ctx.fill();
            this.ctx.closePath();
            
            // Hindernis-Outline
            this.ctx.beginPath();
            this.ctx.rect(
                obstacle.x - obstacle.size / 2,
                obstacle.y - obstacle.size / 2,
                obstacle.size,
                obstacle.size
            );
            this.ctx.strokeStyle = '#FFFFFF';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            this.ctx.closePath();
        });
    }
    
    /**
     * Zeichnet die Benutzeroberfläche
     */
    _drawUI() {
        // Score
        this.ctx.fillStyle = GAME_CONSTANTS.COLORS.TEXT;
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Score: ${this.score}`, 20, 40);
        
        // Schwierigkeit
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`Schwierigkeit: ${this.difficulty.toUpperCase()}`, this.width - 20, 40);
        
        // Pausen-Anzeige
        if (this.isPaused) {
            this._drawPauseScreen();
        }
    }
    
    /**
     * Zeichnet den Pausen-Bildschirm
     */
    _drawPauseScreen() {
        this.ctx.fillStyle = GAME_CONSTANTS.COLORS.UI_BACKGROUND;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.fillStyle = GAME_CONSTANTS.COLORS.TEXT;
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSIERT', this.width / 2, this.height / 2);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Drücke P zum Fortsetzen', this.width / 2, this.height / 2 + 50);
    }
    
    /**
     * Beendet das Spiel
     */
    _gameOver() {
        this.isGameOver = true;
        this.isRunning = false;
        
        if (this.spawnTimer) {
            clearInterval(this.spawnTimer);
        }
        
        if (this.gameLoopId) {
            cancelAnimationFrame(this.gameLoopId);
        }
        
        this._drawGameOver();
    }
    
    /**
     * Zeichnet den Game-Over-Bildschirm
     */
    _drawGameOver() {
        this._clearCanvas();
        
        // Dunkler Hintergrund
        this.ctx.fillStyle = GAME_CONSTANTS.COLORS.UI_BACKGROUND;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Game Over Text
        this.ctx.fillStyle = '#FF0000';
        this.ctx.font = 'bold 64px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('SPIEL VORBEI', this.width / 2, this.height / 2 - 50);
        
        // Score
        this.ctx.fillStyle = GAME_CONSTANTS.COLORS.TEXT;
        this.ctx.font = 'bold 36px Arial';
        this.ctx.fillText(`Endpunktzahl: ${this.score}`, this.width / 2, this.height / 2 + 20);
        
        // Neustart-Hinweis
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Drücke ENTER oder LEERTASTE für Neustart', this.width / 2, this.height / 2 + 80);
    }
    
    /**
     * Schaltet Pause ein/aus
     */
    togglePause() {
        if (this.isGameOver) return;
        
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            // Pausiere Spawn-Timer
            if (this.spawnTimer) {
                clearInterval(this.spawnTimer);
                this.spawnTimer = null;
            }
        } {
            // Setze Spawn-Timer fort
            this._startSpawning();
        }
    }
    
    /**
     * Setzt die Schwierigkeitsstufe
     * @param {string} level - 'easy', 'medium' oder 'hard'
     */
    setDifficulty(level) {
        const validLevels = Object.values(GAME_CONSTANTS.DIFFICULTY);
        
        if (!validLevels.includes(level)) {
            console.error(`Ungültige Schwierigkeitsstufe: ${level}`);
            return;
        }
        
        this.difficulty = level;
        
        // Spieler-Geschwindigkeit aktualisieren
        if (this.player) {
            this.player.speed = GAME_CONSTANTS.SPEED[level];
        }
        
        // Spawn-Intervall aktualisieren wenn das Spiel läuft
        if (this.isRunning && !this.isPaused) {
            this._startSpawning();
        }
    }
    
    /**
     * Startet das Spiel neu
     */
    restart() {
        // Altes Spiel stoppen
        if (this.gameLoopId) {
            cancelAnimationFrame(this.gameLoopId);
        }
        if (this.spawnTimer) {
            clearInterval(this.spawnTimer);
        }
        
        // Neues Spiel starten
        this.start();
    }
    
    /**
     * Stoppt das Spiel
     */
    stop() {
        this.isRunning = false;
        this.isPaused = false;
        this.isGameOver = false;
        
        if (this.gameLoopId) {
            cancelAnimationFrame(this.gameLoopId);
        }
        if (this.spawnTimer) {
            clearInterval(this.spawnTimer);
        }
    }
}

// ==================== INITIALISIERUNG ====================
// Globale Spielinstanz
let game = null;

// Initialisierung wenn DOM geladen ist
document.addEventListener('DOMContentLoaded', () => {
    // Überprüfe ob Canvas existiert
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
        game = new Game('gameCanvas');
    } else {
        console.error('Canvas-Element nicht gefunden!');
    }
});

// Export für globale Nutzung
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Game, GAME_CONSTANTS };
}