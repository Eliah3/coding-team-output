/**
 * @file test_prime.cpp
 * @brief Unit tests for the isPrime function.
 * 
 * This file contains automated tests to verify the correctness
 * of the isPrime function across various edge cases.
 * 
 * Build: g++ -std=c++17 -o test_prime test_prime.cpp
 * Run: ./test_prime
 */

#include <iostream>
#include <cassert>
#include <vector>
#include "prime.h"

// Helper structure for test cases
struct TestCase {
    int input;
    bool expected;
    const char* description;
};

int main() {
    // Define test cases covering all edge cases
    std::vector<TestCase> testCases = {
        // Edge cases: numbers <= 1
        {-10, false, "negative number (-10)"},
        {-1,  false, "negative one (-1)"},
        {0,   false, "zero"},
        {1,   false, "one"},
        
        // Prime numbers
        {2,   true,  "two (smallest prime)"},
        {3,   true,  "three"},
        {5,   true,  "five"},
        {7,   true,  "seven"},
        {11,  true,  "eleven"},
        {13,  true,  "thirteen"},
        {17,  true,  "seventeen"},
        {19,  true,  "nineteen"},
        {23,  true,  "twenty-three"},
        {97,  true,  "ninety-seven"},
        
        // Non-prime numbers (composite)
        {4,   false, "four (2*2)"},
        {6,   false, "six (2*3)"},
        {8,   false, "eight (2*4)"},
        {9,   false, "nine (3*3)"},
        {10,  false, "ten (2*5)"},
        {12,  false, "twelve (2*6)"},
        {14,  false, "fourteen (2*7)"},
        {15,  false, "fifteen (3*5)"},
        {16,  false, "sixteen (4*4)"},
        {18,  false, "eighteen (2*9)"},
        {20,  false, "twenty (2*10)"},
        {21,  false, "twenty-one (3*7)"},
        
        // Larger numbers
        {100, false, "one hundred"},
        {121, false, "121 = 11*11"},
        {127, true,  "127 (prime)"},
        {128, false, "128 (power of 2)"},
        {169, false, "169 = 13*13"},
        {173, true,  "173 (prime)"}
    };
    
    int passed = 0;
    int failed = 0;
    
    std::cout << "Running " << testCases.size() << " test cases..." << std::endl;
    std::cout << "========================================" << std::endl;
    
    // Run all test cases
    for (const auto& test : testCases) {
        bool result = isPrime(test.input);
        
        if (result == test.expected) {
            std::cout << "[PASS] " << test.description 
                      << " (input: " << test.input << ")" << std::endl;
            passed++;
        } else {
            std::cout << "[FAIL] " << test.description 
                      << " (input: " << test.input << "): "
                      << "expected " << (test.expected ? "true" : "false")
                      << ", got " << (result ? "true" : "false") << std::endl;
            failed++;
        }
    }
    
    std::cout << "========================================" << std::endl;
    std::cout << "Results: " << passed << " passed, " << failed << " failed" << std::endl;
    
    // Exit with error code if any tests failed
    if (failed > 0) {
        std::cout << "SOME TESTS FAILED!" << std::endl;
        return 1;
    }
    
    std::cout << "ALL TESTS PASSED!" << std::endl;
    return 0;
}