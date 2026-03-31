"""
Game Window Module für Tic-Tac-Toe
Enthält die grafische Benutzeroberfläche und Event-Handling
"""

import tkinter as tk
from tkinter import messagebox, ttk
from typing import Optional, Callable
import logging

# Konfiguration für das Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class GameWindow:
    """
    Hauptklasse für das Spiel-Fenster.
    Verwaltet die GUI-Komponenten und Benutzerinteraktionen.
    """
    
    # Farbschema für das Spiel
    COLORS = {
        'background': '#2C3E50',
        'frame': '#34495E',
        'button': '#3498DB',
        'button_hover': '#2980B9',
        'X_color': '#E74C3C',
        'O_color': '#2ECC71',
        'text': '#ECF0F1',
        'text_secondary': '#BDC3C7'
    }
    
    def __init__(
        self,
        on_cell_click: Optional[Callable[[int, int], None]] = None,
        on_new_game: Optional[Callable[[], None]] = None,
        on_difficulty_change: Optional[Callable[[str], None]] = None
    ):
        """
        Initialisiert das Spiel-Fenster.
        
        Args:
            on_cell_click: Callback für Klick auf eine Zelle (row, col)
            on_new_game: Callback für Neustart des Spiels
            on_difficulty_change: Callback für Änderung des Schwierigkeitsgrads
        """
        self.on_cell_click = on_cell_click
        self.on_new_game = on_new_game
        self.on_difficulty_change = on_difficulty_change
        
        # Spielstatus
        self.board = [[None for _ in range(3)] for _ in range(3)]
        self.current_player = 'X'
        self.game_over = False
        self.paused = False
        self.difficulty = 'medium'
        
        # GUI-Referenzen
        self.buttons: list[list[tk.Button]] = []
        self.status_label: Optional[tk.Label] = None
        self.difficulty_var: Optional[tk.StringVar] = None
        
        # Hauptfenster erstellen
        self.root = tk.Tk()
        self.root.title("Tic-Tac-Toe")
        self.root.geometry("500x650")
        self.root.configure(bg=self.COLORS['background'])
        self.root.resizable(False, False)
        
        # GUI aufbauen
        self._create_widgets()
        logger.info("GameWindow initialisiert")
    
    def _create_widgets(self) -> None:
        """Erstellt alle GUI-Widgets."""
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
            font=("Helvetica", 28, "bold"),
            bg=self.COLORS['background'],
            fg=self.COLORS['text']
        )
        title_label.pack(pady=(0, 20))
        
        # Status-Anzeige
        self.status_label = tk.Label(
            main_frame,
            text="Spieler X ist dran",
            font=("Helvetica", 14),
            bg=self.COLORS['background'],
            fg=self.COLORS['text_secondary']
        )
        self.status_label.pack(pady=(0, 20))
        
        # Spielfeld-Frame
        board_frame = tk.Frame(
            main_frame,
            bg=self.COLORS['frame'],
            padx=10,
            pady=10
        )
        board_frame.pack(pady=10)
        
        # Spielfeld erstellen
        self._create_board(board_frame)
        
        # Steuerungs-Frame
        control_frame = tk.Frame(
            main_frame,
            bg=self.COLORS['background'],
            pady=20
        )
        control_frame.pack(fill=tk.X)
        
        # Schwierigkeitsgrad-Auswahl
        self._create_difficulty_selector(control_frame)
        
        # Buttons
        self._create_buttons(control_frame)
        
        # Info-Text
        info_label = tk.Label(
            main_frame,
            text="Drücke 'Neues Spiel' um erneut zu spielen",
            font=("Helvetica", 10),
            bg=self.COLORS['background'],
            fg=self.COLORS['text_secondary']
        )
        info_label.pack(pady=(20, 0))
    
    def _create_board(self, parent: tk.Frame) -> None:
        """Erstellt das 3x3 Spielfeld."""
        for row in range(3):
            button_row = []
            for col in range(3):
                btn = tk.Button(
                    parent,
                    text="",
                    font=("Helvetica", 36, "bold"),
                    width=3,
                    height=1,
                    bg=self.COLORS['frame'],
                    fg=self.COLORS['text'],
                    activebackground=self.COLORS['button'],
                    relief=tk.FLAT,
                    command=lambda r=row, c=col: self._handle_cell_click(r, c)
                )
                btn.grid(row=row, column=col, padx=5, pady=5)
                
                # Hover-Effekt binden
                btn.bind("<Enter>", lambda e, b=btn: self._on_hover(b, True))
                btn.bind("<Leave>", lambda e, b=btn: self._on_hover(b, False))
                
                button_row.append(btn)
            self.buttons.append(button_row)
    
    def _create_difficulty_selector(self, parent: tk.Frame) -> None:
        """Erstellt den Schwierigkeitsgrad-Auswahl-Dropdown."""
        difficulty_frame = tk.Frame(
            parent,
            bg=self.COLORS['background']
        )
        difficulty_frame.pack(pady=10)
        
        difficulty_label = tk.Label(
            difficulty_frame,
            text="Schwierigkeit:",
            font=("Helvetica", 12),
            bg=self.COLORS['background'],
            fg=self.COLORS['text']
        )
        difficulty_label.pack(side=tk.LEFT, padx=5)
        
        self.difficulty_var = tk.StringVar(value=self.difficulty)
        
        difficulty_combo = ttk.Combobox(
            difficulty_frame,
            textvariable=self.difficulty_var,
            values=["easy", "medium", "hard"],
            state="readonly",
            font=("Helvetica", 11),
            width=10
        )
        difficulty_combo.pack(side=tk.LEFT, padx=5)
        difficulty_combo.bind("<<ComboboxSelected>>", self._on_difficulty_change)
    
    def _create_buttons(self, parent: tk.Frame) -> None:
        """Erstellt die Steuerungsbuttons."""
        button_frame = tk.Frame(
            parent,
            bg=self.COLORS['background']
        )
        button_frame.pack(pady=10)
        
        # Neues Spiel Button
        new_game_btn = tk.Button(
            button_frame,
            text="Neues Spiel",
            font=("Helvetica", 12, "bold"),
            bg=self.COLORS['button'],
            fg=self.COLORS['text'],
            activebackground=self.COLORS['button_hover'],
            relief=tk.FLAT,
            padx=20,
            pady=10,
            command=self._handle_new_game
        )
        new_game_btn.pack(side=tk.LEFT, padx=10)
        
        # Pause/Resume Button
        self.pause_btn = tk.Button(
            button_frame,
            text="Pause",
            font=("Helvetica", 12, "bold"),
            bg=self.COLORS['button'],
            fg=self.COLORS['text'],
            activebackground=self.COLORS['button_hover'],
            relief=tk.FLAT,
            padx=20,
            pady=10,
            command=self.toggle_pause
        )
        self.pause_btn.pack(side=tk.LEFT, padx=10)
    
    def _on_hover(self, button: tk.Button, entering: bool) -> None:
        """Behandelt Hover-Effekt für Buttons."""
        if button['text'] == "":  # Nur für leere Zellen
            button.configure(
                bg=self.COLORS['button_hover'] if entering else self.COLORS['frame']
            )
    
    def _handle_cell_click(self, row: int, col: int) -> None:
        """Behandelt Klick auf eine Zelle."""
        if self.game_over or self.paused:
            logger.debug(f"Klick ignoriert: game_over={self.game_over}, paused={self.paused}")
            return
        
        if self.board[row][col] is not None:
            logger.debug(f"Zelle bereits belegt: ({row}, {col})")
            return
        
        logger.info(f"Zelle geklickt: ({row}, {col})")
        
        # Callback aufrufen falls vorhanden
        if self.on_cell_click:
            self.on_cell_click(row, col)
    
    def _handle_new_game(self) -> None:
        """Behandelt Neustart des Spiels."""
        logger.info("Neues Spiel gestartet")
        self.reset_board()
        
        if self.on_new_game:
            self.on_new_game()
    
    def _on_difficulty_change(self, event=None) -> None:
        """Behandelt Änderung des Schwierigkeitsgrads."""
        new_difficulty = self.difficulty_var.get()
        logger.info(f"Schwierigkeit geändert: {new_difficulty}")
        
        if self.on_difficulty_change:
            self.on_difficulty_change(new_difficulty)
    
    def update_board(self, row: int, col: int, player: str) -> None:
        """
        Aktualisiert eine Zelle im Spielfeld.
        
        Args:
            row: Zeilenindex (0-2)
            col: Spaltenindex (0-2)
            player: Spielerzeichen ('X' oder 'O')
        """
        if 0 <= row < 3 and 0 <= col < 3:
            self.board[row][col] = player
            
            # Button-Text und Farbe aktualisieren
            color = self.COLORS['X_color'] if player == 'X' else self.COLORS['O_color']
            self.buttons[row][col].configure(
                text=player,
                fg=color,
                state=tk.DISABLED,
                disabledforeground=color
            )
            logger.debug(f"Zelle aktualisiert: ({row}, {col}) = {player}")
    
    def update_status(self, message: str) -> None:
        """
        Aktualisiert die Status-Anzeige.
        
        Args:
            message: Status-Nachricht
        """
        if self.status_label:
            self.status_label.configure(text=message)
            logger.debug(f"Status aktualisiert: {message}")
    
    def set_current_player(self, player: str) -> None:
        """
        Setzt den aktuellen Spieler.
        
        Args:
            player: Spielerzeichen ('X' oder 'O')
        """
        self.current_player = player
        self.update_status(f"Spieler {player} ist dran")
    
    def end_game(self, winner: Optional[str], winning_cells: list = None) -> None:
        """
        Beendet das Spiel und zeigt das Ergebnis an.
        
        Args:
            winner: Gewinner ('X', 'O' oder None für Unentschieden)
            winning_cells: Liste der Gewinnerzellen [(row, col), ...]
        """
        self.game_over = True
        
        # Gewinnerzellen hervorheben
        if winning_cells:
            for row, col in winning_cells:
                self.buttons[row][col].configure(
                    bg=self.COLORS['button_hover']
                )
        
        # Nachricht anzeigen
        if winner:
            message = f"Spieler {winner} hat gewonnen!"
            self.update_status(f"Spieler {winner} hat gewonnen!")
            logger.info(f"Spiel beendet: {winner} gewinnt")
        else:
            message = "Das Spiel endet unentschieden!"
            self.update_status("Unentschieden!")
            logger.info("Spiel beendet: Unentschieden")
        
        # Alle Buttons deaktivieren
        for row in range(3):
            for col in range(3):
                self.buttons[row][col].configure(state=tk.DISABLED)
        
        # Messagebox anzeigen
        self.root.after(100, lambda: messagebox.showinfo("Spiel beendet", message))
    
    def reset_board(self) -> None:
        """Setzt das Spielfeld zurück."""
        self.board = [[None for _ in range(3)] for _ in range(3)]
        self.current_player = 'X'
        self.game_over = False
        self.paused = False
        
        # Buttons zurücksetzen
        for row in range(3):
            for col in range(3):
                self.buttons[row][col].configure(
                    text="",
                    fg=self.COLORS['text'],
                    state=tk.NORMAL,
                    bg=self.COLORS['frame']
                )
        
        self.update_status("Spieler X ist dran")
        logger.info("Spielfeld zurückgesetzt")
    
    def toggle_pause(self) -> None:
        """Schaltet zwischen Pause und Fortsetzen um."""
        self.paused = not self.paused
        
        if self.paused:
            self.pause_btn.configure(text="Fortsetzen")
            self.update_status("Spiel pausiert")
            logger.info("Spiel pausiert")
        else:
            self.pause_btn.configure(text="Pause")
            self.update_status(f"Spieler {self.current_player} ist dran")
            logger.info("Spiel fortgesetzt")
    
    def set_difficulty(self, difficulty: str) -> None:
        """
        Setzt den Schwierigkeitsgrad.
        
        Args:
            difficulty: Schwierigkeitsgrad ('easy', 'medium', 'hard')
        """
        valid_difficulties = ['easy', 'medium', 'hard']
        if difficulty not in valid_difficulties:
            logger.warning(f"Ungültiger Schwierigkeitsgrad: {difficulty}")
            return
        
        self.difficulty = difficulty
        self.difficulty_var.set(difficulty)
        logger.info(f"Schwierigkeit gesetzt: {difficulty}")
    
    def get_difficulty(self) -> str:
        """Gibt den aktuellen Schwierigkeitsgrad zurück."""
        return self.difficulty
    
    def run(self) -> None:
        """Startet die GUI-Hauptschleife."""
        logger.info("Starte GUI-Hauptschleife")
        self.root.mainloop()
    
    def close(self) -> None:
        """Schließt das Fenster."""
        logger.info("Fenster wird geschlossen")
        self.root.quit()
        self.root.destroy()


