#!/usr/bin/env python3
"""Bump a skill's version in frontmatter + CHANGELOG.md entry."""
from __future__ import annotations

import argparse
import datetime as dt
import re
import sys
from pathlib import Path


VERSION_RE = re.compile(r"^(version:\s*)(\d+)\.(\d+)\.(\d+)\s*$", re.MULTILINE)


def bump(current: tuple[int, int, int], part: str) -> tuple[int, int, int]:
    major, minor, patch = current
    if part == "major":
        return (major + 1, 0, 0)
    if part == "minor":
        return (major, minor + 1, 0)
    if part == "patch":
        return (major, minor, patch + 1)
    raise ValueError(part)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("skill_path", type=Path,
                        help="Path to skill folder (e.g., skills/code/ru-commit-message)")
    parser.add_argument("part", choices=("major", "minor", "patch"))
    parser.add_argument("--note", default="", help="Changelog entry description")
    args = parser.parse_args()

    skill_md = args.skill_path / "SKILL.md"
    changelog = args.skill_path / "CHANGELOG.md"
    if not skill_md.is_file():
        print(f"[error] no SKILL.md at {skill_md}", file=sys.stderr)
        return 1
    if not changelog.is_file():
        print(f"[error] no CHANGELOG.md at {changelog}", file=sys.stderr)
        return 1

    text = skill_md.read_text(encoding="utf-8")
    match = VERSION_RE.search(text)
    if not match:
        print("[error] version line not found in SKILL.md", file=sys.stderr)
        return 2
    current: tuple[int, int, int] = tuple(int(x) for x in match.groups()[1:])  # type: ignore[assignment]
    new = bump(current, args.part)
    new_str = "{}.{}.{}".format(*new)

    text = VERSION_RE.sub(f"{match.group(1)}{new_str}", text, count=1)
    skill_md.write_text(text, encoding="utf-8")

    # Prepend CHANGELOG entry (after header, before first `## [...]` section)
    date = dt.date.today().isoformat()
    note = args.note or "(описать изменения)"
    cl_text = changelog.read_text(encoding="utf-8")
    new_entry = f"## [{new_str}] — {date}\n### Изменено\n- {note}\n\n"
    cl_text = re.sub(
        r"^(# CHANGELOG[^\n]*\n(?:[^\n]*\n)*?)(## )",
        lambda m: m.group(1) + new_entry + m.group(2),
        cl_text,
        count=1,
        flags=re.DOTALL,
    )
    changelog.write_text(cl_text, encoding="utf-8")

    print(f"[ok] bumped {args.skill_path.name}: {'.'.join(map(str, current))} -> {new_str}")
    print(f"[hint] review CHANGELOG.md, commit with:  "
          f"git commit -m 'chore(skill/{args.skill_path.name}): bump to {new_str}'")
    return 0


if __name__ == "__main__":
    sys.exit(main())
