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

## First challenge: decouple storage

`OrderService` creates `RedisStorage` directly, so even its business logic tests need Redis to be running. The challenge is to introduce a storage contract, receive the dependency from outside, and use a test double instead.

The learning check is that the service can be tested without Redis. The diagram shows the relationship between `OrderService`, the `Storage` port, and its adapters; code choices let the learner build that solution step by step.

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
