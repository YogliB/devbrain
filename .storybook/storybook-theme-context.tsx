import React, { createContext, useContext, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeProviderProps {
	children: React.ReactNode;
	defaultTheme?: Theme;
	storageKey?: string;
}

interface ThemeProviderState {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	mounted: boolean;
}

const initialState: ThemeProviderState = {
	theme: 'light',
	setTheme: () => null,
	mounted: true,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function StorybookThemeProvider({
	children,
	defaultTheme = 'light',
	...props
}: ThemeProviderProps) {
	const [theme, setTheme] = useState<Theme>(defaultTheme);

	// For Storybook, we'll always consider the component mounted
	const mounted = true;

	// Simple theme setter for Storybook
	const value = {
		theme,
		setTheme: (theme: Theme) => {
			setTheme(theme);

			// Apply theme class to document for Storybook
			const root = document.documentElement;
			root.classList.remove('light', 'dark');
			root.classList.add(theme === 'system' ? 'light' : theme);
		},
		mounted,
	};

	return (
		<ThemeProviderContext.Provider {...props} value={value}>
			<div className={theme}>{children}</div>
		</ThemeProviderContext.Provider>
	);
}

export const useStorybookTheme = () => {
	const context = useContext(ThemeProviderContext);

	if (context === undefined)
		throw new Error(
			'useStorybookTheme must be used within a StorybookThemeProvider',
		);

	return context;
};
