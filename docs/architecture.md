# Application Architecture

## Technology Stack

DevBrain is built using the following technologies:

- **Frontend**: Next.js 15 with React 19 and TypeScript
- **UI Components**: shadcn/ui with TailwindCSS
- **State Management**: React Context API and custom hooks
- **Database**: PostgreSQL with pgvector extension and Drizzle ORM
- **Authentication**: Custom authentication system with bcrypt for password hashing
- **AI Integration**: WebLLM for client-side AI processing
- **Service Worker**: For offline support and model persistence

> **Note**: While the current implementation uses PostgreSQL, some documentation may reference SQLite. The project was likely migrated from SQLite to PostgreSQL at some point.

## Project Structure

The project follows the Atomic Design methodology for organizing components:

```
src/
├── app/                  # Next.js App Router pages and layouts
├── components/           # UI components organized by Atomic Design
│   ├── atoms/            # Basic building blocks (buttons, inputs, etc.)
│   ├── molecules/        # Combinations of atoms (form fields, cards, etc.)
│   ├── organisms/        # Complex UI sections (sidebars, chat interfaces, etc.)
│   ├── templates/        # Page layouts
│   └── pages/            # Full page components
├── db/                   # Database related code
│   ├── schema/           # Drizzle ORM schema definitions
│   └── migrations/       # Database migrations
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and shared code
├── middleware/           # Next.js middleware
└── types/                # TypeScript type definitions
```

## Code-Splitting and Lazy Loading

DevBrain implements code-splitting and lazy loading for major components to improve performance and reduce the initial bundle size:

- Dynamic imports using Next.js's `lazy()` function for main components
- Suspense boundaries with skeleton loading states
- Error boundaries for graceful error handling

The following components are lazy-loaded:

- NotebooksSidebar
- ContentTabs
- ChatInterface
- SourcesList
- SuggestedQuestions

## Performance Optimizations

The application includes several performance optimizations:

- **Service Worker**: For offline support and caching WebLLM models
- **Image Optimization**: Using Next.js Image component
- **Font Optimization**: Using next/font for optimized font loading
- **Bundle Size Optimization**: Using dynamic imports and tree shaking
- **Code-Splitting**: Lazy loading components to reduce initial bundle size

## Development Environment

The project includes configurations for various development tools:

- **VS Code**: Launch configurations and tasks
- **ESLint**: Code linting with Prettier integration
- **Storybook**: Component development and testing
- **Husky**: Git hooks for code quality checks

For more information on the development environment, see the [Development Guide](./development.md).
