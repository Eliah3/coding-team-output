/**
 * Glücksrad - Interaktive Funktionalität
 * Ermöglicht die Drehung des Glücksrades und zufällige Auswahl eines Segments
 */

class WheelOfFortune {
    constructor(options = {}) {
        // Standard-Konfiguration
        this.canvasId = options.canvasId || 'wheelCanvas';
        this.segments = options.segments || [
            'Prize 1',
            'Prize 2',
            'Prize 3',
            'Prize 4',
            'Prize 5',
            'Prize 6'
        ];
        this.colors = options.colors || [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
            '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
        ];
        this.spinButtonId = options.spinButtonId || 'spinButton';
        this.resultDisplayId = options.resultDisplayId || 'resultDisplay';
        
        // Dreh-Parameter
        this.rotation = 0;
        this.isSpinning = false;
        this.minSpins = 5;  // Mindestanzahl an Umdrehungen
        this.maxSpins = 10; // Maximalanzahl an Umdrehungen
        this.spinDuration = 4000; // Dauer in ms
        
        this.init();
    }
    
    /**
     * Initialisiert das Glücksrad
     */
    init() {
        this.canvas = document.getElementById(this.canvasId);
        if (!this.canvas) {
            console.error('Canvas nicht gefunden:', this.canvasId);
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.radius = Math.min(this.centerX, this.centerY) - 10;
        
        // Event Listener für den Spin-Button
        const spinButton = document.getElementById(this.spinButtonId);
        if (spinButton) {
            spinButton.addEventListener('click', () => this.spin());
        }
        
        // Initiales Zeichnen des Rads
        this.drawWheel();
    }
    
    /**
     * Zeichnet das Glücksrad
     */
    drawWheel() {
        const ctx = this.ctx;
        const segmentAngle = (2 * Math.PI) / this.segments.length;
        
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Save context für Rotation
        ctx.save();
        ctx.translate(this.centerX, this.centerY);
        ctx.rotate(this.rotation);
        
        // Zeichne Segmente
        this.segments.forEach((segment, index) => {
            const startAngle = index * segmentAngle;
            const endAngle = (index + 1) * segmentAngle;
            
            // Segment füllen
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, this.radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = this.colors[index % this.colors.length];
            ctx.fill();
            ctx.stroke();
            
            // Text zeichnen
            ctx.save();
            ctx.rotate(startAngle + segmentAngle / 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px Arial';
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 2;
            ctx.fillText(segment, this.radius - 20, 5);
            ctx.restore();
        });
        
        // Zeichne Mittelpunkt
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, 2 * Math.PI);
        ctx.fillStyle = '#333';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Zeichne Pfeil oben
        ctx.restore();
        this.drawArrow();
    }
    
    /**
     * Zeichnet den Pfeil, der das Gewinnsegment anzeigt
     */
    drawArrow() {
        const ctx = this.ctx;
        
        ctx.beginPath();
        ctx.moveTo(this.centerX - 15, this.centerY - this.radius - 25);
        ctx.lineTo(this.centerX + 15, this.centerY - this.radius - 25);
        ctx.lineTo(this.centerX, this.centerY - this.radius - 5);
        ctx.closePath();
        ctx.fillStyle = '#FF4444';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    /**
     * Startet die Drehung des Glücksrades
     */
    spin() {
        if (this.isSpinning) return;
        
        this.isSpinning = true;
        
        // Zufällige Anzahl an Umdrehungen
        const totalSpins = this.minSpins + Math.random() * (this.maxSpins - this.minSpins);
        
        // Zufälliges Zielsegment
        const targetSegment = Math.floor(Math.random() * this.segments.length);
        const segmentAngle = (2 * Math.PI) / this.segments.length;
        
        // Zielwinkel berechnen (Pfeil zeigt nach oben, also -90 Grad bzw. -PI/2)
        const targetRotation = (totalSpins * 2 * Math.PI) + 
                               (targetSegment * segmentAngle) + 
                               (segmentAngle / 2) - 
                               (Math.PI / 2);
        
        // Animation starten
        this.animateSpin(targetRotation);
        
        // Ergebnis nach der Animation anzeigen
        setTimeout(() => {
            this.showResult(targetSegment);
            this.isSpinning = false;
        }, this.spinDuration);
    }
    
    /**
     * Animiert die Drehung des Rads
     */
    animateSpin(targetRotation) {
        const startTime = performance.now();
        const startRotation = this.rotation;
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / this.spinDuration, 1);
            
            // Easing-Funktion (ease-out für realistischen Brems-Effekt)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            this.rotation = startRotation + (targetRotation - startRotation) * easeOut;
            this.drawWheel();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    /**
     * Zeigt das Ergebnis an
     */
    showResult(segmentIndex) {
        const result = this.segments[segmentIndex];
        const resultDisplay = document.getElementById(this.resultDisplayId);
        
        if (resultDisplay) {
            resultDisplay.textContent = `Gewonnen: ${result}!`;
            resultDisplay.classList.add('winner');
            
            // Animation zur Hervorhebung
            setTimeout(() => {
                resultDisplay.classList.remove('winner');
            }, 3000);
        }
        
        // Event für externe Nutzung
        const event = new CustomEvent('wheelSpun', {
            detail: {
                segment: result,
                index: segmentIndex
            }
        });
        document.dispatchEvent(event);
    }
    
    /**
     * Setzt das Rad auf eine bestimmte Position (für Tests)
     */
    setPosition(rotation) {
        this.rotation = rotation;
        this.drawWheel();
    }
    
    /**
     * Aktualisiert die Segmente zur Laufzeit
     */
    setSegments(segments) {
        this.segments = segments;
        this.drawWheel();
    }
}

// Initialisierung beim Laden der Seite
document.addEventListener('DOMContentLoaded', () => {
    // Globale Instanz für einfachen Zugriff
    window.wheelOfFortune = new WheelOfFortune({
        canvasId: 'wheelCanvas',
        spinButtonId: 'spinButton',
        resultDisplayId: 'resultDisplay',
        segments: ['100', '200', '500', '1000', '2000', '5000', 'JACKPOT', 'NIETE'],
        colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FFD700', '#808080']
    });
});

// Export für Module (falls benötigt)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WheelOfFortune;
}