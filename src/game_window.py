"""
Game Window Module
Verwaltet das Pygame-Fenster und dessen Grundeinstellungen.
"""

import pygame
from typing import Tuple, Optional


class GameWindow:
    """
    Verwaltet das Hauptfenster des Spiels.
    """
    
    # Standard-Konfiguration
    DEFAULT_WIDTH: int = 800
    DEFAULT_HEIGHT: int = 600
    DEFAULT_TITLE: str = "Pygame Game"
    DEFAULT_FPS: int = 60
    
    # Farben (RGB)
    BACKGROUND_COLOR: Tuple[int, int, int] = (30, 30, 30)  # Dunkelgrau
    FPS_COLOR: Tuple[int, int, int] = (0, 255, 0)  # Grün
    
    def __init__(
        self,
        width: int = DEFAULT_WIDTH,
        height: int = DEFAULT_HEIGHT,
        title: str = DEFAULT_TITLE,
        fps: int = DEFAULT_FPS
    ) -> None:
        """
        Initialisiert das Spielefenster.
        
        Args:
            width: Fensterbreite in Pixeln
            height: Fensterhöhe in Pixeln
            title: Fenstertitel
            fps: Ziel-Framerate
        """
        self.width = width
        self.height = height
        self.title = title
        self.target_fps = fps
        
        # Pygame initialisieren
        pygame.init()
        
        # Bildschirm erstellen
        self.screen: pygame.Surface = pygame.display.set_mode(
            (self.width, self.height),
            pygame.HWSURFACE | pygame.DOUBLEBUF
        )
        
        # Fenstertitel setzen
        pygame.display.set_caption(self.title)
        
        # Clock für Framerate-Kontrolle
        self.clock: pygame.time.Clock = pygame.time.Clock()
        
        # Status-Variablen
        self.running: bool = False
        self.paused: bool = False
        
        # Schriftart für UI-Elemente
        self.font: Optional[pygame.font.Font] = None
        self._init_fonts()
    
    def _init_fonts(self) -> None:
        """Initialisiert die Schriftarten."""
        try:
            self.font = pygame.font.Font(None, 24)  # Standard-Schriftart
        except pygame.error:
            self.font = None
    
    def clear_screen(self) -> None:
        """Löscht den Bildschirm mit der Hintergrundfarbe."""
        self.screen.fill(self.BACKGROUND_COLOR)
    
    def update_display(self) -> None:
        """Aktualisiert die Anzeige (Double Buffering)."""
        pygame.display.flip()
    
    def tick(self) -> int:
        """
        Wartet auf die nächste Frame (Framerate-Kontrolle).
        
        Returns:
            Tatsächlich vergangene Zeit in Millisekunden
        """
        return self.clock.tick(self.target_fps)
    
    def get_fps(self) -> float:
        """
        Gibt die aktuelle Framerate zurück.
        
        Returns:
            Aktuelle FPS
        """
        return self.clock.get_fps()
    
    def draw_fps(self) -> None:
        """Zeigt die aktuelle FPS im Fenster an."""
        if self.font:
            fps_text = f"FPS: {self.get_fps():.1f}"
            fps_surface = self.font.render(fps_text, True, self.FPS_COLOR)
            self.screen.blit(fps_surface, (10, 10))
    
    def handle_events(self) -> bool:
        """
        Verarbeitet alle Pygame-Events.
        
        Returns:
            False wenn das Programm beendet werden soll, sonst True
        """
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                return False
            
            elif event.type == pygame.KEYDOWN:
                # ESC beendet das Spiel
                if event.key == pygame.K_ESCAPE:
                    return False
                # P pausiert das Spiel
                elif event.key == pygame.K_p:
                    self.paused = not self.paused
            
            # Custom Event-Handler aufrufen
            self._handle_custom_event(event)
        
        return True
    
    def _handle_custom_event(self, event: pygame.event.Event) -> None:
        """
        Überschreibbare Methode für benutzerdefinierte Events.
        
        Args:
            event: Pygame-Event
        """
        pass
    
    def update(self, delta_time: float) -> None:
        """
        Überschreibbare Methode für Spiel-Logik-Updates.
        
        Args:
            delta_time: Zeit seit dem letzten Frame in Sekunden
        """
        pass
    
    def render(self) -> None:
        """
        Überschreibbare Methode für das Rendering.
        """
        pass
    
    def run(self) -> None:
        """
        Startet die Hauptschleife des Spiels.
        """
        self.running = True
        
        while self.running:
            # Events verarbeiten
            if not self.handle_events():
                break
            
            # Delta Time berechnen (in Sekunden)
            delta_time = self.tick() / 1000.0
            
            # Spiel-Logik aktualisieren (wenn nicht pausiert)
            if not self.paused:
                self.update(delta_time)
            
            # Rendern
            self.clear_screen()
            self.render()
            self.draw_fps()
            self.update_display()
        
        # Aufräumen
        self.cleanup()
    
    def cleanup(self) -> None:
        """Räumt Ressourcen auf und beendet Pygame."""
        self.running = False
        pygame.quit()
    
    def __enter__(self) -> "GameWindow":
        """Kontext-Manager Einstieg."""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        """Kontext-Manager Ausstieg."""
        self.cleanup()