import React from 'react';
import { Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
	className?: string;
	iconOnly?: boolean;
}

export function Logo({ className, iconOnly = false }: LogoProps) {
	return (
		<div className={cn('flex items-center gap-2', className)}>
			<Brain className="h-6 w-6 text-primary" />
			{!iconOnly && (
				<span className="font-semibold text-xl">DevBrain</span>
			)}
		</div>
	);
}
