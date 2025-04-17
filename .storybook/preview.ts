import type { Preview } from '@storybook/react';
import '../src/app/globals.css';
import { ThemeDecorator } from './ThemeDecorator';

const preview: Preview = {
	decorators: [ThemeDecorator],
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
		backgrounds: {
			default: 'light',
			values: [
				{
					name: 'light',
					value: '#ffffff',
				},
				{
					name: 'dark',
					value: '#1c1c1c',
				},
			],
		},
		layout: 'centered',
	},
};

export default preview;
