This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

This project uses PostgreSQL with Drizzle ORM for database management. The database is automatically initialized when running the application, but you can also manually initialize it using the database commands listed below.

#### Database Commands

- `npm run db:push` - Apply schema to the database
- `npm run db:studio` - Open Drizzle Studio to view and edit the database
- `npm run db:start` - Start the PostgreSQL Docker container
- `npm run db:stop` - Stop the PostgreSQL Docker container

#### PostgreSQL Setup

The project uses a dockerized PostgreSQL 17.4 (Alpine) instance. To start the database:

```bash
npm run db:start
```

To stop the database:

```bash
npm run db:stop
```

#### Environment Variables

The database connection is configured using environment variables. See `.env.example` for the variables. Make sure to set up the following environment variables in your `.env` file:

```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=devbrain
POSTGRES_PORT=5432
DATABASE_URL=postgres://postgres:postgres@localhost:5432/devbrain
```

#### Database Schema and Indexes

The database schema is defined using Drizzle ORM in the `src/db/schema` directory. The following tables are defined:

- `notebooks` - Stores notebook metadata
- `messages` - Stores chat messages associated with notebooks
- `sources` - Stores source content associated with notebooks
- `suggestedQuestions` - Stores AI-generated questions for notebooks

The following indexes are defined to improve query performance:

- `notebooks_updated_at_idx` - Index on the `updatedAt` column of the notebooks table
- `messages_notebook_id_idx` - Index on the `notebookId` column of the messages table
- `messages_timestamp_idx` - Index on the `timestamp` column of the messages table
- `sources_notebook_id_idx` - Index on the `notebookId` column of the sources table
- `sources_created_at_idx` - Index on the `createdAt` column of the sources table
- `sources_tag_idx` - Index on the `tag` column of the sources table
- `suggested_questions_notebook_id_idx` - Index on the `notebookId` column of the suggestedQuestions table
- `suggested_questions_created_at_idx` - Index on the `createdAt` column of the suggestedQuestions table

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

### Code-Splitting and Lazy Loading

This project implements code-splitting and lazy loading for major components to improve performance and reduce the initial bundle size. The implementation includes:

- Dynamic imports using Next.js's `lazy()` function for main components
- Suspense boundaries with skeleton loading states
- Error boundaries for graceful error handling

The following components are lazy-loaded:

- NotebooksSidebar
- ContentTabs
- ChatInterface
- SourcesList
- SuggestedQuestions

Each lazy-loaded component has a corresponding skeleton component that displays during loading. This approach improves the initial page load time and provides a better user experience with meaningful loading states.

### Code Formatting

This project uses Prettier for code formatting and ESLint for code linting. The configuration is set up to run Prettier as an ESLint rule, which means that formatting issues will be reported as ESLint errors.

You can format your code in several ways:

1. Automatically on save (configured in VS Code settings)
2. By running `npm run format` to format all files
3. By running the VS Code task `Next.js: format`

To check if your code is properly formatted without making changes, run `npm run format:check`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
