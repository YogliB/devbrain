import * as webllm from '@mlc-ai/web-llm';
import { Model, ModelDownloadStatus } from '@/types/model';

/**
 * WebLLM service for managing model downloads and inference
 */
export class WebLLMService {
	private static instance: WebLLMService;
	private engines: Map<string, webllm.MLCEngineInterface> = new Map();
	private activeEngine: webllm.MLCEngineInterface | null = null;
	private activeModelId: string | null = null;
	private downloadControllers: Map<string, AbortController> = new Map();

	private constructor() {}

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
			const engine = await webllm.CreateMLCEngine(webLLMModelId, {
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
			});

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

		// Otherwise, check if the engine exists
		const result = this.engines.has(modelId);
		console.log(`isModelDownloaded check for ${modelId}: ${result}`);
		return result;
	}

	// Track cancelled models to ensure they're never considered downloaded
	private _cancelledModels: Set<string> | null = null;

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
			const messages = [];

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

			const response = await this.activeEngine.chat.completions.create({
				messages,
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
	}
}

// Export a singleton instance
export const webLLMService = WebLLMService.getInstance();
