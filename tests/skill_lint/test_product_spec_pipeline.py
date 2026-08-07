from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
PIPELINE_SKILL = REPO_ROOT / "skills/popovs/product-spec-pipeline/SKILL.md"
BRAINSTORMING_SKILL = REPO_ROOT / "skills/superpowers/brainstorming/SKILL.md"
SPEC_ALIAS_SKILL = REPO_ROOT / "skills/popovs/spec/SKILL.md"


def test_pipeline_runs_brainstorming_before_grilling():
    content = PIPELINE_SKILL.read_text(encoding="utf-8")

    brainstorming_phase = content.index("## Phase 2: Brainstorm the idea")
    grilling_phase = content.index("## Phase 5: Grill the selected direction")

    assert brainstorming_phase < grilling_phase
    assert "embedded-mode=product-spec-pipeline" in content
    assert "<run-dir>/brainstorm.md" in content


def test_brainstorming_has_product_spec_pipeline_embedded_mode():
    content = BRAINSTORMING_SKILL.read_text(encoding="utf-8")

    assert "## Embedded mode: product-spec-pipeline" in content
    assert "Do not commit" in content
    assert "Do not invoke `writing-plans`" in content
    assert "Return control to the parent pipeline" in content


def test_spec_alias_invokes_product_spec_pipeline():
    content = SPEC_ALIAS_SKILL.read_text(encoding="utf-8")

    assert "`product-spec-pipeline`" in content
    assert "Pass the user's complete prompt" in content


def test_pipeline_analyzes_existing_or_empty_project_before_brainstorming():
    content = PIPELINE_SKILL.read_text(encoding="utf-8")

    project_analysis = content.index("### Analyze the project first")
    brainstorming_phase = content.index("## Phase 2: Brainstorm the idea")

    assert project_analysis < brainstorming_phase
    assert "<run-dir>/project-context.md" in content
    assert "greenfield" in content
    assert "non-empty" in content


def test_pipeline_offers_research_and_dispatches_one_fresh_worker_per_selection():
    content = PIPELINE_SKILL.read_text(encoding="utf-8")

    research_selection = content.index("## Phase 3: Select deep research")
    research_execution = content.index("## Phase 4: Run selected research")
    grilling_phase = content.index("## Phase 5: Grill the selected direction")

    assert research_selection < research_execution < grilling_phase
    assert "one fresh agent session per selected track" in content
    assert "orca orchestration task-create" in content
    assert "orca orchestration dispatch --inject" in content
    assert "maximum of 3 research workers concurrently" in content
    assert "<run-dir>/research-summary.md" in content
