/**
 * @file prime.h
 * @brief Header file for prime number checking functionality.
 * 
 * This header provides the declaration of the isPrime function
 * which determines whether a given integer is a prime number.
 */

#ifndef PRIME_H
#define PRIME_H

/**
 * @brief Checks if a given integer is a prime number.
 * 
 * This function implements an efficient primality test using the
 * following algorithm:
 * - Returns false for n <= 1 (not prime by definition)
 * - Returns true for n == 2 (smallest prime)
 * - Returns false for even numbers > 2
 * - For odd numbers, checks only odd divisors up to sqrt(n)
 * 
 * Time complexity: O(sqrt(n))
 * Space complexity: O(1)
 * 
 * @param n The integer to check for primality.
 * @return true if n is a prime number, false otherwise.
 */
bool isPrime(int n);

#endif // PRIME_H