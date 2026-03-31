"""
Spiel-Fenster mit Spielfeld und Steuerungselementen
Verwendet pygame für die grafische Oberfläche
"""

import pygame
import sys
from typing import Tuple, Optional

# Farben (RGB)
COLORS = {
    'background': (30, 30, 40),
    'game_board': (50, 50, 70),
    'grid': (80, 80, 100),
    'player': (255, 200, 80),
    'enemy': (255, 80, 80),
    'obstacle': (150, 150, 160),
    'text': (240, 240, 240),
    'button': (70, 130, 180),
    'button_hover': (100, 160, 210),
    'button_pressed': (50, 100, 150),
    'score': (255, 215, 0),
    'health': (220, 50, 50),
    'success': (80, 200, 80)
}


class Button:
    """Interaktiver Button für die Steuerung"""
    
    def __init__(self, x: int, y: int, width: int, height: int, 
                 text: str, callback: callable):
        self.rect = pygame.Rect(x, y, width, height)
        self.text = text
        self.callback = callback
        self.is_hovered = False
        self.is_pressed = False
        self.font = pygame.font.Font(None, 32)
    
    def handle_event(self, event: pygame.event.Event) -> None:
        """Event-Handler für Maus-Events"""
        if event.type == pygame.MOUSEMOTION:
            self.is_hovered = self.rect.collidepoint(event.pos)
        elif event.type == pygame.MOUSEBUTTONDOWN:
            if self.is_hovered and event.button == 1:
                self.is_pressed = True
        elif event.type == pygame.MOUSEBUTTONUP:
            if self.is_pressed and self.is_hovered:
                self.callback()
            self.is_pressed = False
    
    def draw(self, surface: pygame.Surface) -> None:
        """Button auf Oberfläche zeichnen"""
        # Farbe basierend auf Status
        if self.is_pressed:
            color = COLORS['button_pressed']
        elif self.is_hovered:
            color = COLORS['button_hover']
        else:
            color = COLORS['button']
        
        # Button-Hintergrund zeichnen
        pygame.draw.rect(surface, color, self.rect, border_radius=8)
        pygame.draw.rect(surface, (200, 200, 220), self.rect, 2, border_radius=8)
        
        # Text rendern und zentrieren
        text_surface = self.font.render(self.text, True, COLORS['text'])
        text_rect = text_surface.get_rect(center=self.rect.center)
        surface.blit(text_surface, text_rect)


