'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
	WebLLMState,
	getWebLLMState,
	addStateListener,
	loadModel,
	generateResponse,
	generateSuggestedQuestions,
	ChatCompletionRequestMessage,
} from '@/lib/webllm-service';
import { ModelConfig } from '@/lib/model-config';
import { Source } from '@/types/source';

interface ModelContextType {
	modelAvailable: boolean;
	modelStatus: WebLLMState['status'];
	modelProgress: number;
	modelProgressText: string;
	selectedModel?: ModelConfig;
	loadModel: () => Promise<void>;
	generateResponse: (
		messages: ChatCompletionRequestMessage[],
	) => Promise<string>;
	generateSuggestedQuestions: (
		sources: Source[],
		count?: number,
	) => Promise<{ id: string; text: string }[]>;
}

const ModelContext = createContext<ModelContextType>({
	modelAvailable: false,
	modelStatus: 'evaluating',
	modelProgress: 0,
	modelProgressText: '',
	selectedModel: undefined,
	loadModel: async () => {},
	generateResponse: async () => '',
	generateSuggestedQuestions: async () => [],
});

export function ModelProvider({ children }: { children: React.ReactNode }) {
	const [state, setState] = useState<WebLLMState>(getWebLLMState());

	// Listen for service worker messages
	useEffect(() => {
		const handleServiceWorkerMessage = (event: MessageEvent) => {
			if (
				event.data &&
				(event.data.type === 'SW_ACTIVATED' ||
					event.data.type === 'SW_CLAIMED')
			) {
				console.log(
					'[Client] Received message from service worker:',
					event.data,
				);
				// Trigger model loading when service worker is activated
				loadModel();
			}
		};

		// Add message listener
		navigator.serviceWorker.addEventListener(
			'message',
			handleServiceWorkerMessage,
		);

		// Remove listener on cleanup
		return () => {
			navigator.serviceWorker.removeEventListener(
				'message',
				handleServiceWorkerMessage,
			);
		};
	}, []);

	useEffect(() => {
		const unsubscribe = addStateListener(setState);
		loadModel();
		return unsubscribe;
	}, []);

	const value: ModelContextType = {
		modelAvailable: state.status === 'loaded',
		modelStatus: state.status,
		modelProgress: state.progress,
		modelProgressText: state.progressText,
		selectedModel: state.selectedModel,
		loadModel,
		generateResponse,
		generateSuggestedQuestions,
	};

	return (
		<ModelContext.Provider value={value}>{children}</ModelContext.Provider>
	);
}

export function useModel() {
	return useContext(ModelContext);
}
