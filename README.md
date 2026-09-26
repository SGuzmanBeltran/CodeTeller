# CodeTeller

CodeTeller is a visual learning lab for software design principles and patterns. Learners solve small, focused challenges based on concrete engineering problems.

Instead of memorizing definitions, players start with a system that has a problem, choose code changes, and see how those changes affect its architecture. Each challenge ends with a check that connects the technical decision to its purpose.

## Approach

- Challenges are limited and created for educational purposes; there are no lives, points, or endless progression.
- The diagram represents the system and its dependencies. Choices are recognizable code snippets, not abstract pieces without context.
- Each challenge has a clear learning goal and explains the outcome after it is checked.
- The introductory DI module focuses on handing collaborators to consumers and assembling them in each context; broader design principles are left for later modules.
- The interface is available in Spanish and English.
- Light and dark themes are available, with the system preference used as the initial choice.

## First module: Dependency Injection

The module has five sequential challenges: constructor injection of the MongoDB client, extraction of the storage adapter, the composition root, a test double, and a capstone that transfers the pattern to email delivery. Service locators and DI vs. DIP are not part of this introductory path.

The first challenge starts with `OrderService` constructing a MongoDB client and inserting orders into a collection directly. Learners first inject `MongoClient`; the next challenge extracts and injects `MongoOrderStorage`. Then they connect the pieces at application startup, test order behavior with `FakeStorage`, and apply the same decisions to `NotificationService` with real and fake mailers. The `Storage` contract appears only in the testing challenge. Passing a challenge unlocks the next one. Checks validate the selected code choices and update the diagram; they do not execute arbitrary Python.

Options are shuffled on each visit. Each card always shows its category, title, and code; categories describe the technique without judging it. Distractors are plausible on purpose (an injected MongoDB client, mongomock, an optional mailer, a library patch); after each check, the chosen options reveal what they actually achieve, and the full explanation set appears once the challenge is passed.

The diagram escalates with the learner instead of showing a finished design up front: the first challenge starts with a core creating a MongoDB client, the storage adapter is introduced separately, and the application wiring and test implementation appear only in their respective challenges. Selected alternatives update their actual construction path (for example, an in-service factory is not drawn as `main.py`). The capstone shows production and test paths independently. Diagram state is derived from selected choices by `getDiagramState` in `src/data/diagramState.ts`; code samples are never executed.

See the [introductory DI module specification](docs/di-module.md) for the complete five-challenge learning path.

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
