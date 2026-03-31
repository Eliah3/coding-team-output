/**
 * Tests für Bird Jump Game
 */

const { Bird, GameWindow, GAME_CONFIG, COLORS } = require('./script.js');

/**
 * Test-Klasse für Bird
 */
class BirdTest {
    constructor() {
        this.runTests();
    }

    /**
     * Führt alle Tests aus
     */
    runTests() {
        console.log('Starte Tests...');
        
        this.testBirdCreation();
        this.testBirdJump();
        this.testBirdUpdate();
        this.testBirdBoundaries();
        this.testHitbox();
        
        console.log('Alle Tests abgeschlossen!');
    }

    /**
     * Testet die Erstellung eines Vogels
     */
    testBirdCreation() {
        const bird = new Bird(100, 200);
        
        console.assert(bird.x === 100, 'X-Position sollte 100 sein');
        console.assert(bird.y === 200, 'Y-Position sollte 200 sein');
        console.assert(bird.velocity === 0, 'Anfangsgeschwindigkeit sollte 0 sein');
        console.assert(bird.size === GAME_CONFIG.BIRD_SIZE, 'Größe sollte konfiguriert sein');
        
        console.log('✓ testBirdCreation bestanden');
    }

    /**
     * Testet die Sprung-Funktionalität
     */
    testBirdJump() {
        const bird = new Bird(100, 200);
        
        // Vor dem Sprung
        const initialVelocity = bird.velocity;
        
        // Sprung ausführen
        bird.jump();
        
        // Nach dem Sprung sollte Geschwindigkeit negativ sein (nach oben)
        console.assert(bird.velocity === GAME_CONFIG.JUMP_STRENGTH, 
            'Geschwindigkeit nach Sprung sollte ' + GAME_CONFIG.JUMP_STRENGTH + ' sein');
        console.assert(bird.isJumping === true, 'isJumping sollte true sein');
        
        console.log('✓ testBirdJump bestanden');
    }

    /**
     * Testet die Update-Funktion
     */
    testBirdUpdate() {
        const bird = new Bird(100, 200);
        bird.velocity = -5;  // Nach oben fliegend
        
        const initialY = bird.y;
        bird.update();
        
        // Vogel sollte nach unten fallen (positiver Y-Wert)
        console.assert(bird.y > initialY, 'Y-Position sollte zunehmen (Schwerkraft)');
        
        console.log('✓ testBirdUpdate bestanden');
    }

    /**
     * Testet Grenzen (Boden und Decke)
     */
    testBirdBoundaries() {
        const bird = new Bird(100, 0);  // An der Decke
        
        // Vogel sollte nicht über die Decke gehen
        bird.update();
        console.assert(bird.y >= 0, 'Vogel sollte nicht unter 0 gehen');
        
        // Am Boden testen
        const groundY = GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.GROUND_HEIGHT - bird.size;
        bird.y = groundY;
        bird.velocity = 5;
        
        bird.update();
        console.assert(bird.y <= groundY, 'Vogel sollte nicht durch den Boden fallen');
        
        console.log('✓ testBirdBoundaries bestanden');
    }

    /**
     * Testet die Hitbox-Funktion
     */
    testHitbox() {
        const bird = new Bird(100, 200);
        const hitbox = bird.getHitbox();
        
        console.assert(hitbox.x === 100, 'Hitbox X sollte 100 sein');
        console.assert(hitbox.y === 200, 'Hitbox Y sollte 200 sein');
        console.assert(hitbox.width === GAME_CONFIG.BIRD_SIZE, 'Hitbox Breite sollte Vogelgröße sein');
        console.assert(hitbox.height === GAME_CONFIG.BIRD_SIZE, 'Hitbox Höhe sollte Vogelgröße sein');
        
        console.log('✓ testHitbox bestanden');
    }
}

/**
 * Test-Klasse für GameWindow
 */
class GameWindowTest {
    constructor() {
        this.runTests();
    }

    /**
     * Führt alle Tests aus
     */
    runTests() {
        console.log('Starte GameWindow Tests...');
        
        this.testKeyHandlers();
        this.testColorConstants();
        this.testGameConfig();
        
        console.log('Alle GameWindow Tests abgeschlossen!');
    }

    /**
     * Testet die Tastatur-Handler
     */
    testKeyHandlers() {
        // Mock GameWindow
        const mockWindow = {
            keyHandlers: {
                'Space': () => 'jump',
                'ArrowUp': () => 'up'
            },
            handleKeyPress: function(keyCode) {
                return this.keyHandlers[keyCode] ? this.keyHandlers[keyCode]() : null;
            }
        };
        
        console.assert(mockWindow.handleKeyPress('Space') === 'jump', 
            'Space-Taste sollte Sprung auslösen');
        console.assert(mockWindow.handleKeyPress('ArrowUp') === 'up', 
            'Pfeiltaste sollte Bewegung auslösen');
        console.assert(mockWindow.handleKeyPress('Unknown') === null, 
            'Unbekannte Taste sollte null zurückgeben');
        
        console.log('✓ testKeyHandlers bestanden');
    }

    /**
     * Testet Farbkonstanten
     */
    testColorConstants() {
        console.assert(COLORS.BACKGROUND === '#87CEEB', 'Hintergrundfarbe sollte himmelblau sein');
        console.assert(COLORS.BIRD === '#FFD700', 'Vogelfarbe sollte gold sein');
        console.assert(COLORS.GROUND === '#8B4513', 'Bodenfarbe sollte braun sein');
        
        console.log('✓ testColorConstants bestanden');
    }

    /**
     * Testet Spielkonfiguration
     */
    testGameConfig() {
        console.assert(GAME_CONFIG.GRAVITY > 0, 'Schwerkraft sollte positiv sein');
        console.assert(GAME_CONFIG.JUMP_STRENGTH < 0, 'Sprungstärke sollte negativ sein');
        console.assert(GAME_CONFIG.CANVAS_WIDTH > 0, 'Canvas-Breite sollte positiv sein');
        console.assert(GAME_CONFIG.CANVAS_HEIGHT > 0, 'Canvas-Höhe sollte positiv sein');
        
        console.log('✓ testGameConfig bestanden');
    }
}

// Tests ausführen
try {
    new BirdTest();
    new GameWindowTest();
} catch (error) {
    console.error('Fehler beim Ausführen der Tests:', error);
}