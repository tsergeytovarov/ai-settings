#!/usr/bin/env python3
"""Generate a flat rules file by resolving @imports in AGENTS.md.

Назначения:
- `--global` / `--project PATH` — для Cursor (`.cursor/rules/ai-settings.mdc`, с frontmatter `alwaysApply: true`).
- `--codex` — для Codex CLI (`~/.codex/AGENTS.md`, без frontmatter). Codex не резолвит @imports,
  поэтому нужен плоский файл.
"""
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


def write_safely(dst: Path, content: str) -> None:
    """Пишем в dst так, чтобы не испортить исходный файл через симлинк.

    Если dst — симлинк (как после старого install.sh, когда ~/.codex/AGENTS.md
    был симлинком в репо), Path.write_text() пошёл бы по симлинку и перезаписал
    бы исходный AGENTS.md в репозитории. Поэтому сначала unlink, потом write.
    """
    if dst.is_symlink() or dst.exists():
        if dst.is_symlink():
            dst.unlink()
    dst.parent.mkdir(parents=True, exist_ok=True)
    dst.write_text(content, encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--global", dest="is_global", action="store_true",
                        help="Cursor: write to ~/.cursor/rules/ai-settings.mdc")
    parser.add_argument("--project", type=Path, default=None,
                        help="Cursor: write to <project>/.cursor/rules/ai-settings.mdc")
    parser.add_argument("--codex", action="store_true",
                        help="Codex: write flat AGENTS.md to ~/.codex/AGENTS.md (no frontmatter)")
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

    if args.codex:
        # Codex не поддерживает Cursor frontmatter, пишем плоский markdown.
        output = flat
    else:
        frontmatter = "---\nalwaysApply: true\n---\n\n"
        output = frontmatter + flat

    if args.check:
        print(f"[ok] resolved {source} ({len(output)} chars)")
        return 0

    targets = [bool(args.is_global), bool(args.project), bool(args.codex)]
    if sum(targets) != 1:
        print("[error] exactly one of --global / --project PATH / --codex required",
              file=sys.stderr)
        return 2

    if args.is_global:
        dst = Path.home() / ".cursor" / "rules" / "ai-settings.mdc"
    elif args.project:
        dst = args.project.resolve() / ".cursor" / "rules" / "ai-settings.mdc"
    else:  # args.codex
        dst = Path.home() / ".codex" / "AGENTS.md"

    write_safely(dst, output)
    print(f"[ok] wrote {dst}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
