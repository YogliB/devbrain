import React from 'react';
import { ThemeProvider } from '@/contexts/theme-context';
import { TooltipProvider } from '@/components/ui/tooltip';

export const ThemeDecorator = (Story: React.ComponentType) => {
	return (
		<ThemeProvider defaultTheme="light" storageKey="devbrain-theme">
			<TooltipProvider>
				<Story />
			</TooltipProvider>
		</ThemeProvider>
	);
};
