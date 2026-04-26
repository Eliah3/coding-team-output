""" Einheitstests für das Primzahl-Prüfungsmodul. Dieses Modul enthält Tests für die Funktion `is_prime` unter Verwendung des unittest-Frameworks. Ausführung: python -m pytest tests/test_prime.py oder python -m unittest tests.test_prime """
import unittest
from src.prime import is_prime

class TestIsPrime(unittest.TestCase):
    """Testklasse für die is_prime-Funktion."""
    def test_negative_numbers(self):
        """Negative Zahlen sind keine Primzahlen."""
        self.assertFalse(is_prime(-10))
        self.assertFalse(is_prime(-1))
        self.assertFalse(is_prime(-100))

    def test_zero_and_one(self):
        """0 und 1 sind keine Primzahlen."""
        self.assertFalse(is_prime(0))
        self.assertFalse(is_prime(1))

    def test_small_primes(self):
        """Kleine Primzahlen (2, 3, 5, 7, 11)."""
        self.assertTrue(is_prime(2))
        self.assertTrue(is_prime(3))
        self.assertTrue(is_prime(5))
        self.assertTrue(is_prime(7))
        self.assertTrue(is_prime(11))

    def test_small_composites(self):
        """Kleine zusammengesetzte Zahlen."""
        self.assertFalse(is_prime(4))  # 2*2
        self.assertFalse(is_prime(6))  # 2*3
        self.assertFalse(is_prime(8))  # 2*4
        self.assertFalse(is_prime(9))  # 3*3
        self.assertFalse(is_prime(10))  # 2*5

    def test_even_numbers(self):
        """Alle geraden Zahlen > 2 sind keine Primzahlen."""
        for n in range(4, 100, 2):
            self.assertFalse(is_prime(n), f"{n} sollte keine Primzahl sein")

    def test_odd_composites(self):
        """Zusammengesetzte ungerade Zahlen."""
        odd_composites = [9, 15, 21, 25, 27, 33, 35, 39, 45, 49, 51, 55, 57, 63, 65, 69, 75, 77, 81, 85, 87, 91, 93, 95, 99]
        for n in odd_composites:
            self.assertFalse(is_prime(n), f"{n} sollte keine Primzahl sein")

    def test_known_primes(self):
        """Bekannte Primzahlen bis 100."""
        known_primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97]
        for n in known_primes:
            self.assertTrue(is_prime(n), f"{n} sollte eine Primzahl sein")

    def test_larger_prime(self):
        """Eine größere bekannte Primzahl."""
        self.assertTrue(is_prime(7919))

    def test_type_error_handling(self):
        """Test mit ungültigen Typen sollte einen Fehler auslösen."""
        with self.assertRaises(TypeError):
            is_prime(3.14)  # Float sollte nicht akzeptiert werden
        with self.assertRaises(TypeError):
            is_prime("7")  # String sollte nicht akzeptiert werden

if __name__ == "__main__":
    unittest.main()