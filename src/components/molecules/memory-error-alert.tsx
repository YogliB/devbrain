'use client';

import React from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useModel } from '@/contexts/model-context';
import { MemoryError } from '@/lib/webllm';

interface MemoryErrorAlertProps {
	modelId: string;
	onRetry?: () => void;
	onSelectSmaller?: (modelId: string) => void;
	className?: string;
}

export function MemoryErrorAlert({
	modelId,
	onRetry,
	onSelectSmaller,
	className = '',
}: MemoryErrorAlertProps) {
	const { getMemoryError, clearMemoryError, getSmallerModelRecommendation } =
		useModel();

	const memoryError = getMemoryError(modelId);
	if (!memoryError) return null;

	const smallerModelId = getSmallerModelRecommendation(modelId);

	const handleRetry = () => {
		clearMemoryError(modelId);
		if (onRetry) onRetry();
	};

	const handleSelectSmaller = () => {
		if (smallerModelId && onSelectSmaller) {
			clearMemoryError(modelId);
			onSelectSmaller(smallerModelId);
		}
	};

	return (
		<Alert variant="destructive" className={`mb-4 ${className}`}>
			<AlertCircle className="h-4 w-4" />
			<AlertTitle>Memory Error</AlertTitle>
			<AlertDescription className="mt-2">
				<p className="mb-2">{memoryError.message}</p>
				<div className="flex flex-wrap gap-2 mt-3">
					<button
						onClick={handleRetry}
						className="px-2 py-1 text-xs bg-background border border-input rounded-md hover:bg-muted flex items-center gap-1"
					>
						<RefreshCcw className="h-3 w-3" />
						Retry
					</button>

					{smallerModelId && (
						<button
							onClick={handleSelectSmaller}
							className="px-2 py-1 text-xs bg-background border border-input rounded-md hover:bg-muted"
						>
							Try Smaller Model
						</button>
					)}
				</div>
			</AlertDescription>
		</Alert>
	);
}
