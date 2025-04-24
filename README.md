This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Documentation

For detailed documentation about various aspects of the project, please refer to the [Documentation](./docs/index.md).

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

This project includes a complete authentication system with the following features:

- User registration with email and password
- User login with email and password
- Guest user mode with notifications
- Password strength validation
- Protected routes that require authentication
- Persistent sessions using localStorage

Guest users can use the application without registering, but they are shown a notification that their data is not persisted between sessions. The authentication system is implemented using React context and custom hooks.

### Security Features

This project implements several security features to protect user data and prevent common web vulnerabilities:

#### Input Sanitization

All user inputs are sanitized to prevent XSS (Cross-Site Scripting) attacks and SQL injection:

- **HTML Sanitization**: User-generated content that might contain HTML is sanitized using DOMPurify to remove potentially malicious tags and attributes.
- **Text Sanitization**: Plain text inputs are escaped to prevent HTML injection.
- **Database Sanitization**: Inputs are sanitized before being stored in the database to prevent SQL injection attacks.
- **Filename Sanitization**: Filenames are sanitized to remove unsafe characters and prevent path traversal attacks.

The sanitization utilities are implemented in `src/lib/sanitize-utils.ts` and are used throughout the application, including:

- Chat messages
- Source content
- Notebook titles
- Suggested questions

#### Row-Level Security

This project uses PostgreSQL's Row-Level Security (RLS) to ensure data isolation between users at the database level. For more details, see the [Database Documentation](./docs/database.md#data-isolation-with-row-level-security).

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
