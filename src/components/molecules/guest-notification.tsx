'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface GuestNotificationProps {
	className?: string;
}

export function GuestNotification({ className }: GuestNotificationProps) {
	return (
		<Alert
			variant="default"
			className={cn(
				'bg-primary/10 border-primary/20 text-foreground',
				className,
			)}
		>
			<Info className="h-4 w-4 text-primary" />
			<AlertTitle>Guest Mode</AlertTitle>
			<AlertDescription>
				You are using DevBrain as a guest. Your data will not be
				persisted between sessions. Create an account to save your work.
			</AlertDescription>
		</Alert>
	);
}
