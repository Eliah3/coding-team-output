/**
 * Bird Jump Game - Ein einfaches Spiel, bei dem ein Vogel springt
 * 
 * Steuerung: Leertaste (Space) zum Springen
 */

// Farbkonstanten - ausgelagert für bessere Übersichtlichkeit
const COLORS = {
    BACKGROUND: '#87CEEB',  // Himmelblau
    BIRD: '#FFD700',        // Gold
    BIRD_BORDER: '#DAA520', // Dunkles Gold
    GROUND: '#8B4513',      // Braun
    TEXT: '#FFFFFF'         // Weiß
};

// Spielkonstanten
const GAME_CONFIG = {
    GRAVITY: 0.5,
    JUMP_STRENGTH: -10,
    BIRD_SIZE: 30,
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 500,
    GROUND_HEIGHT: 50
};

/**
 * Bird - Klasse für den Vogel
 * Verwaltet Position, Geschwindigkeit und Sprung-Logik
 */
class Bird {
    /**
     * Erstellt einen neuen Vogel
     * @param {number} x - X-Position
     * @param {number} y - Y-Position
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.velocity = 0;
        this.size = GAME_CONFIG.BIRD_SIZE;
        this.isJumping = false;
    }

    /**
     * Lässt den Vogel springen
     * Wird aufgerufen, wenn die Leertaste gedrückt wird
     */
    jump() {
        this.velocity = GAME_CONFIG.JUMP_STRENGTH;
        this.isJumping = true;
        
        // Reset nach kurzer Zeit
        setTimeout(() => {
            this.isJumping = false;
        }, 200);
    }

    /**
     * Aktualisiert die Vogelposition basierend auf Physik
     */
    update() {
        // Schwerkraft anwenden
        this.velocity += GAME_CONFIG.GRAVITY;
        this.y += this.velocity;

        // Boden-Kollision verhindern
        const groundY = GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.GROUND_HEIGHT - this.size;
        if (this.y > groundY) {
            this.y = groundY;
            this.velocity = 0;
        }

        // Decke-Kollision verhindern
        if (this.y < 0) {
            this.y = 0;
            this.velocity = 0;
        }
    }

    /**
     * Zeichnet den Vogel auf den Canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas Context
     */
    draw(ctx) {
        ctx.save();
        
        // Vogelkörper
        ctx.fillStyle = COLORS.BIRD;
        ctx.strokeStyle = COLORS.BIRD_BORDER;
        ctx.lineWidth = 2;
        
        // Kreis für Vogel zeichnen
        ctx.beginPath();
        ctx.arc(this.x + this.size / 2, this.y + this.size / 2, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Auge
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(this.x + this.size / 2 + 5, this.y + this.size / 2 - 5, 6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(this.x + this.size / 2 + 7, this.y + this.size / 2 - 5, 3, 0, Math.PI * 2);
        ctx.fill();

        // Schnabel
        ctx.fillStyle = '#FF6600';
        ctx.beginPath();
        ctx.moveTo(this.x + this.size / 2 + 10, this.y + this.size / 2);
        ctx.lineTo(this.x + this.size / 2 + 20, this.y + this.size / 2 + 5);
        ctx.lineTo(this.x + this.size / 2 + 10, this.y + this.size / 2 + 10);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    /**
     * Gibt die Hitbox des Vogels zurück
     * @returns {Object} Hitbox mit x, y, width, height
     */
    getHitbox() {
        return {
            x: this.x,
            y: this.y,
            width: this.size,
            height: this.size
        };
    }
}

/**
 * GameWindow - Hauptklasse für das Spiel
 * Verwaltet den Canvas, die Spielschleife und die Benutzerinteraktion
 */
class GameWindow {
    /**
     * Erstellt ein neues Spiel
     */
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.bird = null;
        this.isRunning = false;
        this.animationId = null;
        this.score = 0;
        
        // Tastatur-Event-Handler Map für Erweiterbarkeit
        this.keyHandlers = {
            'Space': () => this.handleJump(),
            ' ': () => this.handleJump()  // Alternative für Leertaste
        };
        
        this.init();
    }

    /**
     * Initialisiert das Spiel
     */
    init() {
        // Canvas erstellen
        this.canvas = document.createElement('canvas');
        this.canvas.width = GAME_CONFIG.CANVAS_WIDTH;
        this.canvas.height = GAME_CONFIG.CANVAS_HEIGHT;
        this.canvas.style.border = '2px solid #333';
        this.canvas.style.display = 'block';
        this.canvas.style.margin = '0 auto';
        
        // Canvas zum Dokument hinzufügen
        document.body.appendChild(this.canvas);
        
        // Context abrufen
        this.ctx = this.canvas.getContext('2d');
        
        // Vogel initialisieren
        this.bird = new Bird(100, GAME_CONFIG.CANVAS_HEIGHT / 2);
        
        // Event Listener für Tastatur hinzufügen
        this.setupKeyboardListeners();
        
        // Spiel starten
        this.start();
    }

    /**
     * Richtet Tastatur-Event-Listener ein
     * Verwendet eine Key-Map für bessere Erweiterbarkeit
     */
    setupKeyboardListeners() {
        document.addEventListener('keydown', (event) => {
            // Leertaste oder alternatives Leerzeichen
            if (event.code === 'Space' || event.key === ' ') {
                event.preventDefault();  // Verhindert Scrollen bei Leertaste
                this.handleKeyPress(event.code);
            }
        });
    }

    /**
     * Verarbeitet Tastendruck basierend auf Key-Map
     * @param {string} keyCode - Der Code der gedrückten Taste
     */
    handleKeyPress(keyCode) {
        const handler = this.keyHandlers[keyCode];
        if (handler) {
            handler();
        }
    }

    /**
     * Behandelt den Sprung des Vogels
     * Wird aufgerufen, wenn die Leertaste gedrückt wird
     */
    handleJump() {
        if (this.bird) {
            this.bird.jump();
            this.score++;
            console.log('Vogel springt! Punktestand:', this.score);
        }
    }

    /**
     * Startet das Spiel
     */
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.gameLoop();
        }
    }

