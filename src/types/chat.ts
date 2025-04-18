export interface ChatMessage {
	id: string;
	content: string;
	role: 'user' | 'assistant';
	timestamp: Date;
	isThinking?: boolean;
}

export interface SuggestedQuestion {
	id: string;
	text: string;
}
