'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
	WebLLMState,
	getWebLLMState,
	addStateListener,
	loadModel,
	generateResponse,
	generateStreamingResponse,
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
	generateStreamingResponse: (
		messages: ChatCompletionRequestMessage[],
		onChunk: (chunk: string) => void,
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
	generateStreamingResponse: async () => '',
	generateSuggestedQuestions: async () => [],
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
		selectedModel: state.selectedModel,
		loadModel,
		generateResponse,
		generateStreamingResponse,
		generateSuggestedQuestions,
	};

	return (
		<ModelContext.Provider value={value}>{children}</ModelContext.Provider>
	);
}

export function useModel() {
	return useContext(ModelContext);
}
