"""
game_logic.py - Spiellogik für Tic-Tac-Toe

Dieses Modul enthält alle Funktionen zur Verwaltung des Spielablaufs,
einschließlich Gewinn- und Verlustprüfungen.
"""

from typing import Optional, Tuple, List


# Konstanten für die Spieler
PLAYER_X = 'X'
PLAYER_O = 'O'
EMPTY = ''

# Alle möglichen Gewinnkombinationen (Zeilen, Spalten, Diagonalen)
WINNING_COMBINATIONS = [
    # Horizontale Reihen
    [(0, 0), (0, 1), (0, 2)],  # Obere Reihe
    [(1, 0), (1, 1), (1, 2)],  # Mittlere Reihe
    [(2, 0), (2, 1), (2, 2)],  # Untere Reihe
    # Vertikale Reihen
    [(0, 0), (1, 0), (2, 0)],  # Linke Spalte
    [(0, 1), (1, 1), (2, 1)],  # Mittlere Spalte
    [(0, 2), (1, 2), (2, 2)],  # Rechte Spalte
    # Diagonalen
    [(0, 0), (1, 1), (2, 2)],  # Hauptdiagonale
    [(0, 2), (1, 1), (2, 0)],  # Nebendiagonale
]


def create_empty_board() -> List[List[str]]:
    """
    Erstellt ein leeres 3x3 Spielfeld.
    
    Returns:
        List[List[str]]: Ein 3x3 Spielfeld mit leeren Zeichenketten
    """
    return [[EMPTY for _ in range(3)] for _ in range(3)]


def is_valid_move(board: List[List[str]], row: int, col: int) -> bool:
    """
    Prüft, ob ein Zug gültig ist.
    
    Args:
        board: Das aktuelle Spielfeld
        row: Die Zeilenposition (0-2)
        col: Die Spaltenposition (0-2)
    
    Returns:
        bool: True wenn der Zug gültig ist, sonst False
    """
    if not (0 <= row <= 2 and 0 <= col <= 2):
        return False
    return board[row][col] == EMPTY


def make_move(board: List[List[str]], row: int, col: int, player: str) -> bool:
    """
    Führt einen Zug auf dem Spielfeld aus.
    
    Args:
        board: Das aktuelle Spielfeld
        row: Die Zeilenposition (0-2)
        col: Die Spaltenposition (0-2)
        player: Der Spieler ('X' oder 'O')
    
    Returns:
        bool: True wenn der Zug erfolgreich war, sonst False
    """
    if is_valid_move(board, row, col):
        board[row][col] = player
        return True
    return False


def check_winner(board: List[List[str]]) -> Optional[str]:
    """
    Prüft, ob es einen Gewinner auf dem Spielfeld gibt.
    
    Args:
        board: Das aktuelle Spielfeld
    
    Returns:
        Optional[str]: 'X' wenn Spieler X gewonnen hat, 'O' wenn Spieler O 
                       gewonnen hat, None wenn kein Gewinner existiert
    """
    for combination in WINNING_COMBINATIONS:
        values = [board[row][col] for row, col in combination]
        
        # Prüfe ob alle drei Positionen gleich und nicht leer sind
        if values[0] != EMPTY and values[0] == values[1] == values[2]:
            return values[0]
    
    return None


def check_loss(board: List[List[str]], player: str) -> bool:
    """
    Prüft, ob ein bestimmter Spieler verloren hat.
    
    Args:
        board: Das aktuelle Spielfeld
        player: Der zu prüfende Spieler ('X' oder 'O')
    
    Returns:
        bool: True wenn der Spieler verloren hat, sonst False
    """
    winner = check_winner(board)
    if winner is not None:
        return winner != player
    return False


def is_board_full(board: List[List[str]]) -> bool:
    """
    Prüft, ob das Spielfeld vollständig belegt ist.
    
    Args:
        board: Das aktuelle Spielfeld
    
    Returns:
        bool: True wenn das Spielfeld voll ist, sonst False
    """
    for row in board:
        for cell in row:
            if cell == EMPTY:
                return False
    return True


def is_game_over(board: List[List[str]]) -> bool:
    """
    Prüft, ob das Spiel beendet ist (Gewinner oder Unentschieden).
    
    Args:
        board: Das aktuelle Spielfeld
    
    Returns:
        bool: True wenn das Spiel beendet ist, sonst False
    """
    return check_winner(board) is not None or is_board_full(board)


def get_winner_message(winner: Optional[str]) -> str:
    """
    Gibt eine entsprechende Nachricht basierend auf dem Gewinner zurück.
    
    Args:
        winner: Der Gewinner ('X', 'O') oder None bei Unentschieden
    
    Returns:
        str: Eine Nachricht, die das Ergebnis des Spiels beschreibt
    """
    if winner == PLAYER_X:
        return "Spieler X hat gewonnen!"
    elif winner == PLAYER_O:
        return "Spieler O hat gewonnen!"
    else:
        return "Das Spiel endet unentschieden!"


def get_loss_message(loser: str) -> str:
    """
    Gibt eine entsprechende Verlustnachricht für einen Spieler zurück.
    
    Args:
        loser: Der Verlierer ('X' oder 'O')
    
    Returns:
        str: Eine Nachricht, die den Verlust beschreibt
    """
    if loser == PLAYER_X:
        return "Spieler X hat verloren!"
    elif loser == PLAYER_O:
        return "Spieler O hat verloren!"
    else:
        return "Ungültiger Spieler"


def get_game_status(board: List[List[str]], current_player: str) -> Tuple[bool, Optional[str]]:
    """
    Gibt den aktuellen Spielstatus zurück.
    
    Args:
        board: Das aktuelle Spielfeld
        current_player: Der aktuelle Spieler
    
    Returns:
        Tuple[bool, Optional[str]]: (Spiel beendet, Gewinner oder None)
    """
    winner = check_winner(board)
    game_over = winner is not None or is_board_full(board)
    return game_over, winner


def reset_game() -> List[List[str]]:
    """
    Setzt das Spiel zurück und gibt ein neues leeres Spielfeld zurück.
    
    Returns:
        List[List[str]]: Ein neues leeres 3x3 Spielfeld
    """
    return create_empty_board()


# Beispiel für die Verwendung der Funktionen
if __name__ == "__main__":
    # Test des Spielfelds
    board = create_empty_board()
    print("Leeres Spielfeld erstellt:")
    for row in board:
        print(row)
    
    # Test Gewinnprüfung - Spieler X gewinnt horizontal
    board[0] = ['X', 'X', 'X']
    winner = check_winner(board)
    print(f"\nGewinner: {winner}")
    print(f"Nachricht: {get_winner_message(winner)}")
    print(f"Spieler O hat verloren: {check_loss(board, 'O')}")
    
    # Test Unentschieden
    board = [
        ['X', 'O', 'X'],
        ['X', 'O', 'O'],
        ['O', 'X', 'X']
    ]
    print(f"\nUnentschieden? {is_board_full(board) and check_winner(board) is None}")
    print(f"Nachricht: {get_winner_message(None)}")