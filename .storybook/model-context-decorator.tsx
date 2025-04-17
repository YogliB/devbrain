import React from 'react';

// Mock context value
const mockContextValue = {
	modelAvailable: true,
	modelStatus: 'loading' as const,
	modelProgress: 45,
	modelProgressText: 'Downloading model files...',
	loadModel: async () => {},
	generateResponse: async () => 'This is a mock response',
	generateStreamingResponse: async () => 'This is a mock streaming response',
};

// Create a wrapper component that provides the mock context
export const ModelContextDecorator = (Story: React.ComponentType) => {
	// Override the useModel hook for the story
	// @ts-ignore - This is for Storybook only
	window.useModel = () => mockContextValue;

	return <Story />;
};
