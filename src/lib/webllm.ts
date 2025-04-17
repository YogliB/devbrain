import * as webllm from '@mlc-ai/web-llm';
import { Model, ModelDownloadStatus } from '@/types/model';

// Custom fetch function to use our proxy API
const proxyFetch = (url: string, init?: RequestInit): Promise<Response> => {
	// Encode the URL to handle special characters
	const encodedUrl = encodeURIComponent(url);
	// Use our proxy API route
	return fetch(`/api/proxy/model?url=${encodedUrl}`, init);
};

// Define the type for WebLLM engine options
interface CustomMLCEngineOptions {
	initProgressCallback?: (report: any) => void;
	logLevel?: string;
	customFetch?: (url: string, init?: RequestInit) => Promise<Response>;
}

// Memory error types
export type MemoryErrorType = 'out-of-memory' | 'allocation-failed' | 'unknown';

// Memory error interface
export interface MemoryError extends Error {
	type: MemoryErrorType;
	modelId: string;
	recommendation: string;
}

// Module-level state variables (private)
// These replace the private class properties
const engines: Map<string, webllm.MLCEngineInterface> = new Map();
let activeEngine: webllm.MLCEngineInterface | null = null;
let activeModelId: string | null = null;
const downloadControllers: Map<string, AbortController> = new Map();
const memoryErrors: Map<string, MemoryError> = new Map();
const cancelledModels: Set<string> = new Set<string>();
let availableModels: Model[] = [];

/**
 * Initialize engines from cached models
 */
const initializeEnginesFromCache = async (): Promise<void> => {
	// Skip if we're not in a browser environment or if there are no models
	if (typeof window === 'undefined' || !availableModels.length) {
		return;
	}

	// Only check the smallest model (TinyLlama) at startup to avoid memory issues
	// Sort models by size (using our hierarchy) and only check the smallest one
	const modelSizeHierarchy = [
		'TinyLlama', // Smallest
		'Phi-3',
		'Llama 3',
		'Mistral', // Largest
	];

	// Find the smallest model available
	let smallestModel: Model | undefined;
	for (const modelName of modelSizeHierarchy) {
		smallestModel = availableModels.find((m) => m.name.includes(modelName));
		if (smallestModel) break;
	}

	// If we found a model, check if it's in the cache
	if (smallestModel) {
		await checkAndInitializeEngine(smallestModel);
	}
};

/**
 * Get the WebLLM model ID for a model
 * @param model The model to get the WebLLM ID for
 * @returns The WebLLM model ID
 */
const getWebLLMModelId = (model: Model): string => {
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

	return modelNameToWebLLMId[model.name] || 'Llama-3-8B-Instruct-q4f32_1-MLC';
};

/**
 * Check if a model is in the cache and initialize its engine if it is
 * @param model The model to check
 */
const checkAndInitializeEngine = async (model: Model): Promise<boolean> => {
	try {
		// Skip if the engine is already initialized or if the model was cancelled
		if (engines.has(model.id) || cancelledModels.has(model.id)) {
			return engines.has(model.id);
		}

		// Get the WebLLM model ID
		const webLLMModelId = getWebLLMModelId(model);

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
				abortController.abort();
			}, 1000); // Abort after 1 second if it's downloading

			try {
				const engine = await webllm.CreateMLCEngine(webLLMModelId, {
					initProgressCallback: (report: any) => {
						// If we get a progress report with a low percentage, it means the model is downloading
						// Abort the download in this case
						if (
							report.progress !== undefined &&
							report.progress < 50
						) {
							abortController.abort();
						}
						silentProgressCallback();
					},
					logLevel: 'INFO',
					// Use our proxy fetch function
					customFetch: proxyFetch,
				} as any);

				// Clear the timeout since we successfully created the engine
				clearTimeout(timeoutId);

				// If we get here, the model was in the cache

				// Store the engine
				engines.set(model.id, engine);

				// Set as active engine if we don't have one yet
				if (!activeEngine) {
					activeEngine = engine;
					activeModelId = model.id;
				}

				return true;
			} catch (error) {
				// Handle memory errors specifically
				if (
					error instanceof Error &&
					(error.message.includes('Out of memory') ||
						error.message.includes('Cannot allocate Wasm memory'))
				) {
					// Create a structured memory error
					const memError: MemoryError = {
						name: 'WebAssemblyMemoryError',
						message: `Not enough memory to check model ${model.name}. This is normal at startup.`,
						type: 'out-of-memory',
						modelId: model.id,
						recommendation:
							'No action needed. You can still download models manually.',
					};

					// Store the error for future reference
					memoryErrors.set(model.id, memError);

					// Just log a simple message for memory errors during cache check

					return false;
				}

				// If the error is an AbortError, it means we aborted the download
				if (
					error instanceof DOMException &&
					error.name === 'AbortError'
				) {
				} else {
					console.error(
						`Error checking cache for model ${model.id}:`,
						error,
					);
				}
				return false;
			}
		} catch (error) {
			// No need to clear timeout here as it's handled in the inner try/catch
			console.error(`Error checking cache for model ${model.id}:`, error);
			return false;
		}
	} catch (error) {
		console.error(`Error checking cache for model ${model.id}:`, error);
		return false;
	}
};

