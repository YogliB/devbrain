import React from 'react';
import { Book, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Notebook } from '@/types/notebook';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';

interface NotebookItemProps {
	notebook: Notebook;
	isActive: boolean;
	isCollapsed: boolean;
	onClick: (notebook: Notebook) => void;
	onDelete: (notebook: Notebook) => void;
}

export function NotebookItem({
	notebook,
	isActive,
	isCollapsed,
	onClick,
	onDelete,
}: NotebookItemProps) {
	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		onDelete(notebook);
	};

	// Don't use Link for navigation, just use a div with onClick
	return (
		<div
			className={cn(
				'group flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors',
				isActive
					? 'bg-sidebar-primary/10 text-sidebar-foreground font-medium'
					: 'hover:bg-sidebar-accent text-sidebar-foreground',
			)}
			onClick={() => onClick(notebook)}
		>
			{isCollapsed ? (
				<Tooltip>
					<TooltipTrigger asChild>
						<div>
							<Book className="h-5 w-5 flex-shrink-0" />
						</div>
					</TooltipTrigger>
					<TooltipContent sideOffset={5}>
						{notebook.title}
					</TooltipContent>
				</Tooltip>
			) : (
				<Book className="h-5 w-5 flex-shrink-0" />
			)}
			{!isCollapsed && (
				<>
					<span className="flex-grow truncate">{notebook.title}</span>
					<button
						onClick={handleDelete}
						className={cn(
							'opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md',
							isActive
								? 'hover:bg-sidebar-foreground/10'
								: 'hover:bg-sidebar-accent-foreground/10',
						)}
						aria-label="Delete notebook"
					>
						<Trash2 className="h-4 w-4" />
					</button>
				</>
			)}
		</div>
	);
}
