'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ThinkingIndicatorProps {
	className?: string;
}

export function ThinkingIndicator({ className }: ThinkingIndicatorProps) {
	return (
		<div className={cn('flex items-center space-x-1.5', className)}>
			<div className="animate-blink-delay-0 thinking-dot-1 h-2.5 w-2.5 rounded-full bg-primary"></div>
			<div className="animate-blink-delay-200 thinking-dot-2 h-2.5 w-2.5 rounded-full bg-primary"></div>
			<div className="animate-blink-delay-400 thinking-dot-3 h-2.5 w-2.5 rounded-full bg-primary"></div>
		</div>
	);
}
