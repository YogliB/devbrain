'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useModel } from '@/contexts/model-context';
import { Cpu } from 'lucide-react';
import { ModelLoadingIndicator } from './model-loading-indicator';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';

interface ModelSelectorProps {
	className?: string;
	isCollapsed?: boolean;
}

export function ModelSelector({
	className,
	isCollapsed = false,
}: ModelSelectorProps) {
	const { modelStatus, selectedModel } = useModel();

	return (
		<div className={cn('space-y-2', className)}>
			{modelStatus === 'loaded' && selectedModel ? (
				isCollapsed ? (
					<Tooltip>
						<TooltipTrigger asChild>
							<div className="flex justify-center p-2">
								<Cpu className="h-5 w-5 text-primary" />
							</div>
						</TooltipTrigger>
						<TooltipContent sideOffset={5}>
							Active Model: {selectedModel.name}
						</TooltipContent>
					</Tooltip>
				) : (
					<div className="p-4 rounded-lg border bg-card">
						<div className="flex items-center gap-3 mb-2">
							<Cpu className="h-5 w-5 text-primary" />
							<h3 className="text-sm font-medium">
								Active Model: {selectedModel.name}
							</h3>
						</div>
						<p className="text-xs text-muted-foreground">
							{selectedModel.description}
						</p>
					</div>
				)
			) : (
				<ModelLoadingIndicator isCollapsed={isCollapsed} />
			)}
		</div>
	);
}
