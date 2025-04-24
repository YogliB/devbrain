'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { LoginForm } from '@/components/molecules/login-form';
import { RegisterForm } from '@/components/molecules/register-form';
import { Logo } from '@/components/atoms/logo';
import { ThemeToggle } from '@/components/atoms/theme-toggle';

interface AuthLayoutProps {
	onAuthSuccess?: () => void;
	className?: string;
}

type AuthView = 'login' | 'register';

export function AuthLayout({ onAuthSuccess, className }: AuthLayoutProps) {
	const [view, setView] = useState<AuthView>('login');

	return (
		<div
			className={cn(
				'flex min-h-screen flex-col items-center justify-center p-4 bg-background',
				className,
			)}
		>
			<div className="absolute top-4 left-4">
				<Logo />
			</div>
			<div className="absolute top-4 right-4">
				<ThemeToggle />
			</div>

			<Card className="w-full max-w-md">
				<CardContent className="pt-6">
					{view === 'login' ? (
						<LoginForm
							onSuccess={onAuthSuccess}
							onRegisterClick={() => setView('register')}
						/>
					) : (
						<RegisterForm
							onSuccess={onAuthSuccess}
							onLoginClick={() => setView('login')}
						/>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
