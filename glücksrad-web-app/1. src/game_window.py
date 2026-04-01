"""
Tic-Tac-Toe Game Window Module

Dieses Modul enthält die grafische Benutzeroberfläche für das Tic-Tac-Toe-Spiel.
Es verwendet Tkinter für die Erstellung der UI-Komponenten.
"""

import tkinter as tk
from tkinter import messagebox
from typing import Optional, Callable
import logging

# Konfiguration für Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class GameWindow:
    """
    Hauptklasse für das Tic-Tac-Toe-Spielfenster.
    
    Verwaltet die grafische Benutzeroberfläche, Spielerinteraktionen
    und die Anzeige des Spielbretts.
    """
    
    # Farbschema für das Spiel
    COLORS = {
        'background': '#2C3E50',
        'board': '#34495E',
        'cell_hover': '#5D6D7E',
        'x_color': '#E74C3C',
        'o_color': '#3498DB',
        'text': '#ECF0F1',
        'button': '#27AE60',
        'button_hover': '#2ECC71'
    }
    
    def __init__(self, root: tk.Tk, on_cell_click: Optional[Callable] = None,
                 on_restart: Optional[Callable] = None):
        """
        Initialisiert das Spielfenster.
        
        Args:
            root: Das Haupt-Tkinter-Fenster
            on_cell_click: Callback-Funktion für Zellen-Klicks
            on_restart: Callback-Funktion für Neustart
        """
        self.root = root
        self.on_cell_click = on_cell_click
        self.on_restart = on_restart
        
        # Spielstatus
        self.current_player = 'X'
        self.game_over = False
        self.board = [[None for _ in range(3)] for _ in range(3)]
        self.buttons = [[None for _ in range(3)] for _ in range(3)]
        
        # UI-Komponenten
        self.title_label = None
        self.status_label = None
        self.board_frame = None
        self.restart_button = None
        
        # Font-Konfiguration
        self.font_title = ('Arial', 24, 'bold')
        self.font_status = ('Arial', 14)
        self.font_button = ('Arial', 12, 'bold')
        self.font_symbol = ('Arial', 48, 'bold')
        
        logger.info("Initialisiere GameWindow")
        self._setup_ui()
    
    def _setup_ui(self) -> None:
        """Richtet die Benutzeroberfläche ein."""
        # Hauptframe
        self.root.configure(bg=self.COLORS['background'])
        self.root.title("Tic-Tac-Toe")
        self.root.resizable(False, False)
        
        # Titel-Label
        self.title_label = tk.Label(
            self.root,
            text="Tic-Tac-Toe",
            font=self.font_title,
            bg=self.COLORS['background'],
            fg=self.COLORS['text']
        )
        self.title_label.pack(pady=20)
        
        # Status-Label (zeigt aktuellen Spieler oder Gewinner)
        self.status_label = tk.Label(
            self.root,
            text="Spieler X ist dran",
            font=self.font_status,
            bg=self.COLORS['background'],
            fg=self.COLORS['text']
        )
        self.status_label.pack(pady=10)
        
        # Spielfeld-Frame
        self.board_frame = tk.Frame(
            self.root,
            bg=self.COLORS['board'],
            bd=5,
            relief=tk.RAISED
        )
        self.board_frame.pack(padx=20, pady=20)
        
        # Erstelle die 3x3 Buttons für das Spielfeld
        self._create_board()
        
        # Neustart-Button
        self.restart_button = tk.Button(
            self.root,
            text="Neues Spiel",
            font=self.font_button,
            bg=self.COLORS['button'],
            fg=self.COLORS['text'],
            activebackground=self.COLORS['button_hover'],
            activeforeground=self.COLORS['text'],
            command=self._handle_restart,
            width=15,
            height=2,
            bd=3,
            relief=tk.RAISED
        )
        self.restart_button.pack(pady=20)
        
        logger.info("UI-Einrichtung abgeschlossen")
    
    def _create_board(self) -> None:
        """Erstellt das 3x3 Spielfeld mit Buttons."""
        for row in range(3):
            for col in range(3):
                self._create_cell(row, col)
    
    def _create_cell(self, row: int, col: int) -> None:
        """
        Erstellt eine einzelne Zelle im Spielfeld.
        
        Args:
            row: Zeilenindex (0-2)
            col: Spaltenindex (0-2)
        """
        button = tk.Button(
            self.board_frame,
            text="",
            font=self.font_symbol,
            bg=self.COLORS['board'],
            fg=self.COLORS['text'],
            width=3,
            height=1,
            bd=2,
            relief=tk.RAISED,
            command=lambda r=row, c=col: self._handle_cell_click(r, c)
        )
        
        # Bindings für Hover-Effekt
        button.bind('<Enter>', lambda e, b=button: self._on_hover_enter(b))
        button.bind('<Leave>', lambda e, b=button: self._on_hover_leave(b))
        
        button.grid(row=row, column=col, padx=5, pady=5)
        self.buttons[row][col] = button
        
        logger.debug(f"Zelle ({row}, {col}) erstellt")
    
    def _on_hover_enter(self, button: tk.Button) -> None:
        """Behandelt das Hover-Enter-Event für eine Zelle."""
        if button['text'] == "" and not self.game_over:
            button.configure(bg=self.COLORS['cell_hover'])
    
    def _on_hover_leave(self, button: tk.Button) -> None:
        """Behandelt das Hover-Leave-Event für eine Zelle."""
        button.configure(bg=self.COLORS['board'])
    
    def _handle_cell_click(self, row: int, col: int) -> None:
        """
        Behandelt einen Klick auf eine Zelle.
        
        Args:
            row: Zeilenindex der geklickten Zelle
            col: Spaltenindex der geklickten Zelle
        """
        # Prüfe ob Spiel vorbei oder Zelle bereits belegt
        if self.game_over or self.board[row][col] is not None:
            logger.debug(f"Klick auf Zelle ({row}, {col}) ignoriert - Spiel vorbei oder Zelle belegt")
            return
        
        logger.info(f"Spieler {self.current_player} klickt auf Zelle ({row}, {col})")
        
        # Setze das Symbol
        self.set_cell(row, col, self.current_player)
        
        # Prüfe auf Gewinn oder Unentschieden
        if self.check_winner():
            self._handle_game_over(winner=self.current_player)
        elif self.check_draw():
            self._handle_game_over(draw=True)
        else:
            # Wechsle Spieler
            self.current_player = 'O' if self.current_player == 'X' else 'X'
            self.update_status(f"Spieler {self.current_player} ist dran")
            
            # Callback für externen Handler (z.B. KI)
            if self.on_cell_click:
                self.on_cell_click(row, col, self.current_player)
    
    def _handle_restart(self) -> None:
        """Behandelt den Neustart-Button-Klick."""
        logger.info("Neues Spiel wird gestartet")
        self.reset_game()
        
        if self.on_restart:
            self.on_restart()
    
    def _handle_game_over(self, winner: Optional[str] = None, draw: bool = False) -> None:
        """
        Behandelt das Ende des Spiels.
        
        Args:
            winner: Gewinner-Symbol ('X' oder 'O') oder None
            draw: True wenn unentschieden
        """
        self.game_over = True
        
        if draw:
            self.update_status("Unentschieden!")
            messagebox.showinfo("Spiel beendet", "Das Spiel endet unentschieden!")
            logger.info("Spiel beendet - Unentschieden")
        else:
            self.update_status(f"Spieler {winner} gewinnt!")
            messagebox.showinfo("Spiel beendet", f"Spieler {winner} gewinnt!")
            logger.info(f"Spiel beendet - Gewinner: {winner}")
    
    def set_cell(self, row: int, col: int, symbol: str) -> None:
        """
        Setzt ein Symbol in eine Zelle.
        
        Args:
            row: Zeilenindex
            col: Spaltenindex
            symbol: 'X' oder 'O'
        """
        self.board[row][col] = symbol
        button = self.buttons[row][col]
        
        # Farbe basierend auf Symbol setzen
        color = self.COLORS['x_color'] if symbol == 'X' else self.COLORS['o_color']
        button.configure(text=symbol, fg=color, relief=tk.SUNKEN)
        
        logger.debug(f"Zelle ({row}, {col}) gesetzt auf {symbol}")
    
    def get_cell(self, row: int, col: int) -> Optional[str]:
        """
        Gibt den Inhalt einer Zelle zurück.
        
        Args:
            row: Zeilenindex
            col: Spaltenindex
            
        Returns:
            'X', 'O' oder None
        """
        return self.board[row][col]
    
    def update_status(self, message: str) -> None:
        """
        Aktualisiert die Statusanzeige.
        
        Args:
            message: Neue Statusnachricht
        """
        self.status_label.configure(text=message)
        logger.debug(f"Status aktualisiert: {message}")
    
    def check_winner(self) -> bool:
        """
        Prüft ob es einen Gewinner gibt.
        
        Returns:
            True wenn es einen Gewinner gibt
        """
        board = self.board
        
        # Prüfe Zeilen
        for row in range(3):
            if board[row][0] == board[row][1] == board[row][2] is not None:
                return True
        
        # Prüfe Spalten
        for col in range(3):
            if board[0][col] == board[1][col] == board[2][col] is not None:
                return True
        
        # Prüfe Diagonalen
        if board[0][0] == board[1][1] == board[2][2] is not None:
            return True
        if board[0][2] == board[1][1] == board[2][0] is not None:
            return True
        
        return False
    
    def check_draw(self) -> bool:
        """
        Prüft ob das Spiel unentschieden ist.
        
        Returns:
            True wenn unentschieden
        """
        return all(self.board[row][col] is not None for row in range(3) for col in range(3))
    
    def reset_game(self) -> None:
        """Setzt das Spiel zurück in den Ausgangszustand."""
        logger.info("Spiel wird zurückgesetzt")
        
        # Zurücksetzen des Spielbretts
        self.board = [[None for _ in range(3)] for _ in range(3)]
        self.current_player = 'X'
        self.game_over = False
        
        # Zurücksetzen der Buttons
        for row in range(3):
            for col in range(3):
                button = self.buttons[row][col]
                button.configure(
                    text="",
                    fg=self.COLORS['text'],
                    bg=self.COLORS['board'],
                    relief=tk.RAISED
                )
        
        self.update_status("Spieler X ist dran")
    
    def disable_board(self) -> None:
        """Deaktiviert das Spielfeld nach Spielende."""
        for row in range(3):
            for col in range(3):
                self.buttons[row][col].configure(state=tk.DISABLED)
    
    def enable_board(self) -> None:
        """Aktiviert das Spielfeld."""
        for row in range(3):
            for col in range(3):
                self.buttons[row][col].configure(state=tk.NORMAL)
    
    def get_board(self) -> list:
        """
        Gibt eine Kopie des aktuellen Spielbretts zurück.
        
        Returns:
            2D-Liste mit dem Spielbrett
        """
        return [row[:] for row in self.board]
    
    def set_board(self, board: list) -> None:
        """
        Setzt das Spielbrett auf einen bestimmten Zustand.
        
        Args:
            board: 2D-Liste mit dem Spielbrett-Zustand
        """
        self.board = [row[:] for row in board]
        
        # Aktualisiere die UI
        for row in range(3):
            for col in range(3):
                symbol = self.board[row][col]
                if symbol:
                    self.set_cell(row, col, symbol)
    
    def highlight_winning_cells(self) -> None:
        """Markiert die Gewinner-Zellen visuell."""
        board = self.board
        
        # Prüfe Zeilen
        for row in range(3):
            if board[row][0] == board[row][1] == board[row][2] is not None:
                for col in range(3):
                    self._highlight_cell(row, col)
                return
        
        # Prüfe Spalten
        for col in range(3):
            if board[0][col] == board[1][col] == board[2][col] is not None:
                for row in range(3):
                    self._highlight_cell(row, col)
                return
        
        # Prüfe Diagonalen
        if board[0][0] == board[1][1] == board[2][2] is not None:
            self._highlight_cell(0, 0)
            self._highlight_cell(1, 1)
            self._highlight_cell(2, 2)
            return
        
        if board[0][2] == board[1][1] == board[2][0] is not None:
            self._highlight_cell(0, 2)
            self._highlight_cell(1, 1)
            self._highlight_cell(2, 0)
    
    def _highlight_cell(self, row: int, col: int) -> None:
        """
        Hebt eine Zelle visuell hervor.
        
        Args:
            row: Zeilenindex
            col: Spaltenindex
        """
        button = self.buttons[row][col]
        button.configure(bg='#F1C40F')  # Goldene Farbe für Gewinner


def create_window() -> tuple:
    """
    Erstellt ein neues Spielfenster und gibt das Fenster und das GameWindow-Objekt zurück.
    
    Returns:
        Tuple aus (root, game_window)
    """
    root = tk.Tk()
    game_window = GameWindow(root)
    return root, game_window


if __name__ == "__main__":
    # Teste die GameWindow-Klasse
    root, game_window = create_window()
    root.mainloop()