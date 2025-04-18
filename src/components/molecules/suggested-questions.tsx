import React from 'react';
import { Lightbulb, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SuggestedQuestion } from '@/types/chat';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

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
	// No longer need to track if we've shown questions before
	// We always show the component now

	// Always show the component if we have sources (controlled by parent)
	// This allows us to show the "Generate questions" button even when there are no questions

	// Check if we have valid questions (non-empty text)
	const validQuestions = questions.filter(
		(q) => q.text && q.text.trim().length > 0,
	);
	const hasValidQuestions = validQuestions.length > 0;

	// Determine if we should show different states
	const showErrorState =
		!isLoading && questions.length > 0 && !hasValidQuestions;
	const showEmptyState = !isLoading && questions.length === 0;

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
								: showEmptyState
									? 'Generate questions'
									: 'Suggested questions'}
					</span>
				</div>
				{onRefresh && (
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								onClick={onRefresh}
								className="p-1 rounded-full bg-muted/30 dark:bg-muted/50 hover:bg-muted transition-colors"
								disabled={isLoading}
							>
								<RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							{showEmptyState
								? 'Generate questions'
								: 'Regenerate questions'}
						</TooltipContent>
					</Tooltip>
				)}
			</div>

			{!isLoading && hasValidQuestions && (
				<div className="flex flex-col gap-2">
					{validQuestions.map((question) => (
						<div key={question.id} className="flex">
							<button
								onClick={() => onSelectQuestion(question)}
								className="px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 rounded-full text-muted-foreground transition-colors text-left w-fit"
							>
								{question.text}
							</button>
						</div>
					))}
				</div>
			)}

			{showEmptyState && onRefresh && (
				<div className="text-xs text-muted-foreground">
					Click the button to generate questions based on your sources
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
