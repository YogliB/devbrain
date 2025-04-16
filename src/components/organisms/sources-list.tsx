import React from 'react';
import { cn } from '@/lib/utils';
import { Source } from '@/types/source';
import { SourceItem } from '@/components/molecules/source-item';
import { AddSourceForm } from '@/components/molecules/add-source-form';

interface SourcesListProps {
	sources: Source[];
	onAddSource: (content: string, filename?: string) => void;
	onUpdateSource: (source: Source, content: string) => void;
	onDeleteSource: (source: Source) => void;
	className?: string;
}

export function SourcesList({
	sources,
	onAddSource,
	onUpdateSource,
	onDeleteSource,
	className,
}: SourcesListProps) {
	return (
		<div className={cn('space-y-4', className)}>
			<AddSourceForm onAddSource={onAddSource} />

			{sources.length === 0 ? (
				<div className="text-center py-8 text-muted-foreground">
					No sources added yet. Add a source to start inquiring.
				</div>
			) : (
				<div className="space-y-4">
					{sources.map((source) => (
						<SourceItem
							key={source.id}
							source={source}
							onUpdate={onUpdateSource}
							onDelete={onDeleteSource}
						/>
					))}
				</div>
			)}
		</div>
	);
}
