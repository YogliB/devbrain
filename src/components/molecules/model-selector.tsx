"use client";

import React, { useState } from 'react';
import { Check, ChevronDown, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Model } from '@/types/model';

interface ModelSelectorProps {
	className?: string;
	models: Model[];
	selectedModel: Model | null;
	onSelectModel: (model: Model) => void;
	onDownloadModel: (model: Model) => void;
}

export function ModelSelector({
	className,
	models,
	selectedModel,
	onSelectModel,
	onDownloadModel,
}: ModelSelectorProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [showModelInfo, setShowModelInfo] = useState<Model | null>(null);

	const toggleDropdown = () => setIsOpen(!isOpen);

	const handleModelSelect = (model: Model) => {
		if (model.isDownloaded) {
			onSelectModel(model);
			setIsOpen(false);
		} else {
			setShowModelInfo(model);
		}
	};

	const handleDownload = (model: Model, e: React.MouseEvent) => {
		e.stopPropagation();
		onDownloadModel(model);
		setShowModelInfo(null);
	};

	return (
		<div className={cn('relative', className)}>
			<button
				onClick={toggleDropdown}
				className="flex items-center justify-between w-full px-4 py-2 text-left bg-background border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
			>
				<span>
					{selectedModel ? selectedModel.name : 'Select a model'}
				</span>
				<ChevronDown className="h-4 w-4 ml-2" />
			</button>

			{isOpen && (
				<div className="absolute z-10 mt-1 w-full bg-popover border border-border rounded-md shadow-lg">
					<ul className="py-1 max-h-60 overflow-auto">
						{models.map((model) => (
							<li
								key={model.id}
								onClick={() => handleModelSelect(model)}
								className="px-4 py-2 hover:bg-muted cursor-pointer flex items-center justify-between"
							>
								<span>{model.name}</span>
								<span className="flex items-center">
									{model.isDownloaded ? (
										<Check className="h-4 w-4 text-green-500" />
									) : (
										<Download className="h-4 w-4 text-muted-foreground" />
									)}
								</span>
							</li>
						))}
					</ul>
				</div>
			)}

			{showModelInfo && (
				<div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
					<div className="bg-card border border-border rounded-lg shadow-lg p-6 max-w-md w-full">
						<h3 className="text-lg font-semibold mb-4">
							{showModelInfo.name}
						</h3>
						<div className="space-y-2 mb-6">
							<p>
								<span className="font-medium">Parameters:</span>{' '}
								{showModelInfo.parameters}
							</p>
							<p>
								<span className="font-medium">Size:</span>{' '}
								{showModelInfo.size}
							</p>
							<p>
								<span className="font-medium">Use case:</span>{' '}
								{showModelInfo.useCase}
							</p>
						</div>
						<div className="flex justify-end space-x-2">
							<button
								onClick={() => setShowModelInfo(null)}
								className="px-4 py-2 border border-input rounded-md hover:bg-muted"
							>
								Cancel
							</button>
							<button
								onClick={(e) => handleDownload(showModelInfo, e)}
								className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center"
							>
								<Download className="h-4 w-4 mr-2" />
								Download
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
