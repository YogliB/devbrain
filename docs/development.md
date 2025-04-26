# Development Guide

## Getting Started

### Prerequisites

- [Volta](https://volta.sh/) (for Node.js version management)
- Node.js 22.x or later (automatically managed by Volta)
- npm 11.x or later (automatically managed by Volta)
- Docker (for PostgreSQL with pgvector database)
- Git

### Node.js Setup with Volta

This project uses [Volta](https://volta.sh/) to ensure consistent Node.js and npm versions across all development environments. Volta automatically uses the Node.js and npm versions specified in the `package.json` file:

```json
"volta": {
    "node": "22.14.0",
    "npm": "11.3.0"
}
```

To set up Volta:

1. Install Volta by following the instructions on the [Volta website](https://volta.sh/)

2. After installation, you may need to restart your terminal or run `volta setup` to ensure Volta is properly configured in your PATH

3. No additional configuration is needed - Volta will automatically use the correct Node.js and npm versions when you're in the project directory

### Setting Up the Development Environment

1. Clone the repository:

    ```bash
    git clone git@github.com:YogliB/devbrain.git
    cd devbrain
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

    > **Note**: If you've installed Volta correctly, it will automatically use the Node.js and npm versions specified in the project's `package.json` file. You don't need to manually switch Node.js versions.

3. Set up environment variables:

    ```bash
    cp .env.example .env
    ```

4. Start the PostgreSQL database:

    ```bash
    npm run db:start
    ```

5. Apply the database schema:

    ```bash
    npm run db:push
    ```

6. Start the development server:
    ```bash
    npm run dev
    ```

## Development Workflow

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

### Using Storybook

Storybook is used for component development and testing:

1. Start Storybook:

    ```bash
    npm run storybook
    ```

2. Open [http://localhost:6006](http://localhost:6006) in your browser

3. Create stories for new components in the same directory as the component:

    ```tsx
    // Button.stories.tsx
    import type { Meta, StoryObj } from '@storybook/react';
    import { Button } from './Button';

    const meta: Meta<typeof Button> = {
    	component: Button,
    	title: 'Atoms/Button',
    };

    export default meta;
    type Story = StoryObj<typeof Button>;

    export const Primary: Story = {
    	args: {
    		variant: 'primary',
    		children: 'Button',
    	},
    };
    ```

### Code Formatting and Linting

This project uses Prettier for code formatting and ESLint for code linting:

- Format code:

    ```bash
    npm run format
    ```

- Check formatting:

    ```bash
    npm run format:check
    ```

- Lint code:
    ```bash
    npm run lint
    ```

Git hooks (via Husky) will automatically format and lint your code before commits.

## Testing

### Running Tests

Vitest is used for testing. While there's no explicit `test` script in package.json, you can run tests using Vitest directly:

```bash
npx vitest
```

### Writing Tests

- Place test files next to the files they test with a `.test.ts` or `.test.tsx` extension
- Use Vitest for unit and integration tests
- Follow the AAA pattern (Arrange, Act, Assert)
- Mock external dependencies

Example test:

```tsx
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
	it('renders correctly', () => {
		render(<Button>Click me</Button>);
		expect(screen.getByText('Click me')).toBeInTheDocument();
	});
});
```

## Database Development

### Using Drizzle Studio

Drizzle Studio provides a visual interface for managing the database:

```bash
npm run db:studio
```

### Database Migrations

Apply schema changes to the database:

```bash
npm run db:push
```

For more information on database development, see the [Database Documentation](./database.md).

## Deployment

### Building for Production

```bash
npm run build
```

### Starting the Production Server

```bash
npm start
```

### Deploying to Vercel

The easiest way to deploy the application is using Vercel:

1. Push your changes to GitHub
2. Connect your repository to Vercel
3. Vercel will automatically build and deploy your application

For more information on deployment, see the [Deployment Guide](./deployment.md).