/**
 * Format sources into a context string for the LLM
 * @param sources The sources to include in the context
 * @returns A formatted string containing the sources
 */
const formatSourcesContext = (
	sources: Array<{ content: string; filename?: string }>,
): string => {
	if (!sources || sources.length === 0) {
		return '';
	}

	let context = 'Here are the sources to use for answering the question:\n\n';

	sources.forEach((source, index) => {
		const sourceTitle = source.filename
			? `Source ${index + 1}: ${source.filename}`
			: `Source ${index + 1}`;
		context += `${sourceTitle}\n${source.content}\n\n`;
	});

	return context;
};

/**
 * Cancel all ongoing downloads
 */
const cancelAllDownloads = (): void => {
	for (const [modelId, controller] of downloadControllers.entries()) {
		// Abort the download
		controller.abort();

		// Add to cancelled models set
		cancelledModels.add(modelId);

		// Remove the engine from the engines map if it exists
		if (engines.has(modelId)) {
			engines.delete(modelId);
		}
	}
	downloadControllers.clear();
};

// --------- Public API Functions ----------

/**
 * Download a model and track progress
 * @param model The model to download
 * @param progressCallback Callback for download progress updates
 * @returns The updated model with download status
 */
export const downloadModel = async (
	model: Model,
	progressCallback?: (progress: number, status: ModelDownloadStatus) => void,
): Promise<Model> => {
	// Create an abort controller for this download
	const abortController = new AbortController();
	downloadControllers.set(model.id, abortController);
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
		const initProgressCallback = (report: webllm.InitProgressReport) => {
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
			} else if (progress >= 100 && report.text.includes('Downloading')) {
				progress = 99; // Cap at 99% until fully complete
			}

			// Update the model's download progress
			updatedModel.downloadProgress = progress;

			// Call the progress callback if provided
			if (progressCallback) {
				progressCallback(progress, 'downloading');
			}
		};

		// Create the WebLLM engine for this model
		// We'll use the model's name as the WebLLM model ID
		// This assumes the model names in our database match the WebLLM model IDs
		const webLLMModelId = getWebLLMModelId(model);

		// Create the engine with progress tracking
		// Note: We're using a custom approach to handle abort since WebLLM doesn't directly support it
		// We'll check the abort signal in our progress callback
		let engine;

		try {
			// Clear any previous memory errors for this model
			memoryErrors.delete(model.id);

			// Configure memory options to handle constraints better
			const engineOptions: CustomMLCEngineOptions = {
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

			// Create the engine with the configured options and our proxy fetch
			engine = await webllm.CreateMLCEngine(webLLMModelId, {
				...engineOptions,
				// Override the fetch function to use our proxy
				customFetch: proxyFetch,
			} as any);
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
				memoryErrors.set(model.id, memError);
				console.error(`Memory error for model ${model.id}:`, memError);

				// Rethrow with more information
				throw memError;
			}

			// Rethrow other errors
			throw error;
		}

		// Store the engine for future use
		engines.set(model.id, engine);

		// Set as active engine if we don't have one yet
		if (!activeEngine) {
			activeEngine = engine;
			activeModelId = model.id;
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
		downloadControllers.delete(model.id);

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
		downloadControllers.delete(model.id);

		// Remove the engine from the engines map if it exists
		// This ensures isModelDownloaded returns false for cancelled models
		if (engines.has(model.id)) {
			engines.delete(model.id);
			console.log(
				`Removed engine for failed/cancelled model ${model.id}`,
			);
		}

		// If this was an abort error, add to cancelled models set
		if (wasAborted) {
			cancelledModels.add(model.id);
		}

		return failedModel;
	}
};

