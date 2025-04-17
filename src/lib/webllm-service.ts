import * as webllm from '@mlc-ai/web-llm';

// Re-export the ChatCompletionRequestMessage type
export type ChatCompletionRequestMessage = {
	role: 'system' | 'user' | 'assistant' | 'function';
	content: string;
	name?: string;
};

// The model ID for Deepseek LLaMA 8B q4f16_1
const MODEL_ID = 'DeepSeek-Llama-8B-q4f16_1-MLC';

export type ModelStatus = 'not-loaded' | 'loading' | 'loaded' | 'error';
export type ProgressCallback = (progress: number, text: string) => void;

export interface WebLLMServiceState {
	status: ModelStatus;
	progress: number;
	progressText: string;
	error?: string;
}

export class WebLLMService {
	private engine: webllm.MLCEngineInterface | null = null;
	private state: WebLLMServiceState = {
		status: 'not-loaded',
		progress: 0,
		progressText: 'Model not loaded',
	};
	private stateListeners: ((state: WebLLMServiceState) => void)[] = [];

	constructor() {
		// Check if the model is already in the cache
		this.checkModelCache();
	}

	private async checkModelCache() {
		// This is a placeholder - WebLLM doesn't have a direct API to check if a model is cached
		// We'll rely on the browser's cache mechanism
	}

	private updateState(newState: Partial<WebLLMServiceState>) {
		this.state = { ...this.state, ...newState };
		this.notifyListeners();
	}

	private notifyListeners() {
		for (const listener of this.stateListeners) {
			listener(this.state);
		}
	}

	public addStateListener(listener: (state: WebLLMServiceState) => void) {
		this.stateListeners.push(listener);
		// Immediately notify with current state
		listener(this.state);
		return () => {
			this.stateListeners = this.stateListeners.filter(
				(l) => l !== listener,
			);
		};
	}

	public async loadModel() {
		if (this.state.status === 'loading' || this.state.status === 'loaded') {
			return;
		}

		this.updateState({
			status: 'loading',
			progress: 0,
			progressText: 'Initializing model...',
		});

		try {
			// Initialize the WebLLM engine with progress callback
			this.engine = await webllm.CreateMLCEngine(MODEL_ID, {
				initProgressCallback: (report: webllm.InitProgressReport) => {
					// Calculate progress percentage if possible
					let progress = 0;
					if (
						report.progress !== undefined &&
						report.total !== undefined
					) {
						progress = Math.round(
							(report.progress / report.total) * 100,
						);
					}

					this.updateState({
						progress,
						progressText: report.text,
					});
				},
			});

			this.updateState({
				status: 'loaded',
				progress: 100,
				progressText: 'Model loaded successfully',
			});
		} catch (error) {
			console.error('Failed to load model:', error);
			this.updateState({
				status: 'error',
				progress: 0,
				progressText: 'Failed to load model',
				error: error instanceof Error ? error.message : String(error),
			});
		}
	}

	public async generateResponse(
		messages: ChatCompletionRequestMessage[],
	): Promise<string> {
		if (!this.engine || this.state.status !== 'loaded') {
			throw new Error('Model not loaded');
		}

		try {
			const response = await this.engine.chat.completions.create({
				messages,
				temperature: 0.7,
				max_tokens: 1024,
			});

			return response.choices[0].message.content;
		} catch (error) {
			console.error('Error generating response:', error);
			throw error;
		}
	}

	public async generateStreamingResponse(
		messages: ChatCompletionRequestMessage[],
		onChunk: (chunk: string) => void,
	): Promise<string> {
		if (!this.engine || this.state.status !== 'loaded') {
			throw new Error('Model not loaded');
		}

		try {
			const chunks = await this.engine.chat.completions.create({
				messages,
				temperature: 0.7,
				max_tokens: 1024,
				stream: true,
			});

			let fullResponse = '';
			for await (const chunk of chunks) {
				const content = chunk.choices[0]?.delta.content || '';
				fullResponse += content;
				onChunk(content);
			}

			return fullResponse;
		} catch (error) {
			console.error('Error generating streaming response:', error);
			throw error;
		}
	}

	public getState(): WebLLMServiceState {
		return this.state;
	}
}

// Create a singleton instance
export const webLLMService = new WebLLMService();
