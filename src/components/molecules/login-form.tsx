'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { useAuth } from '@/contexts/auth-context';
import { validateEmail } from '@/lib/auth-utils';

interface LoginFormProps {
	onSuccess?: () => void;
	onRegisterClick?: () => void;
	className?: string;
}

type FormValues = {
	email: string;
	password: string;
};

export function LoginForm({
	onSuccess,
	onRegisterClick,
	className,
}: LoginFormProps) {
	const { login, continueAsGuest } = useAuth();
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm<FormValues>({
		defaultValues: {
			email: '',
			password: '',
		},
	});

	const handleSubmit = async (data: FormValues) => {
		setError(null);
		setIsLoading(true);

		try {
			await login(data.email, data.password);
			if (onSuccess) {
				onSuccess();
			}
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: 'Failed to login. Please try again.',
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleGuestLogin = async () => {
		setError(null);
		setIsLoading(true);

		try {
			await continueAsGuest();
			if (onSuccess) {
				onSuccess();
			}
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: 'Failed to continue as guest. Please try again.',
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className={cn('space-y-6', className)}>
			<div className="space-y-2 text-center">
				<h1 className="text-3xl font-bold">Login</h1>
				<p className="text-muted-foreground">
					Enter your credentials to access your account
				</p>
			</div>

			{error && (
				<div className="p-3 text-sm bg-destructive/10 border border-destructive/20 text-destructive rounded-md">
					{error}
				</div>
			)}

			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(handleSubmit)}
					className="space-y-4"
				>
					<FormField
						control={form.control}
						name="email"
						rules={{
							required: 'Email is required',
							validate: (value) => {
								const result = validateEmail(value);
								return result.isValid || result.message;
							},
						}}
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input
										placeholder="you@example.com"
										{...field}
										disabled={isLoading}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="password"
						rules={{
							required: 'Password is required',
						}}
						render={({ field }) => (
							<FormItem>
								<FormLabel>Password</FormLabel>
								<FormControl>
									<Input
										type="password"
										placeholder="••••••••"
										{...field}
										disabled={isLoading}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button
						type="submit"
						className="w-full"
						disabled={isLoading}
					>
						{isLoading ? 'Logging in...' : 'Login'}
					</Button>
				</form>
			</Form>

			<div className="relative">
				<div className="absolute inset-0 flex items-center">
					<span className="w-full border-t" />
				</div>
				<div className="relative flex justify-center text-xs uppercase">
					<span className="bg-background px-2 text-muted-foreground">
						Or
					</span>
				</div>
			</div>

			<div className="space-y-4">
				<Button
					variant="outline"
					className="w-full"
					onClick={handleGuestLogin}
					disabled={isLoading}
				>
					Continue as Guest
				</Button>

				<div className="text-center text-sm">
					Don&apos;t have an account?{' '}
					<button
						type="button"
						className="underline font-medium text-primary"
						onClick={onRegisterClick}
						disabled={isLoading}
					>
						Register
					</button>
				</div>
			</div>
		</div>
	);
}
