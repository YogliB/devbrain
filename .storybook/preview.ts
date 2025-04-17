import type { Preview } from '@storybook/react';
import '../src/app/globals.css';
import './storybook.css';
import { ThemeDecorator } from './ThemeDecorator';

const preview: Preview = {
	decorators: [(Story) => ThemeDecorator(Story)],
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
		backgrounds: {
			disable: true, // Disable background controls as we're using the theme
		},
		layout: 'centered',
		// Note: Instead of using argTypesRegex, use explicit actions with fn from @storybook/test
		// Example: actions: { onClick: fn() }
	},
};

export default preview;
