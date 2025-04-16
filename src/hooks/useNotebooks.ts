import { useState } from 'react';
import { Notebook } from '@/types/notebook';
import { notebooksAPI } from '@/lib/api';

export function useNotebooks() {
	const [notebooks, setNotebooks] = useState<Notebook[]>([]);
	const [activeNotebook, setActiveNotebook] = useState<Notebook | null>(null);

	const fetchNotebooks = async () => {
		try {
			const notebooksData = await notebooksAPI.getAll();
			setNotebooks(notebooksData);
			return notebooksData;
		} catch (error) {
			console.error('Failed to fetch notebooks:', error);
			return [];
		}
	};

	const selectNotebook = (notebook: Notebook) => {
		setActiveNotebook(notebook);
	};

	const createNotebook = async () => {
		try {
			const newNotebook = await notebooksAPI.create(
				`New Notebook ${notebooks.length + 1}`
			);
			setNotebooks([...notebooks, newNotebook]);
			setActiveNotebook(newNotebook);
			return newNotebook;
		} catch (error) {
			console.error('Failed to create notebook:', error);
			return null;
		}
	};

	const deleteNotebook = async (notebook: Notebook) => {
		try {
			await notebooksAPI.delete(notebook.id);
			const updatedNotebooks = notebooks.filter((n) => n.id !== notebook.id);
			setNotebooks(updatedNotebooks);

			if (activeNotebook?.id === notebook.id) {
				setActiveNotebook(updatedNotebooks[0] || null);
			}
			return true;
		} catch (error) {
			console.error('Failed to delete notebook:', error);
			return false;
		}
	};

	return {
		notebooks,
		activeNotebook,
		setNotebooks,
		setActiveNotebook,
		fetchNotebooks,
		selectNotebook,
		createNotebook,
		deleteNotebook,
	};
}
