# CMakeLists.txt - Build configuration for Prime Number Checker
# Requires CMake 3.10 or higher

cmake_minimum_required(VERSION 3.10)

# Project name and language
project(PrimeChecker LANGUAGES CXX)

# Set C++ standard to C++17
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Enable additional warnings for better code quality
if(CMAKE_CXX_COMPILER_ID MATCHES "GNU|Clang")
    add_compile_options(-Wall -Wextra -pedantic)
endif()

# Create the executable
add_executable(primecheck src/main.cpp src/prime.cpp)

# Install target (optional)
install(TARGETS primecheck DESTINATION bin)