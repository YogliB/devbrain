import * as webllm from '@mlc-ai/web-llm';
import { CreateServiceWorkerMLCEngine } from '@mlc-ai/web-llm';

export type ChatCompletionRequestMessage = {
	role: 'system' | 'user' | 'assistant' | 'function';
	content: string;
	name?: string;
};

export const MODEL_ID = 'DeepSeek-R1-Distill-Llama-8B-q4f16_1-MLC';

export type ModelStatus = 'not-loaded' | 'loading' | 'loaded' | 'error';

export interface WebLLMState {
	status: ModelStatus;
	progress: number;
	progressText: string;
	error?: string;
	engine: webllm.MLCEngineInterface | null;
}

export const initialWebLLMState: WebLLMState = {
	status: 'not-loaded',
	progress: 0,
	progressText: 'Model not loaded',
	engine: null,
	error: undefined,
};

let currentState = { ...initialWebLLMState };
let listeners: ((state: WebLLMState) => void)[] = [];

function updateState(newState: Partial<WebLLMState>): void {
	currentState = { ...currentState, ...newState };
	notifyListeners();
}

function notifyListeners(): void {
	listeners.forEach((listener) => listener(currentState));
}

export function addStateListener(
	listener: (state: WebLLMState) => void,
): () => void {
	listeners.push(listener);
	listener(currentState);

	return () => {
		listeners = listeners.filter((l) => l !== listener);
	};
}

export function getWebLLMState(): WebLLMState {
	return currentState;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
	if ('serviceWorker' in navigator) {
		try {
			const registration = await navigator.serviceWorker.register(
				'/webllm-sw.js',
				{ type: 'module' },
			);

			return registration;
		} catch (error) {
			console.error(`Service worker registration failed:`, error);
			return null;
		}
	}

	return null;
}

export async function loadModel(): Promise<void> {
	if (currentState.status === 'loading' || currentState.status === 'loaded') {
		return;
	}

	updateState({
		status: 'loading',
		progress: 0,
		progressText: 'Initializing model...',
	});

	let useServiceWorker = false;
	if ('serviceWorker' in navigator) {
		try {
			await registerServiceWorker();
			useServiceWorker = true;
		} catch (error) {
			console.warn(
				'Service worker registration failed, falling back to regular engine:',
				error,
			);
			useServiceWorker = false;
		}
	}

	try {
		updateState({
			progressText: `Loading model: ${MODEL_ID}...`,
		});

		let engine;
		if (useServiceWorker) {
			engine = await CreateServiceWorkerMLCEngine(MODEL_ID, {
				initProgressCallback: (report: webllm.InitProgressReport) => {
					let progress = 0;
					if (report.progress !== undefined) {
						progress = Math.min(
							Math.round(report.progress * 100),
							100,
						);
					}

					updateState({
						progress,
						progressText: report.text,
					});
				},
			});
		} else {
			engine = await webllm.CreateMLCEngine(MODEL_ID, {
				initProgressCallback: (report: webllm.InitProgressReport) => {
					let progress = 0;
					if (report.progress !== undefined) {
						progress = Math.min(
							Math.round(report.progress * 100),
							100,
						);
					}

					updateState({
						progress,
						progressText: report.text,
					});
				},
			});
		}

		updateState({
			status: 'loaded',
			progress: 100,
			progressText: `Model loaded successfully`,
			engine,
		});
	} catch (error) {
		console.error(`Failed to load model ${MODEL_ID}:`, error);
		updateState({
			status: 'error',
			progress: 0,
			progressText: 'Failed to load model',
			error: error instanceof Error ? error.message : String(error),
		});
	}
}

export async function generateResponse(
	messages: ChatCompletionRequestMessage[],
): Promise<string> {
	if (!currentState.engine || currentState.status !== 'loaded') {
		throw new Error('Model not loaded');
	}

	try {
		const webllmMessages = messages.map((msg) => ({
			role: msg.role,
			content: msg.content,
			...(msg.name ? { name: msg.name } : {}),
		}));

		const response = await currentState.engine.chat.completions.create({
			// @ts-expect-error - WebLLM has specific type requirements
			messages: webllmMessages,
			temperature: 0.7,
			max_tokens: 1024,
		});

		return response.choices[0].message.content || '';
	} catch (error) {
		console.error('Error generating response:', error);
		throw error;
	}
}

export async function generateStreamingResponse(
	messages: ChatCompletionRequestMessage[],
	onChunk: (chunk: string) => void,
): Promise<string> {
	if (!currentState.engine || currentState.status !== 'loaded') {
		throw new Error('Model not loaded');
	}

	try {
		const webllmMessages = messages.map((msg) => ({
			role: msg.role,
			content: msg.content,
			...(msg.name ? { name: msg.name } : {}),
		}));

		const chunks = await currentState.engine.chat.completions.create({
			// @ts-expect-error - WebLLM has specific type requirements
			messages: webllmMessages,
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

loadModel().catch((error) => {
	console.error('Failed to initialize model loading:', error);
});
