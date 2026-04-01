/**
 * Glücksrad - Interaktive Funktionalität
 * 
 * Dieses Modul implementiert ein interaktives Glücksrad mit:
 * - Zufälliger Segmentauswahl
 * - Sanfter Drehanimation mit Easing-Funktion
 * - Vollständiger Fehlerbehandlung
 * - Eingabevalidierung
 */

// Farben für die Segmente des Rads
const DEFAULT_COLORS = [
    '#FF6B6B', // Rot
    '#4ECDC4', // Türkis
    '#45B7D1', // Blau
    '#96CEB4', // Grün
    '#FFEAA7', // Gelb
    '#DDA0DD', // Pflaume
    '#98D8C8', // Minze
    '#F7DC6F'  // Gold
];

/**
 * Easing-Funktion für sanfte Drehung
 * Verwendet eine kubische Ease-Out-Funktion für natürliche Verzögerung
 * 
 * @param {number} t - Fortschritt der Animation (0 bis 1)
 * @returns {number} - Easing-Wert für die Interpolation
 * 
 * Die Funktion sorgt dafür, dass das Rad schnell startet und langsam
 * zum Stillstand kommt, was einer realistischen physikalischen Bewegung entspricht.
 */
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

/**
 * Easing-Funktion für sanften Start (Ease-In)
 * @param {number} t - Fortschritt der Animation (0 bis 1)
 * @returns {number} - Easing-Wert
 */
function easeInCubic(t) {
    return t * t * t;
}

/**
 * Hauptklasse für das Glücksrad
 */
class WheelGame {
    /**
     * Erstellt eine neue WheelGame-Instanz
     * @param {string} canvasId - ID des Canvas-Elements
     * @param {string} spinButtonId - ID des Dreh-Buttons
     * @param {string} resultId - ID des Ergebnis-Elements
     */
    constructor(canvasId, spinButtonId, resultId) {
        // DOM-Elemente abrufen mit Fehlerbehandlung
        this.canvas = document.getElementById(canvasId);
        this.spinButton = document.getElementById(spinButtonId);
        this.resultElement = document.getElementById(resultId);
        
        // Fehlerbehandlung für fehlende DOM-Elemente
        if (!this.canvas) {
            throw new Error(`Canvas-Element mit ID '${canvasId}' nicht gefunden`);
        }
        if (!this.spinButton) {
            throw new Error(`Button-Element mit ID '${spinButtonId}' nicht gefunden`);
        }
        if (!this.resultElement) {
            throw new Error(`Ergebnis-Element mit ID '${resultId}' nicht gefunden`);
        }
        
        this.ctx = this.canvas.getContext('2d');
        
        // Konfiguration
        this.segments = [];
        this.currentRotation = 0;
        this.isSpinning = false;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.radius = Math.min(this.centerX, this.centerY) - 10;
        
        // Standard-Segmente setzen
        this.setSegments(['Segment 1', 'Segment 2', 'Segment 3', 'Segment 4', 
                          'Segment 5', 'Segment 6', 'Segment 7', 'Segment 8']);
        
        // Event-Listener hinzufügen
        this.spinButton.addEventListener('click', () => this.spin());
        
        // Initiales Zeichnen
        this.draw();
    }
    
    /**
     * Setzt die Segmente des Rads mit Validierung
     * @param {string[]} segments - Array von Segmentnamen
     * @throws {Error} Wenn die Eingabe ungültig ist
     */
    setSegments(segments) {
        // Eingabevalidierung
        if (!Array.isArray(segments)) {
            throw new Error('Segmente müssen als Array übergeben werden');
        }
        
        if (segments.length === 0) {
            throw new Error('Mindestens ein Segment erforderlich');
        }
        
        if (segments.length > 20) {
            throw new Error('Maximal 20 Segmente erlaubt');
        }
        
        // Überprüfen, ob alle Elemente Strings sind
        for (let i = 0; i < segments.length; i++) {
            if (typeof segments[i] !== 'string') {
                throw new Error(`Segment an Index ${i} ist kein gültiger String`);
            }
        }
        
        this.segments = segments;
        this.draw();
    }
    
