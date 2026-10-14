#!/usr/bin/env python3
"""Sync ai-settings/docs/ai → ~/.hermes/SOUL.md.

Назначения:
- без аргументов — пишет ~/.hermes/SOUL.md (старый файл уезжает в бэкап).
- `--check` — показывает размер результата, на диск не пишет.

Генерируемый файл всегда содержит комментарий сверху, что править надо
исходники в репо, а не этот файл.

Файлы, входящие в SOUL.md:
  persona.md  — кто мы
  personality.md  — как мы говорим и ведём себя
  style.md  — стиль общения (chat)
  hard-gates.md  — неотменяемые правила
"""
from __future__ import annotations

import sys
from pathlib import Path


def main() -> int:
    check = "--check" in sys.argv

    repo = Path(__file__).resolve().parent.parent
    docs_ai = repo / "docs" / "ai"
    dst = Path.home() / ".hermes" / "SOUL.md"

    parts = ["persona.md", "personality.md", "style.md", "hard-gates.md"]
    source_lines = []
    for name in parts:
        src = docs_ai / name
        if not src.is_file():
            print(f"[error] missing: {src}", file=sys.stderr)
            return 1
        text = src.read_text(encoding="utf-8")
        source_lines.append(text)

    header = (
        "<!-- Generated from ~/work/ai-settings/docs/ai "
        "(persona, personality, style, hard-gates). "
        "Edit the sources, not this file. -->\n\n"
    )
    output = header + "\n".join(source_lines) + "\n"

    if check:
        print(f"[ok] would write {dst} ({len(output)} chars)")
        return 0

    # Back up if file already exists.
    if dst.is_file():
        stamp = dst.stat().st_mtime
        backup = dst.with_name(f"{dst.name}.bak-{stamp:.0f}")
        dst.rename(backup)
        print(f"[ok] backed up → {backup}")

    dst.parent.mkdir(parents=True, exist_ok=True)
    dst.write_text(output, encoding="utf-8")
    dst.chmod(0o600)
    print(f"[ok] wrote {dst} ({len(output)} chars)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
