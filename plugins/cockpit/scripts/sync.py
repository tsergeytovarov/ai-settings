"""Copies context-weather and fuse into cockpit, so cockpit stays one plugin
to install while the code lives in one place.

Edit context-weather or fuse, then run from the plugins folder:
    python3 cockpit/scripts/sync.py          # write the copies
    python3 cockpit/scripts/sync.py --check  # exit 1 if a copy is stale
"""
import sys
from pathlib import Path

PLUGINS = Path(__file__).resolve().parents[2]
COCKPIT = PLUGINS / "cockpit"

# (source plugin, folder under cockpit/hooks, files to take from its hooks/)
SOURCES = [
    ("context-weather", "weather", ["claude.ts", "icons.ts", "limits.ts", "weather.ts", "register.tsx", "weather.test.tsx"]),
    ("fuse", "fuse", ["rules.ts", "targets.ts", "register.tsx", "fuse.test.tsx"]),
]
# Binary files copied as they are: (from, to), relative to the plugins folder.
ASSETS = [("fuse/sounds/alarm.wav", "cockpit/sounds/alarm.wav")]


def adapt(text: str, source: str) -> str:
    """The copy's state belongs to cockpit, and its types sit one folder higher."""
    text = text.replace(f"plugin: '{source}'", "plugin: 'cockpit'")
    text = text.replace("from '../types'", "from '../../types'")
    return f"// Generated from plugins/{source} by cockpit/scripts/sync.py: edit the source, then sync.\n{text}"


def planned() -> dict[Path, bytes]:
    files: dict[Path, bytes] = {}
    for source, folder, names in SOURCES:
        for name in names:
            text = (PLUGINS / source / "hooks" / name).read_text()
            files[COCKPIT / "hooks" / folder / name] = adapt(text, source).encode()
    for src, dst in ASSETS:
        files[PLUGINS / dst] = (PLUGINS / src).read_bytes()
    return files


def main() -> int:
    files = planned()
    if "--check" in sys.argv:
        stale = [p for p, data in files.items() if not p.exists() or p.read_bytes() != data]
        for path in stale:
            print(f"stale: {path.relative_to(PLUGINS)}")
        return 1 if stale else 0
    for path, data in files.items():
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
    print(f"synced {len(files)} files")
    return 0


if __name__ == "__main__":
    sys.exit(main())
