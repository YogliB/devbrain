'use client';

import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
	useRef,
} from 'react';
import { notebooksAPI } from '@/lib/api';
import { Notebook } from '@/types/notebook';

// Cache to store notebooks by ID
const notebooksCache = new Map<string, Notebook>();

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

	// Track notebooks we've already tried to load
	const loadedNotebooksRef = useRef<Set<string>>(new Set());

	const loadNotebookById = useCallback(
		async (id: string) => {
			// Check if we've already loaded this notebook
			const alreadyLoaded = loadedNotebooksRef.current.has(id);

			// Check cache first
			if (notebooksCache.has(id)) {
				const cachedNotebook = notebooksCache.get(id);
				if (cachedNotebook) {
					console.log(
						`[notebook-context] Using cached notebook for ID ${id}`,
					);
					setActiveNotebook(cachedNotebook);
					return cachedNotebook;
				}
			}

			// If notebooks are already loaded, try to find the notebook in the existing list
			const existingNotebook = notebooks.find((n) => n.id === id);
			if (existingNotebook) {
				setActiveNotebook(existingNotebook);
				// Add to cache
				notebooksCache.set(id, existingNotebook);
				// Mark as loaded
				loadedNotebooksRef.current.add(id);
				return existingNotebook;
			}

			// If not found in the existing list and not already attempted, try to fetch it from the API
			if (!alreadyLoaded) {
				try {
					console.log(
						`[notebook-context] Fetching notebook with ID ${id}`,
					);
					const notebook = await notebooksAPI.get(id);
					// Add the notebook to the list if it's not already there
					if (!notebooks.some((n) => n.id === notebook.id)) {
						setNotebooks((prev) => [...prev, notebook]);
					}
					setActiveNotebook(notebook);
					// Add to cache
					notebooksCache.set(id, notebook);
					// Mark as loaded
					loadedNotebooksRef.current.add(id);
					return notebook;
				} catch (error) {
					console.error(
						`Failed to load notebook with ID ${id}:`,
						error,
					);
					// Mark as attempted even if it failed
					loadedNotebooksRef.current.add(id);
					return null;
				}
			}

			// If we've already tried to load this notebook and it's not in the cache or list,
			// it probably doesn't exist
			return null;
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

			// Add to cache
			notebooksCache.set(newNotebook.id, newNotebook);
			// Mark as loaded
			loadedNotebooksRef.current.add(newNotebook.id);

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

				// Remove from cache
				notebooksCache.delete(notebook.id);
				// Remove from loaded set
				loadedNotebooksRef.current.delete(notebook.id);

				return true;
			} catch (error) {
				console.error('Failed to delete notebook:', error);
				return false;
			}
		},
		[notebooks, activeNotebook],
	);

	// Track if we're on the home page (not a specific notebook page)
	const isHomePage = useRef(true);

	// Check if we're on the home page by looking at the URL
	useEffect(() => {
		if (typeof window !== 'undefined') {
			// If the URL contains /notebooks/ followed by an ID, we're not on the home page
			isHomePage.current =
				!window.location.pathname.match(/\/notebooks\/[\w-]+/);
			console.log(`[notebook-context] isHomePage: ${isHomePage.current}`);
		}
	}, []);

	useEffect(() => {
		async function initializeApp() {
			try {
				// Fetch notebooks
				console.log('[notebook-context] Fetching notebooks');
				const notebooksData = await fetchNotebooks();
				console.log(
					`[notebook-context] Fetched ${notebooksData.length} notebooks`,
				);

				// Cache all notebooks
				notebooksData.forEach((notebook) => {
					notebooksCache.set(notebook.id, notebook);
					loadedNotebooksRef.current.add(notebook.id);
				});

				// Only set the first notebook as active if we're on the home page
				// If we're on a specific notebook page, the notebook will be loaded by the page component
				if (notebooksData.length > 0 && isHomePage.current) {
					console.log(
						'[notebook-context] Setting first notebook as active (home page)',
					);
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
