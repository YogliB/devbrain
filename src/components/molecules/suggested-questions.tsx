import React from 'react';
import { Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SuggestedQuestion } from '@/types/chat';

interface SuggestedQuestionsProps {
	questions: SuggestedQuestion[];
	onSelectQuestion: (question: SuggestedQuestion) => void;
	className?: string;
}

export function SuggestedQuestions({
	questions,
	onSelectQuestion,
	className,
}: SuggestedQuestionsProps) {
	if (questions.length === 0) return null;

	return (
		<div className={cn('space-y-2', className)}>
			<div className="flex items-center gap-2 text-sm text-muted-foreground">
				<Lightbulb className="h-4 w-4" />
				<span>Suggested questions</span>
			</div>
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
		</div>
	);
}
