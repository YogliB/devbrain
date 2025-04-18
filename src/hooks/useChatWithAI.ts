'use client';

import { useState, useCallback, useEffect } from 'react';
import { ChatMessage, SuggestedQuestion } from '@/types/chat';
import { messagesAPI } from '@/lib/api';
import { useModel } from '@/contexts/model-context';
import { ChatCompletionRequestMessage } from '@/lib/webllm-service';
import { useSources } from '@/hooks/useSources';

export function useChatWithAI(notebookId: string | null) {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [isGenerating, setIsGenerating] = useState(false);
	const [suggestedQuestions, setSuggestedQuestions] = useState<
		SuggestedQuestion[]
	>([]);
	const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
	const { modelAvailable, generateResponse, generateSuggestedQuestions } =
		useModel();

	// Use the sources hook to manage sources
	const { sources, addSource, updateSource, deleteSource } =
		useSources(notebookId);

	const fetchMessages = useCallback(async (notebookId: string) => {
		if (!notebookId) return [];

		try {
			const messagesData = await messagesAPI.getAll(notebookId);
			setMessages(messagesData);
			return messagesData;
		} catch (error) {
			console.error('Failed to fetch messages:', error);
			return [];
		}
	}, []);

	const sendMessage = useCallback(
		async (content: string) => {
			if (!notebookId) return null;
			if (!modelAvailable) return null;

			try {
				// Create and save user message
				const userMessage = await messagesAPI.create(
					notebookId,
					content,
					'user',
				);
				setMessages((prev) => [...prev, userMessage]);

				// Generate AI response
				setIsGenerating(true);
				try {
					// Prepare messages for the AI model
					const aiMessages: ChatCompletionRequestMessage[] = [
						{
							role: 'system',
							content: `You are a helpful AI assistant that answers questions based on the provided sources.
${sources.length > 0 ? 'Use the following sources to answer the question:' : 'No sources are available, so answer based on your general knowledge.'}

${sources.map((source, index) => `Source ${index + 1}: ${source.filename || `Source ${index + 1}`}\n${source.content}`).join('\n\n')}`,
						},
						...messages
							.filter(
								(msg) =>
									msg.role === 'user' ||
									msg.role === 'assistant',
							)
							.map((msg) => ({
								role: msg.role as 'user' | 'assistant',
								content: msg.content,
							})),
						{ role: 'user', content },
					];

					// Generate response using WebLLM
					const aiResponse = await generateResponse(aiMessages);

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
		[notebookId, modelAvailable, generateResponse, messages, sources],
	);

	const selectQuestion = useCallback(
		(question: SuggestedQuestion) => sendMessage(question.text),
		[sendMessage],
	);

	const canSendMessages = useCallback(() => modelAvailable, [modelAvailable]);

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

	// Fetch messages when notebook ID changes
	useEffect(() => {
		if (notebookId) {
			fetchMessages(notebookId);
		} else {
			setMessages([]);
		}
	}, [notebookId, fetchMessages]);

	// Regenerate suggested questions when sources change or model becomes available
	useEffect(() => {
		if (sources.length > 0 && modelAvailable) {
			setIsGeneratingQuestions(true);
			generateSuggestedQuestions(sources)
				.then((questions) => setSuggestedQuestions(questions))
				.catch((error) => {
					console.error(
						'Failed to generate suggested questions:',
						error,
					);
					setSuggestedQuestions([]);
				})
				.finally(() => {
					setIsGeneratingQuestions(false);
				});
		} else {
			setSuggestedQuestions([]);
		}
	}, [sources, modelAvailable, generateSuggestedQuestions]);

	return {
		messages,
		isGenerating,
		sources,
		suggestedQuestions,
		isGeneratingQuestions,
		fetchMessages,
		sendMessage,
		selectQuestion,
		canSendMessages,
		clearMessages,
		addSource,
		updateSource,
		deleteSource,
	};
}
