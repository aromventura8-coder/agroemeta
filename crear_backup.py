"""
AGROEMETA - Script de Respaldo Automático
Copia todos los archivos esenciales del proyecto a una subcarpeta con timestamp
dentro de /backups_agroemeta.
"""

import os
import shutil
from datetime import datetime

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKUP_BASE_DIR = os.path.join(ROOT_DIR, "backups_agroemeta")

EXTENSIONS = {
    ".html", ".js", ".css", ".py", ".json", ".md",
    ".toml", ".bat", ".ps1", ".txt"
}

FOLDERS_TO_INCLUDE = ["api"]

def create_backup():
    now_str = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    target_dir = os.path.join(BACKUP_BASE_DIR, f"backup_{now_str}")
    os.makedirs(target_dir, exist_ok=True)

    copied_files = 0
    for item in os.listdir(ROOT_DIR):
        item_path = os.path.join(ROOT_DIR, item)
        if os.path.isfile(item_path):
            _, ext = os.path.splitext(item)
            if ext.lower() in EXTENSIONS:
                shutil.copy2(item_path, target_dir)
                copied_files += 1
        elif os.path.isdir(item_path) and item in FOLDERS_TO_INCLUDE:
            dest_subdir = os.path.join(target_dir, item)
            if os.path.exists(dest_subdir):
                shutil.rmtree(dest_subdir)
            shutil.copytree(item_path, dest_subdir)

    print(f"[BACKUP OK] {copied_files} archivos respaldados en: {target_dir}")
    return target_dir

if __name__ == "__main__":
    create_backup()
