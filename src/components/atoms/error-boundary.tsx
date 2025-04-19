'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorBoundaryProps {
	children: ReactNode;
	fallback?: ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

export class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
		};
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return {
			hasError: true,
			error,
		};
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
		console.error('Component error:', error, errorInfo);
	}

	render(): ReactNode {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<div className="flex flex-col items-center justify-center p-6 text-center h-full">
					<AlertCircle className="h-10 w-10 text-destructive mb-4" />
					<h2 className="text-xl font-semibold mb-2">
						Something went wrong
					</h2>
					<p className="text-muted-foreground mb-4">
						{this.state.error?.message ||
							'An unexpected error occurred'}
					</p>
					<button
						onClick={() =>
							this.setState({ hasError: false, error: null })
						}
						className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
					>
						Try again
					</button>
				</div>
			);
		}

		return this.props.children;
	}
}
