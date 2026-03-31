/**
 * script.js - Spring-Spiel mit Leertasten-Steuerung
 * 
 * Implementiert einen Vogel, der mit der Leertaste springen kann.
 * Enthält grundlegende Physik für Schwerkraft und Sprung.
 */

// Spiel-Konfiguration
const CONFIG = {
    gravity: 0.5,           // Schwerkraft pro Frame
    jumpStrength: -10,      // Sprungkraft (negativ für Aufwärtsbewegung)
    groundY: 350,           // Position des Bodens
    birdStartX: 100,        // Startposition X des Vogels
    birdStartY: 250,        // Startposition Y des Vogels
    birdSize: 30            // Größe des Vogels (Breite und Höhe)
};

// Spiel-Zustand
let gameState = {
    bird: {
        x: CONFIG.birdStartX,
        y: CONFIG.birdStartY,
        velocityY: 0,
        isJumping: false
    },
    isGameRunning: true,
    score: 0
};

// Canvas und Context abrufen
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

/**
 * Initialisiert das Spiel
 */
function initGame() {
    // Event Listener für Leertaste hinzufügen
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // Spielschleife starten
    gameLoop();
}

/**
 * Behandelt Tastendruck-Events
 * @param {KeyboardEvent} event - Das Tastenereignis
 */
function handleKeyDown(event) {
    // Leertaste (Space) = Sprung
    if (event.code === 'Space') {
        event.preventDefault(); // Verhindert Scrollen der Seite
        
        if (!gameState.bird.isJumping) {
            jump();
        }
    }
    
    // R-Taste = Spiel neu starten
    if (event.code === 'KeyR') {
        resetGame();
    }
}

/**
 * Behandelt Tastenloslass-Events
 * @param {KeyboardEvent} event - Das Tastenereignis
 */
function handleKeyUp(event) {
    // Hier können zusätzliche Aktionen beim Loslassen definiert werden
    if (event.code === 'Space') {
        // Optional: Kürzerer Sprung wenn Taste früh losgelassen wird
        if (gameState.bird.velocityY < -5) {
            gameState.bird.velocityY = -5;
        }
    }
}

/**
 * Lässt den Vogel springen
 */
function jump() {
    gameState.bird.velocityY = CONFIG.jumpStrength;
    gameState.bird.isJumping = true;
    
    // Visuelles Feedback für Sprung
    console.log("Vogel springt!");
}

/**
 * Aktualisiert die Spielphysik
 */
function updatePhysics() {
    if (!gameState.isGameRunning) return;
    
    // Schwerkraft anwenden
    gameState.bird.velocityY += CONFIG.gravity;
    gameState.bird.y += gameState.bird.velocityY;
    
    // Bodenkollision prüfen
    if (gameState.bird.y >= CONFIG.groundY - CONFIG.birdSize) {
        gameState.bird.y = CONFIG.groundY - CONFIG.birdSize;
        gameState.bird.velocityY = 0;
        gameState.bird.isJumping = false;
    }
    
    // Deckenkollision prüfen (optional)
    if (gameState.bird.y < 0) {
        gameState.bird.y = 0;
        gameState.bird.velocityY = 0;
    }
}

/**
 * Zeichnet den Vogel auf den Canvas
 */
function drawBird() {
    const bird = gameState.bird;
    
    ctx.fillStyle = '#FFD700'; // Goldgelbe Farbe
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    
    // Vogel als Rechteck zeichnen
    ctx.fillRect(bird.x, bird.y, CONFIG.birdSize, CONFIG.birdSize);
    ctx.strokeRect(bird.x, bird.y, CONFIG.birdSize, CONFIG.birdSize);
    
    // Auge hinzufügen
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(bird.x + CONFIG.birdSize - 8, bird.y + 8, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Schnabel hinzufügen
    ctx.fillStyle = '#FF6600';
    ctx.beginPath();
    ctx.moveTo(bird.x + CONFIG.birdSize, bird.y + 15);
    ctx.lineTo(bird.x + CONFIG.birdSize + 10, bird.y + 18);
    ctx.lineTo(bird.x + CONFIG.birdSize, bird.y + 21);
    ctx.closePath();
    ctx.fill();
}

/**
 * Zeichnet den Boden
 */
function drawGround() {
    ctx.fillStyle = '#8B4513'; // Braun
    ctx.fillRect(0, CONFIG.groundY, canvas.width, canvas.height - CONFIG.groundY);
    
    // Graslinie
    ctx.fillStyle = '#228B22'; // Grün
    ctx.fillRect(0, CONFIG.groundY, canvas.width, 10);
}

/**
 * Zeichnet Anweisungen auf den Canvas
 */
function drawInstructions() {
    ctx.fillStyle = '#333';
    ctx.font = '16px Arial';
    ctx.fillText('Drücke LEERTASTE zum Springen', 10, 25);
    ctx.fillText('Drücke R zum Neustart', 10, 45);
    
    // Score anzeigen
    ctx.fillText('Sprünge: ' + gameState.score, 10, 65);
}

/**
 * Haupt-Spielschleife
 */
function gameLoop() {
    // Canvas leeren
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Physik aktualisieren
    updatePhysics();
    
    // Elemente zeichnen
    drawGround();
    drawBird();
    drawInstructions();
    
    // Nächsten Frame anfordern
    requestAnimationFrame(gameLoop);
}

/**
 * Setzt das Spiel zurück
 */
function resetGame() {
    gameState.bird.x = CONFIG.birdStartX;
    gameState.bird.y = CONFIG.birdStartY;
    gameState.bird.velocityY = 0;
    gameState.bird.isJumping = false;
    gameState.score = 0;
    gameState.isGameRunning = true;
    
    consoleSpiel neu gestartet");
}

// Spiel starten, wenn DOM geladen ist
document.addEventListener('DOMContentLoaded', initGame);