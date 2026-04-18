"""Skill-lint rules — apply to every SKILL.md under skills/."""
from __future__ import annotations

import re
from pathlib import Path


SEMVER_RE = re.compile(r"^\d+\.\d+\.\d+$")
REQUIRED_FIELDS = ("name", "version", "description", "category")
SECRET_PATTERNS = [
    re.compile(r"(?i)aws[_-]?secret[_-]?access[_-]?key"),
    re.compile(r"(?i)api[_-]?key\s*=\s*['\"][A-Za-z0-9_-]{20,}['\"]"),
    re.compile(r"ghp_[A-Za-z0-9]{30,}"),  # GitHub PAT
    re.compile(r"sk-[A-Za-z0-9]{30,}"),    # OpenAI/Anthropic-style
]


def test_frontmatter_exists(skill_frontmatter):
    assert isinstance(skill_frontmatter, dict), "Frontmatter must be a YAML mapping"


def test_required_fields(skill_frontmatter):
    missing = [f for f in REQUIRED_FIELDS if not skill_frontmatter.get(f)]
    assert not missing, f"Missing required fields: {missing}"


def test_description_has_trigger(skill_frontmatter):
    desc = str(skill_frontmatter.get("description", ""))
    assert re.search(r"\b(Use when|Trigger)\b", desc), \
        "description must contain 'Use when' or 'Trigger'"


def test_description_has_skip(skill_frontmatter):
    desc = str(skill_frontmatter.get("description", ""))
    assert re.search(r"\b(SKIP|Do NOT use)\b", desc), \
        "description must contain 'SKIP' or 'Do NOT use'"


def test_description_length(skill_frontmatter):
    desc = str(skill_frontmatter.get("description", ""))
    assert len(desc) >= 100, f"description too short ({len(desc)} chars, need >=100)"


def test_version_semver(skill_frontmatter):
    version = str(skill_frontmatter.get("version", ""))
    assert SEMVER_RE.match(version), f"version '{version}' is not semver X.Y.Z"


def test_changelog_exists(skill_path: Path, skill_frontmatter):
    changelog = skill_path.parent / "CHANGELOG.md"
    assert changelog.is_file(), f"{changelog} missing"
    content = changelog.read_text(encoding="utf-8")
    version = skill_frontmatter["version"]
    assert f"[{version}]" in content, \
        f"CHANGELOG.md has no entry for version {version}"


def test_name_matches_folder(skill_path: Path, skill_frontmatter):
    folder_name = skill_path.parent.name
    declared = skill_frontmatter.get("name", "")
    assert declared == folder_name, \
        f"frontmatter name '{declared}' != folder '{folder_name}'"


def test_no_obvious_secrets(skill_text: str):
    for pattern in SECRET_PATTERNS:
        match = pattern.search(skill_text)
        assert not match, f"Possible secret matched: {pattern.pattern}"
