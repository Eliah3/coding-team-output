"""
Main Entry Point für das Pygame-Spiel.
"""

import sys
from pathlib import Path

# Pfad zum src-Verzeichnis hinzufügen (für Importe)
sys.path.insert(0, str(Path(__file__).parent))

from game_window import GameWindow


class Game(GameWindow):
    """
    Hauptklasse für das Spiel.
    Erweitert GameWindow mit spezifischer Spiel-Logik.
    """
    
    def __init__(self) -> None:
        # Fenster-Konfiguration
        super().__init__(
            width=1024,
            height=768,
            title="Mein Pygame Spiel",
            fps=60
        )
        
        # Spiel-spezifische Initialisierung
        self.player_pos: tuple = (self.width // 2, self.height // 2)
        self.player_color: tuple = (0, 120, 255)  # Blau
        self.player_size: int = 30
        self.move_speed: int = 300  # Pixel pro Sekunde
        
        # Bewegungsstatus
        self.keys_pressed: dict = {}
    
    def _handle_custom_event(self, event) -> None:
        """Behandelt benutzerdefinierte Events."""
        # Hier können zusätzliche Events hinzugefügt werden
        pass
    
    def update(self, delta_time: float) -> None:
        """
        Aktualisiert die Spiel-Logik.
        
        Args:
            delta_time: Zeit seit dem letzten Frame in Sekunden
        """
        # Tastaturstatus abfragen
        self.keys_pressed = pygame.key.get_pressed()
        
        # Bewegung basierend auf Tastatureingaben
        dx, dy = 0, 0
        
        if self.keys_pressed[pygame.K_LEFT] or self.keys_pressed[pygame.K_a]:
            dx -= 1
        if self.keys_pressed[pygame.K_RIGHT] or self.keys_pressed[pygame.K_d]:
            dx += 1
        if self.keys_pressed[pygame.K_UP] or self.keys_pressed[pygame.K_w]:
            dy -= 1
        if self.keys_pressed[pygame.K_DOWN] or self.keys_pressed[pygame.K_s]:
            dy += 1
        
        # Position aktualisieren (mit Geschwindigkeit und Delta Time)
        if dx != 0 or dy != 0:
            # Normalisieren für diagonale Bewegung
            length = (dx**2 + dy**2) ** 0.5
            dx, dy = dx / length, dy / length
            
            self.player_pos = (
                max(self.player_size, min(
                    self.width - self.player_size,
                    self.player_pos[0] + dx * self.move_speed * delta_time
                )),
                max(self.player_size, min(
                    self.height - self.player_size,
                    self.player_pos[1] + dy * self.move_speed * delta_time
                ))
            )
    
    def render(self) -> None:
        """
        Rendert alle Spielobjekte.
        """
        # Spieler zeichnen (Kreis)
        pygame.draw.circle(
            self.screen,
            self.player_color,
            (int(self.player_pos[0]), int(self.player_pos[1])),
            self.player_size
        )
        
        # Steuerungshinweise anzeigen
        if self.font:
            controls = "WASD oder Pfeiltasten zum Bewegen | P = Pause | ESC = Beenden"
            controls_surface = self.font.render(controls, True, (200, 200, 200))
            text_rect = controls_surface.get_rect(
                center=(self.width // 2, self.height - 30)
            )
            self.screen.blit(controls_surface, text_rect)
            
            # Pausen-Anzeige
            if self.paused:
                pause_text = "PAUSIERT"
                pause_surface = self.font.render(pause_text, True, (255, 255, 0))
                pause_rect = pause_surface.get_rect(
                    center=(self.width // 2, self.height // 2)
                )
                self.screen.blit(pause_surface, pause_rect)


def main() -> None:
    """
    Haupteinstiegspunkt des Programms.
    """
    print("=" * 50)
    print("  Pygame Spiel wird gestartet...")
    print("  Steuerung: WASD/Pfeiltasten, P, ESC")
    print("=" * 50)
    
    # Spiel mit Kontext-Manager starten (automatische Bereinigung)
    with Game() as game:
        game.run()
    
    print("\nSpiel wurde beendet. Bis bald!")


if __name__ == "__main__":
    main()