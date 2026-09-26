# CodeTeller

CodeTeller is a visual learning lab for software design principles and patterns. Learners solve small, focused challenges based on concrete engineering problems.

Instead of memorizing definitions, players start with a system that has a problem, choose code changes, and see how those changes affect its architecture. Each challenge ends with a check that connects the technical decision to its purpose.

## Approach

- Challenges are limited and created for educational purposes; there are no lives, points, or endless progression.
- The diagram represents the system and its dependencies. Choices are recognizable code snippets, not abstract pieces without context.
- Each challenge has a clear learning goal and explains the outcome after it is checked.
- The Dependency Inversion Principle (DIP) and Dependency Injection (DI) are explained as distinct ideas, even when a challenge shows how they work together.
- The interface is available in Spanish and English.
- Light and dark themes are available, with the system preference used as the initial choice.

## First module: Dependency Injection

The module has seven sequential challenges: constructor injection of the MongoDB client, extraction of the storage adapter, the composition root, test doubles, service locators, the distinction between DI and DIP, and a provider-switching capstone.

The first challenge starts with `OrderService` constructing a MongoDB client and inserting orders into a collection directly. Learners first inject the `MongoClient` through the constructor; the next challenge extracts `MongoOrderStorage` and injects it instead, and later challenges introduce the `Storage` contract. Passing a challenge unlocks the next one. Checks validate the selected code choices and update the diagram; they do not execute arbitrary Python.

Options are shuffled on each visit. Each card always shows its category, title, and code; categories describe the technique without judging it. Distractors are plausible on purpose (an injected MongoDB client, mongomock, a service locator, an optional mailer); after each check, the chosen options reveal what they actually achieve, and the full explanation set appears once the challenge is passed.

The diagram escalates with the learner instead of showing a finished design up front: the first challenge starts with a core pointing straight at a MongoDB client, the contract appears in challenges that introduce it, and a test implementation only shows up after it has been injected. That state is derived from the selected choices by `getDiagramState` in `src/data/diagramState.ts`. The core node itself never dumps raw code: `buildCoreSummary` renders a one- or two-sentence summary of what the service does with its dependencies (each option card already shows its own snippet). Selecting anything outside the answer taints the state (`hasResidue`): the diagram falls back to the original coupling, and when the achieved fix points at a different node than the leftover, both are drawn: the fix on top, the coupling that is still standing below.

See the [introductory DI module specification](docs/di-module.md) for the five-challenge learning path. The running app currently implements its first challenge (receive the client) plus the pre-existing challenges.

## Tech stack

- React 19
- TypeScript
- Vite
- React Compiler
- CSS Modules

See the [design system](docs/design-system.md) for the color palette and typography.

## Local development

Requires Node.js and pnpm.

```sh
pnpm install
pnpm dev
```

Available checks:

```sh
pnpm build
pnpm lint
```

## Container deployment

Pushes to `main` publish `ghcr.io/sguzmanbeltran/codeteller:latest` for `linux/amd64`. The image contains only the production build and an unprivileged Nginx static server. See the [VPS deployment guide](docs/deployment.md) for Docker Compose and Caddy setup.

## License

[MIT](LICENSE). Fork it, ship it, break it, teach with it.
