'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { ChatMessage, SuggestedQuestion } from '@/types/chat';
import { messagesAPI, suggestedQuestionsAPI } from '@/lib/api';
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
	const [questionsLoaded, setQuestionsLoaded] = useState(false);
	const sourcesChangedRef = useRef(false);
	const prevSourcesLengthRef = useRef(0);
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

	// Function to fetch persisted suggested questions
	const fetchSuggestedQuestions = useCallback(async () => {
		if (!notebookId) return false;

		try {
			const questions = await suggestedQuestionsAPI.getAll(notebookId);
			console.log(
				`Fetched ${questions.length} persisted questions for notebook ${notebookId}`,
			);

			// Convert DB format to app format
			const formattedQuestions = questions.map((q) => ({
				id: q.id,
				text: q.text,
			}));

			if (formattedQuestions.length > 0) {
				setSuggestedQuestions(formattedQuestions);
				setQuestionsLoaded(true);
				console.log('Loaded persisted questions successfully');
				return true;
			}
			console.log('No persisted questions found');
			return false;
		} catch (error) {
			console.error('Failed to fetch suggested questions:', error);
			return false;
		}
	}, [notebookId]);

	// Fetch messages and questions when notebook ID changes
	useEffect(() => {
		if (notebookId) {
			// Reset state for the new notebook
			setQuestionsLoaded(false);
			sourcesChangedRef.current = false;

			// Fetch messages
			fetchMessages(notebookId);

			// Fetch persisted questions - never auto-regenerate
			fetchSuggestedQuestions().then((hasQuestions) => {
				console.log(
					`Notebook ${notebookId} has persisted questions: ${hasQuestions}`,
				);
				// We don't do anything if there are no questions - user must manually generate
			});
		} else {
			// Clear state when no notebook is selected
			setMessages([]);
			setSuggestedQuestions([]);
			setQuestionsLoaded(false);
		}
	}, [notebookId, fetchMessages, fetchSuggestedQuestions]);

	// Function to generate suggested questions - only called manually or with forceRegenerate=true
	const generateQuestions = useCallback(
		async (forceRegenerate = false) => {
			// Only proceed if explicitly forced or if we're generating for the first time with no questions in DB
			if (!forceRegenerate && questionsLoaded) {
				console.log(
					'Skipping question generation: not forced and questions already loaded',
				);
				return;
			}

			if (sources.length === 0 || !modelAvailable) {
				console.log(
					'Not generating questions: no sources or model unavailable',
				);
				setSuggestedQuestions([]);
				return;
			}

			console.log(
				`Generating questions: forceRegenerate=${forceRegenerate}, questionsLoaded=${questionsLoaded}`,
			);

			setIsGeneratingQuestions(true);
			try {
				const questions = await generateSuggestedQuestions(sources);

				// Only update state if we got valid questions
				if (questions.length > 0) {
					setSuggestedQuestions(questions);

					// Save questions to the database if we have a notebook ID
					if (notebookId) {
						try {
							console.log(
								`Saving ${questions.length} questions to database for notebook ${notebookId}`,
							);
							await suggestedQuestionsAPI.save(
								notebookId,
								questions,
							);
							setQuestionsLoaded(true);
							sourcesChangedRef.current = false;
							console.log('Questions saved successfully');
						} catch (saveError) {
							console.error(
								'Failed to save suggested questions:',
								saveError,
							);
						}
					}
				} else {
					// If we got no questions, keep the previous ones but mark them as invalid
					// This will trigger the error state in the UI
					setSuggestedQuestions([{ id: 'error', text: '' }]);
				}
			} catch (error) {
				console.error('Failed to generate suggested questions:', error);
				// Set an empty question with just an ID to trigger the error state
				setSuggestedQuestions([{ id: 'error', text: '' }]);
			} finally {
				setIsGeneratingQuestions(false);
			}
		},
		[
			sources,
			modelAvailable,
			generateSuggestedQuestions,
			notebookId,
			questionsLoaded,
		],
	);

	// Track when sources change - just for UI indication, no auto regeneration
	useEffect(() => {
		// Only mark as changed if we had sources before and they changed
		if (
			prevSourcesLengthRef.current > 0 &&
			sources.length !== prevSourcesLengthRef.current
		) {
			console.log(
				'Sources changed, user can manually regenerate questions if needed',
			);
			sourcesChangedRef.current = true;
		}

		// Update the previous length for next comparison
		prevSourcesLengthRef.current = sources.length;
	}, [sources]);

	// First-time load only - check if we need to generate questions for a new notebook with no persisted questions
	useEffect(() => {
		// This effect runs only once when the component mounts
		const checkFirstTimeLoad = async () => {
			// If we have a notebook but no questions loaded yet, try to fetch them first
			if (notebookId && sources.length > 0 && !questionsLoaded) {
				const hasPersistedQuestions = await fetchSuggestedQuestions();

				// If this is a brand new notebook with no persisted questions, generate initial ones
				if (!hasPersistedQuestions) {
					console.log(
						'First-time load for notebook with no persisted questions, generating initial set',
					);
					await generateQuestions(true);
				}
			}
		};

		checkFirstTimeLoad();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Function to force regeneration of questions
	const regenerateQuestions = useCallback(async () => {
		// If we have a notebook ID, clear the persisted questions first
		if (notebookId) {
			try {
				// Clear questions from DB first
				await suggestedQuestionsAPI.clear(notebookId);
				// Reset state to force regeneration
				setQuestionsLoaded(false);
				sourcesChangedRef.current = true;
				// Now generate new questions
				await generateQuestions(true);
			} catch (error) {
				console.error('Failed to regenerate questions:', error);
				// Still try to generate even if clearing failed
				await generateQuestions(true);
			}
		} else {
			// No notebook ID, just regenerate
			await generateQuestions(true);
		}
	}, [generateQuestions, notebookId]);

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
		regenerateQuestions,
	};
}
