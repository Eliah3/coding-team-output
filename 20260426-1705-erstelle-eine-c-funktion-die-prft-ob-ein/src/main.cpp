/**
 * @file main.cpp
 * @brief Main program for the Prime Number Checker.
 * 
 * Provides an interactive console interface for checking if user-input
 * numbers are prime.
 */

#include <iostream>
#include <string>
#include <limits>
#include "prime.h"

/**
 * @brief Main entry point of the prime checker program.
 * 
 * Runs an interactive loop that:
 * 1. Prompts the user to enter a number
 * 2. Reads the input (integer or 'q' to quit)
 * 3. Calls isPrime() to check if the number is prime
 * 4. Displays the result
 * 
 * @return 0 on successful exit, non-zero on error
 */
int main() {
    std::cout << "Primzahl-Pruefer (Ende mit EOF oder 'q')\n";
    
    // Main interaction loop - runs until user quits or EOF
    while (true) {
        std::cout << "Zahl eingeben: ";
        
        // Read a line of input from the user
        std::string input;
        if (!std::getline(std::cin, input)) {
            // EOF reached (Ctrl+D) or input stream closed
            std::cout << "\nProgramm beendet.\n";
            break;
        }
        
        // Check if user wants to quit
        if (input == "q" || input == "Q") {
            std::cout << "Programm beendet.\n";
            break;
        }
        
        // Skip empty input
        if (input.empty()) {
            continue;
        }
        
        // Try to convert input to integer
        try {
            // Use std::stoll first to detect overflow before assigning to int
            // This handles the case where input is too large for int
            long long temp = std::stoll(input);
            
            // Check if the number fits in int range
            if (temp < std::numeric_limits<int>::min() || 
                temp > std::numeric_limits<int>::max()) {
                std::cout << "Eingabe ausserhalb des int-Bereichs. "
                          << "Bitte eine Zahl zwischen "
                          << std::numeric_limits<int>::min() << " und "
                          << std::numeric_limits<int>::max() << " eingeben.\n";
                continue;
            }
            
            int num = static_cast<int>(temp);
            
            // Check for primality and display result
            bool result = isPrime(num);
            std::cout << num << " ist " 
                      << (result ? "eine Primzahl." : "keine Primzahl.") 
                      << "\n";
                      
        } catch (const std::invalid_argument&) {
            // std::stoi failed to parse the input as a number
            std::cout << "Ungueltige Eingabe. Bitte eine ganze Zahl eingeben.\n";
        } catch (const std::out_of_range&) {
            // Input number is too large for long long
            std::cout << "Eingabe zu gross. Bitte eine kleinere Zahl eingeben.\n";
        } catch (const std::exception& e) {
            // Catch any other unexpected exceptions
            std::cout << "Unerwarteter Fehler: " << e.what() << "\n";
        }
    }
    
    return 0;
}