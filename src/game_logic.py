"""
TicTacToe Spiellogik
Verwaltet das Spielbrett, Züge und Gewinnbedingungen
"""

from typing import List, Optional, Tuple
from enum import Enum


class Player(Enum):
    """Spieler-Typen"""
    X = "X"
    O = "O"
    
    def opponent(self) -> "Player":
        """Gegnerischen Spieler zurückgeben"""
        return Player.O if self == Player.X else Player.X


class GameState(Enum):
    """Mögliche Spielzustände"""
    IN_PROGRESS = "in_progress"
    X_WINS = "x_wins"
    O_WINS = "o_wins"
    DRAW = "draw"


class TicTacToeGame:
    """Hauptklasse für das TicTacToe Spiel"""
    
    def __init__(self, board_size: int = 3):
        """
        Initialisiert das Spiel
        
        Args:
            board_size: Größe des Spielfelds (Standard: 3x3)
        """
        self.board_size = board_size
        self.board: List[List[Optional[Player]]] = self._create_empty_board()
        self.current_player: Player = Player.X
        self.game_state: GameState = GameState.IN_PROGRESS
        self.move_history: List[Tuple[int, int]] = []
        
    def _create_empty_board(self) -> List[List[Optional[Player]]]:
        """Erstellt ein leeres Spielfeld"""
        return [[None for _ in range(self.board_size)] 
                for _ in range(self.board_size)]
    
    def reset(self) -> None:
        """Setzt das Spiel zurück"""
        self.board = self._create_empty_board()
        self.current_player = Player.X
        self.game_state = GameState.IN_PROGRESS
        self.move_history = []
    
    def is_valid_move(self, row: int, col: int) -> bool:
        """
        Prüft ob ein Zug gültig ist
        
        Args:
            row: Zeilenindex
            col: Spaltenindex
            
        Returns:
            True wenn Zug gültig ist
        """
        # Prüfe ob Indizes im gültigen Bereich liegen
        if not (0 <= row < self.board_size and 0 <= col < self.board_size):
            return False
        
        # Prüfe ob Feld leer ist
        if self.board[row][col] is not None:
            return False
        
        # Prüfe ob Spiel noch läuft
        if self.game_state != GameState.IN_PROGRESS:
            return False
        
        return True
    
    def make_move(self, row: int, col: int) -> bool:
        """
        Führt einen Zug aus
        
        Args:
            row: Zeilenindex
            col: Spaltenindex
            
        Returns:
            True wenn Zug erfolgreich war
        """
        if not self.is_valid_move(row, col):
            return False
        
        # Setze Stein
        self.board[row][col] = self.current_player
        self.move_history.append((row, col))
        
        # Prüfe auf Gewinn oder Unentschieden
        self._check_game_state()
        
        # Wechsle Spieler wenn Spiel noch läuft
        if self.game_state == GameState.IN_PROGRESS:
            self.current_player = self.current_player.opponent()
        
        return True
    
    def _check_game_state(self) -> None:
        """Prüft den aktuellen Spielzustand"""
        # Prüfe Gewinn
        winner = self._check_winner()
        if winner == Player.X:
            self.game_state = GameState.X_WINS
            return
        elif winner == Player.O:
            self.game_state = GameState.O_WINS
            return
        
        # Prüfe Unentschieden
        if self._is_board_full():
            self.game_state = GameState.DRAW
    
    def _check_winner(self) -> Optional[Player]:
        """Prüft ob es einen Gewinner gibt"""
        n = self.board_size
        
        # Prüfe Zeilen
        for row in range(n):
            if self._is_line_winner(self.board[row]):
                return self.board[row][0]
        
        # Prüfe Spalten
        for col in range(n):
            column = [self.board[row][col] for row in range(n)]
            if self._is_line_winner(column):
                return self.board[0][col]
        
        # Prüfe Diagonale (links oben nach rechts unten)
        diagonal = [self.board[i][i] for i in range(n)]
        if self._is_line_winner(diagonal):
            return self.board[0][0]
        
        # Prüfe Diagonale (rechts oben nach links unten)
        anti_diagonal = [self.board[i][n - 1 - i] for i in range(n)]
        if self._is_line_winner(anti_diagonal):
            return self.board[0][n - 1]
        
        return None
    
    def _is_line_winner(self, line: List[Optional[Player]]) -> bool:
        """Prüft ob eine Linie komplett von einem Spieler besetzt ist"""
        if line[0] is None:
            return False
        return all(cell == line[0] for cell in line)
    
    def _is_board_full(self) -> bool:
        """Prüft ob das Spielfeld voll ist"""
        return all(cell is not None for row in self.board for cell in row)
    
    def get_available_moves(self) -> List[Tuple[int, int]]:
        """
        Gibt alle verfügbaren Züge zurück
        
        Returns:
            Liste von (row, col) Tupeln
        """
        moves = []
        for row in range(self.board_size):
            for col in range(self.board_size):
                if self.board[row][col] is None:
                    moves.append((row, col))
        return moves
    
    def get_winner(self) -> Optional[Player]:
        """Gibt den Gewinner zurück falls vorhanden"""
        if self.game_state == GameState.X_WINS:
            return Player.X
        elif self.game_state == GameState.O_WINS:
            return Player.O
        return None
    
    def is_game_over(self) -> bool:
        """Prüft ob das Spiel beendet ist"""
        return self.game_state != GameState.IN_PROGRESS
    
    def print_board(self) -> None:
        """Gibt das Spielfeld in der Konsole aus"""
        print("\n  " + " ".join(str(i) for i in range(self.board_size)))
        print(" +" + "-" * (self.board_size * 2))
        
        for row_idx, row in enumerate(self.board):
            row_str = " ".join(
                cell.value if cell else "." 
                for cell in row
            )
            print(f"{row_idx}| {row_str}")
        print()
    
    def get_board_state(self) -> Tuple[Tuple[Optional[str], ...], ...]:
        """
        Gibt den aktuellen Brettzustand als Tuple zurück
        (nützlich für KI und Tests)
        """
        return tuple(
            tuple(cell.value if cell else None for cell in row)
            for row in self.board
        )


# Convenience-Funktionen für einfache Nutzung
def create_game(board_size: int = 3) -> TicTacToeGame:
    """Erstellt eine neue Spielinstanz"""
    return TicTacToeGame(board_size)


def print_result(game: TicTacToeGame) -> None:
    """Gibt das Spielergebnis aus"""
    if game.game_state == GameState.X_WINS:
        print("X gewinnt!")
    elif game.game_state == GameState.O_WINS:
        print("O gewinnt!")
    elif game.game_state == GameState.DRAW:
        print("Unentschieden!")