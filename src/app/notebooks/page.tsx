'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotebooksPage() {
	const router = useRouter();

	// Redirect to home page
	useEffect(() => {
		router.push('/');
	}, [router]);

	return (
		<div className="flex h-screen items-center justify-center">
			<div className="text-center">
				<h2 className="text-2xl font-semibold mb-2">Redirecting...</h2>
				<p className="text-muted-foreground">
					Please wait while we redirect you to your notebooks.
				</p>
			</div>
		</div>
	);
}
