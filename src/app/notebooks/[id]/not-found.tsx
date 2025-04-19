'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotebookNotFound() {
	return (
		<div className="flex h-screen items-center justify-center">
			<div className="text-center">
				<h2 className="text-2xl font-semibold mb-2">
					Notebook Not Found
				</h2>
				<p className="text-muted-foreground mb-4">
					The notebook you're looking for doesn't exist or has been
					deleted.
				</p>
				<Button asChild>
					<Link href="/">Go to Home</Link>
				</Button>
			</div>
		</div>
	);
}
