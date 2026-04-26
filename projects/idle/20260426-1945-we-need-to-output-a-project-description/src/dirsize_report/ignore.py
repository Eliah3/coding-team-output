"""
Ignore pattern management for dirsize-report.

This module handles reading and matching patterns from .dirsizeignore
files to exclude certain directories from scanning.
"""

import fnmatch
import re
from pathlib import Path
from typing import List, Optional, Set


class IgnoreManager:
    """
    Manages ignore patterns for directory scanning.
    
    Supports patterns from .dirsizeignore files including:
    - Exact directory names (e.g., ".git")
    - Glob patterns (e.g., "node_modules", "*.tmp")
    - Comments (lines starting with #)
    - Empty lines (ignored)
    """
    
    def __init__(self, ignore_file_path: Optional[Path] = None):
        """
        Initialize the IgnoreManager.
        
        Args:
            ignore_file_path: Path to the .dirsizeignore file
        """
        self.patterns: List[str] = []
        self._compiled_patterns: List[re.Pattern] = []
        
        if ignore_file_path and ignore_file_path.exists():
            self._load_patterns(ignore_file_path)
    
    def _load_patterns(self, ignore_file_path: Path) -> None:
        """
        Load ignore patterns from file.
        
        Args:
            ignore_file_path: Path to the ignore file
        """
        try:
            with open(ignore_file_path, "r", encoding="utf-8") as f:
                for line in f:
                    # Strip whitespace and comments
                    line = line.strip()
                    
                    # Skip empty lines and comments
                    if not line or line.startswith("#"):
                        continue
                    
                    self.patterns.append(line)
                    # Compile regex pattern for efficient matching
                    # Convert glob patterns to regex
                    regex_pattern = self._glob_to_regex(line)
                    self._compiled_patterns.append(re.compile(regex_pattern))
                    
        except (IOError, OSError) as e:
            # Silently ignore file read errors
            pass
    
    def _glob_to_regex(self, pattern: str) -> str:
        """
        Convert a glob pattern to a regular expression.
        
        Args:
            pattern: Glob pattern string
            
        Returns:
            Regular expression pattern string
        """
        # Escape special regex characters except * and ?
        # Then convert glob wildcards to regex
        regex = re.escape(pattern)
        regex = regex.replace(r"\*", ".*")  # * matches any characters
        regex = regex.replace(r"\?", ".")   # ? matches single character
        return f"^{regex}$"
    
    def should_ignore(self, path: Path) -> bool:
        """
        Check if a path should be ignored based on patterns.
        
        Args:
            path: Path to check
            
        Returns:
            True if path matches any ignore pattern, False otherwise
        """
        path_name = path.name
        
        for pattern in self._compiled_patterns:
            if pattern.match(path_name):
                return True
        
        return False
    
    def get_default_patterns(self) -> Set[str]:
        """
        Get default ignore patterns that are always applied.
        
        Returns:
            Set of default pattern strings
        """
        return {
            ".git",
            ".svn",
            ".hg",
            "__pycache__",
            ".pytest_cache",
            ".mypy_cache",
            "node_modules",
            ".DS_Store",
            "Thumbs.db",
        }


# Default ignore manager with common patterns
def get_default_ignore_manager() -> IgnoreManager:
    """
    Get an IgnoreManager with default patterns.
    
    Returns:
        IgnoreManager instance with default patterns
    """
    manager = IgnoreManager()
    return manager