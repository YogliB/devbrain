import { useState } from 'react';
import { ChatMessage, SuggestedQuestion } from '@/types/chat';
import { messagesAPI } from '@/lib/api';

export function useMessages(notebookId: string | null) {
	const [messages, setMessages] = useState<ChatMessage[]>([]);

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

	const sendMessage = async (content: string) => {
		if (!notebookId) return null;

		try {
			const userMessage = await messagesAPI.create(
				notebookId,
				content,
				'user'
			);
			setMessages((prev) => [...prev, userMessage]);

			// Simulate assistant response
			setTimeout(async () => {
				try {
					const assistantMessage = await messagesAPI.create(
						notebookId,
						`I received your message: "${content}". This is a mock response.`,
						'assistant'
					);
					setMessages((prev) => [...prev, assistantMessage]);
				} catch (error) {
					console.error('Failed to create assistant message:', error);
				}
			}, 1000);

			return userMessage;
		} catch (error) {
			console.error('Failed to send message:', error);
			return null;
		}
	};

	const selectQuestion = (question: SuggestedQuestion) => {
		return sendMessage(question.text);
	};

	return {
		messages,
		setMessages,
		fetchMessages,
		sendMessage,
		selectQuestion,
	};
}