class GameWindowTests:
    """Test-Klasse für GameWindow."""
    
    @staticmethod
    def test_initialization():
        """Testet die Initialisierung des GameWindow."""
        window = GameWindow()
        assert window.current_player == 'X'
        assert window.game_over is False
        assert window.paused is False
        assert window.difficulty == 'medium'
        assert len(window.buttons) == 3
        assert len(window.buttons[0]) == 3
        window.close()
        print("✓ test_initialization bestanden")
    
    @staticmethod
    def test_update_board():
        """Testet die Aktualisierung des Spielfelds."""
        window = GameWindow()
        window.update_board(0, 0, 'X')
        assert window.board[0][0] == 'X'
        assert window.buttons[0][0]['text'] == 'X'
        window.close()
        print("✓ test_update_board bestanden")
    
    @staticmethod
    def test_reset_board():
        """Testet das Zurücksetzen des Spielfelds."""
        window = GameWindow()
        window.update_board(0, 0, 'X')
        window.update_board(1, 1, 'O')
        window.reset_board()
        
        assert window.board[0][0] is None
        assert window.board[1][1] is None
        assert window.current_player == 'X'
        assert window.game_over is False
        window.close()
        print("✓ test_reset_board bestanden")
    
    @staticmethod
    def test_toggle_pause():
        """Testet die Pause-Funktion."""
        window = GameWindow()
        assert window.paused is False
        
        window.toggle_pause()
        assert window.paused is True
        
        window.toggle_pause()
        assert window.paused is False
        window.close()
        print("✓ test_toggle_pause bestanden")
    
    @staticmethod
    def test_set_difficulty():
        """Testet das Setzen des Schwierigkeitsgrads."""
        window = GameWindow()
        
        window.set_difficulty('easy')
        assert window.get_difficulty() == 'easy'
        
        window.set_difficulty('hard')
        assert window.get_difficulty() == 'hard'
        
        # Ungültiger Wert sollte ignoriert werden
        window.set_difficulty('invalid')
        assert window.get_difficulty() == 'hard'
        window.close()
        print("✓ test_set_difficulty bestanden")
    
    @staticmethod
    def run_all_tests():
        """Führt alle Tests aus."""
        print("Starte Tests für GameWindow...")
        GameWindowTests.test_initialization()
        GameWindowTests.test_update_board()
        GameWindowTests.test_reset_board()
        GameWindowTests.test_toggle_pause()
        GameWindowTests.test_set_difficulty()
        print("Alle Tests bestanden!")


if __name__ == "__main__":
    # Tests ausführen wenn direkt aufgerufen
    GameWindowTests.run_all_tests()