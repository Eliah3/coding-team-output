"""
Benutzeroberfläche für das Tic-Tac-Toe-Spiel.

Dieses Modul enthält die Klasse GameWindow, die für die Darstellung
der grafischen Benutzeroberfläche verantwortlich ist.
"""

import tkinter as tk
from tkinter import messagebox
from typing import Optional, Tuple
import logging

# Konfiguration für Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class GameWindow:
    """
    Hauptklasse für das Tic-Tac-Toe-Fenster.
    
    Verwaltet die grafische Oberfläche des Spiels, einschließlich
    des Spielfelds, der Spielsteine und der Steuerelemente.
    """
    
    # Farbschema für das Spiel
    COLORS = {
        'background': '#2C3E50',
        'grid': '#ECF0F1',
        'player_x': '#E74C3C',
        'player_o': '#3498DB',
        'button': '#27AE60',
        'button_hover': '#2ECC71',
        'text': '#ECF0F1',
        'text_secondary': '#BDC3C7'
    }
    
    def __init__(self, game_logic, ai_module=None):
        """
        Initialisiert das Spielefenster.
        
        Args:
            game_logic: Instanz der GameLogic-Klasse
            ai_module: Optionale Instanz der KI-Klasse für den Computergegner
        """
        self.game_logic = game_logic
        self.ai_module = ai_module
        self.root = tk.Tk()
        self.root.title("Tic-Tac-Toe")
        self.root.geometry("500x600")
        self.root.configure(bg=self.COLORS['background'])
        self.root.resizable(False, False)
        
        # Spielstatus
        self.buttons: list = []
        self.current_player = 'X'
        self.game_active = True
        self.game_mode = 'pvp'  # 'pvp' oder 'pvc' (Player vs Computer)
        
        # Schriftarten
        self.font_large = ('Arial', 48, 'bold')
        self.font_medium = ('Arial', 24, 'bold')
        self.font_small = ('Arial', 12)
        
        # UI-Komponenten erstellen
        self._create_widgets()
        
        # Event-Handler binden
        self.root.protocol("WM_DELETE_WINDOW", self._on_close)
        
        logger.info("Spielefenster erfolgreich initialisiert")
    
    def _create_widgets(self) -> None:
        """Erstellt alle UI-Widgets für das Fenster."""
        
        # Titel-Label
        title_label = tk.Label(
            self.root,
            text="Tic-Tac-Toe",
            font=('Arial', 28, 'bold'),
            bg=self.COLORS['background'],
            fg=self.COLORS['text']
        )
        title_label.pack(pady=20)
        
        # Status-Anzeige (aktueller Spieler)
        self.status_label = tk.Label(
            self.root,
            text="Spieler X ist dran",
            font=self.font_small,
            bg=self.COLORS['background'],
            fg=self.COLORS['text_secondary']
        )
        self.status_label.pack(pady=5)
        
        # Spielfeld-Frame
        self.game_frame = tk.Frame(
            self.root,
            bg=self.COLORS['background']
        )
        self.game_frame.pack(pady=20)
        
        # Spielfeld-Buttons erstellen
        self._create_game_buttons()
        
        # Steuerungs-Frame
        control_frame = tk.Frame(
            self.root,
            bg=self.COLORS['background']
        )
        control_frame.pack(pady=20)
        
        # Neues Spiel Button
        self.new_game_btn = tk.Button(
            control_frame,
            text="Neues Spiel",
            font=self.font_small,
            bg=self.COLORS['button'],
            fg=self.COLORS['text'],
            activebackground=self.COLORS['button_hover'],
            command=self.reset_game,
            width=15,
            height=2
        )
        self.new_game_btn.pack(side=tk.LEFT, padx=10)
        
        # Spielmodus-Button
        self.mode_btn = tk.Button(
            control_frame,
            text="Modus: PvP",
            font=self.font_small,
            bg='#8E44AD',
            fg=self.COLORS['text'],
            command=self.toggle_game_mode,
            width=15,
            height=2
        )
        self.mode_btn.pack(side=tk.LEFT, padx=10)
        
        # Schwierigkeitsgrad-Auswahl (nur für PvC-Modus)
        self.difficulty_frame = tk.Frame(
            self.root,
            bg=self.COLORS['background']
        )
        self.difficulty_frame.pack(pady=10)
        
        self.difficulty_label = tk.Label(
            self.difficulty_frame,
            text="Schwierigkeit:",
            font=self.font_small,
            bg=self.COLORS['background'],
            fg=self.COLORS['text_secondary']
        )
        self.difficulty_label.pack(side=tk.LEFT, padx=5)
        
        self.difficulty_var = tk.StringVar(value="medium")
        difficulties = [("Leicht", "easy"), ("Mittel", "medium"), ("Schwer", "hard")]
        
        for text, value in difficulties:
            rb = tk.Radiobutton(
                self.difficulty_frame,
                text=text,
                variable=self.difficulty_var,
                value=value,
                bg=self.COLORS['background'],
                fg=self.COLORS['text'],
                selectcolor=self.COLORS['background'],
                command=self.set_difficulty
            )
            rb.pack(side=tk.LEFT, padx=5)
        
        # Initial den Schwierigkeitsgrad-Frame ausblenden
        self.difficulty_frame.pack_forget()
    
    def _create_game_buttons(self) -> None:
        """Erstellt die 3x3 Buttons für das Spielfeld."""
        self.buttons = []
        
        for row in range(3):
            button_row = []
            for col in range(3):
                btn = tk.Button(
                    self.game_frame,
                    text="",
                    font=self.font_large,
                    width=3,
                    height=1,
                    bg=self.COLORS['grid'],
                    fg=self.COLORS['grid'],
                    activebackground='#BDC3C7',
                    command=lambda r=row, c=col: self._on_button_click(r, c)
                )
                btn.grid(row=row, column=col, padx=5, pady=5)
                button_row.append(btn)
            self.buttons.append(button_row)
        
        logger.info("Spielfeld-Buttons erstellt")
    
    def _on_button_click(self, row: int, col: int) -> None:
        """
        Behandelt einen Klick auf ein Spielfeld.
        
        Args:
            row: Reihe des geklickten Buttons (0-2)
            col: Spalte des geklickten Buttons (0-2)
        """
        if not self.game_active:
            logger.info("Spiel ist beendet, Klick ignoriert")
            return
        
        # Überprüfen, ob das Feld bereits belegt ist
        if self.game_logic.get_cell(row, col) is not None:
            logger.info(f"Feld ({row}, {col}) ist bereits belegt")
            return
        
        # Spielzug ausführen
        self._make_move(row, col)
        
        # Wenn gegen Computer gespielt wird und das Spiel noch läuft
        if self.game_active and self.game_mode == 'pvc' and self.current_player == 'O':
            self.root.after(500, self._computer_move)
    
    def _make_move(self, row: int, col: int) -> bool:
        """
        Führt einen Spielzug aus.
        
        Args:
            row: Reihe des Zuges
            col: Spalte des Zuges
            
        Returns:
            True wenn der Zug erfolgreich war, False sonst
        """
        # Zug in der Logik aktualisieren
        success = self.game_logic.make_move(row, col, self.current_player)
        
        if not success:
            logger.warning(f"Zug fehlgeschlagen: ({row}, {col})")
            return False
        
        # Button aktualisieren
        self._update_button(row, col)
        
        logger.info(f"Spieler {self.current_player} setzt auf ({row}, {col})")
        
        # Auf Sieg prüfen
        if self.game_logic.check_winner():
            self._handle_game_end(f"Spieler {self.current_player} gewinnt!")
            return True
        
        # Auf Unentschieden prüfen
        if self.game_logic.is_board_full():
            self._handle_game_end("Das Spiel endet unentschieden!")
            return True
        
        # Spieler wechseln
        self.current_player = 'O' if self.current_player == 'X' else 'X'
        self._update_status()
        
        return True
    
    def _update_button(self, row: int, col: int) -> None:
        """
        Aktualisiert die Anzeige eines Buttons.
        
        Args:
            row: Reihe des Buttons
            col: Spalte des Buttons
        """
        value = self.game_logic.get_cell(row, col)
        btn = self.buttons[row][col]
        
        if value == 'X':
            btn.config(text='X', fg=self.COLORS['player_x'])
        elif value == 'O':
            btn.config(text='O', fg=self.COLORS['player_o'])
    
    def _computer_move(self) -> None:
        """Führt den Zug des Computers aus."""
        if not self.game_active:
            return
        
        logger.info("Computer macht seinen Zug")
        
        # KI-Zug abrufen
        if self.ai_module:
            row, col = self.ai_module.get_best_move(
                self.game_logic.board,
                self.difficulty_var.get()
            )
        else:
            # Fallback: Zufälliger Zug
            row, col = self._get_random_empty_cell()
        
        if row is not None:
            self._make_move(row, col)
    
    def _get_random_empty_cell(self) -> Optional[Tuple[int, int]]:
        """
        Findet eine zufällige leere Zelle.
        
        Returns:
            Tuple aus (row, col) oder None wenn keine leere Zelle existiert
        """
        import random
        empty_cells = self.game_logic.get_empty_cells()
        if empty_cells:
            return random.choice(empty_cells)
        return None
    
    def _update_status(self) -> None:
        """Aktualisiert die Status-Anzeige."""
        if self.game_mode == 'pvc':
            if self.current_player == 'X':
                self.status_label.config(text="Du bist dran (X)")
            else:
                self.status_label.config(text="Computer denkt nach...")
        else:
            self.status_label.config(text=f"Spieler {self.current_player} ist dran")
    
    def _handle_game_end(self, message: str) -> None:
        """
        Behandelt das Ende des Spiels.
        
        Args:
            message: Nachricht, die angezeigt werden soll
        """
        self.game_active = False
        self.status_label.config(text=message)
        
        logger.info(f"Spiel beendet: {message}")
        
        # Dialog anzeigen
        self.root.after(100, lambda: messagebox.showinfo("Spiel beendet", message))
    
    def reset_game(self) -> None:
        """Setzt das Spiel zurück und startet neu."""
        logger.info("Spiel wird zurückgesetzt")
        
        # Spielelogik zurücksetzen
        self.game_logic.reset()
        
        # Alle Buttons zurücksetzen
        for row in range(3):
            for col in range(3):
                self.buttons[row][col].config(text="", fg=self.COLORS['grid'])
        
        # Spielstatus zurücksetzen
        self.current_player = 'X'
        self.game_active = True
        self._update_status()
    
    def toggle_game_mode(self) -> None:
        """Wechselt zwischen PvP- und PvC-Modus."""
        if self.game_mode == 'pvp':
            self.game_mode = 'pvc'
            self.mode_btn.config(text="Modus: PvC")
            self.difficulty_frame.pack(pady=10)
            logger.info("Spielmodus gewechselt zu PvC")
        else:
            self.game_mode = 'pvp'
            self.mode_btn.config(text="Modus: PvP")
            self.difficulty_frame.pack_forget()
            logger.info("Spielmodus gewechselt zu PvP")
        
        # Spiel zurücksetzen
        self.reset_game()
    
    def set_difficulty(self) -> None:
        """
        Setzt den Schwierigkeitsgrad für den Computergegner.
        Wird aufgerufen wenn der Benutzer eine Schwierigkeit auswählt.
        """
        difficulty = self.difficulty_var.get()
        logger.info(f"Schwierigkeitsgrad gesetzt auf: {difficulty}")
        
        # Hier könnte die KI-Konfiguration angepasst werden
        if self.ai_module:
            self.ai_module.set_difficulty(difficulty)
    
    def toggle_pause(self) -> None:
        """
        Pausiert oder setzt das Spiel fort.
        Diese Methode ist für zukünftige Erweiterungen vorgesehen.
        """
        # Diese Funktion könnte für eine Pause-Funktion verwendet werden
        logger.info("Pause-Funktion aufgerufen (noch nicht implementiert)")
    
    def run(self) -> None:
        """Startet die Tkinter-Hauptschleife."""
        logger.info("Starte Hauptschleife des Spiels")
        self.root.mainloop()
    
    def _on_close(self) -> None:
        """Behandelt das Schließen des Fensters."""
        logger.info("Fenster wird geschlossen")
        self.root.destroy()


def create_window(game_logic, ai_module=None) -> GameWindow:
    """
    Factory-Funktion zur Erstellung eines GameWindow-Objekts.
    
    Args:
        game_logic: Instanz der GameLogic-Klasse
        ai_module: Optionale Instanz der KI-Klasse
        
    Returns:
        GameWindow-Instanz
    """
    return GameWindow(game_logic, ai_module)