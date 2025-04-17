import * as webllm from '@mlc-ai/web-llm';
import { Model, ModelDownloadStatus } from '@/types/model';

// Memory error types
export type MemoryErrorType = 'out-of-memory' | 'allocation-failed' | 'unknown';

// Memory error interface
export interface MemoryError extends Error {
	type: MemoryErrorType;
	modelId: string;
	recommendation: string;
}

/**
 * WebLLM service for managing model downloads and inference
 */
export class WebLLMService {
	private static instance: WebLLMService;
	private engines: Map<string, webllm.MLCEngineInterface> = new Map();
	private activeEngine: webllm.MLCEngineInterface | null = null;
	private activeModelId: string | null = null;
	private downloadControllers: Map<string, AbortController> = new Map();
	// Track memory errors
	private memoryErrors: Map<string, MemoryError> = new Map();

	private constructor() {
		// Initialize engines from cache when service is created
		this.initializeEnginesFromCache();
	}

	/**
	 * Get the singleton instance of WebLLMService
	 */
	public static getInstance(): WebLLMService {
		if (!WebLLMService.instance) {
			WebLLMService.instance = new WebLLMService();
		}
		return WebLLMService.instance;
	}

	/**
	 * Download a model and track progress
	 * @param model The model to download
	 * @param progressCallback Callback for download progress updates
	 * @returns The updated model with download status
	 */
	public async downloadModel(
		model: Model,
		progressCallback?: (
			progress: number,
			status: ModelDownloadStatus,
		) => void,
	): Promise<Model> {
		// Create an abort controller for this download
		const abortController = new AbortController();
		this.downloadControllers.set(model.id, abortController);
		try {
			// Set initial download status
			const updatedModel = {
				...model,
				downloadStatus: 'downloading' as ModelDownloadStatus,
				downloadProgress: 0,
			};

			// Report initial progress
			if (progressCallback) {
				progressCallback(0, 'downloading');
			}

			// Create a progress callback for WebLLM
			const initProgressCallback = (
				report: webllm.InitProgressReport,
			) => {
				// Extract progress percentage from the report text if possible
				let progress = 0;
				if (report.progress !== undefined) {
					progress = report.progress;
				} else if (report.text.includes('%')) {
					const match = report.text.match(/(\d+)%/);
					if (match && match[1]) {
						progress = parseInt(match[1], 10);
					}
				}

				// Ensure progress is between 1 and 99 during download
				// This prevents jumping from 0 to 100 without showing intermediate progress
				if (progress <= 0 && report.text.includes('Downloading')) {
					progress = 1; // Start at 1% to show some initial progress
				} else if (
					progress >= 100 &&
					report.text.includes('Downloading')
				) {
					progress = 99; // Cap at 99% until fully complete
				}

				// Update the model's download progress
				updatedModel.downloadProgress = progress;

				// Log progress for debugging
				console.log(
					`Model download progress: ${progress}%, ${report.text}`,
				);

				// Call the progress callback if provided
				if (progressCallback) {
					progressCallback(progress, 'downloading');
				}
			};

			// Create the WebLLM engine for this model
			// We'll use the model's name as the WebLLM model ID
			// This assumes the model names in our database match the WebLLM model IDs
			const webLLMModelId = this.getWebLLMModelId(model);

			// Create the engine with progress tracking
			// Note: We're using a custom approach to handle abort since WebLLM doesn't directly support it
			// We'll check the abort signal in our progress callback
			let engine;

			try {
				// Clear any previous memory errors for this model
				this.memoryErrors.delete(model.id);

				// Configure memory options to handle constraints better
				const engineOptions: webllm.MLCEngineOptions = {
					initProgressCallback: (report) => {
						// Check if the download has been aborted
						if (abortController.signal.aborted) {
							throw new DOMException(
								'Download aborted by user',
								'AbortError',
							);
						}
						// Otherwise, call the original callback
						initProgressCallback(report);
					},
					logLevel: 'INFO',
				};

				// Create the engine with the configured options
				engine = await webllm.CreateMLCEngine(
					webLLMModelId,
					engineOptions,
				);
			} catch (error) {
				// Handle WebAssembly memory errors
				if (
					error instanceof Error &&
					(error.message.includes('Out of memory') ||
						error.message.includes('Cannot allocate Wasm memory'))
				) {
					// Create a structured memory error
					const memError: MemoryError = {
						name: 'WebAssemblyMemoryError',
						message: `Not enough memory to load model ${model.name}. Try a smaller model or free up browser memory.`,
						type: 'out-of-memory',
						modelId: model.id,
						recommendation:
							'Try using a smaller model like TinyLlama, or restart your browser to free up memory.',
					};

					// Store the error for future reference
					this.memoryErrors.set(model.id, memError);
					console.error(
						`Memory error for model ${model.id}:`,
						memError,
					);

					// Rethrow with more information
					throw memError;
				}

				// Rethrow other errors
				throw error;
			}

			// Store the engine for future use
			this.engines.set(model.id, engine);

			// Set as active engine if we don't have one yet
			if (!this.activeEngine) {
				this.activeEngine = engine;
				this.activeModelId = model.id;
			}

			// Update the model status to downloaded
			updatedModel.downloadStatus = 'downloaded';
			updatedModel.isDownloaded = true;
			updatedModel.downloadProgress = 100;

			// Final progress callback
			if (progressCallback) {
				progressCallback(100, 'downloaded');
			}

			// Remove the abort controller as download is complete
			this.downloadControllers.delete(model.id);

			return updatedModel;
		} catch (error) {
			console.error('Failed to download model:', error);

			// Check if this was an abort error
			const wasAborted =
				error instanceof DOMException && error.name === 'AbortError';

			// Update the model status to failed or cancelled
			const failedModel = {
				...model,
				downloadStatus: wasAborted
					? ('cancelled' as ModelDownloadStatus)
					: ('failed' as ModelDownloadStatus),
				isDownloaded: false,
				downloadProgress: 0, // Ensure progress is reset to 0
			};

			// Call the progress callback with appropriate status
			if (progressCallback) {
				progressCallback(0, failedModel.downloadStatus);
			}

			// Remove the abort controller
			this.downloadControllers.delete(model.id);

			// Remove the engine from the engines map if it exists
			// This ensures isModelDownloaded returns false for cancelled models
			if (this.engines.has(model.id)) {
				this.engines.delete(model.id);
				console.log(
					`Removed engine for failed/cancelled model ${model.id}`,
				);
			}

			// If this was an abort error, add to cancelled models set
			if (wasAborted) {
				if (!this._cancelledModels) {
					this._cancelledModels = new Set<string>();
				}
				this._cancelledModels.add(model.id);
				console.log(
					`Added ${model.id} to cancelled models set (from catch block)`,
				);
			}

			return failedModel;
		}
	}

