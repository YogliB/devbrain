'use client';

import React, { useState } from 'react';
import { useModel } from '@/contexts/model-context';
import { ModelDownloadCard } from '@/components/molecules/model-download-card';

/**
 * A test component to verify model integration
 */
export function ModelTest() {
	const {
		models,
		selectedModel,
		getDownloadProgress,
		getDownloadStatus,
		isModelDownloaded,
		downloadModel,
		cancelDownload,
		removeModel,
	} = useModel();
	const [prompt, setPrompt] = useState('');
	const [response, setResponse] = useState('');
	const [isGenerating, setIsGenerating] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!selectedModel?.isDownloaded) {
			setError('Please download a model first');
			return;
		}

		if (!prompt.trim()) {
			setError('Please enter a prompt');
			return;
		}

		setError(null);
		setIsGenerating(true);

		try {
			// Placeholder for model response - will be implemented with new service
			const result = `This is a placeholder response. The AI model integration is being reimplemented.\n\nYour prompt was: "${prompt}"`;
			setResponse(result);
		} catch (err) {
			console.error('Error generating response:', err);
			setError(
				`Error: ${err instanceof Error ? err.message : String(err)}`,
			);
		} finally {
			setIsGenerating(false);
		}
	};

	return (
		<div className="p-4 border border-border rounded-md">
			<h3 className="text-lg font-semibold mb-4">
				Test Model Integration
			</h3>

			<div className="mb-4">
				<h4 className="text-sm font-medium mb-3">Model Selection</h4>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
					{models.map((model) => {
						// Get the current download status and progress for this model
						const downloadStatus = getDownloadStatus(model.id);
						const downloadProgress = getDownloadProgress(model.id);
						const isDownloaded = isModelDownloaded(model.id);

						return (
							<ModelDownloadCard
								key={model.id}
								model={{
									...model,
									downloadProgress,
									downloadStatus,
									isDownloaded,
								}}
								onDownload={downloadModel}
								onCancel={cancelDownload}
								onRemove={removeModel}
							/>
						);
					})}
				</div>

				<p className="text-sm text-muted-foreground mb-2">
					Selected Model:{' '}
					{selectedModel ? selectedModel.name : 'None'}
					{selectedModel?.isDownloaded
						? ' (Downloaded)'
						: ' (Not Downloaded)'}
				</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label
						htmlFor="prompt"
						className="block text-sm font-medium mb-1"
					>
						Prompt
					</label>
					<textarea
						id="prompt"
						value={prompt}
						onChange={(e) => setPrompt(e.target.value)}
						className="w-full p-2 border border-input rounded-md bg-background"
						rows={3}
						placeholder="Enter your prompt here..."
					/>
				</div>

				<button
					type="submit"
					disabled={isGenerating || !selectedModel?.isDownloaded}
					className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isGenerating ? 'Generating...' : 'Generate Response'}
				</button>
			</form>

			{error && (
				<div className="mt-4 p-2 bg-red-100 border border-red-300 text-red-800 rounded-md">
					{error}
				</div>
			)}

			{response && (
				<div className="mt-4">
					<h4 className="text-md font-medium mb-2">Response:</h4>
					<div className="p-3 bg-muted rounded-md whitespace-pre-wrap">
						{response}
					</div>
				</div>
			)}
		</div>
	);
}
