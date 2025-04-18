import { useState, useEffect, useCallback } from 'react';
import { initializeDatabase, notebooksAPI } from '@/lib/api';
import { Notebook } from '@/types/notebook';

export function useAppInitialization() {
	const [isLoading, setIsLoading] = useState(true);
	const [notebooks, setNotebooks] = useState<Notebook[]>([]);
	const [activeNotebook, setActiveNotebook] = useState<Notebook | null>(null);

	const fetchNotebooks = useCallback(async () => {
		try {
			const notebooksData = await notebooksAPI.getAll();
			setNotebooks(notebooksData);
			return notebooksData;
		} catch (error) {
			console.error('Failed to fetch notebooks:', error);
			return [];
		}
	}, []);

	const selectNotebook = useCallback((notebook: Notebook) => {
		setActiveNotebook(notebook);
	}, []);

	const createNotebook = useCallback(async () => {
		try {
			const newNotebook = await notebooksAPI.create(
				`New Notebook ${notebooks.length + 1}`,
			);
			setNotebooks((prev) => [...prev, newNotebook]);
			setActiveNotebook(newNotebook);
			return newNotebook;
		} catch (error) {
			console.error('Failed to create notebook:', error);
			return null;
		}
	}, [notebooks.length]);

	const deleteNotebook = useCallback(
		async (notebook: Notebook) => {
			try {
				await notebooksAPI.delete(notebook.id);
				const updatedNotebooks = notebooks.filter(
					(n) => n.id !== notebook.id,
				);
				setNotebooks(updatedNotebooks);

				if (activeNotebook?.id === notebook.id) {
					setActiveNotebook(updatedNotebooks[0] || null);
				}
				return true;
			} catch (error) {
				console.error('Failed to delete notebook:', error);
				return false;
			}
		},
		[notebooks, activeNotebook],
	);

	useEffect(() => {
		async function initializeApp() {
			try {
				const timeoutPromise = new Promise<void>((resolve) => {
					setTimeout(resolve, 2000);
				});

				initializeDatabase().catch((error) => {
					console.error('Database initialization issue:', error);
				});

				await timeoutPromise;

				const notebooksData = await fetchNotebooks();

				if (notebooksData.length > 0) {
					const notebook = notebooksData[0];
					setActiveNotebook(notebook);
				}
			} catch (error) {
				console.error('Failed to initialize app:', error);
			} finally {
				setIsLoading(false);
			}
		}

		initializeApp();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return {
		isLoading,
		notebooks,
		activeNotebook,
		selectNotebook,
		createNotebook,
		deleteNotebook,
	};
}