	/**
	 * Set the active model for inference
	 * @param modelId The ID of the model to set as active
	 * @returns True if successful, false otherwise
	 */
	public setActiveModel(modelId: string): boolean {
		const engine = this.engines.get(modelId);
		if (engine) {
			this.activeEngine = engine;
			this.activeModelId = modelId;
			return true;
		}
		return false;
	}

	/**
	 * Get the active model ID
	 * @returns The active model ID or null if none is set
	 */
	public getActiveModelId(): string | null {
		return this.activeModelId;
	}

	/**
	 * Get memory error for a model if one exists
	 * @param modelId The ID of the model to check
	 * @returns The memory error or null if none exists
	 */
	public getMemoryError(modelId: string): MemoryError | null {
		return this.memoryErrors.get(modelId) || null;
	}

	/**
	 * Check if a model has a memory error
	 * @param modelId The ID of the model to check
	 * @returns True if the model has a memory error, false otherwise
	 */
	public hasMemoryError(modelId: string): boolean {
		return this.memoryErrors.has(modelId);
	}

	/**
	 * Clear memory error for a model
	 * @param modelId The ID of the model to clear error for
	 */
	public clearMemoryError(modelId: string): void {
		this.memoryErrors.delete(modelId);
	}

	/**
	 * Check if a model is downloaded
	 * @param modelId The ID of the model to check
	 * @returns True if the model is downloaded, false otherwise
	 */
	public isModelDownloaded(modelId: string): boolean {
		// Track a map of cancelled models to ensure they're never considered downloaded
		if (!this._cancelledModels) {
			this._cancelledModels = new Set<string>();
		}

		// If the model was cancelled, it's not downloaded
		if (this._cancelledModels.has(modelId)) {
			console.log(
				`Model ${modelId} was cancelled, returning false for isModelDownloaded`,
			);
			return false;
		}

		// First check if the engine exists in memory
		if (this.engines.has(modelId)) {
			console.log(`Model ${modelId} engine exists in memory`);
			return true;
		}

		// If not in memory, check if it exists in the cache and initialize it if needed
		const model = this.models.find((m) => m.id === modelId);
		if (model) {
			this.checkAndInitializeEngine(model);
			// After initialization attempt, check again if the engine exists
			const result = this.engines.has(modelId);
			console.log(
				`Model ${modelId} engine initialized from cache: ${result}`,
			);
			return result;
		}

		console.log(`Model ${modelId} not found in memory or cache`);
		return false;
	}

