import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
	resolve: {
		alias: {
			'@': path.resolve(__dirname, '../src'),
		},
	},
	optimizeDeps: {
		exclude: [
			'@storybook/addon-docs',
			'@storybook/blocks',
			'@storybook/theming',
			'@storybook/components',
			'@storybook/preview-api',
			'storybook-dark-mode',
		],
	},
});
