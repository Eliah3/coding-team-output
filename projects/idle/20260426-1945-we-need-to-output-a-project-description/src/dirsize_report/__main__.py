#!/usr/bin/env python3
"""
Main entry point for the dirsize-report command-line tool.

This module sets up the argument parser and orchestrates the scanning
and output process based on user-provided arguments.
"""

import argparse
import sys
from pathlib import Path

from .scanner import DirectoryScanner
from .formatter import OutputFormatter
from .ignore import IgnoreManager


def create_argument_parser() -> argparse.ArgumentParser:
    """
    Create and configure the argument parser for the CLI.
    
    Returns:
        Configured ArgumentParser instance
    """
    parser = argparse.ArgumentParser(
        prog="dirsize-report",
        description="Analyze directory storage usage and identify large folders.",
        epilog="Example: dirsize-report /path/to/dir --depth 2 --format json --output results.json",
    )
    
    parser.add_argument(
        "directory",
        nargs="?",
        default=".",
        help="Target directory to analyze (default: current directory)",
    )
    
    parser.add_argument(
        "--depth", "-d",
        type=int,
        default=None,
        help="Maximum directory depth to scan (None = unlimited)",
    )
    
    parser.add_argument(
        "--format", "-f",
        choices=["console", "json", "csv"],
        default="console",
        help="Output format (default: console)",
    )
    
    parser.add_argument(
        "--output", "-o",
        type=Path,
        default=None,
        help="Output file path (if not specified, output to console)",
    )
    
    parser.add_argument(
        "--ignore-file",
        type=Path,
        default=".dirsizeignore",
        help="Path to ignore file (default: .dirsizeignore in target directory)",
    )
    
    parser.add_argument(
        "--show-progress", "-p",
        action="store_true",
        help="Show progress bar during scanning (requires tqdm)",
    )
    
    parser.add_argument(
        "--top", "-t",
        type=int,
        default=None,
        help="Show only top N results (useful for large directories)",
    )
    
    parser.add_argument(
        "--version",
        action="version",
        version="%(prog)s 1.0.0",
    )
    
    return parser


def main() -> int:
    """
    Main function that orchestrates the entire process.
    
    Returns:
        Exit code (0 for success, non-zero for errors)
    """
    parser = create_argument_parser()
    args = parser.parse_args()
    
    # Resolve target directory
    target_dir = Path(args.directory).resolve()
    
    if not target_dir.exists():
        parser.error(f"Directory does not exist: {target_dir}")
        return 1
    
    if not target_dir.is_dir():
        parser.error(f"Path is not a directory: {target_dir}")
        return 1
    
    # Initialize ignore manager
    ignore_file_path = target_dir / args.ignore_file if args.ignore_file else None
    ignore_manager = IgnoreManager(ignore_file_path)
    
    # Initialize scanner
    scanner = DirectoryScanner(
        show_progress=args.show_progress,
        max_depth=args.depth,
    )
    
    # Perform scan
    try:
        results = scanner.scan(target_dir, ignore_manager)
    except PermissionError as e:
        parser.error(f"Permission denied: {e}")
        return 1
    except Exception as e:
        parser.error(f"Scan failed: {e}")
        return 1
    
    # Sort results by size (descending)
    results.sort(key=lambda x: x.size, reverse=True)
    
    # Apply top N filter if specified
    if args.top is not None and args.top > 0:
        results = results[:args.top]
    
    # Format and output results
    formatter = OutputFormatter()
    
    try:
        if args.format == "console":
            output = formatter.format_console(results)
            if args.output:
                args.output.write_text(output)
            else:
                print(output)
        elif args.format == "json":
            output = formatter.format_json(results)
            if args.output:
                args.output.write_text(output)
            else:
                print(output)
        elif args.format == "csv":
            output = formatter.format_csv(results)
            if args.output:
                args.output.write_text(output)
            else:
                print(output)
    except IOError as e:
        parser.error(f"Failed to write output: {e}")
        return 1
    
    return 0


if __name__ == "__main__":
    sys.exit(main())