	// Track cancelled models to ensure they're never considered downloaded
	private _cancelledModels: Set<string> | null = null;
	// Track available models
	private models: Model[] = [];

	/**
	 * Get the WebLLM model ID for a model
	 * @param model The model to get the WebLLM ID for
	 * @returns The WebLLM model ID
	 */
	private getWebLLMModelId(model: Model): string {
		// If the model has a webLLMId, use that
		if (model.webLLMId) {
			return model.webLLMId;
		}

		// Otherwise, map our model names to WebLLM model IDs
		// This is a simple mapping based on the model name
		// In a real app, you'd want to have a more robust mapping
		const modelNameToWebLLMId: Record<string, string> = {
			TinyLlama: 'TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC',
			Mistral: 'Mistral-7B-Instruct-v0.3-q4f16_1-MLC',
			'Phi-3': 'Phi-3-mini-4k-instruct-q4f32_1-MLC',
			'Llama 3': 'Llama-3-8B-Instruct-q4f32_1-MLC',
		};

		return (
			modelNameToWebLLMId[model.name] || 'Llama-3-8B-Instruct-q4f32_1-MLC'
		);
	}

	/**
	 * Format sources into a context string for the LLM
	 * @param sources The sources to include in the context
	 * @returns A formatted string containing the sources
	 */
	private formatSourcesContext(
		sources: Array<{ content: string; filename?: string }>,
	): string {
		if (!sources || sources.length === 0) {
			return '';
		}

		let context =
			'Here are the sources to use for answering the question:\n\n';

		sources.forEach((source, index) => {
			const sourceTitle = source.filename
				? `Source ${index + 1}: ${source.filename}`
				: `Source ${index + 1}`;
			context += `${sourceTitle}\n${source.content}\n\n`;
		});

		return context;
	}

	/**
	 * Send a message to the active model
	 * @param message The message to send
	 * @param sources Optional sources to provide as context
	 * @returns The model's response
	 */
	public async sendMessage(
		message: string,
		sources?: Array<{ content: string; filename?: string }>,
	): Promise<string> {
		if (!this.activeEngine) {
			throw new Error('No active model selected');
		}

		try {
			const messages: Array<{
				role: 'system' | 'user' | 'assistant';
				content: string;
			}> = [];

			// Add system message with instructions if sources are provided
			if (sources && sources.length > 0) {
				const sourcesContext = this.formatSourcesContext(sources);
				messages.push({
					role: 'system',
					content:
						'You are a helpful assistant that answers questions based on the provided sources. ' +
						'Use only the information from the sources to answer the question. ' +
						'If the sources do not contain the information needed to answer the question, ' +
						'say that you cannot answer based on the available information.\n\n' +
						sourcesContext,
				});
			} else {
				messages.push({
					role: 'system',
					content: 'You are a helpful assistant.',
				});
			}

			// Add the user message
			messages.push({ role: 'user', content: message });

			// Cast messages to any to avoid TypeScript errors with WebLLM's API
			const response = await this.activeEngine.chat.completions.create({
				messages: messages as any,
				temperature: 0.7,
				max_tokens: 800,
			});

			return response.choices[0].message.content || '';
		} catch (error) {
			console.error('Error sending message to model:', error);
			throw error;
		}
	}

