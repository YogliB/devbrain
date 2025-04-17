'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
	WebLLMState,
	getWebLLMState,
	addStateListener,
	loadModel,
	generateResponse,
	generateStreamingResponse,
	ChatCompletionRequestMessage,
} from '@/lib/webllm-service';

interface ModelContextType {
	modelAvailable: boolean;
	modelStatus: WebLLMState['status'];
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
	const [state, setState] = useState<WebLLMState>(getWebLLMState());

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
		loadModel,
		generateResponse,
		generateStreamingResponse,
	};

	return (
		<ModelContext.Provider value={value}>{children}</ModelContext.Provider>
	);
}

export function useModel() {
	return useContext(ModelContext);
}