/**
 * Set the active model for inference
 * @param modelId The ID of the model to set as active
 * @returns True if successful, false otherwise
 */
export const setActiveModel = (modelId: string): boolean => {
	const engine = engines.get(modelId);
	if (engine) {
		activeEngine = engine;
		activeModelId = modelId;
		return true;
	}
	return false;
};

/**
 * Get the active model ID
 * @returns The active model ID or null if none is set
 */
export const getActiveModelId = (): string | null => activeModelId;

/**
 * Get memory error for a model if one exists
 * @param modelId The ID of the model to check
 * @returns The memory error or null if none exists
 */
export const getMemoryError = (modelId: string): MemoryError | null =>
	memoryErrors.get(modelId) || null;

/**
 * Check if a model has a memory error
 * @param modelId The ID of the model to check
 * @returns True if the model has a memory error, false otherwise
 */
export const hasMemoryError = (modelId: string): boolean =>
	memoryErrors.has(modelId);

/**
 * Clear memory error for a model
 * @param modelId The ID of the model to clear error for
 */
export const clearMemoryError = (modelId: string): void => {
	memoryErrors.delete(modelId);
};

/**
 * Check if a model is downloaded
 * @param modelId The ID of the model to check
 * @returns True if the model is downloaded, false otherwise
 */
export const isModelDownloaded = (modelId: string): boolean => {
	// If the model was cancelled, it's not downloaded
	if (cancelledModels.has(modelId)) {
		return false;
	}

	// First check if the engine exists in memory
	if (engines.has(modelId)) {
		return true;
	}

	// If not in memory, check if it exists in the cache and initialize it if needed
	const model = availableModels.find((m) => m.id === modelId);
	if (model) {
		checkAndInitializeEngine(model);
		// After initialization attempt, check again if the engine exists
		const result = engines.has(modelId);

		return result;
	}

	return false;
};

/**
 * Send a message to the active model
 * @param message The message to send
 * @param sources Optional sources to provide as context
 * @returns The model's response
 */
