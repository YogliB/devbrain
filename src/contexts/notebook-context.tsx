'use client';

import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
} from 'react';
import { initializeDatabase, notebooksAPI } from '@/lib/api';
import { Notebook } from '@/types/notebook';

interface NotebookContextType {
	isLoading: boolean;
	notebooks: Notebook[];
	activeNotebook: Notebook | null;
	selectNotebook: (notebook: Notebook) => void;
	createNotebook: () => Promise<Notebook | null>;
	deleteNotebook: (notebook: Notebook) => Promise<boolean>;
	loadNotebookById: (id: string) => Promise<Notebook | null>;
}

const NotebookContext = createContext<NotebookContextType | undefined>(
	undefined,
);

export function NotebookProvider({ children }: { children: React.ReactNode }) {
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

	const loadNotebookById = useCallback(
		async (id: string) => {
			// If notebooks are already loaded, try to find the notebook in the existing list
			const existingNotebook = notebooks.find((n) => n.id === id);
			if (existingNotebook) {
				setActiveNotebook(existingNotebook);
				return existingNotebook;
			}

			// If not found in the existing list, try to fetch it from the API
			try {
				const notebook = await notebooksAPI.get(id);
				// Add the notebook to the list if it's not already there
				if (!notebooks.some((n) => n.id === notebook.id)) {
					setNotebooks((prev) => [...prev, notebook]);
				}
				setActiveNotebook(notebook);
				return notebook;
			} catch (error) {
				console.error(`Failed to load notebook with ID ${id}:`, error);
				return null;
			}
		},
		[notebooks],
	);

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

	const value = {
		isLoading,
		notebooks,
		activeNotebook,
		selectNotebook,
		createNotebook,
		deleteNotebook,
		loadNotebookById,
	};

	return (
		<NotebookContext.Provider value={value}>
			{children}
		</NotebookContext.Provider>
	);
}

export function useNotebook() {
	const context = useContext(NotebookContext);
	if (context === undefined) {
		throw new Error('useNotebook must be used within a NotebookProvider');
	}
	return context;
}