class GameWindow:
    """Hauptklasse für das Spiel-Fenster"""
    
    def __init__(self, width: int = 900, height: int = 700, title: str = "Spiel"):
        # Pygame initialisieren
        pygame.init()
        
        # Fenster-Eigenschaften
        self.width = width
        self.height = height
        self.title = title
        
        # Fenster erstellen
        self.screen = pygame.display.set_mode((width, height))
        pygame.display.set_caption(title)
        
        # Fonts
        self.font_large = pygame.font.Font(None, 48)
        self.font_medium = pygame.font.Font(None, 36)
        self.font_small = pygame.font.Font(None, 24)
        
        # Spielbrett-Eigenschaften
        self.board_size = 8  # 8x8 Spielfeld
        self.cell_size = 60
        self.board_offset_x = 50
        self.board_offset_y = 80
        
        # UI-Elemente
        self.buttons: list[Button] = []
        self.score = 0
        self.health = 100
        self.level = 1
        self.game_over = False
        
        # Spielobjekte
        self.player_pos = [3, 3]  # Startposition
        self.enemies = []
        self.obstacles = []
        
        # Steuerelemente erstellen
        self._create_controls()
        
        # Clock für FPS-Kontrolle
        self.clock = pygame.time.Clock()
    
    def _create_controls(self) -> None:
        """Erstellt die Steuerungselemente"""
        # Buttons auf der rechten Seite
        button_y = 200
        
        # Neues Spiel Button
        self.new_game_btn = Button(
            self.width - 180, button_y, 150, 45,
            "Neues Spiel", self.new_game
        )
        self.buttons.append(self.new_game_btn)
        
        # Pause Button
        self.pause_btn = Button(
            self.width - 180, button_y + 60, 150, 45,
            "Pause", self.toggle_pause
        )
        self.buttons.append(self.pause_btn)
        
        # Reset Button
        self.reset_btn = Button(
            self.width - 180, button_y + 120, 150, 45,
            "Zurücksetzen", self.reset_level
        )
        self.buttons.append(self.reset_btn)
        
        # Schwierigkeit Buttons
        self.easy_btn = Button(
            self.width - 180, button_y + 200, 70, 35,
            "Leicht", lambda: self.set_difficulty("easy")
        )
        self.buttons.append(self.easy_btn)
        
        self.hard_btn = Button(
            self.width - 100, button_y + 200, 70, 35,
            "Schwer", lambda: self.set_difficulty("hard")
        )
        self.buttons.append(self.hard_btn)
    
    def new_game(self) -> None:
        """Startet ein neues Spiel"""
        self.score = 0
        self.health = 100
        self.level = 1
        self.game_over = False
        self.player_pos = [3, 3]
        self.enemies = []
        self.obstacles = []
        print("Neues Spiel gestartet!")
    
    def toggle_pause(self) -> None:
        """Schaltet Pause ein/aus"""
        print("Pause umgeschaltet")
    
    def reset_level(self) -> None:
        """Setzt das aktuelle Level zurück"""
        self.player_pos = [3, 3]
        self.health = 100
        print("Level zurückgesetzt")
    
    def set_difficulty(self, difficulty: str) -> None:
        """Setzt die Schwierigkeit"""
        print(f"Schwierigkeit: {difficulty}")
    
    def handle_events(self) -> None:
        """Verarbeitet alle Events"""
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            
            # Button-Events
            for button in self.buttons:
                button.handle_event(event)
            
            # Tastatur-Events für Spielersteuerung
            if event.type == pygame.KEYDOWN and not self.game_over:
                self._handle_keyboard(event.key)
    
    def _handle_keyboard(self, key: int) -> None:
        """Verarbeitet Tastatureingaben"""
        new_pos = list(self.player_pos)
        
        if key == pygame.K_UP or key == pygame.K_w:
            new_pos[1] -= 1
        elif key == pygame.K_DOWN or key == pygame.K_s:
            new_pos[1] += 1
        elif key == pygame.K_LEFT or key == pygame.K_a:
            new_pos[0] -= 1
        elif key == pygame.K_RIGHT or key == pygame.K_d:
            new_pos[0] += 1
        
        # Position validieren
        if 0 <= new_pos[0] < self.board_size and 0 <= new_pos[1] < self.board_size:
            self.player_pos = new_pos
            self.score += 10
    
    def update(self) -> None:
        """Aktualisiert den Spielzustand"""
        if self.health <= 0:
            self.game_over = True
    
    def draw_board(self) -> None:
        """Zeichnet das Spielfeld"""
        board_x = self.board_offset_x
        board_y = self.board_offset_y
        
        # Spielfeld-Hintergrund
        board_rect = pygame.Rect(
            board_x, board_y,
            self.board_size * self.cell_size,
            self.board_size * self.cell_size
        )
        pygame.draw.rect(self.screen, COLORS['game_board'], board_rect)
        
        # Gitter zeichnen
        for row in range(self.board_size + 1):
            y = board_y + row * self.cell_size
            pygame.draw.line(
                self.screen, COLORS['grid'],
                (board_x, y),
                (board_x + self.board_size * self.cell_size, y),
                1
            )
        
        for col in range(self.board_size + 1):
            x = board_x + col * self.cell_size
            pygame.draw.line(
                self.screen, COLORS['grid'],
                (x, board_y),
                (x, board_y + self.board_size * self.cell_size),
                1
            )
        
        # Hindernisse zeichnen
        for obs in self.obstacles:
            self._draw_cell(obs[0], obs[1], COLORS['obstacle'])
        
        # Gegner zeichnen
        for enemy in self.enemies:
            self._draw_cell(enemy[0], enemy[1], COLORS['enemy'])
        
        # Spieler zeichnen
        self._draw_cell(self.player_pos[0], self.player_pos[1], COLORS['player'])
    
    def _draw_cell(self, col: int, row: int, color: Tuple[int, int, int]) -> None:
        """Zeichnet eine einzelne Zelle"""
        x = self.board_offset_x + col * self.cell_size + 5
        y = self.board_offset_y + row * self.cell_size + 5
        size = self.cell_size - 10
        
        pygame.draw.rect(self.screen, color, (x, y, size, size), border_radius=8)
    
    def draw_ui(self) -> None:
        """Zeichnet die Benutzeroberfläche"""
        # Titel
        title_surface = self.font_large.render(self.title, True, COLORS['text'])
        self.screen.blit(title_surface, (self.board_offset_x, 20))
        
        # Status-Leiste
        status_y = self.height - 50
        
        # Score
        score_text = self.font_medium.render(f"Punkte: {self.score}", True, COLORS['score'])
        self.screen.blit(score_text, (self.board_offset_x, status_y))
        
        # Level
        level_text = self.font_medium.render(f"Level: {self.level}", True, COLORS['text'])
        self.screen.blit(level_text, (self.board_offset_x + 200, status_y))
        
        # Health Bar
        health_bar_width = 200
        health_bar_height = 25
        health_x = self.board_offset_x + 400
        health_y = status_y + 5
        
        # Health Bar Hintergrund
        pygame.draw.rect(self.screen, (80, 20, 20), 
                        (health_x, health_y, health_bar_width, health_bar_height))
        
        # Health Bar Füllung
        health_width = int(health_bar_width * (self.health / 100))
        pygame.draw.rect(self.screen, COLORS['health'],
                        (health_x, health_y, health_width, health_bar_height))
        
        # Health Bar Rahmen
        pygame.draw.rect(self.screen, (200, 200, 200),
                        (health_x, health_y, health_bar_width, health_bar_height), 2)
        
        # Health Text
        health_text = self.font_small.render(f"Leben: {self.health}%", True, COLORS['text'])
        self.screen.blit(health_text, (health_x + 70, status_y + 8))
        
        # Game Over Overlay
        if self.game_over:
            self._draw_game_over()
    
    def _draw_game_over(self) -> None:
        """Zeichnet das Game Over Overlay"""
        # Halbtransparenter Hintergrund
        overlay = pygame.Surface((self.width, self.height), pygame.SRCALPHA)
        overlay.fill((0, 0, 0, 180))
        self.screen.blit(overlay, (0, 0))
        
        # Game Over Text
        game_over_text = self.font_large.render("SPIEL VORBEI", True, COLORS['enemy'])
        text_rect = game_over_text.get_rect(center=(self.width // 2, self.height // 2 - 50))
        self.screen.blit(game_over_text, text_rect)
        
        # Final Score
        final_score = self.font_medium.render(f"Endpunktzahl: {self.score}", True, COLORS['score'])
        score_rect = final_score.get_rect(center=(self.width // 2, self.height // 2 + 10))
        self.screen.blit(final_score, score_rect)
        
        # Anleitung zum Neustart
        restart_text = self.font_small.render("Drücke 'Neues Spiel' um erneut zu spielen", True, COLORS['text'])
        restart_rect = restart_text.get_rect(center=(self.width // 2, self.height // 2 + 60))
        self.screen.blit(restart_text, restart_rect)
    
    def draw_controls_info(self) -> None:
        """Zeichnet Steuerungsinformationen"""
        info_y = 450
        info_x = self.width - 180
        
        title = self.font_small.render("Steuerung:", True, COLORS['text'])
        self.screen.blit(title, (info_x, info_y))
        
        controls = [
            "W/↑ - Hoch",
            "S/↓ - Runter",
            "A/← - Links",
            "D/→ - Rechts"
        ]
        
        for i, control in enumerate(controls):
            text = self.font_small.render(control, True, (180, 180, 190))
            self.screen.blit(text, (info_x, info_y + 25 + i * 22))
    
    def render(self) -> None:
        """Haupt-Render-Methode"""
        # Hintergrund
        self.screen.fill(COLORS['background'])
        
        # Spielfeld zeichnen
        self.draw_board()
        
        # UI zeichnen
        self.draw_ui()
        
        # Buttons zeichnen
        for button in self.buttons:
            button.draw(self.screen)
        
        # Steuerungsinfo zeichnen
        self.draw_controls_info()
        
        # Display aktualisieren
        pygame.display.flip()
    
    def run(self) -> None:
        """Hauptspiel-Schleife"""
        while True:
            self.handle_events()
            self.update()
            self.render()
            self.clock.tick(60)  # 60 FPS


def main():
    """Einstiegspunkt für das Spiel"""
    game = GameWindow(title="Mein Spiel")
    game.run()


if __name__ == "__main__":
    main()