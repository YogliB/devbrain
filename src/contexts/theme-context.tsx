"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

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
	theme: 'system',
	setTheme: () => null,
	mounted: false,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
	children,
	defaultTheme = 'system',
	storageKey = 'devbrain-theme',
	...props
}: ThemeProviderProps) {
	// Always start with the default theme on the server
	const [theme, setTheme] = useState<Theme>(defaultTheme);
	// Track if we're mounted to avoid hydration issues
	const [mounted, setMounted] = useState(false);

	// Once mounted, update the theme based on localStorage
	useEffect(() => {
		setMounted(true);
		const storedTheme = localStorage.getItem(storageKey) as Theme;
		if (storedTheme) {
			setTheme(storedTheme);
		}
	}, [storageKey]);

	// Apply theme to document
	useEffect(() => {
		if (!mounted) return;

		const root = window.document.documentElement;
		root.classList.remove('light', 'dark');

		if (theme === 'system') {
			const systemTheme = window.matchMedia(
				'(prefers-color-scheme: dark)',
			).matches
				? 'dark'
				: 'light';
			root.classList.add(systemTheme);
			return;
		}

		root.classList.add(theme);
	}, [theme, mounted]);

	const value = {
		theme,
		setTheme: (theme: Theme) => {
			localStorage.setItem(storageKey, theme);
			setTheme(theme);
		},
		mounted,
	};

	return (
		<ThemeProviderContext.Provider {...props} value={value}>
			{children}
		</ThemeProviderContext.Provider>
	);
}

export const useTheme = () => {
	const context = useContext(ThemeProviderContext);

	if (context === undefined)
		throw new Error('useTheme must be used within a ThemeProvider');

	return context;
};
