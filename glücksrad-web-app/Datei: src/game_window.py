"""
Game Window Module für Tic-Tac-Toe
Enthält die grafische Benutzeroberfläche und Event-Handling
"""

import tkinter as tk
from tkinter import messagebox
from typing import Optional, Tuple
import logging

# Logging-Konfiguration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class GameWindow:
    """
    Hauptklasse für das Tic-Tac-Toe-Fenster.
    Verwaltet die GUI, das Spielfeld und die Spielereignisse.
    """
    
    # Farbschema für das Spiel
    COLORS = {
        'background': '#2C3E50',
        'frame': '#34495E',
        'button': '#ECF0F1',
        'button_hover': '#BDC3C7',
        'text': '#2C3E50',
        'text_light': '#ECF0F1',
        'x_color': '#E74C3C',
        'o_color': '#3498DB',
        'win_highlight': '#27AE60'
    }
    
    def __init__(self, root: tk.Tk) -> None:
        """
        Initialisiert das Spielefenster.
        
        Args:
            root: Das Haupt-Tkinter-Fenster
        """
        self.root = root
        self.root.title("Tic-Tac-Toe")
        self.root.geometry("400x500")
        self.root.resizable(False, False)
        self.root.configure(bg=self.COLORS['background'])
        
        # Spielstatus
        self.current_player: str = 'X'
        self.board: list = [['' for _ in range(3)] for _ in range(3)]
        self.game_over: bool = False
        self.player_wins: int = 0
        self.ai_wins: int = 0
        self.draws: int = 0
        
        # GUI-Komponenten
        self.buttons: list = []
        self.status_label: Optional[tk.Label] = None
        self.score_label: Optional[tk.Label] = None
        
        # UI-Komponenten initialisieren
        self._create_widgets()
        logger.info("Spielefenster erfolgreich initialisiert")
    
    def _create_widgets(self) -> None:
        """Erstellt alle GUI-Widgets für das Fenster."""
        
        # Hauptframe
        main_frame = tk.Frame(
            self.root,
            bg=self.COLORS['background'],
            padx=20,
            pady=20
        )
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Titel-Label
        title_label = tk.Label(
            main_frame,
            text="Tic-Tac-Toe",
            font=('Helvetica', 24, 'bold'),
            bg=self.COLORS['background'],
            fg=self.COLORS['text_light']
        )
        title_label.pack(pady=(0, 10))
        
        # Punktestand-Anzeige
        self.score_label = tk.Label(
            main_frame,
            text=self._get_score_text(),
            font=('Helvetica', 12),
            bg=self.COLORS['background'],
            fg=self.COLORS['text_light']
        )
        self.score_label.pack(pady=(0, 15))
        
        # Status-Label (aktueller Spieler)
        self.status_label = tk.Label(
            main_frame,
            text=f"Spieler {self.current_player} ist dran",
            font=('Helvetica', 14),
            bg=self.COLORS['background'],
            fg=self.COLORS['text_light']
        )
        self.status_label.pack(pady=(0, 15))
        
        # Spielfeld-Frame
        board_frame = tk.Frame(
            main_frame,
            bg=self.COLORS['frame'],
            padx=5,
            pady=5
        )
        board_frame.pack(pady=(0, 15))
        
        # 3x3 Button-Grid erstellen
        for row in range(3):
            button_row = []
            for col in range(3):
                btn = tk.Button(
                    board_frame,
                    text='',
                    font=('Helvetica', 32, 'bold'),
                    width=3,
                    height=1,
                    bg=self.COLORS['button'],
                    fg=self.COLORS['text'],
                    activebackground=self.COLORS['button_hover'],
                    relief=tk.RAISED,
                    borderwidth=3,
                    command=lambda r=row, c=col: self._on_cell_click(r, c)
                )
                btn.grid(row=row, column=col, padx=3, pady=3)
                button_row.append(btn)
            self.buttons.append(button_row)
        
        # Steuerungs-Buttons Frame
        control_frame = tk.Frame(
            main_frame,
            bg=self.COLORS['background']
        )
        control_frame.pack(pady=10)
        
        # Neustart-Button
        restart_btn = tk.Button(
            control_frame,
            text="Neues Spiel",
            font=('Helvetica', 12),
            bg=self.COLORS['button'],
            fg=self.COLORS['text'],
            padx=20,
            pady=5,
            command=self.restart_game
        )
        restart_btn.pack(side=tk.LEFT, padx=5)
        
        # Beenden-Button
        quit_btn = tk.Button(
            control_frame,
            text="Beenden",
            font=('Helvetica', 12),
            bg=self.COLORS['button'],
            fg=self.COLORS['text'],
            padx=20,
            pady=5,
            command=self.root.quit
        )
        quit_btn.pack(side=tk.LEFT, padx=5)
        
        # Info-Label
        info_label = tk.Label(
            main_frame,
            text="Klicke auf eine Zelle, um zu spielen",
            font=('Helvetica', 10),
            bg=self.COLORS['background'],
            fg=self.COLORS['text_light']
        )
        info_label.pack(pady=(10, 0))
    
    def _get_score_text(self) -> str:
        """Erstellt den Text für die Punktestand-Anzeige."""
        return f"Spieler X: {self.player_wins} | Unentschieden: {self.draws} | Spieler O: {self.ai_wins}"
    
    def _on_cell_click(self, row: int, col: int) -> None:
        """
        Behandelt einen Klick auf eine Spielfeldzelle.
        
        Args:
            row: Die Reihe der geklickten Zelle (0-2)
            col: Die Spalte der geklickten Zelle (0-2)
        """
        # Prüfen ob Spiel beendet oder Zelle bereits belegt
        if self.game_over or self.board[row][col] != '':
            logger.debug(f"Übersprungen: Spiel beendet={self.game_over}, Zelle belegt={self.board[row][col]}")
            return
        
        # Zug ausführen
        self._make_move(row, col)
        
        # Prüfen auf Gewinn oder Unentschieden
        if self._check_winner():
            self._handle_game_end()
        elif self._check_draw():
            self._handle_draw()
        else:
            # Spieler wechseln
            self.current_player = 'O' if self.current_player == 'X' else 'X'
            self._update_status()
            logger.info(f"Spielerwechsel zu {self.current_player}")
    
    def _make_move(self, row: int, col: int) -> None:
        """
        Führt einen Zug aus.
        
        Args:
            row: Die Reihe des Zuges
            col: Die Spalte des Zuges
        """
        self.board[row][col] = self.current_player
        
        # Button aktualisieren
        button = self.buttons[row][col]
        button.config(
            text=self.current_player,
            fg=self.COLORS['x_color'] if self.current_player == 'X' else self.COLORS['o_color']
        )
        
        logger.info(f"Spieler {self.current_player} setzt auf Position ({row}, {col})")
    
    def _check_winner(self) -> bool:
        """
        Prüft ob es einen Gewinner gibt.
        
        Returns:
            True wenn es einen Gewinner gibt, sonst False
        """
        b = self.board
        
        # Zeilen prüfen
        for row in range(3):
            if b[row][0] == b[row][1] == b[row][2] != '':
                self._highlight_winning_cells([(row, 0), (row, 1), (row, 2)])
                return True
        
        # Spalten prüfen
        for col in range(3):
            if b[0][col] == b[1][col] == b[2][col] != '':
                self._highlight_winning_cells([(0, col), (1, col), (2, col)])
                return True
        
        # Diagonalen prüfen
        if b[0][0] == b[1][1] == b[2][2] != '':
            self._highlight_winning_cells([(0, 0), (1, 1), (2, 2)])
            return True
        
        if b[0][2] == b[1][1] == b[2][0] != '':
            self._highlight_winning_cells([(0, 2), (1, 1), (2, 0)])
            return True
        
        return False
    
    def _check_draw(self) -> bool:
        """
        Prüft auf Unentschieden.
        
        Returns:
            True wenn das Spiel unentschieden endet, sonst False
        """
        return all(cell != '' for row in self.board for cell in row)
    
    def _highlight_winning_cells(self, cells: list) -> None:
        """
        Hebt die Gewinnerzellen hervor.
        
        Args:
            cells: Liste von (row, col) Tupeln für die Gewinnerzellen
        """
        for row, col in cells:
            self.buttons[row][col].config(bg=self.COLORS['win_highlight'])
    
    def _handle_game_end(self) -> None:
        """Behandelt das Ende des Spiels bei einem Gewinner."""
        self.game_over = True
        
        if self.current_player == 'X':
            self.player_wins += 1
            winner_text = "Du hast gewonnen!"
        else:
            self.ai_wins += 1
            winner_text = "Computer hat gewonnen!"
        
        self._update_score()
        self.status_label.config(text=winner_text, fg=self.COLORS['win_highlight'])
        logger.info(f"Spiel beendet - Gewinner: {self.current_player}")
        
        # Nachricht anzeigen
        self.root.after(100, lambda: messagebox.showinfo("Spiel beendet", winner_text))
    
    def _handle_draw(self) -> None:
        """Behandelt ein Unentschieden."""
        self.game_over = True
        self.draws += 1
        
        self._update_score()
        self.status_label.config(text="Unentschieden!", fg=self.COLORS['text_light'])
        logger.info("Spiel beendet - Unentschieden")
        
        # Nachricht anzeigen
        self.root.after(100, lambda: messagebox.showinfo("Spiel beendet", "Das Spiel endet unentschieden!"))
    
    def _update_status(self) -> None:
        """Aktualisiert die Statusanzeige."""
        self.status_label.config(
            text=f"Spieler {self.current_player} ist dran",
            fg=self.COLORS['text_light']
        )
    
    def _update_score(self) -> None:
        """Aktualisiert die Punktestand-Anzeige."""
        self.score_label.config(text=self._get_score_text())
    
    def restart_game(self) -> None:
        """Startet ein neues Spiel zurück."""
        logger.info("Neues Spiel wird gestartet")
        
        # Spielstatus zurücksetzen
        self.current_player = 'X'
        self.board = [['' for _ in range(3)] for _ in range(3)]
        self.game_over = False
        
        # Buttons zurücksetzen
        for row in range(3):
            for col in range(3):
                self.buttons[row][col].config(
                    text='',
                    bg=self.COLORS['button'],
                    fg=self.COLORS['text']
                )
        
        # Status aktualisieren
        self._update_status()
        logger.info("Spiel erfolgreich zurückgesetzt")
    
    def toggle_pause(self) -> None:
        """
        Pausiert oder setzt das Spiel fort.
        (Für zukünftige Erweiterungen)
        """
        logger.info("Pause-Funktion aufgerufen (noch nicht implementiert)")
        # Diese Methode kann für zukünftige Erweiterungen verwendet werden
        # z.B. wenn ein Pause-Button hinzugefügt werden soll
    
    def set_difficulty(self, difficulty: str) -> None:
        """
        Setzt den Schwierigkeitsgrad der KI.
        
        Args:
            difficulty: Der Schwierigkeitsgrad ('easy', 'medium', 'hard')
        """
        logger.info(f"Schwierigkeitsgrad gesetzt auf: {difficulty}")
        # Diese Methode kann für zukünftige Erweiterungen verwendet werden
        # wenn verschiedene KI-Schwierigkeitsgrade implementiert werden sollen


def create_window() -> Tuple[tk.Tk, GameWindow]:
    """
    Erstellt das Hauptfenster und die GameWindow-Instanz.
    
    Returns:
        Tuple aus (root, game_window)
    """
    root = tk.Tk()
    game_window = GameWindow(root)
    return root, game_window


if __name__ == "__main__":
    # Direkter Test des Moduls
    root, game = create_window()
    root.mainloop()