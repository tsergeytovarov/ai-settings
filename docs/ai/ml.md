# ML-Specific Rules

Applies when working on ML/data pipelines, model training, or dataset processing.

## Reproducibility

- **Set random seeds explicitly** at the start of every script/notebook:
  - `np.random.seed(42)`
  - `random.seed(42)`
  - `torch.manual_seed(42)` (and `torch.cuda.manual_seed_all(42)` if using GPU)
  - `tf.random.set_seed(42)` (for TensorFlow)
- **Version datasets, code, and models together.** Treat data as code: any change to the dataset gets a version bump.
- **Pin all library versions** in `pyproject.toml` / `requirements.txt`. ML stacks drift fast.

## Safety

- **No PII in logs.** Sanitize before `print` / `logger.info`. Check what goes into `wandb`, `mlflow`, and cloud logging.
- **No PII in training data** without explicit consent and a lawful basis.
- **Validate data schemas** (`pandera`, `pydantic`, or manual assertions) at pipeline stage boundaries. Fail fast, loudly.

## Evaluation

- **Hold-out set, not training set.** Never evaluate on data the model has seen.
- **No data leakage** from future to past in time-series; from test to train via preprocessing statistics.
- Report metrics with confidence intervals when feasible (bootstrap or cross-validation).

## Determinism

- Pipelines must be **re-runnable end-to-end** without manual intervention.
- Use **separate uv environments per project** — avoid contaminating the global Python.
- Checkpoint aggressively during long runs; a crashed training loop should be resumable.

## TODO (to expand as project-specific needs arise)

- Dataset versioning (DVC / lakeFS / manual-with-hashes) — pick one per project, document why.
- Model registry conventions.
- Experiment tracking (MLflow / Weights & Biases) — one tool per project, no mixing.
