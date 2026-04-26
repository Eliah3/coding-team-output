"""
dirsize-report - A command-line tool to analyze directory storage usage.

This package provides functionality to recursively scan directories,
calculate folder sizes, and output results in various formats.
"""

__version__ = "1.0.0"
__author__ = "Developer"
__license__ = "MIT"

from .scanner import DirectoryScanner, ScanResult
from .formatter import OutputFormatter
from .ignore import IgnoreManager

__all__ = [
    "DirectoryScanner",
    "ScanResult",
    "OutputFormatter",
    "IgnoreManager",
]