export interface Model {
	id: string;
	name: string;
	isDownloaded: boolean;
	parameters: string;
	size: string;
	useCase: string;
}

export type ModelStatus = 'downloaded' | 'not-downloaded';
