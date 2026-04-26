/**
 * @file prime.h
 * @brief Header file for prime number checking functionality.
 * 
 * This file declares the isPrime function which determines whether
 * a given integer is a prime number.
 */

#ifndef PRIME_H
#define PRIME_H

/**
 * @brief Checks if a given integer is a prime number.
 * 
 * This function efficiently determines primality using the 6k±1 optimization.
 * Numbers less than or equal to 1 are not considered prime.
 * 
 * @param n The integer to check for primality.
 * @return true if n is a prime number, false otherwise.
 * 
 * @note Handles negative numbers, 0, and 1 correctly (returns false).
 * @note Uses the 6k±1 optimization for efficiency: all primes > 3 are of form 6k±1.
 * 
 * Time Complexity: O(√n) with approximately √n/3 iterations due to optimization.
 * Space Complexity: O(1)
 */
bool isPrime(int n);

#endif // PRIME_H