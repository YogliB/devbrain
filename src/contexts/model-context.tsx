'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { webLLMService, WebLLMServiceState } from '@/lib/webllm-service';
import { ChatCompletionRequestMessage } from '@/lib/webllm-service';

interface ModelContextType {
	modelAvailable: boolean;
	modelStatus: WebLLMServiceState['status'];
	modelProgress: number;
	modelProgressText: string;
	loadModel: () => Promise<void>;
	generateResponse: (
		messages: ChatCompletionRequestMessage[],
	) => Promise<string>;
	generateStreamingResponse: (
		messages: ChatCompletionRequestMessage[],
		onChunk: (chunk: string) => void,
	) => Promise<string>;
}

const ModelContext = createContext<ModelContextType>({
	modelAvailable: false,
	modelStatus: 'not-loaded',
	modelProgress: 0,
	modelProgressText: '',
	loadModel: async () => {},
	generateResponse: async () => '',
	generateStreamingResponse: async () => '',
});

export function ModelProvider({ children }: { children: React.ReactNode }) {
	const [state, setState] = useState<WebLLMServiceState>(
		webLLMService.getState(),
	);

	useEffect(() => {
		// Subscribe to state changes from the WebLLM service
		const unsubscribe = webLLMService.addStateListener(setState);

		// Start loading the model automatically
		webLLMService.loadModel();

		return unsubscribe;
	}, []);

	const value: ModelContextType = {
		modelAvailable: state.status === 'loaded',
		modelStatus: state.status,
		modelProgress: state.progress,
		modelProgressText: state.progressText,
		loadModel: webLLMService.loadModel.bind(webLLMService),
		generateResponse: webLLMService.generateResponse.bind(webLLMService),
		generateStreamingResponse:
			webLLMService.generateStreamingResponse.bind(webLLMService),
	};

	return (
		<ModelContext.Provider value={value}>{children}</ModelContext.Provider>
	);
}

export function useModel() {
	return useContext(ModelContext);
}
