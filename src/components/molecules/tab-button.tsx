import React from 'react';
import { cn } from '@/lib/utils';

interface TabButtonProps {
	isActive: boolean;
	onClick: () => void;
	children: React.ReactNode;
	className?: string;
}

export function TabButton({
	isActive,
	onClick,
	children,
	className,
}: TabButtonProps) {
	return (
		<button
			onClick={onClick}
			className={cn(
				'px-4 py-2 font-medium text-sm transition-colors relative',
				isActive
					? 'text-foreground'
					: 'text-muted-foreground hover:text-foreground',
				className,
			)}
		>
			{children}
			{isActive && (
				<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
			)}
		</button>
	);
}
