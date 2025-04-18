import React, { useEffect, useState } from 'react';
import { Lightbulb, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SuggestedQuestion } from '@/types/chat';

interface SuggestedQuestionsProps {
	questions: SuggestedQuestion[];
	onSelectQuestion: (question: SuggestedQuestion) => void;
	isLoading?: boolean;
	onRefresh?: () => void;
	className?: string;
}

export function SuggestedQuestions({
	questions,
	onSelectQuestion,
	isLoading = false,
	onRefresh,
	className,
}: SuggestedQuestionsProps) {
	// Track if we've shown valid questions before
	const [hasShownQuestions, setHasShownQuestions] = useState(false);

	// Update tracking state when we have questions
	useEffect(() => {
		if (questions.length > 0 && !isLoading) {
			setHasShownQuestions(true);
		}
	}, [questions, isLoading]);

	// Show loading state even if there are no questions yet
	// Or show the component if we previously had questions but now have none
	if (questions.length === 0 && !isLoading && !hasShownQuestions) return null;

	// Check if we have valid questions (non-empty text)
	const validQuestions = questions.filter(
		(q) => q.text && q.text.trim().length > 0,
	);
	const hasValidQuestions = validQuestions.length > 0;

	// Determine if we should show an error state
	const showErrorState =
		!isLoading && questions.length > 0 && !hasValidQuestions;

	return (
		<div className={cn('space-y-2', className)}>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					{isLoading ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : showErrorState ? (
						<Lightbulb className="h-4 w-4 text-yellow-500" />
					) : (
						<Lightbulb className="h-4 w-4" />
					)}
					<span>
						{isLoading
							? 'Generating questions...'
							: showErrorState
								? 'Failed to generate questions'
								: 'Suggested questions'}
					</span>
				</div>
				{(showErrorState || hasShownQuestions) && onRefresh && (
					<button
						onClick={onRefresh}
						className="p-1 rounded-full hover:bg-muted transition-colors"
						title="Regenerate questions"
						disabled={isLoading}
					>
						<RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
					</button>
				)}
			</div>

			{!isLoading && hasValidQuestions && (
				<div className="flex flex-wrap gap-2">
					{validQuestions.map((question) => (
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

			{showErrorState && onRefresh && (
				<div className="text-xs text-muted-foreground">
					Click the refresh button to try again
				</div>
			)}
		</div>
	);
}