    /**
     * Zeichnet das Glücksrad auf den Canvas
     */
    draw() {
        const ctx = this.ctx;
        const numSegments = this.segments.length;
        const anglePerSegment = (2 * Math.PI) / numSegments;
        
        // Canvas leeren
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Jedes Segment zeichnen
        for (let i = 0; i < numSegments; i++) {
            const startAngle = i * anglePerSegment - Math.PI / 2 + this.currentRotation;
            const endAngle = startAngle + anglePerSegment;
            
            // Segment-Hintergrund
            ctx.beginPath();
            ctx.moveTo(this.centerX, this.centerY);
            ctx.arc(this.centerX, this.centerY, this.radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = DEFAULT_COLORS[i % DEFAULT_COLORS.length];
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Segment-Text
            ctx.save();
            ctx.translate(this.centerX, this.centerY);
            ctx.rotate(startAngle + anglePerSegment / 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 16px Arial';
            ctx.fillText(this.segments[i], this.radius - 20, 5);
            ctx.restore();
        }
        
        // Mittelpunkt zeichnen
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, 20, 0, 2 * Math.PI);
        ctx.fillStyle = '#2c3e50';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();
    }
    
    /**
     * Dreht das Glücksrad
     * 
     * Berechnet die Zielrotation basierend auf:
     * - Zufälliger Segmentauswahl
     * - Mehreren Umdrehungen für visuelle Wirkung
     * - Easing-Funktion für sanfte Animation
     */
    spin() {
        if (this.isSpinning) {
            return;
        }
        
        this.isSpinning = true;
        this.spinButton.disabled = true;
        this.resultElement.textContent = '';
        this.resultElement.classList.remove('highlight');
        
        // Zufälliges Segment auswählen
        const randomIndex = Math.floor(Math.random() * this.segments.length);
        
        // Berechnung der Anzahl der Umdrehungen
        // Das Rad macht mindestens 5 und maximal 8 Umdrehungen
        // für einen beeindruckenden visuellen Effekt
        const minRotations = 5;
        const maxRotations = 8;
        const numberOfRotations = minRotations + Math.random() * (maxRotations - minRotations);
        
        // Berechnung der Zielrotation
        // Wir berechnen die Rotation so, dass das ausgewählte Segment
        // oben am Pointer (bei -90 Grad bzw. 270 Grad) landet
        const numSegments = this.segments.length;
        const anglePerSegment = 360 / numSegments;
        
        // Winkel zum ausgewählten Segment berechnen
        // Da der Pointer oben ist (bei -90°), müssen wir das Segment
        // entsprechend positionieren
        const segmentAngle = randomIndex * anglePerSegment;
        const targetSegmentAngle = 360 - segmentAngle + 90;
        
        // Zielrotation berechnen: Umdrehungen * 360 + Position des Segments
        // Die zusätzlichen 360 Grad sorgen dafür, dass wir immer vom
        // aktuellen Punkt aus weiterdrehen
        const targetRotation = (numberOfRotations * 360) + targetSegmentAngle;
        
        // Startwerte für die Animation
        const startRotation = this.currentRotation % 360;
        const totalRotation = targetRotation - startRotation;
        
        // Animationsparameter
        const duration = 5000; // 5 Sekunden Drehzeit
        const startTime = performance.now();
        
        // Animations-Schleife
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing-Funktion anwenden für sanfte Verzögerung
            const easedProgress = easeOutCubic(progress);
            
            // Aktuelle Rotation berechnen
            this.currentRotation = startRotation + (totalRotation * easedProgress);
            
            // Rad neu zeichnen
            this.draw();
            
            // Animation fortsetzen oder beenden
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.finishSpin(randomIndex);
            }
        };
        
        // Animation starten
        requestAnimationFrame(animate);
    }
    
    /**
     * Beendet die Drehung und zeigt das Ergebnis an
     * @param {number} winningIndex - Index des gewonnenen Segments
     */
    finishSpin(winningIndex) {
        this.isSpinning = false;
        this.spinButton.disabled = false;
        
        // Ergebnis anzeigen
        const winningSegment = this.segments[winningIndex];
        this.resultElement.textContent = `Gewonnen: ${winningSegment}`;
        this.resultElement.classList.add('highlight');
        
        // Highlight-Animation nach kurzer Zeit entfernen
        setTimeout(() => {
            this.resultElement.classList.remove('highlight');
        }, 500);
    }
}

// Initialisierung beim Laden der Seite
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Glücksrad-Instanz erstellen
        window.wheelGame = new WheelGame('wheel', 'spinButton', 'result');
        
        // Beispiel: Segmente dynamisch anpassen (optional)
        // window.wheelGame.setSegments(['A', 'B', 'C', 'D', 'E', 'F']);
    } catch (error) {
        console.error('Fehler bei der Initialisierung des Glücksrads:', error);
        document.querySelector('.container').innerHTML = `
            <div style="color: red; padding: 20px;">
                <h2>Fehler</h2>
                <p>${error.message}</p>
            </div>
        `;
    }
});