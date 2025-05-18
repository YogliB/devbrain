## App Context
This is an open-source web application for developers that allows users to create AI-powered notebooks from their codebases, docs, Jira tickets, and more. It supports collaboration via shared notebooks and teams, with a strong focus on data privacy and user control.

## Development Guidelines
- Use **TypeScript exclusively**.
- Backend and frontend are handled via **Next.js 15**.
- Database is **SQLite using Drizzle ORM**.
- **React 19** is used with **TailwindCSS** and **shadcn/ui** for UI components.
- Components follow **Atomic Design** and must include stories in **Storybook**.
- Avoid OOP—prefer **functional and composable patterns**.
- Use **native web features** where practical; avoid third-party libs unless complexity justifies them.
- All exported modules must include **reasonable Vitest tests**.
- **Each API route should have test coverage**.
- All logic should be tested for relevant and common cases.
- **Edge cases should be tested only if specifically asked**.
- Keep code **simple, efficient, and maintainable**.
- **Do not write any comments in the code**—strive for clarity through naming, structure, and composition.
- Update the **README** and document new functionality clearly and consistently.
- When new modules, components, or features are added, the agent must **suggest updates to the README or relevant documentation automatically**.
- The agent should **proactively identify and flag documentation gaps, inconsistencies, or missing explanations** across code, components, and features.
- **Update these copilot-instructions whenever the project structure or architecture changes** to keep the instructions aligned with the current state of the project.
- Prioritize **performance, clarity, and privacy** in every feature.