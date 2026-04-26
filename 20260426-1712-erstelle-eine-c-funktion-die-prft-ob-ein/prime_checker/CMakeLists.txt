# CMakeLists.txt - Build configuration for Prime Checker project
# 
# Usage:
#   mkdir build
#   cd build
#   cmake ..
#   make
#   ./prime_checker

# Minimum CMake version required
cmake_minimum_required(VERSION 3.10)

# Project name and language
project(PrimeChecker LANGUAGES CXX)

# Set C++ standard to C++17
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Enable additional warnings for better code quality
if(CMAKE_CXX_COMPILER_ID MATCHES "GNU|Clang")
    add_compile_options(-Wall -Wextra -pedantic)
elseif(MSVC)
    add_compile_options(/W4)
endif()

# Create the executable
add_executable(prime_checker prime.cpp)

# Optional: Install target (installs to /usr/local/bin on Unix-like systems)
install(TARGETS prime_checker DESTINATION bin)