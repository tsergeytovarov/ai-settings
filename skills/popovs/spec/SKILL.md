---
name: spec
version: 1.0.0
category: product
description: >-
  Short alias for the global product-spec-pipeline skill. Use when the user
  invokes `$spec` to turn a product idea, feature, improvement, or small task
  into a researched and independently reviewed product specification. Trigger:
  `$spec` followed by the idea or task. Do NOT use for technical architecture,
  implementation plans, or API documentation.
---

# Spec

Invoke the installed `product-spec-pipeline` skill immediately.

- Pass the user's complete prompt to it without summarizing, rewriting, or
  dropping attachments and project context.
- Follow the complete pipeline, including project analysis, brainstorming,
  optional selected research, grilling, verification, drafting, 2 independent
  reviews, and finalization.
- Do not implement a separate abbreviated workflow in this alias.

`$spec` is only an entrypoint. The `product-spec-pipeline` skill remains the
single source of truth for behavior.
