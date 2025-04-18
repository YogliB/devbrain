import { useState, useEffect, useCallback } from 'react';
import { Source } from '@/types/source';
import { sourcesAPI } from '@/lib/api';

export function useSources(notebookId: string | null) {
	const [sources, setSources] = useState<Source[]>([]);

	const fetchSources = useCallback(async (notebookId: string) => {
		if (!notebookId) return [];

		try {
			const sourcesData = await sourcesAPI.getAll(notebookId);
			setSources(sourcesData);
			return sourcesData;
		} catch (error) {
			console.error('Failed to fetch sources:', error);
			return [];
		}
	}, []);

	const addSource = async (content: string, filename?: string) => {
		if (!notebookId) return null;

		try {
			const newSource = await sourcesAPI.create(
				notebookId,
				content,
				filename,
			);
			setSources((prev) => [...prev, newSource]);
			return newSource;
		} catch (error) {
			console.error('Failed to add source:', error);
			return null;
		}
	};

	const updateSource = async (source: Source, content: string) => {
		if (!notebookId) return null;

		try {
			const updatedSource = await sourcesAPI.update(
				notebookId,
				source.id,
				content,
				source.filename,
			);

			setSources((prev) =>
				prev.map((s) =>
					s.id === updatedSource.id ? updatedSource : s,
				),
			);
			return updatedSource;
		} catch (error) {
			console.error('Failed to update source:', error);
			return null;
		}
	};

	const deleteSource = async (source: Source) => {
		if (!notebookId) return false;

		try {
			await sourcesAPI.delete(notebookId, source.id);
			setSources((prev) => prev.filter((s) => s.id !== source.id));
			return true;
		} catch (error) {
			console.error('Failed to delete source:', error);
			return false;
		}
	};

	// Automatically fetch sources when notebookId changes
	useEffect(() => {
		if (notebookId) {
			fetchSources(notebookId);
		} else {
			setSources([]);
		}
	}, [notebookId, fetchSources]);

	return {
		sources,
		setSources,
		fetchSources,
		addSource,
		updateSource,
		deleteSource,
	};
}
