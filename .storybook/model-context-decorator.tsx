import React from 'react';

export const ModelContextDecorator = (Story: React.ComponentType) => (
	<ModelProviderMock>
		<Story />
	</ModelProviderMock>
);

function ModelProviderMock({ children }: { children: React.ReactNode }) {
	const mockContextValue = {
		modelAvailable: true,
		modelStatus: 'loading' as const,
		modelProgress: 45,
		modelProgressText: 'Downloading model files...',
		loadModel: async () => {},
		generateResponse: async () => 'This is a mock response',
		generateSuggestedQuestions: async () => [],
	};

	// @ts-ignore - This is for Storybook only
	window.useModel = () => mockContextValue;

	return <>{children}</>;
}
