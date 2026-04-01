"""
Benutzeroberfläche für das Tic-Tac-Toe Spiel.
Enthält die grafische Darstellung des Spielfelds und die Steuerungselemente.
"""

import tkinter as tk
from tkinter import messagebox
from typing import Optional, Callable
import logging

# Logging-Konfiguration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class GameWindow:
    """
    Hauptklasse für das Spiel-Fenster.
    Verwaltet die grafische Benutzeroberfläche und Benutzerinteraktionen.
    """
    
    # Farbschema für das Spiel
    COLORS = {
        'background': '#2C3E50',
        'frame_bg': '#34495E',
        'button_bg': '#ECF0F1',
        'button_hover': '#BDC3C7',
        'x_color': '#E74C3C',
        'o_color': '#3498DB',
        'text': '#ECF0F1',
        'text_dark': '#2C3E50',
        'win_highlight': '#27AE60'
    }
    
    def __init__(self, root: tk.Tk, on_cell_click: Optional[Callable] = None,
                 on_new_game: Optional[Callable] = None,
                 on_ai_toggle: Optional[Callable] = None):
        """
        Initialisiert das Spiel-Fenster.
        
        Args:
            root: Das Tkinter-Hauptfenster
            on_cell_click: Callback-Funktion für Zellen-Klicks
            on_new_game: Callback-Funktion für Neustart
            on_ai_toggle: Callback-Funktion für KI-Ein/Aus-Schaltung
        """
        self.root = root
        self.on_cell_click = on_cell_click
        self.on_new_game = on_new_game
        self.on_ai_toggle = on_ai_toggle
        
        # Spielstatus
        self.board = [[None for _ in range(3)] for _ in range(3)]
        self.current_player = 'X'
        self.game_over = False
        self.ai_enabled = True
        self.winner = None
        self.winning_cells = []
        
        # UI-Komponenten
        self.buttons = [[None for _ in range(3)] for _ in range(3)]
        self.status_label = None
        self.score_label = None
        self.ai_toggle_button = None
        
        # Spielstände
        self.score_x = 0
        self.score_o = 0
        self.score_draw = 0
        
        logger.info("Initialisiere GameWindow")
        self._setup_window()
        self._create_widgets()
    
    def _setup_window(self) -> None:
        """Konfiguriert das Hauptfenster."""
        self.root.title("Tic-Tac-Toe")
        self.root.geometry("500x650")
        self.root.resizable(False, False)
        self.root.configure(bg=self.COLORS['background'])
        logger.info("Fenster konfiguriert")
    
    def _create_widgets(self) -> None:
        """Erstellt alle UI-Elemente des Spiels."""
        # Hauptcontainer
        main_frame = tk.Frame(
            self.root,
            bg=self.COLORS['background'],
            padx=20,
            pady=20
        )
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Titel
        title_label = tk.Label(
            main_frame,
            text="Tic-Tac-Toe",
            font=('Helvetica', 28, 'bold'),
            bg=self.COLORS['background'],
            fg=self.COLORS['text']
        )
        title_label.pack(pady=(0, 10))
        
        # Status-Anzeige
        self.status_label = tk.Label(
            main_frame,
            text=self._get_status_text(),
            font=('Helvetica', 14),
            bg=self.COLORS['background'],
            fg=self.COLORS['text']
        )
        self.status_label.pack(pady=(0, 15))
        
        # Spielbrett-Frame
        board_frame = tk.Frame(
            main_frame,
            bg=self.COLORS['frame_bg'],
            padx=10,
            pady=10
        )
        board_frame.pack(pady=10)
        
        # Erstellt die 3x3 Buttons für das Spielfeld
        for row in range(3):
            for col in range(3):
                self._create_board_button(board_frame, row, col)
        
        # Punktestand-Anzeige
        self.score_label = tk.Label(
            main_frame,
            text=self._get_score_text(),
            font=('Helvetica', 12),
            bg=self.COLORS['background'],
            fg=self.COLORS['text']
        )
        self.score_label.pack(pady=10)
        
        # Steuerungs-Buttons
        control_frame = tk.Frame(
            main_frame,
            bg=self.COLORS['background'],
            pady=10
        )
        control_frame.pack()
        
        # Neues Spiel Button
        new_game_btn = tk.Button(
            control_frame,
            text="Neues Spiel",
            font=('Helvetica', 12, 'bold'),
            bg=self.COLORS['button_bg'],
            fg=self.COLORS['text_dark'],
            padx=20,
            pady=8,
            command=self._on_new_game_clicked,
            relief=tk.FLAT,
            cursor='hand2'
        )
        new_game_btn.pack(side=tk.LEFT, padx=5)
        
        # KI Toggle Button
        self.ai_toggle_button = tk.Button(
            control_frame,
            text=self._get_ai_button_text(),
            font=('Helvetica', 12),
            bg=self.COLORS['button_bg'],
            fg=self.COLORS['text_dark'],
            padx=20,
            pady=8,
            command=self._on_ai_toggle_clicked,
            relief=tk.FLAT,
            cursor='hand2'
        )
        self.ai_toggle_button.pack(side=tk.LEFT, padx=5)
        
        # Info-Text
        info_label = tk.Label(
            main_frame,
            text="Spieler X ist immer zuerst dran",
            font=('Helvetica', 10),
            bg=self.COLORS['background'],
            fg=self.COLORS['text'],
            alpha=0.7
        )
        info_label.pack(pady=(15, 0))
        
        logger.info("Widgets erstellt")
    
    def _create_board_button(self, parent: tk.Frame, row: int, col: int) -> None:
        """
        Erstellt einen einzelnen Button für das Spielfeld.
        
        Args:
            parent: Das übergeordnete Frame
            row: Zeilenposition
            col: Spaltenposition
        """
        button = tk.Button(
            parent,
            text="",
            font=('Helvetica', 48, 'bold'),
            width=3,
            height=1,
            bg=self.COLORS['button_bg'],
            fg=self.COLORS['text_dark'],
            relief=tk.FLAT,
            command=lambda r=row, c=col: self._on_cell_clicked(r, c),
            cursor='hand2'
        )
        button.grid(row=row, column=col, padx=5, pady=5)
        
        # Hover-Effekte binden
        button.bind('<Enter>', lambda e, b=button: self._on_button_hover(b, True))
        button.bind('<Leave>', lambda e, b=button: self._on_button_hover(b, False))
        
        self.buttons[row][col] = button
        logger.debug(f"Button erstellt für Position ({row}, {col})")
    
    def _on_button_hover(self, button: tk.Button, entering: bool) -> None:
        """
        Behandelt Hover-Effekte für Buttons.
        
        Args:
            button: Der betroffene Button
            entering: True wenn Maus den Button betritt
        """
        if button['text'] == "" and not self.game_over:
            button.configure(bg=self.COLORS['button_hover'] if entering 
                           else self.COLORS['button_bg'])
    
    def _on_cell_clicked(self, row: int, col: int) -> None:
        """
        Behandelt einen Klick auf eine Zelle.
        
        Args:
            row: Zeilenposition
            col: Spaltenposition
        """
        # Prüfen ob Zug gültig ist
        if self.game_over or self.board[row][col] is not None:
            logger.debug(f"Ungültiger Zug auf ({row}, {col})")
            return
        
        # Prüfen ob KI gerade am Zug ist
        if self.ai_enabled and self.current_player == 'O':
            logger.debug("KI ist am Zug, Eingabe ignoriert")
            return
        
        logger.info(f"Spieler {self.current_player} klickt auf ({row}, {col})")
        
        # Callback aufrufen falls vorhanden
        if self.on_cell_click:
            self.on_cell_click(row, col)
        else:
            # Direkt ausführen wenn kein Callback
            self.make_move(row, col)
    
    def _on_new_game_clicked(self) -> None:
        """Behandelt den Klick auf 'Neues Spiel'."""
        logger.info("Neues Spiel gestartet")
        
        if self.on_new_game:
            self.on_new_game()
        else:
            self.reset_game()
    
    def _on_ai_toggle_clicked(self) -> None:
        """Behandelt den Klick auf den KI-Umschalt-Button."""
        self.ai_enabled = not self.ai_enabled
        logger.info(f"KI {'aktiviert' if self.ai_enabled else 'deaktiviert'}")
        
        self.ai_toggle_button.configure(text=self._get_ai_button_text())
        
        if self.on_ai_toggle:
            self.on_ai_toggle(self.ai_enabled)
    
    def _get_status_text(self) -> str:
        """Erstellt den Status-Text basierend auf dem aktuellen Spielstand."""
        if self.game_over:
            if self.winner:
                return f"Sieger: Spieler {self.winner}!"
            else:
                return "Unentschieden!"
        return f"Spieler {self.current_player} ist dran"
    
    def _get_score_text(self) -> str:
        """Erstellt den Punktestand-Text."""
        return (f"Siege X: {self.score_x}  |  "
                f"Siege O: {self.score_o}  |  "
                f"Unentschieden: {self.score_draw}")
    
    def _get_ai_button_text(self) -> str:
        """Erstellt den Text für den KI-Button."""
        return "KI: Aus" if self.ai_enabled else "KI: An"
    
    def make_move(self, row: int, col: int) -> bool:
        """
        Führt einen Spielzug aus.
        
        Args:
            row: Zeilenposition
            col: Spaltenposition
            
        Returns:
            True wenn der Zug erfolgreich war
        """
        if self.game_over or self.board[row][col] is not None:
            return False
        
        # Zug ausführen
        self.board[row][col] = self.current_player
        self._update_button_display(row, col)
        
        # Auf Sieg prüfen
        if self._check_winner():
            self._handle_game_end()
            return True
        
        # Auf Unentschieden prüfen
        if self._check_draw():
            self._handle_draw()
            return True
        
        # Spieler wechseln
        self.current_player = 'O' if self.current_player == 'X' else 'X'
        self._update_status()
        
        logger.info(f"Zug ausgeführt. Jetzt ist Spieler {self.current_player} dran")
        return True
    
    def _update_button_display(self, row: int, col: int) -> None:
        """
        Aktualisiert die Anzeige eines Buttons.
        
        Args:
            row: Zeilenposition
            col: Spaltenposition
        """
        button = self.buttons[row][col]
        symbol = self.board[row][col]
        
        button.configure(
            text=symbol,
            fg=self.COLORS['x_color'] if symbol == 'X' else self.COLORS['o_color']
        )
        
        # Gewonnene Zellen hervorheben
        if (row, col) in self.winning_cells:
            button.configure(bg=self.COLORS['win_highlight'])
    
    def _check_winner(self) -> bool:
        """
        Prüft ob es einen Gewinner gibt.
        
        Returns:
            True wenn es einen Gewinner gibt
        """
        # Zeilen prüfen
        for row in range(3):
            if self.board[row][0] == self.board[row][1] == self.board[row][2] \
               and self.board[row][0] is not None:
                self.winner = self.board[row][0]
                self.winning_cells = [(row, 0), (row, 1), (row, 2)]
                return True
        
        # Spalten prüfen
        for col in range(3):
            if self.board[0][col] == self.board[1][col] == self.board[2][col] \
               and self.board[0][col] is not None:
                self.winner = self.board[0][col]
                self.winning_cells = [(0, col), (1, col), (2, col)]
                return True
        
        # Diagonalen prüfen
        if self.board[0][0] == self.board[1][1] == self.board[2][2] \
           and self.board[0][0] is not None:
            self.winner = self.board[0][0]
            self.winning_cells = [(0, 0), (1, 1), (2, 2)]
            return True
        
        if self.board[0][2] == self.board[1][1] == self.board[2][0] \
           and self.board[0][2] is not None:
            self.winner = self.board[0][2]
            self.winning_cells = [(0, 2), (1, 1), (2, 0)]
            return True
        
        return False
    
    def _check_draw(self) -> bool:
        """
        Prüft ob das Spiel unentschieden ist.
        
        Returns:
            True wenn das Spiel unentschieden ist
        """
        return all(self.board[row][col] is not None 
                   for row in range(3) for col in range(3))
    
    def _handle_game_end(self) -> None:
        """Behandelt das Ende des Spiels mit einem Gewinner."""
        self.game_over = True
        self._update_status()
        
        # Punktestand aktualisieren
        if self.winner == 'X':
            self.score_x += 1
        else:
            self.score_o += 1
        
        self._update_score()
        
        # Gewonnene Zellen hervorheben
        for row, col in self.winning_cells:
            self.buttons[row][col].configure(bg=self.COLORS['win_highlight'])
        
        logger.info(f"Spiel beendet. Gewinner: {self.winner}")
        
        # Nachricht anzeigen
        messagebox.showinfo("Spiel beendet", 
                           f"Spieler {self.winner} hat gewonnen!")
    
    def _handle_draw(self) -> None:
        """Behandelt ein Unentschieden."""
        self.game_over = True
        self.score_draw += 1
        self._update_status()
        self._update_score()
        
        logger.info("Spiel beendet. Unentschieden")
        
        messagebox.showinfo("Spiel beendet", "Das Spiel endet unentschieden!")
    
    def _update_status(self) -> None:
        """Aktualisiert die Status-Anzeige."""
        self.status_label.configure(text=self._get_status_text())
    
    def _update_score(self) -> None:
        """Aktualisiert die Punktestand-Anzeige."""
        self.score_label.configure(text=self._get_score_text())
    
    def reset_game(self) -> None:
        """Setzt das Spiel zurück für eine neue Runde."""
        # Spielstatus zurücksetzen
        self.board = [[None for _ in range(3)] for _ in range(3)]
        self.current_player = 'X'
        self.game_over = False
        self.winner = None
        self.winning_cells = []
        
        # Buttons zurücksetzen
        for row in range(3):
            for col in range(3):
                self.buttons[row][col].configure(
                    text="",
                    bg=self.COLORS['button_bg'],
                    fg=self.COLORS['text_dark']
                )
        
        # Anzeigen aktualisieren
        self._update_status()
        
        logger.info("Spiel zurückgesetzt")
    
    def get_board_state(self) -> list:
        """
        Gibt den aktuellen Spielbrett-Zustand zurück.
        
        Returns:
            Eine Kopie des Spielbretts
        """
        return [row[:] for row in self.board]
    
    def set_ai_enabled(self, enabled: bool) -> None:
        """
        Aktiviert oder deaktiviert die KI.
        
        Args:
            enabled: True um KI zu aktivieren
        """
        self.ai_enabled = enabled
        self.ai_toggle_button.configure(text=self._get_ai_button_text())
        logger.info(f"KI {'aktiviert' if enabled else 'deaktiviert'}")
    
    def get_current_player(self) -> str:
        """
        Gibt den aktuellen Spieler zurück.
        
        Returns:
            'X' oder 'O'
        """
        return self.current_player
    
    def is_game_over(self) -> bool:
        """
        Prüft ob das Spiel vorbei ist.
        
        Returns:
            True wenn das Spiel vorbei ist
        """
        return self.game_over


# Standalone-Test wenn die Datei direkt ausgeführt wird
if __name__ == "__main__":
    root = tk.Tk()
    game_window = GameWindow(root)
    root.mainloop()