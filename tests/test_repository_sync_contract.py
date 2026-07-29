from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
SYNC_SCRIPT = REPO_ROOT / "scripts" / "sync-cursor.sh"
CONTRACT_HEADING = "# Repository Sync Preflight"
NEXT_AGENTS_SECTION = "## 8. Docs Discipline"
NO_APPROVAL_INTRO = (
    "The only Git operations that this preflight may perform without separate "
    "user approval are:"
)


def render_flat_codex_agents(tmp_path: Path) -> str:
    isolated_home = tmp_path / "home"
    environment = os.environ | {"HOME": str(isolated_home)}

    result = subprocess.run(
        [sys.executable, str(SYNC_SCRIPT), "--codex"],
        cwd=REPO_ROOT,
        env=environment,
        capture_output=True,
        text=True,
        check=False,
    )

    assert result.returncode == 0, result.stderr
    output = isolated_home / ".codex" / "AGENTS.md"
    assert output.is_file()
    return output.read_text(encoding="utf-8")


def repository_sync_contract(flat_agents: str) -> str:
    start = flat_agents.index(CONTRACT_HEADING)
    end = flat_agents.index(NEXT_AGENTS_SECTION, start)
    return flat_agents[start:end]


def no_approval_operations(contract: str) -> list[str]:
    remainder = contract.split(NO_APPROVAL_INTRO, maxsplit=1)[1]
    bullet_block = remainder.split("\n\n", maxsplit=1)[0]
    return [
        line.removeprefix("- ")
        for line in bullet_block.splitlines()
        if line.startswith("- ")
    ]


def test_flat_codex_agents_enforces_repository_preflight_contract(tmp_path: Path) -> None:
    flat_agents = render_flat_codex_agents(tmp_path)
    contract = repository_sync_contract(flat_agents)
    normalized_contract = " ".join(contract.split())

    assert "@docs/ai/repository-sync.md" not in flat_agents
    assert "Resolve the current project and every linked `repository_id`" in normalized_contract
    assert "hq-repo-sync preflight" in normalized_contract
    assert "before reading or changing subject code" in normalized_contract
    assert "whenever a paused task is resumed" in normalized_contract
    assert "Proceed only when the command exits with code `0`." in normalized_contract
    assert "Any non-zero result is a blocker" in normalized_contract
    assert "Stop all subject work" in normalized_contract
    assert no_approval_operations(contract) == [
        "automatic clone of a missing checkout",
        "`fetch --all --prune`",
        "`pull --ff-only`",
    ]
    assert "separate user decision for every other Git operation" in normalized_contract
    for operation in (
        "commit",
        "branch",
        "merge",
        "rebase",
        "reset",
        "push",
        "force push",
        "remote rewrite",
        "credential change",
    ):
        assert operation in normalized_contract
