'use client';

import React, { useState } from 'react';
import { PlusCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Notebook } from '@/types/notebook';
import { NotebookItem } from '@/components/molecules/notebook-item';
import { Logo } from '@/components/atoms/logo';
import { ModelSelector } from '@/components/molecules/model-selector';

interface NotebooksSidebarProps {
	notebooks: Notebook[];
	activeNotebook: Notebook | null;
	isLoading?: boolean;
	onSelectNotebook: (notebook: Notebook) => void;
	onCreateNotebook: () => void;
	onDeleteNotebook: (notebook: Notebook) => void;
	className?: string;
}

export function NotebooksSidebar({
	notebooks,
	activeNotebook,
	isLoading = false,
	onSelectNotebook,
	onCreateNotebook,
	onDeleteNotebook,
	className,
}: NotebooksSidebarProps) {
	const [isCollapsed, setIsCollapsed] = useState(false);

	const toggleCollapse = () => {
		setIsCollapsed(!isCollapsed);
	};

	return (
		<div
			className={cn(
				'flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300',
				isCollapsed ? 'w-16' : 'w-64',
				className,
			)}
		>
			<div className="flex items-center justify-between p-4 border-b border-sidebar-border">
				<Logo
					iconOnly={isCollapsed}
					className="text-sidebar-foreground"
				/>
				<button
					onClick={toggleCollapse}
					className="p-1 rounded-md hover:bg-sidebar-accent text-sidebar-foreground"
					aria-label={
						isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
					}
				>
					{isCollapsed ? (
						<ChevronRight className="h-5 w-5" />
					) : (
						<ChevronLeft className="h-5 w-5" />
					)}
				</button>
			</div>

			<div className="p-2">
				<button
					onClick={onCreateNotebook}
					className={cn(
						'flex items-center gap-2 w-full px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors',
						isCollapsed && 'justify-center',
					)}
				>
					<PlusCircle className="h-5 w-5 flex-shrink-0" />
					{!isCollapsed && <span>New Notebook</span>}
				</button>
			</div>

			<div className="flex-grow overflow-y-auto p-2">
				{isLoading ? (
					// Show loading skeletons
					<div className="space-y-1">
						{Array.from({ length: 3 }).map((_, i) => (
							<div
								key={i}
								className={cn(
									'h-10 w-full rounded-md bg-sidebar-accent/30 animate-pulse',
									isCollapsed
										? 'flex justify-center items-center'
										: 'px-3 py-2',
								)}
							/>
						))}
					</div>
				) : notebooks.length === 0 ? (
					<div
						className={cn(
							'text-sidebar-foreground/50 text-sm p-3',
							isCollapsed && 'hidden',
						)}
					>
						No notebooks yet
					</div>
				) : (
					<div className="space-y-1">
						{notebooks.map((notebook) => (
							<NotebookItem
								key={notebook.id}
								notebook={notebook}
								isActive={activeNotebook?.id === notebook.id}
								isCollapsed={isCollapsed}
								onClick={onSelectNotebook}
								onDelete={onDeleteNotebook}
							/>
						))}
					</div>
				)}
			</div>

			<div className="mt-auto p-2">
				<ModelSelector isCollapsed={isCollapsed} />
			</div>
		</div>
	);
}