	/**
	 * Cancel a specific model download
	 * @param modelId The ID of the model to cancel download for
	 * @returns True if the download was cancelled, false if no download was in progress
	 */
	public cancelDownload(modelId: string): boolean {
		// Always add to cancelled models set regardless of whether a download is in progress
		// This ensures isModelDownloaded always returns false for cancelled models
		if (!this._cancelledModels) {
			this._cancelledModels = new Set<string>();
		}
		this._cancelledModels.add(modelId);
		console.log(`Added ${modelId} to cancelled models set`);

		// Remove the engine from the engines map if it exists
		// This ensures isModelDownloaded returns false for cancelled models
		if (this.engines.has(modelId)) {
			this.engines.delete(modelId);
			console.log(`Removed engine for cancelled model ${modelId}`);
		}

		// If this was the active model, clear the active model
		if (this.activeModelId === modelId) {
			this.activeEngine = null;
			this.activeModelId = null;
			console.log(
				`Cleared active model because ${modelId} was cancelled`,
			);
		}

		// Check if there's an active download to cancel
		const controller = this.downloadControllers.get(modelId);
		if (controller) {
			// Abort the download
			controller.abort();
			this.downloadControllers.delete(modelId);
			console.log(`Cancelled download for model ${modelId}`);
			return true;
		}

		// Even if there was no active download, we've still marked the model as cancelled
		// and removed it from the engines map, so return true
		return true;
	}

	/**
	 * Cancel all ongoing downloads
	 */
	private cancelAllDownloads(): void {
		console.log(
			`Cancelling ${this.downloadControllers.size} ongoing downloads`,
		);

		// Initialize cancelled models set if it doesn't exist
		if (!this._cancelledModels) {
			this._cancelledModels = new Set<string>();
		}

		for (const [
			modelId,
			controller,
		] of this.downloadControllers.entries()) {
			// Abort the download
			controller.abort();

			// Add to cancelled models set
			this._cancelledModels.add(modelId);

			// Remove the engine from the engines map if it exists
			if (this.engines.has(modelId)) {
				this.engines.delete(modelId);
				console.log(`Removed engine for cancelled model ${modelId}`);
			}

			console.log(`Cancelled download for model ${modelId}`);
		}
		this.downloadControllers.clear();
	}

	/**
	 * Check if a model is currently downloading
	 * @param modelId The ID of the model to check
	 * @returns True if the model is currently downloading, false otherwise
	 */
	public isDownloading(modelId: string): boolean {
		return this.downloadControllers.has(modelId);
	}

	/**
	 * Set available models for cache checking
	 * @param models The available models
	 */
	public setAvailableModels(models: Model[]): void {
		this.models = models;
		// Check if any of these models are already in the cache
		this.initializeEnginesFromCache();
	}

	/**
	 * Initialize engines from cached models
	 */
	private async initializeEnginesFromCache(): Promise<void> {
		// Skip if we're not in a browser environment or if there are no models
		if (typeof window === 'undefined' || !this.models.length) {
			return;
		}

		console.log('Checking for cached models...');

		// For each model, check if it's in the cache and initialize its engine
		for (const model of this.models) {
			await this.checkAndInitializeEngine(model);
		}
	}

	/**
	 * Check if a model is in the cache and initialize its engine if it is
	 * @param model The model to check
	 */
	private async checkAndInitializeEngine(model: Model): Promise<boolean> {
		try {
			// Skip if the engine is already initialized or if the model was cancelled
			if (
				this.engines.has(model.id) ||
				(this._cancelledModels && this._cancelledModels.has(model.id))
			) {
				return this.engines.has(model.id);
			}

			// Get the WebLLM model ID
			const webLLMModelId = this.getWebLLMModelId(model);

			// Check if the model exists in the cache by creating an engine
			// WebLLM will use the cached model if it exists
			// We use a silent progress callback to avoid UI updates
			const silentProgressCallback = () => {};

			try {
				// Try to create the engine - this will use the cached model if it exists
				// If the model is not in the cache, this will start downloading it
				// We'll abort the download if it's not in the cache
				const abortController = new AbortController();

				// Set a timeout to abort if it takes too long (indicating a download)
				const timeoutId = setTimeout(() => {
					console.log(
						`Model ${model.id} not in cache, aborting initialization`,
					);
					abortController.abort();
				}, 1000); // Abort after 1 second if it's downloading

				const engine = await webllm.CreateMLCEngine(webLLMModelId, {
					initProgressCallback: (report) => {
						// If we get a progress report with a low percentage, it means the model is downloading
						// Abort the download in this case
						if (
							report.progress !== undefined &&
							report.progress < 50
						) {
							console.log(
								`Model ${model.id} is downloading (${report.progress}%), aborting`,
							);
							abortController.abort();
						}
						silentProgressCallback();
					},
					logLevel: 'INFO',
				});

				// Clear the timeout since we successfully created the engine
				clearTimeout(timeoutId);

				// If we get here, the model was in the cache
				console.log(
					`Model ${model.id} found in cache, engine initialized`,
				);

				// Store the engine
				this.engines.set(model.id, engine);

				// Set as active engine if we don't have one yet
				if (!this.activeEngine) {
					this.activeEngine = engine;
					this.activeModelId = model.id;
				}

				return true;
			} catch (error) {
				// If the error is an AbortError, it means we aborted the download
				if (
					error instanceof DOMException &&
					error.name === 'AbortError'
				) {
					console.log(
						`Model ${model.id} initialization aborted - not in cache`,
					);
				} else {
					console.error(
						`Error checking cache for model ${model.id}:`,
						error,
					);
				}
				return false;
			}
		} catch (error) {
			console.error(`Error checking cache for model ${model.id}:`, error);
			return false;
		}
	}

