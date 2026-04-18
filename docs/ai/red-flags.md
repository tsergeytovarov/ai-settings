# Red Flags

When any of these thoughts appears, **STOP** and reconsider. The pattern you're about to follow is almost certainly wrong.

| If you think... | Problem | Instead |
|---|---|---|
| "I'll just `except Exception:`" | Swallows all errors, including the ones you actually want to see | Catch specific exception types; re-raise unknown ones |
| "I'll hardcode this URL/key for now" | "For now" becomes permanent; leaks to prod | Env var or config file; ask the user |
| "I'll copy-paste this logic" | Duplication, drift over time | Extract a function/module/component |
| "I'll mock everything in the test" | Tests don't catch real integration bugs | Mock only external boundaries (network, filesystem); use real code for everything in-process |
| "I'll load the whole dataset in memory" | OOM at scale | Streaming, chunking, or generators |
| "I'll use `any` in TS just this once" | Gateway to silent type erosion | `unknown` + narrowing, or proper type; justify in a comment if truly unavoidable |
| "I'll put this side effect in useEffect without deps" | Infinite loops or stale closures | Correct deps array; prefer `useMemo`/`useCallback` or restructure |
| "Diff is 800+ lines, whatever" | Unreviewable, risky merge | Split the PR into logical chunks |
| "I'll skip the test this once" | Untested code will hit prod | Write the test first (TDD); at minimum, write it after |
| "I'll use `--force` / `--no-verify`" | Silent destruction, bypasses safety | Fix the underlying issue |
| "I'll `rm -rf` this real quick" | One typo away from deleting wrong thing | `ls` the target first; use `trash` utility when available |
| "I'll catch and silently log the error" | Production fires become invisible | Log + re-raise, or handle meaningfully; never swallow |
| "The test is flaky, I'll retry it" | Real bug hidden behind flakiness | Investigate the flake; fix or quarantine with a ticket |
| "I'll commit the build artifacts" | Bloats repo, merge conflicts | Add to `.gitignore`; produce artifacts in CI |
| "I'll fix this type error with `// @ts-ignore`" | Hides a real bug | Fix the type; if genuinely unreachable, use `// @ts-expect-error` + comment |
