'use client';

import React, { useState } from 'react';
import { File, Trash2, Save, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Source } from '@/types/source';

interface SourceItemProps {
	source: Source;
	onUpdate: (source: Source, content: string) => void;
	onDelete: (source: Source) => void;
	className?: string;
}

export function SourceItem({
	source,
	onUpdate,
	onDelete,
	className,
}: SourceItemProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [editedContent, setEditedContent] = useState(source.content);

	const handleSave = () => {
		onUpdate(source, editedContent);
		setIsEditing(false);
	};

	const handleCancel = () => {
		setEditedContent(source.content);
		setIsEditing(false);
	};

	return (
		<div
			className={cn(
				'border border-border rounded-md overflow-hidden',
				className,
			)}
		>
			<div className="flex items-center justify-between bg-muted/50 px-4 py-2">
				<div className="flex items-center gap-2">
					<File className="h-4 w-4 text-muted-foreground" />
					<span className="font-medium">
						{source.filename ||
							source.tag ||
							`Source ${source.id.slice(0, 8)}`}
					</span>
				</div>
				<div className="flex items-center gap-1">
					{isEditing ? (
						<>
							<button
								onClick={handleSave}
								className="p-1 rounded-md hover:bg-background"
								aria-label="Save"
							>
								<Save className="h-4 w-4" />
							</button>
							<button
								onClick={handleCancel}
								className="p-1 rounded-md hover:bg-background"
								aria-label="Cancel"
							>
								<Edit className="h-4 w-4" />
							</button>
						</>
					) : (
						<button
							onClick={() => setIsEditing(true)}
							className="p-1 rounded-md hover:bg-background"
							aria-label="Edit"
						>
							<Edit className="h-4 w-4" />
						</button>
					)}
					<button
						onClick={() => onDelete(source)}
						className="p-1 rounded-md hover:bg-background"
						aria-label="Delete"
					>
						<Trash2 className="h-4 w-4" />
					</button>
				</div>
			</div>
			<div className="p-4">
				{isEditing ? (
					<textarea
						value={editedContent}
						onChange={(e) => setEditedContent(e.target.value)}
						className="w-full min-h-[100px] resize-y rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					/>
				) : (
					<div className="whitespace-pre-wrap text-sm">
						{source.content}
					</div>
				)}
			</div>
		</div>
	);
}
