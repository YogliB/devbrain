import * as webllm from '@mlc-ai/web-llm';
import { CreateServiceWorkerMLCEngine } from '@mlc-ai/web-llm';
import { ModelConfig, selectBestModel } from './model-config';

export type ChatCompletionRequestMessage = {
	role: 'system' | 'user' | 'assistant' | 'function';
	content: string;
	name?: string;
};

// Model will be dynamically selected based on device capabilities

export type ModelStatus =
	| 'evaluating'
	| 'not-loaded'
	| 'loading'
	| 'loaded'
	| 'error'
	| 'unsupported';

export interface WebLLMState {
	status: ModelStatus;
	progress: number;
	progressText: string;
	error?: string;
	engine: webllm.MLCEngineInterface | null;
	selectedModel?: ModelConfig;
}

export const initialWebLLMState: WebLLMState = {
	status: 'evaluating',
	progress: 0,
	progressText: 'Evaluating device capabilities...',
	engine: null,
	error: undefined,
	selectedModel: undefined,
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

export async function registerServiceWorker(): Promise<void> {
	if (window !== undefined || 'serviceWorker' in navigator) {
		try {
			if (navigator.serviceWorker.controller) {
				return;
			}

			const registration = await navigator.serviceWorker.register(
				'/webllm-sw.js',
				{ type: 'module' },
			);

			await new Promise<void>((resolve) => {
				const checkController = () =>
					!!navigator.serviceWorker.controller;

				if (registration.active) {
					if (checkController()) {
						resolve();
						return;
					}

					navigator.serviceWorker.ready.then(async (registration) => {
						await registration.unregister();
						const newRegistration =
							await navigator.serviceWorker.register(
								'/webllm-sw.js',
								{ type: 'module' },
							);
						newRegistration.active?.postMessage('claim');
					});

					const interval = setInterval(() => {
						if (checkController()) {
							clearInterval(interval);
							resolve();
						}
					}, 100);
				} else {
					registration.addEventListener('activate', () => {
						registration.active?.postMessage('claim');

						const interval = setInterval(() => {
							if (checkController()) {
								clearInterval(interval);
								resolve();
							}
						}, 100);
					});
				}
			});
		} catch (error) {
			console.error(
				'[Client] Service worker registration failed:',
				error,
			);
			throw error;
		}
	}
}

export async function loadModel(): Promise<void> {
	// Don't restart loading if already in progress or loaded
	if (currentState.status === 'loading' || currentState.status === 'loaded') {
		return;
	}

	// If we're not in evaluating state, set it
	if (currentState.status !== 'evaluating') {
		updateState({
			status: 'evaluating',
			progress: 0,
			progressText: 'Evaluating device capabilities...',
		});
	}

	// Select the best model based on device capabilities
	try {
		const selectedModel = await selectBestModel();

		// Update state with selected model
		updateState({
			selectedModel,
			status: 'loading',
			progress: 0,
			progressText: `Initializing ${selectedModel.name}...`,
		});

		// Set up service worker if available
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

		// Load the selected model
		try {
			updateState({
				progressText: `Loading model: ${selectedModel.name}...`,
			});

			let engine;
			if (useServiceWorker) {
				engine = await CreateServiceWorkerMLCEngine(selectedModel.id, {
					initProgressCallback: (
						report: webllm.InitProgressReport,
					) => {
						console.log('[Client] Init progress:', report);
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
				engine = await webllm.CreateMLCEngine(selectedModel.id, {
					initProgressCallback: (
						report: webllm.InitProgressReport,
					) => {
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
				progressText: `${selectedModel.name} loaded successfully`,
				engine,
			});
		} catch (error) {
			console.error(`Failed to load model ${selectedModel.id}:`, error);
			updateState({
				status: 'error',
				progress: 0,
				progressText: 'Failed to load model',
				error: error instanceof Error ? error.message : String(error),
			});
		}
	} catch (error) {
		console.error('Failed to select appropriate model:', error);
		updateState({
			status: 'unsupported',
			progress: 0,
			progressText: 'Your device does not support any available models',
			error: error instanceof Error ? error.message : String(error),
		});
	}
}

export async function generateSuggestedQuestions(
	sources: { content: string; filename?: string }[],
	count: number = 3,
): Promise<{ id: string; text: string }[]> {
	if (!currentState.engine || currentState.status !== 'loaded') {
		throw new Error('Model not loaded');
	}

	if (sources.length === 0) {
		return [];
	}

	try {
		// Create a prompt for generating questions
		const sourcesText = sources
			.map(
				(source, index) =>
					`Source ${index + 1}: ${source.filename || `Source ${index + 1}`}\n${source.content}`,
			)
			.join('\n\n');

		const messages: ChatCompletionRequestMessage[] = [
			{
				role: 'system',
				content: `You are an AI assistant that generates insightful questions based on provided content.
			Your task is to generate exactly ${count} specific, relevant questions that a user might want to ask about the following sources.
			Make the questions diverse, interesting, and focused on the most important aspects of the content.

			IMPORTANT FORMATTING INSTRUCTIONS:
			1. Return ONLY the numbered questions with no additional text, explanations, or commentary
			2. Each question must be on its own line
			3. Format each question exactly as: "1 - Question text", "2 - Question text", etc.
			4. Do not include any introductory text or conclusion
			5. Ensure you generate exactly ${count} complete questions

			Example of correct format:
			1 - What is the main purpose of this code?
			2 - How does this algorithm handle edge cases?
			3 - What are the performance implications of this approach?`,
			},
			{
				role: 'user',
				content: sourcesText,
			},
		];

		const webllmMessages = messages.map((msg) => ({
			role: msg.role,
			content: msg.content,
			...(msg.name ? { name: msg.name } : {}),
		}));

		const response = await currentState.engine.chat.completions.create({
			// @ts-expect-error - WebLLM has specific type requirements
			messages: webllmMessages,
			temperature: 0.7, // Slightly lower temperature for more consistent formatting
			max_tokens: 512,
		});

		const questionsText = response.choices[0].message.content || '';

		// Try multiple parsing strategies to handle different formats
		let questions: { id: string; text: string }[] = [];

		// Strategy 1: Parse numbered format with dash (e.g., "1 - What is...")
		const dashFormatRegex = /(\d+)\s*-\s*([^\n]+)/g;
		const dashMatches = [...questionsText.matchAll(dashFormatRegex)];

		if (dashMatches.length > 0) {
			questions = dashMatches.map((match, index) => ({
				id: `generated-${Date.now()}-${index}`,
				text: match[2].trim(),
			}));
		} else {
			// Strategy 2: Parse standard numbered list format (e.g., "1. What is...")
			const standardRegex = /\d+\.\s*(.+?)(?=\n\d+\.|$)/gs;
			const standardMatches = [...questionsText.matchAll(standardRegex)];

			if (standardMatches.length > 0) {
				questions = standardMatches.map((match, index) => ({
					id: `generated-${Date.now()}-${index}`,
					text: match[1].trim(),
				}));
			} else {
				// Strategy 3: Split by newlines and clean up
				const lines = questionsText
					.split('\n')
					.map((line) => line.trim())
					.filter((line) => line.length > 0);

				questions = lines.map((line, index) => ({
					id: `generated-${Date.now()}-${index}`,
					// Remove any numbering or prefixes
					text: line.replace(/^\s*\d+\s*[-.:]?\s*/, '').trim(),
				}));
			}
		}

		// Validate and clean up questions
		questions = questions
			.filter((q) => q.text.length > 0) // Remove empty questions
			.map((q) => ({
				// Clean up text
				...q,
				text: q.text
					.replace(/^["']+|["']+$/g, '') // Remove quotes
					.replace(/\*\*/g, '') // Remove markdown bold
					.trim(),
			}))
			.filter(
				(q, i, arr) =>
					// Remove duplicates
					arr.findIndex(
						(item) =>
							item.text.toLowerCase() === q.text.toLowerCase(),
					) === i,
			);

		// Ensure we don't return more than requested count
		return questions.slice(0, count);
	} catch (error) {
		console.error('Error generating suggested questions:', error);
		return [];
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
