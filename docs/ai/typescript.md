# TypeScript / JavaScript Standards

Applies to all TS/JS code. Builds on top of `coding-standards.md`.

## Language & config

- **TypeScript strict mode** required: `"strict": true` in `tsconfig.json`, plus `"noUncheckedIndexedAccess": true` for new projects.
- Use TS, not JS, for new code. Existing `.js` files — migrate opportunistically, not as a separate refactor PR.
- Target: Node.js 20+ or the framework-declared minimum, whichever is higher.

## Type discipline

- **`any` is forbidden** without an inline comment justifying why and a plan to remove it.
- Prefer `unknown` + narrowing (`if (typeof x === 'string') ...`) over `any`.
- Prefer `type` for unions and mapped types; `interface` for object shapes that may be extended.
- Never export mutable module-level state; export functions that encapsulate it.

## Next.js 15 (app router)

- **App router only.** `app/` directory, server components by default.
- `'use client'` directive only when genuinely needed: state hooks, browser APIs, event handlers.
- Data fetching:
  - Server: direct `fetch` / DB calls in server components.
  - Client: `@tanstack/react-query` for anything non-trivial.
- Do not use `getServerSideProps`, `getStaticProps`, `pages/` directory in new code — those are legacy pages router.

## React 19

- Hooks only. No class components in new code.
- Lift state sparingly; prefer composition.
- Avoid `useEffect` for data fetching — use a library (`react-query`) or server components.
- Event handlers: strongly typed (`React.MouseEvent<HTMLButtonElement>`, not `any`).

## Path aliases

- `@/*` → `src/*` by default (configurable in `tsconfig.json`).
- Avoid deep relative imports (`../../../foo`) — use the alias.

## Exports

- Prefer **named exports** for shared components and utilities. Default exports — only when the framework requires it (e.g., Next.js pages/layouts).
- One top-level export per file when it makes the file's purpose unambiguous.

## Linting & formatting

- `eslint` with the framework's default config as the baseline.
- `prettier` for formatting. Do not argue with prettier — let it format.
- Never disable a lint rule without an inline comment explaining why.

## Anti-patterns

- `getServerSideProps` / `getStaticProps` / `pages/` in a new Next.js 15 project.
- `class MyComponent extends React.Component`.
- `any` without justification comment.
- `useEffect` running on mount to fetch data when a server component would suffice.
- Inline styles when the project has Tailwind / CSS modules / styled-components.