	/**
	 * Get a smaller model recommendation based on a model ID
	 * @param modelId The ID of the model to get a recommendation for
	 * @returns The ID of a recommended smaller model, or null if none is available
	 */
	public getSmallerModelRecommendation(modelId: string): string | null {
		// Get the model
		const model = this.models.find((m) => m.id === modelId);
		if (!model) return null;

		// Model size hierarchy from smallest to largest
		const modelSizeHierarchy = [
			'TinyLlama', // Smallest
			'Phi-3',
			'Llama 3',
			'Mistral', // Largest
		];

		// Find the current model's position in the hierarchy
		const currentIndex = modelSizeHierarchy.findIndex((name) =>
			model.name.includes(name),
		);

		// If model not found in hierarchy or already the smallest, return null
		if (currentIndex <= 0) return null;

		// Get the next smaller model name
		const smallerModelName = modelSizeHierarchy[currentIndex - 1];

		// Find a model with that name
		const smallerModel = this.models.find((m) =>
			m.name.includes(smallerModelName),
		);

		return smallerModel?.id || null;
	}

	/**
	 * Remove a downloaded model from the cache
	 * @param modelId The ID of the model to remove
	 * @returns True if the model was removed, false if it wasn't downloaded
	 */
	public removeModel(modelId: string): boolean {
		// Check if the model is currently downloading and cancel if needed
		if (this.isDownloading(modelId)) {
			this.cancelDownload(modelId);
		}

		// Check if the model is in the engines map
		if (!this.engines.has(modelId)) {
			console.log(
				`Model ${modelId} not found in engines map, nothing to remove`,
			);
			return false;
		}

		// If this is the active model, clear the active model
		if (this.activeModelId === modelId) {
			this.activeEngine = null;
			this.activeModelId = null;
			console.log(`Cleared active model because ${modelId} was removed`);
		}

		// Remove the engine from the engines map
		this.engines.delete(modelId);
		console.log(`Removed engine for model ${modelId}`);

		// Clear any memory errors for this model
		this.memoryErrors.delete(modelId);

		// Add to cancelled models set to ensure it's not considered downloaded
		if (!this._cancelledModels) {
			this._cancelledModels = new Set<string>();
		}
		this._cancelledModels.add(modelId);

		// Try to clear the model from WebLLM's cache
		try {
			// WebLLM doesn't provide a direct API to clear cache for a specific model
			// We would need to use browser APIs to clear IndexedDB storage
			// This is a placeholder for future implementation
			console.log(
				`Note: WebLLM doesn't provide a direct API to clear cache for a specific model`,
			);
			console.log(
				`The model will be removed from memory but may still exist in browser cache`,
			);
		} catch (error) {
			console.error(`Error clearing cache for model ${modelId}:`, error);
		}

		return true;
	}

	/**
	 * Clean up resources when the service is no longer needed
	 */
	public async cleanup(): Promise<void> {
		// Clean up all engines
		// WebLLM doesn't have a specific cleanup method, but we'll log for debugging
		console.log(`Cleaning up ${this.engines.size} WebLLM engines`);

		// If WebLLM adds cleanup methods in the future, we would iterate through engines here

		// Cancel any ongoing downloads
		this.cancelAllDownloads();

		// Clear the engines map
		this.engines.clear();
		this.activeEngine = null;
		this.activeModelId = null;

		// Clear memory errors
		this.memoryErrors.clear();
	}
}

// Export a singleton instance
export const webLLMService = WebLLMService.getInstance();
