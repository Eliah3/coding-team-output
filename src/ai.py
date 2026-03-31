"""
TicTacToe KI
Implementiert einen intelligenten Computer-Gegner
"""

import random
from typing import List, Tuple, Optional
from game_logic import TicTacToeGame, Player, GameState


class TicTacToeAI:
    """
    KI für TicTacToe mit mehreren Schwierigkeitsstufen
    """
    
    def __init__(self, difficulty: str = "hard"):
        """
        Initialisiert die KI
        
        Args:
            difficulty: "easy", "medium" oder "hard"
        """
        self.difficulty = difficulty
    
    def get_best_move(self, game: TicTacToeGame) -> Optional[Tuple[int, int]]:
        """
        Berechnet den besten Zug für die KI
        
        Args:
            game: Aktuelle Spielinstanz
            
        Returns:
            Tuple (row, col) oder None wenn kein Zug möglich
        """
        available_moves = game.get_available_moves()
        
        if not available_moves:
            return None
        
        if self.difficulty == "easy":
            return self._get_random_move(available_moves)
        elif self.difficulty == "medium":
            return self._get_medium_move(game, available_moves)
        else:  # hard
            return self._get_minimax_move(game, available_moves)
    
    def _get_random_move(self, available_moves: List[Tuple[int, int]]) -> Tuple[int, int]:
        """Wählt einen zufälligen Zug (einfach)"""
        return random.choice(available_moves)
    
    def _get_medium_move(self, game: TicTacToeGame, 
                         available_moves: List[Tuple[int, int]]) -> Tuple[int, int]:
        """
        Mittlere Schwierigkeit: Nutzt Minimax mit geringer Tiefe
        oder zufällige Züge (50/50 Chance)
        """
        if random.random() < 0.5:
            # 50% Chance für optimalen Zug
            return self._get_minimax_move(game, available_moves)
        else:
            # 50% Chance für zufälligen Zug
            return self._get_random_move(available_moves)
    
    def _get_minimax_move(self, game: TicTacToeGame,
                          available_moves: List[Tuple[int, int]]) -> Tuple[int, int]:
        """
        Verwendet den Minimax-Algorithmus für optimale Züge (schwer)
        """
        # Bestimme ob KI X oder O ist
        ai_player = game.current_player
        
        best_score = float('-inf') if ai_player == Player.X else float('inf')
        best_move = available_moves[0]
        
        for row, col in available_moves:
            # Simuliere Zug
            game.board[row][col] = ai_player
            
            # Berechne Score mit Minimax
            score = self._minimax(
                game, 
                depth=0, 
                is_maximizing=(ai_player == Player.O),
                ai_player=ai_player
            )
            
            # Rückgängig machen
            game.board[row][col] = None
            
            # Wähle besten Zug
            if ai_player == Player.X:
                if score > best_score:
                    best_score = score
                    best_move = (row, col)
            else:
                if score < best_score:
                    best_score = score
                    best_move = (row, col)
        
        return best_move
    
    def _minimax(self, game: TicTacToeGame, depth: int, 
                 is_maximizing: bool, ai_player: Player) -> float:
        """
        Rekursiver Minimax-Algorithmus
        
        Args:
            game: Spielinstanz
            depth: Aktuelle Tiefe
            is_maximizing: Ob aktueller Spieler maximiert
            ai_player: Der Spieler für den die KI optimiert
            
        Returns:
            Bewertung des Spielstands
        """
        # Prüfe Endzustand
        winner = self._check_winner_static(game)
        
        if winner == ai_player:
            return 10 - depth  # Gewinn (je schneller, desto besser)
        elif winner == ai_player.opponent():
            return depth - 10  # Niederlage (je später, desto besser)
        elif game._is_board_full():
            return 0  # Unentschieden
        
        available_moves = game.get_available_moves()
        
        if is_maximizing:
            best_score = float('-inf')
            for row, col in available_moves:
                game.board[row][col] = Player.X
                score = self._minimax(game, depth + 1, False, ai_player)
                game.board[row][col] = None
                best_score = max(score, best_score)
            return best_score
        else:
            best_score = float('inf')
            for row, col in available_moves:
                game.board[row][col] = Player.O
                score = self._minimax(game, depth + 1, True, ai_player)
                game.board[row][col] = None
                best_score = min(score, best_score)
            return best_score
    
    def _check_winner_static(self, game: TicTacToeGame) -> Optional[Player]:
        """Prüft Gewinner (statische Version für Minimax)"""
        n = game.board_size
        
        # Zeilen
        for row in range(n):
            if game.board[row][0] and all(
                game.board[row][col] == game.board[row][0] 
                for col in range(n)
            ):
                return game.board[row][0]
        
        # Spalten
        for col in range(n):
            if game.board[0][col] and all(
                game.board[row][col] == game.board[0][col] 
                for row in range(n)
            ):
                return game.board[0][col]
        
        # Diagonale
        if game.board[0][0] and all(
            game.board[i][i] == game.board[0][0] for i in range(n)
        ):
            return game.board[0][0]
        
        # Anti-Diagonale
        if game.board[0][n-1] and all(
            game.board[i][n-1-i] == game.board[0][n-1] for i in range(n)
        ):
            return game.board[0][n-1]
        
        return None


def play_ai_turn(game: TicTacToeGame, ai: TicTacToeAI) -> bool:
    """
    Führt einen KI-Zug aus
    
    Args:
        game: Spielinstanz
        ai: KI-Instanz
        
    Returns:
        True wenn Zug erfolgreich
    """
    move = ai.get_best_move(game)
    if move:
        row, col = move
        return game.make_move(row, col)
    return False


# Beispiel für strategische Funktionen
def find_winning_move(game: TicTacToeGame, player: Player) -> Optional[Tuple[int, int]]:
    """
    Findet einen Zug der direkt gewinnt
    
    Args:
        game: Spielinstanz
        player: Der Spieler für den der Gewinnzug gesucht wird
        
    Returns:
        Gewinnzug oder None
    """
    for row, col in game.get_available_moves():
        game.board[row][col] = player
        winner = game._check_winner()
        game.board[row][col] = None
        
        if winner == player:
            return (row, col)
    return None


def find_blocking_move(game: TicTacToeGame, player: Player) -> Optional[Tuple[int, int]]:
    """
    Findet einen Zug der den Gegner blockt
    
    Args:
        game: Spielinstanz
        player: Der Spieler der blocken soll
        
    Returns:
        Blockzug oder None
    """
    opponent = player.opponent()
    return find_winning_move(game, opponent)


def get_corner_moves(game: TicTacToeGame) -> List[Tuple[int, int]]:
    """Gibt alle freien Ecken zurück"""
    n = game.board_size
    corners = [(0, 0), (0, n-1), (n-1, 0), (n-1, n-1)]
    return [(r, c) for r, c in corners if game.board[r][c] is None]


def get_center_move(game: TicTacToeGame) -> Optional[Tuple[int, int]]:
    """Gibt das Zentrum zurück falls frei"""
    n = game.board_size
    center = n // 2
    if game.board[center][center] is None:
        return (center, center)
    return None