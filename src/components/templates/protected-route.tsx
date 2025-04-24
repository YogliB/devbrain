'use client';

import React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { AuthLayout } from './auth-layout';

interface ProtectedRouteProps {
	children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
	const { isAuthenticated, isLoading } = useAuth();

	// If still loading auth state, show nothing
	if (isLoading) {
		return <div className="flex h-screen items-center justify-center" />;
	}

	// If not authenticated, show auth layout
	if (!isAuthenticated) {
		return <AuthLayout />;
	}

	// If authenticated, show children
	return <>{children}</>;
}
