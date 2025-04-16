import { ChatModule, ModelRecord } from '@mlc-ai/web-llm';
import { Model, ModelDownloadStatus } from '@/types/model';

class WebLLMService {
	private chatModule: ChatModule | null = null;
	private availableModels: ModelRecord[] = [];
	private modelDownloadListeners: Map<
		string,
		Set<(progress: number) => void>
	> = new Map();
	private modelStatusListeners: Map<
		string,
		Set<(status: ModelDownloadStatus) => void>
	> = new Map();

	constructor() {
		this.initialize();
	}

	private async initialize() {
		try {
			this.chatModule = new ChatModule();
			await this.chatModule.reload();
			this.availableModels = await this.chatModule.listModels();
			console.log(
				'WebLLM initialized with models:',
				this.availableModels,
			);
		} catch (error) {
			console.error('Failed to initialize WebLLM:', error);
		}
	}

	public async getAvailableModels(): Promise<ModelRecord[]> {
		if (!this.availableModels.length && this.chatModule) {
			try {
				this.availableModels = await this.chatModule.listModels();
			} catch (error) {
				console.error('Failed to list models:', error);
			}
		}
		return this.availableModels;
	}

	public async downloadModel(model: Model): Promise<boolean> {
		if (!this.chatModule || !model.webLLMId) {
			return false;
		}

		try {
			// Notify listeners that download is starting
			this.notifyStatusListeners(model.id, 'downloading');

			// Start the download with progress tracking
			await this.chatModule.loadModel(model.webLLMId, (progress) => {
				this.notifyProgressListeners(model.id, progress);
			});

			// Notify listeners that download is complete
			this.notifyStatusListeners(model.id, 'downloaded');
			return true;
		} catch (error) {
			console.error(`Failed to download model ${model.name}:`, error);
			this.notifyStatusListeners(model.id, 'failed');
			return false;
		}
	}

	public async isModelDownloaded(webLLMId: string): Promise<boolean> {
		if (!this.chatModule) {
			return false;
		}
		try {
			return await this.chatModule.isModelDownloaded(webLLMId);
		} catch (error) {
			console.error(
				`Failed to check if model ${webLLMId} is downloaded:`,
				error,
			);
			return false;
		}
	}

	public addDownloadProgressListener(
		modelId: string,
		listener: (progress: number) => void,
	) {
		if (!this.modelDownloadListeners.has(modelId)) {
			this.modelDownloadListeners.set(modelId, new Set());
		}
		this.modelDownloadListeners.get(modelId)?.add(listener);
	}

	public removeDownloadProgressListener(
		modelId: string,
		listener: (progress: number) => void,
	) {
		this.modelDownloadListeners.get(modelId)?.delete(listener);
	}

	public addStatusListener(
		modelId: string,
		listener: (status: ModelDownloadStatus) => void,
	) {
		if (!this.modelStatusListeners.has(modelId)) {
			this.modelStatusListeners.set(modelId, new Set());
		}
		this.modelStatusListeners.get(modelId)?.add(listener);
	}

	public removeStatusListener(
		modelId: string,
		listener: (status: ModelDownloadStatus) => void,
	) {
		this.modelStatusListeners.get(modelId)?.delete(listener);
	}

	private notifyProgressListeners(modelId: string, progress: number) {
		this.modelDownloadListeners.get(modelId)?.forEach((listener) => {
			listener(progress);
		});
	}

	private notifyStatusListeners(
		modelId: string,
		status: ModelDownloadStatus,
	) {
		this.modelStatusListeners.get(modelId)?.forEach((listener) => {
			listener(status);
		});
	}
}

// Create a singleton instance
const webLLMService = new WebLLMService();
export default webLLMService;
