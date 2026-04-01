"""
game_logic.py - Spiellogik für Tic-Tac-Toe

Dieses Modul enthält die Kernlogik des Spiels, einschließlich:
- Verwaltung des Spielfelds
- Überprüfung von Gewinnbedingungen
- Überprüfung auf Unentschieden
- Validierung von Zügen
"""

from typing import Optional, List, Tuple


class GameLogic:
    """
    Klasse für die Spiellogik des Tic-Tac-Toe-Spiels.
    Verwaltet das Spielfeld und prüft Spielzustände.
    """
    
    def __init__(self, board_size: int = 3):
        """
        Initialisiert die Spiellogik mit einem leeren Spielfeld.
        
        Args:
            board_size: Größe des Spielfelds (Standard: 3 für 3x3)
        """
        self.board_size = board_size
        self.board: List[List[Optional[str]]] = self._create_empty_board()
        self.current_player: str = "X"
        self.winner: Optional[str] = None
        self.game_over: bool = False
        self.moves_count: int = 0
        
    def _create_empty_board(self) -> List[List[Optional[str]]]:
        """
        Erstellt ein leeres Spielfeld.
        
        Returns:
            2D-Liste mit None-Werten für ein leeres Spielfeld
        """
        return [[None for _ in range(self.board_size)] 
                for _ in range(self.board_size)]
    
    def reset_game(self) -> None:
        """Setzt das Spiel auf den Ausgangszustand zurück."""
        self.board = self._create_empty_board()
        self.current_player = "X"
        self.winner = None
        self.game_over = False
        self.moves_count = 0
    
    def make_move(self, row: int, col: int) -> bool:
        """
        Führt einen Zug aus, wenn der Zug gültig ist.
        
        Args:
            row: Zeilenindex (0-basiert)
            col: Spaltenindex (0-basiert)
            
        Returns:
            True wenn der Zug erfolgreich war, False otherwise
        """
        # Prüfen ob Spiel bereits beendet
        if self.game_over:
            return False
        
        # Prüfen ob Position gültig und leer
        if not self._is_valid_position(row, col):
            return False
            
        if self.board[row][col] is not None:
            return False
        
        # Zug ausführen
        self.board[row][col] = self.current_player
        self.moves_count += 1
        
        # Gewinn prüfen
        if self.check_winner():
            self.winner = self.current_player
            self.game_over = True
            return True
        
        # Unentschieden prüfen
        if self.check_draw():
            self.game_over = True
            return True
        
        # Spieler wechseln
        self.current_player = "O" if self.current_player == "X" else "X"
        
        return True
    
    def _is_valid_position(self, row: int, col: int) -> bool:
        """
        Prüft ob eine Position innerhalb des Spielfelds liegt.
        
        Args:
            row: Zeilenindex
            col: Spaltenindex
            
        Returns:
            True wenn Position gültig ist
        """
        return 0 <= row < self.board_size and 0 <= col < self.board_size
    
    def check_winner(self) -> Optional[str]:
        """
        Prüft ob es einen Gewinner gibt.
        
        Returns:
            "X" oder "O" wenn ein Spieler gewonnen hat, None otherwise
        """
        # Alle Gewinnkombinationen prüfen
        return (self._check_rows() or 
                self._check_columns() or 
                self._check_diagonals())
    
    def _check_rows(self) -> Optional[str]:
        """
        Prüft alle Zeilen auf Gewinnbedingung.
        
        Returns:
            Gewinner oder None
        """
        for row in self.board:
            if self._is_winning_line(row):
                return row[0]
        return None
    
    def _check_columns(self) -> Optional[str]:
        """
        Prüft alle Spalten auf Gewinnbedingung.
        
        Returns:
            Gewinner oder None
        """
        for col_idx in range(self.board_size):
            column = [self.board[row_idx][col_idx] 
                      for row_idx in range(self.board_size)]
            if self._is_winning_line(column):
                return column[0]
        return None
    
    def _check_diagonals(self) -> Optional[str]:
        """
        Prüft beide Diagonalen auf Gewinnbedingung.
        
        Returns:
            Gewinner oder None
        """
        # Hauptdiagonale (links oben nach rechts unten)
        main_diagonal = [self.board[i][i] 
                        for i in range(self.board_size)]
        if self._is_winning_line(main_diagonal):
            return main_diagonal[0]
        
        # Nebendiagonale (rechts oben nach links unten)
        anti_diagonal = [self.board[i][self.board_size - 1 - i] 
                        for i in range(self.board_size)]
        if self._is_winning_line(anti_diagonal):
            return anti_diagonal[0]
        
        return None
    
    def _is_winning_line(self, line: List[Optional[str]]) -> bool:
        """
        Prüft ob eine Linie eine Gewinnbedingung erfüllt.
        
        Args:
            line: Liste von Spielsteinen (Zeile, Spalte oder Diagonale)
            
        Returns:
            True wenn alle Elemente gleich und nicht None sind
        """
        if not line or line[0] is None:
            return False
        return all(cell == line[0] for cell in line)
    
    def check_draw(self) -> bool:
        """
        Prüft ob das Spiel unentschieden endet.
        
        Returns:
            True wenn das Spielfeld voll ist und kein Gewinner existiert
        """
        return self.moves_count >= self.board_size ** 2 and self.winner is None
    
    def get_winning_cells(self) -> List[Tuple[int, int]]:
        """
        Gibt die Zellen zurück, die zum Sieg geführt haben.
        
        Returns:
            Liste von (row, col) Tupeln der Gewinnzellen
        """
        if not self.winner:
            return []
        
        # Zeilen prüfen
        for row_idx, row in enumerate(self.board):
            if self._is_winning_line(row):
                return [(row_idx, col_idx) for col_idx in range(self.board_size)]
        
        # Spalten prüfen
        for col_idx in range(self.board_size):
            column = [self.board[row_idx][col_idx] 
                      for row_idx in range(self.board_size)]
            if self._is_winning_line(column):
                return [(row_idx, col_idx) for row_idx in range(self.board_size)]
        
        # Hauptdiagonale prüfen
        main_diagonal = [self.board[i][i] for i in range(self.board_size)]
        if self._is_winning_line(main_diagonal):
            return [(i, i) for i in range(self.board_size)]
        
        # Nebendiagonale prüfen
        anti_diagonal = [self.board[i][self.board_size - 1 - i] 
                        for i in range(self.board_size)]
        if self._is_winning_line(anti_diagonal):
            return [(i, self.board_size - 1 - i) for i in range(self.board_size)]
        
        return []
    
    def get_board_state(self) -> List[List[Optional[str]]]:
        """
        Gibt eine Kopie des aktuellen Spielfelds zurück.
        
        Returns:
            Kopie des Spielfelds
        """
        return [row[:] for row in self.board]
    
    def get_current_player(self) -> str:
        """Gibt den aktuellen Spieler zurück."""
        return self.current_player
    
    def is_game_over(self) -> bool:
        """Gibt zurück ob das Spiel beendet ist."""
        return self.game_over
    
    def get_winner(self) -> Optional[str]:
        """Gibt den Gewinner zurück, falls vorhanden."""
        return self.winner


