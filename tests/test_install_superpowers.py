import os
import subprocess
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]


def test_dry_run_skips_personal_superpowers_when_codex_plugin_exists(tmp_path):
    manifest = (
        tmp_path
        / ".codex/plugins/cache/superpowers-dev/superpowers/6.2.0/.codex-plugin/plugin.json"
    )
    manifest.parent.mkdir(parents=True)
    manifest.write_text("{}", encoding="utf-8")

    result = subprocess.run(
        [REPO_ROOT / "scripts/install.sh", "--dry-run"],
        cwd=REPO_ROOT,
        env={**os.environ, "HOME": str(tmp_path)},
        capture_output=True,
        text=True,
        check=True,
    )

    output = result.stdout + result.stderr
    duplicate_target = tmp_path / ".agents/skills/test-driven-development"
    assert "skip Codex personal Superpowers skills: plugin is installed" in output
    assert str(duplicate_target) not in output
