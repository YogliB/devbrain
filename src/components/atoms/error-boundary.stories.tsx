import type { Meta, StoryObj } from '@storybook/react';
import { ErrorBoundary } from './error-boundary';

// Component that throws an error for testing
function ErrorComponent() {
	throw new Error('This is a test error');
	return <div>This will never render</div>;
}

// Component that doesn't throw an error
function NormalComponent() {
	return <div className="p-4 border rounded">This is a normal component</div>;
}

const meta: Meta<typeof ErrorBoundary> = {
	title: 'Atoms/ErrorBoundary',
	component: ErrorBoundary,
	parameters: {
		layout: 'padded',
	},
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ErrorBoundary>;

export const WithErroringComponent: Story = {
	args: {
		children: <ErrorComponent />,
	},
};

export const WithNormalComponent: Story = {
	args: {
		children: <NormalComponent />,
	},
};

export const WithCustomFallback: Story = {
	args: {
		children: <ErrorComponent />,
		fallback: (
			<div className="p-4 border-2 border-red-500 rounded-md text-center">
				<h3 className="text-lg font-bold text-red-500">
					Custom Error UI
				</h3>
				<p>Something went wrong with this component.</p>
			</div>
		),
	},
};
