import { useState, useEffect, useCallback, useRef } from 'react';
import { Source } from '@/types/source';
import { sourcesAPI } from '@/lib/api';

// Cache to store sources by notebook ID
const sourcesCache = new Map<string, Source[]>();

export function useSources(notebookId: string | null) {
	const [sources, setSources] = useState<Source[]>([]);
	// Track if we've already fetched sources for this notebook
	const fetchedRef = useRef<string | null>(null);

	const fetchSources = useCallback(async (notebookId: string) => {
		if (!notebookId) return [];

		// If we already have this notebook's sources in the cache, use them
		if (sourcesCache.has(notebookId)) {
			const cachedSources = sourcesCache.get(notebookId);
			console.log(
				`[useSources] Using cached sources for notebook ${notebookId}`,
			);
			setSources(cachedSources || []);
			return cachedSources || [];
		}

		try {
			console.log(
				`[useSources] Fetching sources for notebook ${notebookId}`,
			);
			const sourcesData = await sourcesAPI.getAll(notebookId);
			setSources(sourcesData);
			// Store in cache
			sourcesCache.set(notebookId, sourcesData);
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

			// Update local state
			setSources((prev) => [...prev, newSource]);

			// Update cache
			if (sourcesCache.has(notebookId)) {
				const cachedSources = sourcesCache.get(notebookId) || [];
				sourcesCache.set(notebookId, [...cachedSources, newSource]);
			}

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

			// Update local state
			setSources((prev) =>
				prev.map((s) =>
					s.id === updatedSource.id ? updatedSource : s,
				),
			);

			// Update cache
			if (sourcesCache.has(notebookId)) {
				const cachedSources = sourcesCache.get(notebookId) || [];
				sourcesCache.set(
					notebookId,
					cachedSources.map((s) =>
						s.id === updatedSource.id ? updatedSource : s,
					),
				);
			}

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

			// Update local state
			setSources((prev) => prev.filter((s) => s.id !== source.id));

			// Update cache
			if (sourcesCache.has(notebookId)) {
				const cachedSources = sourcesCache.get(notebookId) || [];
				sourcesCache.set(
					notebookId,
					cachedSources.filter((s) => s.id !== source.id),
				);
			}

			return true;
		} catch (error) {
			console.error('Failed to delete source:', error);
			return false;
		}
	};

	// Automatically fetch sources when notebookId changes, but only if we haven't fetched them before
	useEffect(() => {
		// Skip if notebookId is null or undefined
		if (!notebookId) {
			setSources([]);
			fetchedRef.current = null;
			return;
		}

		console.log(`[useSources] Notebook ID changed to: ${notebookId}`);
		console.log(
			`[useSources] Previously fetched notebook: ${fetchedRef.current}`,
		);

		// Only fetch if we haven't already fetched for this notebook
		if (fetchedRef.current !== notebookId) {
			fetchSources(notebookId);
			fetchedRef.current = notebookId;
		} else if (sourcesCache.has(notebookId)) {
			// If we've already fetched and have cache, just use the cache
			setSources(sourcesCache.get(notebookId) || []);
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
