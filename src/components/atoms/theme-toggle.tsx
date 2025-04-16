"use client";

import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
	className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
	const { theme, setTheme } = useTheme();

	return (
		<div className={cn('flex items-center gap-2', className)}>
			<button
				onClick={() => setTheme('light')}
				className={cn(
					'p-2 rounded-md transition-colors',
					theme === 'light'
						? 'bg-primary text-primary-foreground'
						: 'hover:bg-muted',
				)}
				aria-label="Light mode"
			>
				<Sun className="h-5 w-5" />
			</button>
			<button
				onClick={() => setTheme('dark')}
				className={cn(
					'p-2 rounded-md transition-colors',
					theme === 'dark'
						? 'bg-primary text-primary-foreground'
						: 'hover:bg-muted',
				)}
				aria-label="Dark mode"
			>
				<Moon className="h-5 w-5" />
			</button>
			<button
				onClick={() => setTheme('system')}
				className={cn(
					'p-2 rounded-md transition-colors',
					theme === 'system'
						? 'bg-primary text-primary-foreground'
						: 'hover:bg-muted',
				)}
				aria-label="System preference"
			>
				<Monitor className="h-5 w-5" />
			</button>
		</div>
	);
}
