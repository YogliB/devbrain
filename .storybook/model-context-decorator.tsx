import React from 'react';

// Mock context value
const mockContextValue = {
	modelAvailable: true,
};

// Create a wrapper component that provides the mock context
export const ModelContextDecorator = (Story: React.ComponentType) => {
	// Override the useModel hook for the story
	// @ts-ignore - This is for Storybook only
	window.useModel = mockContextValue;

	return <Story />;
};
