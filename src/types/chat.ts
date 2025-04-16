export interface ChatMessage {
	id: string;
	content: string;
	role: 'user' | 'assistant';
	timestamp: Date;
}

export interface SuggestedQuestion {
	id: string;
	text: string;
}
