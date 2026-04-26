"""
Directory scanning and size calculation for dirsize-report.

This module contains the core scanning logic that recursively traverses
directories and calculates the size of each subdirectory.
"""

import os
from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional, Iterator, Set

# Try to import tqdm for progress bar, but make it optional
try:
    from tqdm import tqdm
    TQDM_AVAILABLE = True
except ImportError:
    TQDM_AVAILABLE = False

from .ignore import IgnoreManager


@dataclass
class ScanResult:
    """
    Represents the result of scanning a single directory.
    
    Attributes:
        path: Full path to the directory
        name: Directory name (basename)
        size: Total size in bytes
        file_count: Number of files in the directory
        dir_count: Number of subdirectories
    """
    path: Path
    name: str
    size: int
    file_count: int
    dir_count: int
    
    def __repr__(self) -> str:
        return f"ScanResult(path={self.path}, size={self.size})"


class DirectoryScanner:
    """
    Scans directories and calculates their sizes recursively.
    
    This class handles the core functionality of traversing directory
    trees, calculating sizes, and applying ignore patterns.
    """
    
    def __init__(
        self,
        show_progress: bool = False,
        max_depth: Optional[int] = None,
    ):
        """
        Initialize the DirectoryScanner.
        
        Args:
            show_progress: Whether to show progress bar during scanning
            max_depth: Maximum depth to scan (None for unlimited)
        """
        self.show_progress = show_progress and TQDM_AVAILABLE
        self.max_depth = max_depth
        
        # Default patterns to always ignore
        self._default_ignore: Set[str] = {
            ".git",
            ".svn",
            ".hg",
            "__pycache__",
            ".pytest_cache",
            ".mypy_cache",
        }
    
    def scan(
        self,
        root_path: Path,
        ignore_manager: Optional[IgnoreManager] = None,
    ) -> List[ScanResult]:
        """
        Scan a directory and calculate sizes of all subdirectories.
        
        Args:
            root_path: Root directory to scan
            ignore_manager: Manager for ignore patterns
            
        Returns:
            List of ScanResult objects sorted by size (descending)
        """
        results: List[ScanResult] = []
        
        # First, get the size of the root directory itself
        root_size, root_files, root_dirs = self._calculate_directory_size(
            root_path,
            ignore_manager,
            current_depth=0,
        )
        
        # Add root directory to results
        results.append(ScanResult(
            path=root_path,
            name=root_path.name or str(root_path),
            size=root_size,
            file_count=root_files,
            dir_count=root_dirs,
        ))
        
        # Then scan all subdirectories
        subdirs = self._get_subdirectories(root_path, ignore_manager, current_depth=0)
        
        # Use progress bar if available and requested
        if self.show_progress:
            iterator = tqdm(subdirs, desc="Scanning directories", unit="dir")
        else:
            iterator = subdirs
        
        for subdir in iterator:
            size, file_count, dir_count = self._calculate_directory_size(
                subdir,
                ignore_manager,
                current_depth=1,  # Start at depth 1 for subdirectories
            )
            
            results.append(ScanResult(
                path=subdir,
                name=subdir.name,
                size=size,
                file_count=file_count,
                dir_count=dir_count,
            ))
        
        return results
    
    def _get_subdirectories(
        self,
        directory: Path,
        ignore_manager: Optional[IgnoreManager],
        current_depth: int,
    ) -> List[Path]:
        """
        Get all subdirectories of a directory recursively.
        
        Args:
            directory: Directory to scan
            ignore_manager: Manager for ignore patterns
            current_depth: Current recursion depth
            
        Returns:
            List of subdirectory paths
        """
        subdirs: List[Path] = []
        
        # Check depth limit
        if self.max_depth is not None and current_depth >= self.max_depth:
            return subdirs
        
        try:
            for entry in os.scandir(directory):
                if not entry.is_dir(follow_symlinks=False):
                    continue
                
                entry_path = Path(entry.path)
                
                # Check if should be ignored
                if self._should_ignore_entry(entry_path, ignore_manager):
                    continue
                
                # Add this directory
                subdirs.append(entry_path)
                
                # Recursively get subdirectories
                subdirs.extend(self._get_subdirectories(
                    entry_path,
                    ignore_manager,
                    current_depth + 1,
                ))
                
        except (PermissionError, OSError):
            # Skip directories we can't access
            pass
        
        return subdirs
    
    def _should_ignore_entry(
        self,
        path: Path,
        ignore_manager: Optional[IgnoreManager],
    ) -> bool:
        """
        Check if an entry should be ignored.
        
        Args:
            path: Path to check
            ignore_manager: Manager for ignore patterns
            
        Returns:
            True if should be ignored, False otherwise
        """
        # Check default ignore patterns
        if path.name in self._default_ignore:
            return True
        
        # Check custom ignore patterns
        if ignore_manager and ignore_manager.should_ignore(path):
            return True
        
        return False
    
    def _calculate_directory_size(
        self,
        directory: Path,
        ignore_manager: Optional[IgnoreManager],
        current_depth: int,
    ) -> tuple[int, int, int]:
        """
        Calculate the total size of a directory recursively.
        
        Args:
            directory: Directory to calculate size for
            ignore_manager: Manager for ignore patterns
            current_depth: Current recursion depth
            
        Returns:
            Tuple of (total_size, file_count, dir_count)
        """
        total_size = 0
        file_count = 0
        dir_count = 0
        
        try:
            for entry in os.scandir(directory):
                try:
                    if entry.is_file(follow_symlinks=False):
                        # Add file size
                        total_size += entry.stat(follow_symlinks=False).st_size
                        file_count += 1
                        
                    elif entry.is_dir(follow_symlinks=False):
                        entry_path = Path(entry.path)
                        
                        # Check if should be ignored
                        if self._should_ignore_entry(entry_path, ignore_manager):
                            continue
                        
                        # Check depth limit
                        if self.max_depth is not None and current_depth >= self.max_depth:
                            continue
                        
                        # Recursively calculate subdirectory size
                        sub_size, sub_files, sub_dirs = self._calculate_directory_size(
                            entry_path,
                            ignore_manager,
                            current_depth + 1

---

Review-Bericht:

Nach sorgfältiger Prüfung des bereitgestellten Codes haben wir folgende Punkte identifiziert, die verbessert oder korrigiert werden sollten:

1. **Bugs und logische Fehler**:
   - Im `DirectoryScanner`-Modul fehlt eine Fehlerbehandlung für den Fall, dass die `ignore_manager`-Instanz `None` ist, wenn die `_should_ignore_entry`-Methode aufgerufen wird. Dies könnte zu einem `AttributeError` führen, wenn versucht wird, auf `ignore_manager.should_ignore` zuzugreifen.
   - In der `_get_subdirectories`-Methode des `DirectoryScanner` wird nicht geprüft, ob die `ignore_manager`-Instanz `None` ist, bevor versucht wird, auf ihre Methoden zuzugreifen. Dies könnte ebenfalls zu einem `AttributeError` führen.

2. **Sicherheitslücken**:
   - Es gibt keine offensichtlichen Sicherheitslücken im bereitgestellten Code. Der Code vermeidet jedoch das direkte Ausführen von Benutzereingaben oder das Öffnen von Dateien ohne entsprechende Fehlerbehandlung, was positiv zu bewerten ist.

3. **Performance-Probleme**:
   - Der Code verwendet rekursive Funktionen, um Verzeichnisse zu durchlaufen. Für sehr tiefe Verzeichnisbäume könnte dies zu einem StackOverflow führen. Eine iterative Lösung könnte hier performanter und robuster sein.
   - Die Verwendung von `os.scandir` ist effizienter als `os.listdir`, da es weniger Systemaufrufe erfordert und zusätzliche Informationen über die Dateieinträge liefert.

4. **Abweichungen vom ursprünglichen Plan**:
   - Der Code entspricht im Wesentlichen den Erwartungen und dem ursprünglichen Plan. Es gibt jedoch keine explizite Dokumentation oder Kommentare, die den Plan oder die Designentscheidungen hinter dem Code erläutern.

5. **Code-Qualität und Lesbarkeit**:
   - Der Code ist im Allgemeinen gut strukturiert und lesbar. Die Verwendung von Typ-Hinweisen und Docstrings verbessert die Lesbarkeit und hilft anderen Entwicklern, den Code zu verstehen.
   - Es gibt jedoch einige lange Methoden (z.B. `scan` in `DirectoryScanner`), die in kleinere, fokussiertere Funktionen aufgeteilt werden könnten, um die Lesbarkeit und Wartbarkeit zu verbessern.

Korrigierter Code:

Um die identifizierten Probleme zu beheben, sollten die folgenden Änderungen vorgenommen werden: