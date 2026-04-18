#!/usr/bin/env python3
"""Generate a flat Cursor .mdc rules file by resolving @imports in AGENTS.md."""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


IMPORT_RE = re.compile(r"^@([./\w\-/]+\.md)\s*$", re.MULTILINE)


def resolve_imports(text: str, base_dir: Path, seen: set[Path] | None = None) -> str:
    seen = seen or set()

    def replace(match: re.Match) -> str:
        rel = match.group(1)
        target = (base_dir / rel).resolve()
        if target in seen:
            return f"<!-- skipped cyclic import: {rel} -->"
        if not target.is_file():
            return f"<!-- missing import: {rel} -->"
        seen.add(target)
        inner = target.read_text(encoding="utf-8")
        return resolve_imports(inner, target.parent, seen)

    return IMPORT_RE.sub(replace, text)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--global", dest="is_global", action="store_true",
                        help="Write to ~/.cursor/rules/ai-settings.mdc")
    parser.add_argument("--project", type=Path, default=None,
                        help="Write to <project>/.cursor/rules/ai-settings.mdc")
    parser.add_argument("--source", type=Path,
                        default=Path(__file__).resolve().parent.parent / "AGENTS.md")
    parser.add_argument("--check", action="store_true",
                        help="Resolve imports but don't write; exit 0 if OK")
    args = parser.parse_args()

    source: Path = args.source.resolve()
    if not source.is_file():
        print(f"[error] source not found: {source}", file=sys.stderr)
        return 1

    flat = resolve_imports(source.read_text(encoding="utf-8"), source.parent)
    frontmatter = "---\nalwaysApply: true\n---\n\n"
    output = frontmatter + flat

    if args.check:
        print(f"[ok] resolved {source} ({len(output)} chars)")
        return 0

    if args.is_global:
        dst = Path.home() / ".cursor" / "rules" / "ai-settings.mdc"
    elif args.project:
        dst = args.project.resolve() / ".cursor" / "rules" / "ai-settings.mdc"
    else:
        print("[error] either --global or --project PATH required", file=sys.stderr)
        return 2

    dst.parent.mkdir(parents=True, exist_ok=True)
    dst.write_text(output, encoding="utf-8")
    print(f"[ok] wrote {dst}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
