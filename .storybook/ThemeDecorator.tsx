import React from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { StorybookThemeProvider } from './storybook-theme-context';

export const ThemeDecorator = (Story: React.ComponentType) => {
	return (
		<StorybookThemeProvider defaultTheme="light">
			<TooltipProvider>
				<div className="p-4">
					<Story />
				</div>
			</TooltipProvider>
		</StorybookThemeProvider>
	);
};
