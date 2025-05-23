'use client';

import React, { useState, useEffect } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';
import { cn } from '@/lib/utils';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';

interface ThemeToggleProps {
	className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
	const { theme, setTheme } = useTheme();

	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return <div className={cn('flex items-center gap-2 h-9', className)} />;
	}

	return (
		<div className={cn('flex items-center gap-2', className)}>
			<Tooltip>
				<TooltipTrigger asChild>
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
				</TooltipTrigger>
				<TooltipContent sideOffset={5}>Light mode</TooltipContent>
			</Tooltip>

			<Tooltip>
				<TooltipTrigger asChild>
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
				</TooltipTrigger>
				<TooltipContent sideOffset={5}>Dark mode</TooltipContent>
			</Tooltip>

			<Tooltip>
				<TooltipTrigger asChild>
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
				</TooltipTrigger>
				<TooltipContent sideOffset={5}>
					System preference
				</TooltipContent>
			</Tooltip>
		</div>
	);
}