    /**
     * Stoppt das Spiel
     */
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    /**
     * Haupt-Spielschleife
     */
    gameLoop() {
        if (!this.isRunning) return;

        // Canvas leeren
        this.clear();

        // Spielelemente aktualisieren
        this.update();

        // Spielelemente zeichnen
        this.draw();

        // Nächsten Frame planen
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }

    /**
     * Löscht den Canvas
     */
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Aktualisiert die Spielelogik
     */
    update() {
        if (this.bird) {
            this.bird.update();
        }
    }

    /**
     * Zeichnet alle Spielelemente
     */
    draw() {
        // Hintergrund zeichnen
        this.drawBackground();
        
        // Boden zeichnen
        this.drawGround();
        
        // Vogel zeichnen
        if (this.bird) {
            this.bird.draw(this.ctx);
        }
        
        // Punktestand anzeigen
        this.drawScore();
        
        // Anleitung anzeigen
        this.drawInstructions();
    }

    /**
     * Zeichnet den Hintergrund
     */
    drawBackground() {
        this.ctx.fillStyle = COLORS.BACKGROUND;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Wolken zeichnen (optionale Dekoration)
        this.drawClouds();
    }

    /**
     * Zeichnet Wolken
     */
    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        // Wolke 1
        this.drawCloud(100, 80, 40);
        // Wolke 2
        this.drawCloud(300, 50, 50);
        // Wolke 3
        this.drawCloud(600, 100, 35);
    }

    /**
     * Zeichnet eine einzelne Wolke
     * @param {number} x - X-Position
     * @param {number} y - Y-Position
     * @param {number} size - Größe der Wolke
     */
    drawCloud(x, y, size) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.8, y - size * 0.3, size * 0.7, 0, Math.PI * 2);
        this.ctx.arc(x + size * 1.5, y, size * 0.8, 0, Math.PI * 2);
        this.ctx.fill();
    }

    /**
     * Zeichnet den Boden
     */
    drawGround() {
        this.ctx.fillStyle = COLORS.GROUND;
        this.ctx.fillRect(
            0, 
            GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.GROUND_HEIGHT, 
            this.canvas.width, 
            GAME_CONFIG.GROUND_HEIGHT
        );
        
        // Gras oben auf dem Boden
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(
            0, 
            GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.GROUND_HEIGHT, 
            this.canvas.width, 
            10
        );
    }

    /**
     * Zeichnet den Punktestand
     */
    drawScore() {
        this.ctx.fillStyle = COLORS.TEXT;
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Punkte: ${this.score}`, 20, 40);
    }

    /**
     * Zeichnet die Steuerungsanleitung
     */
    drawInstructions() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            'Drücke LEERTASTE zum Springen', 
            this.canvas.width / 2, 
            this.canvas.height - 15
        );
    }
}

// Spiel starten, wenn das Dokument geladen ist
document.addEventListener('DOMContentLoaded', () => {
    console.log('Bird Jump Game wird initialisiert...');
    const game = new GameWindow();
    console.log('Spiel gestartet! Drücke Leertaste zum Springen.');
});

/**
 * Export für Tests
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Bird, GameWindow, GAME_CONFIG, COLORS };
}