""" Primzahl-Prüfungsmodul. Dieses Modul enthält die Funktion `is_prime`, die bestimmt, ob eine gegebene Ganzzahl eine Primzahl ist. Funktionen: is_prime(n: int) -> bool: Prüft, ob eine Zahl eine Primzahl ist. Beispiel: >>> is_prime(7) True >>> is_prime(4) False """
import math
from typing import List, Tuple

def is_prime(n: int) -> bool:
    """ Prüft, ob die übergebene Ganzzahl eine Primzahl ist. Eine Primzahl ist eine natürliche Zahl größer als 1, die keine positiven Teiler außer 1 und sich selbst hat. Parameter ---------- n : int Die zu prüfende Ganzzahl. Rückgabe ------- bool True, wenn n eine Primzahl ist, andernfalls False. Beispiele -------- >>> is_prime(2) True >>> is_prime(15) False >>> is_prime(-5) False Hinweise -------- - Zahlen kleiner als 2 sind keine Primzahlen. - 2 ist die einzige gerade Primzahl. - Für gerade Zahlen größer als 2 wird sofort False zurückgegeben. - Die Funktion prüft nur ungerade Teiler bis zur Quadratwurzel von n. - Zeitkomplexität: O(√n), Speicherkomplexität: O(1). """
    # Spezialfall: Zahlen kleiner als 2 sind keine Primzahlen
    if n < 2:
        return False
    # Spezialfall: 2 ist die einzige gerade Primzahl
    if n == 2:
        return True
    # Alle anderen geraden Zahlen sind keine Primzahlen
    if n % 2 == 0:
        return False
    # Nur ungerade Teiler bis zur Quadratwurzel prüfen
    # Wir beginnen bei 3 und erhöhen um 2 (nur ungerade Zahlen)
    sqrt_n = math.isqrt(n)
    for divisor in range(3, sqrt_n + 1, 2):
        if n % divisor == 0:
            return False
    return True

if __name__ == "__main__":
    # Testfälle gemäß Plan (Schritt 4.6)
    test_cases: List[Tuple[int, bool]] = [
        (-10, False),  # Negative Zahl
        (-1, False),  # Negative Zahl
        (0, False),  # Null
        (1, False),  # Eins (keine Primzahl)
        (2, True),  # Kleinste Primzahl
        (3, True),  # Primzahl
        (4, False),  # Zusammengesetzt (2*2)
        (5, True),  # Primzahl
        (9, False),  # Zusammengesetzt (3*3)
        (11, True),  # Primzahl
        (25, False),  # Zusammengesetzt (5*5)
        (29, True),  # Primzahl
        (97, True),  # Primzahl
        (100, False),  # Zusammengesetzt (10*10)
        (7919, True),  # Bekannte Primzahl
    ]
    print("=" * 60)
    print("Primzahl-Prüfung - Testlauf")
    print("=" * 60)
    all_passed = True
    for n, expected in test_cases:
        result = is_prime(n)
        status = "✓ PASS" if result == expected else "✗ FAIL"
        if result != expected:
            all_passed = False
        print(f"is_prime({n:>4}) = {result:<5} (erwartet: {expected}) [{status}]")
    print("=" * 60)
    if all_passed:
        print("Alle Tests erfolgreich bestanden!")
    else:
        print("FEHLER: Einige Tests sind fehlgeschlagen!")
    print("=" * 60)