export const sendMessage = async (
	message: string,
	sources?: Array<{ content: string; filename?: string }>,
): Promise<string> => {
	if (!activeEngine) {
		throw new Error('No active model selected');
	}

	try {
		const messages: Array<{
			role: 'system' | 'user' | 'assistant';
			content: string;
		}> = [];

		// Add system message with instructions if sources are provided
		if (sources && sources.length > 0) {
			const sourcesContext = formatSourcesContext(sources);
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
		const response = await activeEngine.chat.completions.create({
			messages: messages as any,
			temperature: 0.7,
			max_tokens: 800,
		});

		return response.choices[0].message.content || '';
	} catch (error) {
		console.error('Error sending message to model:', error);
		throw error;
	}
};

/**
 * Cancel a specific model download
 * @param modelId The ID of the model to cancel download for
 * @returns True if the download was cancelled, false if no download was in progress
 */
export const cancelDownload = (modelId: string): boolean => {
	// Always add to cancelled models set regardless of whether a download is in progress
	cancelledModels.add(modelId);

	// Remove the engine from the engines map if it exists
	// This ensures isModelDownloaded returns false for cancelled models
	if (engines.has(modelId)) {
		engines.delete(modelId);
	}

	// If this was the active model, clear the active model
	if (activeModelId === modelId) {
		activeEngine = null;
		activeModelId = null;
	}

	// Check if there's an active download to cancel
	const controller = downloadControllers.get(modelId);
	if (controller) {
		// Abort the download
		controller.abort();
		downloadControllers.delete(modelId);

		return true;
	}

	// Even if there was no active download, we've still marked the model as cancelled
	// and removed it from the engines map, so return true
	return true;
};

/**
 * Check if a model is currently downloading
 * @param modelId The ID of the model to check
 * @returns True if the model is currently downloading, false otherwise
 */
export const isDownloading = (modelId: string): boolean =>
	downloadControllers.has(modelId);

/**
 * Set available models for cache checking
 * @param models The available models
 */
export const setAvailableModels = (models: Model[]): void => {
	availableModels = models;
	// Check if any of these models are already in the cache
	// Use setTimeout to delay cache checking to avoid blocking the UI
	setTimeout(() => {
		initializeEnginesFromCache();
	}, 2000); // Delay cache checking by 2 seconds
};

/**
 * Get a smaller model recommendation based on a model ID
 * @param modelId The ID of the model to get a recommendation for
 * @returns The ID of a recommended smaller model, or null if none is available
 */
export const getSmallerModelRecommendation = (
	modelId: string,
): string | null => {
	// Get the model
	const model = availableModels.find((m) => m.id === modelId);
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
	const smallerModel = availableModels.find((m) =>
		m.name.includes(smallerModelName),
	);

	return smallerModel?.id || null;
};

/**
 * Remove a downloaded model from the cache
 * @param modelId The ID of the model to remove
 * @returns True if the model was removed, false if it wasn't downloaded
 */
export const removeModel = (modelId: string): boolean => {
	// Check if the model is currently downloading and cancel if needed
	if (isDownloading(modelId)) {
		cancelDownload(modelId);
	}

	// Check if the model is in the engines map
	if (!engines.has(modelId)) {
		return false;
	}

	// If this is the active model, clear the active model
	if (activeModelId === modelId) {
		activeEngine = null;
		activeModelId = null;
	}

	// Remove the engine from the engines map
	engines.delete(modelId);
	console.log(`Removed engine for model ${modelId}`);

	// Clear any memory errors for this model
	memoryErrors.delete(modelId);

	// Add to cancelled models set to ensure it's not considered downloaded
	cancelledModels.add(modelId);

	// Try to clear the model from WebLLM's cache
	try {
		// WebLLM doesn't provide a direct API to clear cache for a specific model
		// We would need to use browser APIs to clear IndexedDB storage
		// This is a placeholder for future implementation
	} catch (error) {
		console.error(`Error clearing cache for model ${modelId}:`, error);
	}

	return true;
};

/**
 * Clean up resources when the module is no longer needed
 */
export const cleanup = async (): Promise<void> => {
	// Clean up all engines
	// WebLLM doesn't have a specific cleanup method, but we'll log for debugging

	// If WebLLM adds cleanup methods in the future, we would iterate through engines here

	// Cancel any ongoing downloads
	cancelAllDownloads();

	// Clear the engines map
	engines.clear();
	activeEngine = null;
	activeModelId = null;

	// Clear memory errors
	memoryErrors.clear();
};

// Initialize when module is loaded
if (typeof window !== 'undefined') {
	// Only run in browser environment
	// This replaces the constructor initialization in the class version
	setTimeout(() => {
		initializeEnginesFromCache();
	}, 3000);
}

// Export the main API as a named export object for backward compatibility
// (This helps if some imports were using the webLLMService object)
export const webLLMService = {
	downloadModel,
	setActiveModel,
	getActiveModelId,
	getMemoryError,
	hasMemoryError,
	clearMemoryError,
	isModelDownloaded,
	sendMessage,
	cancelDownload,
	isDownloading,
	setAvailableModels,
	getSmallerModelRecommendation,
	removeModel,
	cleanup,
};
