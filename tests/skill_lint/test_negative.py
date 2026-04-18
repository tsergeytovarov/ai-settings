"""Meta-test: verify lint rules actually catch problems on a known-bad fixture."""
from __future__ import annotations

import re
from pathlib import Path

import yaml

from tests.skill_lint.test_skills import REQUIRED_FIELDS


FIXTURE_BAD_SKILL = Path(__file__).parent / "fixtures" / "bad-skill" / "SKILL.md"


def test_bad_fixture_has_frontmatter_but_missing_fields():
    """Apply our rule directly to the bad fixture — must report missing fields."""
    text = FIXTURE_BAD_SKILL.read_text(encoding="utf-8")
    match = re.match(r"^---\n(.*?)\n---\n", text, re.DOTALL)
    assert match, "fixture must have frontmatter"
    fm = yaml.safe_load(match.group(1))
    missing = [f for f in REQUIRED_FIELDS if not fm.get(f)]
    assert missing, "bad fixture should be missing required fields"
