"""Pytest configuration and fixtures for skill-lint."""
from __future__ import annotations

import re
from pathlib import Path

import pytest
import yaml


REPO_ROOT = Path(__file__).resolve().parents[2]
SKILLS_ROOT = REPO_ROOT / "skills"


def discover_skill_paths() -> list[Path]:
    """Find every SKILL.md under skills/."""
    return sorted(SKILLS_ROOT.glob("**/SKILL.md"))


@pytest.fixture(params=discover_skill_paths(), ids=lambda p: str(p.relative_to(REPO_ROOT)))
def skill_path(request: pytest.FixtureRequest) -> Path:
    return request.param


@pytest.fixture
def skill_text(skill_path: Path) -> str:
    return skill_path.read_text(encoding="utf-8")


@pytest.fixture
def skill_frontmatter(skill_text: str) -> dict:
    """Parse YAML frontmatter from SKILL.md."""
    match = re.match(r"^---\n(.*?)\n---\n", skill_text, re.DOTALL)
    if not match:
        pytest.fail("No YAML frontmatter found")
    return yaml.safe_load(match.group(1))
