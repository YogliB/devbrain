'use client';

import { useState, useCallback } from 'react';
import { ChatMessage, SuggestedQuestion } from '@/types/chat';
import { Source } from '@/types/source';
import { messagesAPI, sourcesAPI } from '@/lib/api';
import { webLLMService } from '@/lib/webllm';
import { useModel } from '@/contexts/model-context';

export function useChatWithAI(notebookId: string | null) {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [isGenerating, setIsGenerating] = useState(false);
	const [sources, setSources] = useState<Source[]>([]);
	const { selectedModel, isModelDownloaded } = useModel();

	const fetchMessages = async (notebookId: string) => {
		if (!notebookId) return [];

		try {
			const messagesData = await messagesAPI.getAll(notebookId);
			setMessages(messagesData);
			return messagesData;
		} catch (error) {
			console.error('Failed to fetch messages:', error);
			return [];
		}
	};

	const fetchSources = async (notebookId: string) => {
		if (!notebookId) return [];

		try {
			const sourcesData = await sourcesAPI.getAll(notebookId);
			setSources(sourcesData);
			return sourcesData;
		} catch (error) {
			console.error('Failed to fetch sources:', error);
			return [];
		}
	};

	const sendMessage = useCallback(
		async (content: string) => {
			if (!notebookId) return null;
			if (!selectedModel) return null;
			if (!isModelDownloaded(selectedModel.id)) return null;

			try {
				// Create and save user message
				const userMessage = await messagesAPI.create(
					notebookId,
					content,
					'user',
				);
				setMessages((prev) => [...prev, userMessage]);

				// Make sure we have the latest sources
				const currentSources = await fetchSources(notebookId);

				// Generate AI response
				setIsGenerating(true);
				try {
					// Get response from the model using sources as context
					const aiResponse = await webLLMService.sendMessage(
						content,
						currentSources,
					);

					// Save the AI response to the database
					const assistantMessage = await messagesAPI.create(
						notebookId,
						aiResponse,
						'assistant',
					);

					setMessages((prev) => [...prev, assistantMessage]);
					return userMessage;
				} catch (error) {
					console.error('Failed to generate AI response:', error);

					// Create an error message
					const errorMessage = await messagesAPI.create(
						notebookId,
						`Error generating response: ${error instanceof Error ? error.message : String(error)}`,
						'assistant',
					);

					setMessages((prev) => [...prev, errorMessage]);
				} finally {
					setIsGenerating(false);
				}
			} catch (error) {
				console.error('Failed to send message:', error);
				return null;
			}
		},
		[notebookId, selectedModel, isModelDownloaded, fetchSources],
	);

	const selectQuestion = useCallback(
		(question: SuggestedQuestion) => sendMessage(question.text),
		[sendMessage],
	);

	const canSendMessages = useCallback(
		() => selectedModel !== null && isModelDownloaded(selectedModel.id),
		[selectedModel, isModelDownloaded],
	);

	const clearMessages = useCallback(async () => {
		if (!notebookId) return false;

		try {
			await messagesAPI.clear(notebookId);
			setMessages([]);
			return true;
		} catch (error) {
			console.error('Failed to clear messages:', error);
			return false;
		}
	}, [notebookId]);

	return {
		messages,
		isGenerating,
		sources,
		setMessages,
		fetchMessages,
		fetchSources,
		sendMessage,
		selectQuestion,
		canSendMessages,
		clearMessages,
	};
}
