"""
KI-Modul für den Computergegner im Tic-Tac-Toe-Spiel.

Dieses Modul implementiert verschiedene Schwierigkeitsgrade für den Computergegner:
- Random: Zufällige Züge (einfach)
- Minimax: Optimale Züge (schwer)
"""

import random
from typing import List, Tuple, Optional


class ComputerOpponent:
    """
    Klasse für den computergesteuerten Gegner.
    
    Attribute:
        difficulty (str): Schwierigkeitsgrad ('random', 'minimax')
        player_symbol (str): Das Symbol des Computers ('X' oder 'O')
    """
    
    def __init__(self, player_symbol: str = 'O', difficulty: str = 'random'):
        """
        Initialisiert den Computergegner.
        
        Args:
            player_symbol: Das Symbol des Spielers ('X' oder 'O')
            difficulty: Der Schwierigkeitsgrad ('random' oder 'minimax')
        """
        self.player_symbol = player_symbol
        self.difficulty = difficulty
        
        # Das Symbol des menschlichen Spielers
        self.opponent_symbol = 'X' if player_symbol == 'O' else 'O'
    
    def get_move(self, board: List[List[str]]) -> Optional[Tuple[int, int]]:
        """
        Berechnet den nächsten Zug des Computergegners.
        
        Args:
            board: Eine 3x3 Liste, die den aktuellen Spielstand darstellt.
                   Leere Felder sind '', 'X' ist der Spieler, 'O' ist der Computer.
        
        Returns:
            Ein Tuple (row, col) mit der Position des Zuges oder None wenn kein Zug möglich ist.
        """
        # Finde alle freien Felder
        available_moves = self.get_available_moves(board)
        
        if not available_moves:
            return None  # Keine Züge mehr möglich
        
        # Wähle den Zug basierend auf dem Schwierigkeitsgrad
        if self.difficulty == 'random':
            return self._get_random_move(available_moves)
        elif self.difficulty == 'minimax':
            return self._get_minimax_move(board, available_moves)
        else:
            # Fallback auf random
            return self._get_random_move(available_moves)
    
    def get_available_moves(self, board: List[List[str]]) -> List[Tuple[int, int]]:
        """
        Findet alle verfügbaren (leeren) Felder auf dem Spielbrett.
        
        Args:
            board: Das aktuelle Spielbrett
        
        Returns:
            Liste von Tuple-Koordinaten (row, col) für leere Felder
        """
        moves = []
        for row in range(3):
            for col in range(3):
                if board[row][col] == '':
                    moves.append((row, col))
        return moves
    
    def _get_random_move(self, available_moves: List[Tuple[int, int]]) -> Tuple[int, int]:
        """
        Wählt einen zufälligen Zug aus den verfügbaren Zügen.
        
        Args:
            available_moves: Liste der verfügbaren Züge
        
        Returns:
            Ein zufällig ausgewählter Zug als Tuple (row, col)
        """
        return random.choice(available_moves)
    
    def _get_minimax_move(self, board: List[List[str]], 
                          available_moves: List[Tuple[int, int]]) -> Tuple[int, int]:
        """
        Verwendet den Minimax-Algorithmus für optimale Züge.
        
        Args:
            board: Das aktuelle Spielbrett
            available_moves: Liste der verfügbaren Züge
        
        Returns:
            Der optimale Zug als Tuple (row, col)
        """
        best_score = float('-inf')
        best_move = None
        
        for move in available_moves:
            # Simuliere den Zug
            row, col = move
            board[row][col] = self.player_symbol
            
            # Berechne den Wert dieses Zuges
            score = self._minimax(board, 0, False, float('-inf'), float('inf'))
            
            # Rückgängig machen des Zuges
            board[row][col] = ''
            
            if score > best_score:
                best_score = score
                best_move = move
        
        return best_move
    
    def _minimax(self, board: List[List[str]], depth: int, 
                 is_maximizing: bool, alpha: float, beta: float) -> float:
        """
        Der Minimax-Algorithmus mit Alpha-Beta-Pruning.
        
        Args:
            board: Das aktuelle Spielbrett
            depth: Die aktuelle Tiefe im Rekursionsbaum
            is_maximizing: True wenn der Computer am Zug ist
            alpha: Der beste Wert, den der Maximizer garantieren kann
            beta: Der beste Wert, den der Minimizer garantieren kann
        
        Returns:
            Der bewertete Spielstand
        """
        # Prüfe auf Endzustände
        winner = self._check_winner(board)
        if winner == self.player_symbol:
            return 10 - depth  # Computer gewinnt
        elif winner == self.opponent_symbol:
            return depth - 10  # Mensch gewinnt
        elif self._is_board_full(board):
            return 0  # Unentschieden
        
        available_moves = self.get_available_moves(board)
        
        if is_maximizing:
            # Computerzug (Maximieren)
            max_score = float('-inf')
            for move in available_moves:
                row, col = move
                board[row][col] = self.player_symbol
                score = self._minimax(board, depth + 1, False, alpha, beta)
                board[row][col] = ''
                max_score = max(score, max_score)
                alpha = max(alpha, score)
                if beta <= alpha:
                    break  # Alpha-Beta Pruning
            return max_score
        else:
            # Menschlicher Zug (Minimieren)
            min_score = float('inf')
            for move in available_moves:
                row, col = move
                board[row][col] = self.opponent_symbol
                score = self._minimax(board, depth + 1, True, alpha, beta)
                board[row][col] = ''
                min_score = min(score, min_score)
                beta = min(beta, score)
                if beta <= alpha:
                    break  # Alpha-Beta Pruning
            return min_score
    
    def _check_winner(self, board: List[List[str]]) -> Optional[str]:
        """
        Prüft ob es einen Gewinner gibt.
        
        Args:
            board: Das Spielbrett
        
        Returns:
            'X', 'O' oder None
        """
        # Zeilen prüfen
        for row in range(3):
            if board[row][0] == board[row][1] == board[row][2] != '':
                return board[row][0]
        
        # Spalten prüfen
        for col in range(3):
            if board[0][col] == board[1][col] == board[2][col] != '':
                return board[0][col]
        
        # Diagonalen prüfen
        if board[0][0] == board[1][1] == board[2][2] != '':
            return board[0][0]
        if board[0][2] == board[1][1] == board[2][0] != '':
            return board[0][2]
        
        return None
    
    def _is_board_full(self, board: List[List[str]]) -> bool:
        """
        Prüft ob das Brett voll ist.
        
        Args:
            board: Das Spielbrett
        
        Returns:
            True wenn das Brett voll ist
        """
        for row in range(3):
            for col in range(3):
                if board[row][col] == '':
                    return False
        return True


def create_computer_player(symbol: str = 'O', difficulty: str = 'random') -> ComputerOpponent:
    """
    Factory-Funktion zur Erstellung eines Computergegners.
    
    Args:
        symbol: Das Symbol des Spielers ('X' oder 'O')
        difficulty: Der Schwierigkeitsgrad ('random' oder 'minimax')
    
    Returns:
        Eine Instanz von ComputerOpponent
    """
    return ComputerOpponent(player_symbol=symbol, difficulty=difficulty)


# Beispiel-Verwendung (kann zum Testen verwendet werden)
if __name__ == "__main__":
    # Test des Computergegners
    opponent = create_computer_player('O', 'random')
    
    # Ein Test-Brett (einige Züge sind bereits gemacht)
    test_board = [
        ['X', 'O', ''],
        ['', 'X', ''],
        ['', '', '']
    ]
    
    print("Test-Brett:")
    for row in test_board:
        print(row)
    
    move = opponent.get_move(test_board)
    print(f"\nComputer setzt auf: {move}")
    
    # Zeige verfügbare Züge
    available = opponent.get_available_moves(test_board)
    print(f"Verfügbare Züge: {available}")