import React from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { StorybookThemeProvider } from './storybook-theme-context';
import { ModelContextDecorator } from './model-context-decorator';

export const ThemeDecorator = (Story: React.ComponentType) => {
	// Apply the model context decorator
	const StoryWithModelContext = () => ModelContextDecorator(Story);

	return (
		<StorybookThemeProvider defaultTheme="light">
			<TooltipProvider>
				<div className="p-4">
					<StoryWithModelContext />
				</div>
			</TooltipProvider>
		</StorybookThemeProvider>
	);
};
