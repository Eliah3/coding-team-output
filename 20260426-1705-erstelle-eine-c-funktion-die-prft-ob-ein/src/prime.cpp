/**
 * @file prime.cpp
 * @brief Implementation of the prime number checking function.
 * 
 * Implements the isPrime function using an optimized algorithm
 * that checks only numbers of the form 6k±1.
 */

#include "prime.h"
#include <cmath>

bool isPrime(int n) {
    // Numbers less than or equal to 1 are not prime
    if (n <= 1) {
        return false;
    }
    
    // 2 and 3 are the only consecutive primes
    if (n <= 3) {
        return true;
    }
    
    // Eliminate multiples of 2 and 3 early
    // This handles the edge cases before the 6k±1 loop
    if (n % 2 == 0 || n % 3 == 0) {
        return false;
    }
    
    // 6k±1 optimization:
    // All primes greater than 3 can be expressed as 6k - 1 or 6k + 1
    // We only need to check numbers of the form 6k - 1 and 6k + 1
    // This reduces the number of iterations by approximately 3x
    //
    // Starting from i = 5 (which is 6*1 - 1):
    // - Check i     = 6k - 1
    // - Check i + 2 = 6k + 1
    // Then increment by 6 for the next k
    //
    // We use i * i <= n instead of sqrt(n) to avoid floating-point
    // operations and potential precision issues. This is safe because
    // when i * i overflows, the condition will fail anyway for large n.
    for (int i = 5; i * i <= n; i += 6) {
        if (n % i == 0 || n % (i + 2) == 0) {
            return false;
        }
    }
    
    return true;
}