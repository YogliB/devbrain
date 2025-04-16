export interface Model {
	id: string;
	name: string;
	parameters: string;
	size: string;
	useCase: string;
	webLLMId?: string; // ID used by WebLLM to reference the model

	// Runtime-only properties (not stored in DB)
	isDownloaded?: boolean;
	downloadProgress?: number;
	downloadStatus?: ModelDownloadStatus;
}

export type ModelStatus = 'downloaded' | 'not-downloaded';

export type ModelDownloadStatus =
	| 'not-downloaded'
	| 'downloading'
	| 'downloaded'
	| 'failed'
	| 'cancelled';
