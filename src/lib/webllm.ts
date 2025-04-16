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
		return this.engines.has(modelId);
	}

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
	 * Send a message to the active model
	 * @param message The message to send
	 * @returns The model's response
	 */
	public async sendMessage(message: string): Promise<string> {
		if (!this.activeEngine) {
			throw new Error('No active model selected');
		}

		try {
			const response = await this.activeEngine.chat.completions.create({
				messages: [{ role: 'user', content: message }],
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
		const controller = this.downloadControllers.get(modelId);
		if (controller) {
			controller.abort();
			this.downloadControllers.delete(modelId);
			console.log(`Cancelled download for model ${modelId}`);
			return true;
		}
		return false;
	}

	/**
	 * Cancel all ongoing downloads
	 */
	private cancelAllDownloads(): void {
		console.log(
			`Cancelling ${this.downloadControllers.size} ongoing downloads`,
		);
		for (const [
			modelId,
			controller,
		] of this.downloadControllers.entries()) {
			controller.abort();
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
