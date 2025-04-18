import React from 'react';
import { Lightbulb, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SuggestedQuestion } from '@/types/chat';

interface SuggestedQuestionsProps {
	questions: SuggestedQuestion[];
	onSelectQuestion: (question: SuggestedQuestion) => void;
	isLoading?: boolean;
	className?: string;
}

export function SuggestedQuestions({
	questions,
	onSelectQuestion,
	isLoading = false,
	className,
}: SuggestedQuestionsProps) {
	// Show loading state even if there are no questions yet
	if (questions.length === 0 && !isLoading) return null;

	return (
		<div className={cn('space-y-2', className)}>
			<div className="flex items-center gap-2 text-sm text-muted-foreground">
				{isLoading ? (
					<Loader2 className="h-4 w-4 animate-spin" />
				) : (
					<Lightbulb className="h-4 w-4" />
				)}
				<span>
					{isLoading
						? 'Generating questions...'
						: 'Suggested questions'}
				</span>
			</div>
			{!isLoading && questions.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{questions.map((question) => (
						<button
							key={question.id}
							onClick={() => onSelectQuestion(question)}
							className="px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 rounded-full text-muted-foreground transition-colors"
						>
							{question.text}
						</button>
					))}
				</div>
			)}
		</div>
	);
}
