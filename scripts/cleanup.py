#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Cleanup script for CorgPhish project
------------------------------------

This script cleans up the project structure by:
1. Removing duplicated directories
2. Removing build artifacts
3. Organizing remaining files
"""

import os
import shutil
import sys

def print_status(message):
    """Print a status message with formatting."""
    print(f"[CLEANUP] {message}")

def remove_directory(path):
    """Remove a directory if it exists."""
    if os.path.exists(path):
        try:
            shutil.rmtree(path)
            print_status(f"Removed directory: {path}")
            return True
        except Exception as e:
            print_status(f"Error removing directory {path}: {str(e)}")
            return False
    else:
        print_status(f"Directory not found: {path}")
        return False

def remove_file(path):
    """Remove a file if it exists."""
    if os.path.exists(path):
        try:
            os.remove(path)
            print_status(f"Removed file: {path}")
            return True
        except Exception as e:
            print_status(f"Error removing file {path}: {str(e)}")
            return False
    else:
        print_status(f"File not found: {path}")
        return False

def cleanup_project():
    """Main cleanup function."""
    print_status("Starting project cleanup...")
    
    # 1. Remove migrated model directory
    print_status("Removing src/model directory (already migrated to src/common)...")
    remove_directory("src/model")
    
    # 2. Remove frontend directory since models are already in extension
    print_status("Removing redundant src/frontend directory...")
    remove_directory("src/frontend")
    
    # 3. Remove build artifacts
    print_status("Removing build artifacts...")
    remove_file("CorgPhish-v1.1.0.zip")
    remove_file("restructure.log")
    
    # 4. Remove .idea directory (IDE files)
    print_status("Removing IDE-specific directories...")
    remove_directory(".idea")
    
    # 5. Cleanup any __pycache__ directories
    print_status("Cleaning up Python cache files...")
    for root, dirs, files in os.walk("."):
        for dir_name in dirs:
            if dir_name == "__pycache__":
                remove_directory(os.path.join(root, dir_name))
            elif dir_name.endswith(".egg-info"):
                remove_directory(os.path.join(root, dir_name))
        for file_name in files:
            if file_name.endswith(".pyc") or file_name.endswith(".pyo"):
                remove_file(os.path.join(root, file_name))
    
    print_status("Cleanup completed!")

if __name__ == "__main__":
    try:
        cleanup_project()
    except Exception as e:
        print_status(f"Error during cleanup: {str(e)}")
        sys.exit(1) 