/**
 * @file prime.cpp
 * @brief Implementation of prime number checking with user interface.
 * 
 * This file contains:
 * - The isPrime() function implementation
 * - A main() function that demonstrates the usage by reading
 *   user input and displaying the result
 * 
 * Build: g++ -std=c++17 prime.cpp -o prime_checker
 * Or use CMake as described in CMakeLists.txt
 */

#include <iostream>
#include <cmath>
#include <limits>
#include "prime.h"

// ============================================================================
// Implementation of isPrime
// ============================================================================

bool isPrime(int n) {
    // Step 1: Numbers less than or equal to 1 are not prime
    if (n <= 1) {
        return false;
    }
    
    // Step 2: 2 is the smallest prime number
    if (n == 2) {
        return true;
    }
    
    // Step 3: Even numbers greater than 2 are not prime
    if (n % 2 == 0) {
        return false;
    }
    
    // Step 4: For odd numbers, check only odd divisors up to sqrt(n)
    // This reduces the number of iterations by half compared to
    // checking all numbers from 3 to n
    int limit = static_cast<int>(std::sqrt(n));
    
    for (int i = 3; i <= limit; i += 2) {
        if (n % i == 0) {
            return false;  // Found a divisor, not prime
        }
    }
    
    // No divisors found, must be prime
    return true;
}

// ============================================================================
// Main function - User interface
// ============================================================================

int main() {
    int number;
    
    // Prompt user for input
    std::cout << "Enter an integer: ";
    
    // Read input and validate
    if (!(std::cin >> number)) {
        // Input validation failed (e.g., user entered non-numeric characters)
        std::cout << "Error: Invalid input. Please enter a valid integer." << std::endl;
        
        // Clear the error flag and ignore remaining input
        std::cin.clear();
        std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
        
        return 1;  // Exit with error code
    }
    
    // Call isPrime and display result
    // Using ternary operator for concise output
    std::cout << number << (isPrime(number) ? " is prime." : " is not prime.") << std::endl;
    
    return 0;  // Successful execution
}