"""
Tests für das GameWindow Modul
"""

import unittest
import sys
import os

# Füge src zum Pfad hinzu
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

try:
    import tkinter as tk
    from game_window import GameWindow
except ImportError as e:
    print(f"ImportError: {e}")
    tk = None
    GameWindow = None


@unittest.skipIf(tk is None, "Tkinter nicht verfügbar")
class TestGameWindow(unittest.TestCase):
    """Test-Klasse für GameWindow"""
    
    def setUp(self):
        """Setup für jeden Test"""
        self.root = tk.Tk()
        self.game_window = GameWindow(self.root)
    
    def tearDown(self):
        """Cleanup nach jedem Test"""
        try:
            self.root.destroy()
        except:
            pass
    
    def test_initial_state(self):
        """Testet den Initialzustand des Spiels"""
        self.assertEqual(self.game_window.current_player, 'X')
        self.assertFalse(self.game_window.game_over)
        self.assertEqual(self.game_window.player_wins, 0)
        self.assertEqual(self.game_window.ai_wins, 0)
        self.assertEqual(self.game_window.draws, 0)
    
    def test_board_initialization(self):
        """Testet die Initialisierung des Spielfelds"""
        expected_board = [['' for _ in range(3)] for _ in range(3)]
        self.assertEqual(self.game_window.board, expected_board)
    
    def test_make_move(self):
        """Testet das Ausführen eines Zuges"""
        self.game_window._make_move(0, 0)
        
        self.assertEqual(self.game_window.board[0][0], 'X')
        self.assertEqual(self.game_window.buttons[0][0].cget('text'), 'X')
    
    def test_check_winner_row(self):
        """Testet die Gewinnprüfung in einer Reihe"""
        # X gewinnt in der ersten Reihe
        self.game_window.board = [
            ['X', 'X', 'X'],
            ['O', '', ''],
            ['', '', '']
        ]
        
        self.assertTrue(self.game_window._check_winner())
    
    def test_check_winner_column(self):
        """Testet die Gewinnprüfung in einer Spalte"""
        # X gewinnt in der ersten Spalte
        self.game_window.board = [
            ['X', 'O', ''],
            ['X', '', ''],
            ['X', '', '']
        ]
        
        self.assertTrue(self.game_window._check_winner())
    
    def test_check_winner_diagonal(self):
        """Testet die Gewinnprüfung auf einer Diagonale"""
        # X gewinnt auf der Hauptdiagonale
        self.game_window.board = [
            ['X', 'O', ''],
            ['O', 'X', ''],
            ['', '', 'X']
        ]
        
        self.assertTrue(self.game_window._check_winner())
    
    def test_check_winner_anti_diagonal(self):
        """Testet die Gewinnprüfung auf der Nebendiagonale"""
        # X gewinnt auf der Nebendiagonale
        self.game_window.board = [
            ['', 'O', 'X'],
            ['O', 'X', ''],
            ['X', '', '']
        ]
        
        self.assertTrue(self.game_window._check_winner())
    
    def test_check_no_winner(self):
        """Testet die Gewinnprüfung wenn kein Gewinner vorhanden ist"""
        self.game_window.board = [
            ['X', 'O', 'X'],
            ['X', 'O', 'O'],
            ['O', 'X', 'X']
        ]
        
        self.assertFalse(self.game_window._check_winner())
    
    def test_check_draw(self):
        """Testet die Unentschieden-Prüfung"""
        self.game_window.board = [
            ['X', 'O', 'X'],
            ['X', 'O', 'O'],
            ['O', 'X', 'X']
        ]
        
        self.assertTrue(self.game_window._check_draw())
    
    def test_check_no_draw(self):
        """Testet die Unentschieden-Prüfung wenn noch Züge möglich sind"""
        self.game_window.board = [
            ['X', 'O', 'X'],
            ['X', '', 'O'],
            ['O', 'X', 'X']
        ]
        
        self.assertFalse(self.game_window._check_draw())
    
    def test_restart_game(self):
        """Testet das Neustarten des Spiels"""
        # Setze einige Werte
        self.game_window.current_player = 'O'
        self.game_window.board[0][0] = 'X'
        self.game_window.game_over = True
        self.game_window.player_wins = 1
        self.game_window.ai_wins = 1
        self.game_window.draws = 1
        
        # Neustart
        self.game_window.restart_game()
        
        # Prüfe ob alles zurückgesetzt wurde
        self.assertEqual(self.game_window.current_player, 'X')
        self.assertFalse(self.game_window.game_over)
        self.assertEqual(self.game_window.board[0][0], '')
        self.assertEqual(self.game_window.player_wins, 1)  # Sollte nicht zurückgesetzt werden
        self.assertEqual(self.game_window.ai_wins, 1)
        self.assertEqual(self.game_window.draws, 1)
    
    def test_score_text(self):
        """Testet die Erstellung des Score-Textes"""
        self.game_window.player_wins = 3
        self.game_window.ai_wins = 2
        self.game_window.draws = 1
        
        score_text = self.game_window._get_score_text()
        
        self.assertEqual(score_text, "Spieler X: 3 | Unentschieden: 1 | Spieler O: 2")


if __name__ == '__main__':
    unittest.main()