# Testfunktion für direkte Ausführung
if __name__ == "__main__":
    # Einfache Tests für die Gewinnprüfung
    game = GameLogic()
    
    # Test 1: Horizontaler Gewinn (X)
    print("Test 1: Horizontaler Gewinn (X)")
    game.board = [
        ["X", "X", "X"],
        [None, "O", None],
        [None, None, "O"]
    ]
    game.moves_count = 5
    winner = game.check_winner()
    print(f"  Gewinner: {winner} (erwartet: X)")
    print(f"  Gewinnzellen: {game.get_winning_cells()}")
    
    # Test 2: Vertikaler Gewinn (O)
    print("\nTest 2: Vertikaler Gewinn (O)")
    game.reset_game()
    game.board = [
        ["X", "O", None],
        ["X", "O", None],
        [None, "O", "X"]
    ]
    game.moves_count = 5
    winner = game.check_winner()
    print(f"  Gewinner: {winner} (erwartet: O)")
    print(f"  Gewinnzellen: {game.get_winning_cells()}")
    
    # Test 3: Diagonaler Gewinn (X)
    print("\nTest 3: Diagonaler Gewinn (X)")
    game.reset_game()
    game.board = [
        ["X", "O", None],
        ["O", "X", None],
        [None, None, "X"]
    ]
    game.moves_count = 5
    winner = game.check_winner()
    print(f"  Gewinner: {winner} (erwartet: X)")
    print(f"  Gewinnzellen: {game.get_winning_cells()}")
    
    # Test 4: Kein Gewinner
    print("\nTest 4: Kein Gewinner")
    game.reset_game()
    game.board = [
        ["X", "O", "X"],
        ["X", "O", "O"],
        ["O", "X", "X"]
    ]
    game.moves_count = 9
    winner = game.check_winner()
    print(f"  Gewinner: {winner} (erwartet: None)")
    
    # Test 5: Unentschieden
    print("\nTest 5: Unentschieden")
    print(f"  Ist Unentschieden: {game.check_draw()} (erwartet: True)")
    
    print("\n✓ Alle Tests abgeschlossen!")