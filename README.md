This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Documentation

DevBrain has comprehensive documentation covering all aspects of the application. The documentation is organized into the following sections:

- [Architecture](./docs/architecture.md) - Overview of the application architecture and technology stack
- [Database](./docs/database.md) - Information about the database setup, schema, and security features
- [Authentication](./docs/authentication.md) - Details about the authentication system and user management
- [Security](./docs/security.md) - Security features and best practices implemented in the application
- [AI Integration](./docs/ai-integration.md) - Information about the WebLLM integration and AI features
- [Vector Embeddings](./docs/vector-embeddings.md) - Details about the vector embedding system for source content
- [Development Guide](./docs/development.md) - Guide for setting up the development environment and workflow

For a complete overview, please refer to the [Documentation Index](./docs/index.md).

## Getting Started

### Using the Command Line

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Database Management

This project uses PostgreSQL with Drizzle ORM for database management. For detailed information about the database setup, schema, and security features, please refer to the [Database Documentation](./docs/database.md).

### Using VS Code

This project includes VS Code configurations to make development easier:

1. Open the project in VS Code
2. Press `F5` to start the development server with debugging enabled
3. VS Code will automatically open your browser when the server is ready

Alternatively, you can use the VS Code tasks:

1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS)
2. Type "Tasks: Run Task"
3. Select one of the available tasks:
    - `Next.js: dev` - Start the development server
    - `Next.js: build` - Build the application for production
    - `Next.js: start` - Start the production server
    - `Next.js: lint` - Run ESLint
    - `Next.js: format` - Format code with Prettier

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

### Authentication System

This project includes a complete authentication system with features like user registration, login, guest mode, and protected routes. For detailed information about the authentication system, please refer to the [Authentication Documentation](./docs/authentication.md).

### Security Features

This project implements several security features to protect user data and prevent common web vulnerabilities, including input sanitization and row-level security. For detailed information about the security features, please refer to the [Security Documentation](./docs/security.md).

### Code-Splitting and Lazy Loading

This project implements code-splitting and lazy loading for major components to improve performance and reduce the initial bundle size. For detailed information about the architecture and performance optimizations, please refer to the [Architecture Documentation](./docs/architecture.md#code-splitting-and-lazy-loading).

### Code Formatting

This project uses Prettier for code formatting and ESLint for code linting. For detailed information about code formatting and the development workflow, please refer to the [Development Guide](./docs/development.md#code-formatting-and-linting).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
