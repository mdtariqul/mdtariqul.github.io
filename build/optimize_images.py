"""Resize the gallery photos in place, keeping the originals as a backup.

Usage:
    python build/optimize_images.py

Originals are copied to _originals/ (same folder structure) before anything is
changed. That folder is listed in .gitignore so it never gets deployed.
"""
import shutil
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
BACKUP = ROOT / "_originals"
MAX_SIZE = (1600, 1600)  # longest edge, in pixels
QUALITY = 82             # JPEG quality
EXTENSIONS = {".jpg", ".jpeg"}

sources = [
    ROOT / "assets/images/Work Sample",
    ROOT / "assets/images/Environment",
]
photos = [p for folder in sources for p in folder.glob("*")
          if p.suffix.lower() in EXTENSIONS]
photos.append(ROOT / "assets/images/home.jpg")

total_before = 0
total_after = 0

for src in photos:
    if not src.exists():
        print("skip (missing):", src.name)
        continue

    # Back up the untouched original exactly once. Photos with a backup have
    # already been optimized, so leave them alone (no repeated re-encoding).
    backup = BACKUP / src.relative_to(ROOT)
    if backup.exists():
        print("already optimized (skipped):", src.name)
        continue
    backup.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, backup)

    before = src.stat().st_size
    total_before += before

    # Resize to a temporary file, then replace — never write over an open image.
    temp = src.with_name(src.stem + ".optimized-tmp.jpg")
    with Image.open(src) as opened:
        image = ImageOps.exif_transpose(opened)
        image.thumbnail(MAX_SIZE, Image.Resampling.LANCZOS)
        if image.mode != "RGB":
            image = image.convert("RGB")
        image.save(temp, "JPEG", quality=QUALITY, optimize=True, progressive=True)
    temp.replace(src)

    after = src.stat().st_size
    total_after += after
    print(f"{src.parent.name}/{src.name}: {before / 1_048_576:.2f} MB -> "
          f"{after / 1_048_576:.2f} MB")

if total_before:
    print(f"\nProcessed: {total_before / 1_048_576:.1f} MB -> "
          f"{total_after / 1_048_576:.1f} MB "
          f"({100 - total_after / total_before * 100:.0f}% smaller)")
site_mb = sum(p.stat().st_size for p in photos if p.exists()) / 1_048_576
print(f"All site photos now: {site_mb:.1f} MB")
print("Full-size originals backed up in:", BACKUP.relative_to(ROOT))
