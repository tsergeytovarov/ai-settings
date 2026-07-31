import os
import subprocess
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]


def test_install_links_gemini_import_and_superpowers(tmp_path):
    subprocess.run(
        [REPO_ROOT / "scripts/install.sh"],
        cwd=REPO_ROOT,
        env={**os.environ, "HOME": str(tmp_path)},
        capture_output=True,
        text=True,
        check=True,
    )

    gemini_home = tmp_path / ".gemini"
    assert (gemini_home / "GEMINI.md").resolve() == REPO_ROOT / "GEMINI.md"
    assert (gemini_home / "AGENTS.md").resolve() == REPO_ROOT / "AGENTS.md"
    assert (gemini_home / "skills").resolve() == REPO_ROOT / "skills/superpowers"
