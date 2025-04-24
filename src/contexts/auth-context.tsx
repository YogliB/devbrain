'use client';

import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
} from 'react';

type User = {
	id: string;
	email: string;
	name: string | null;
	isGuest: boolean;
	createdAt: Date;
	updatedAt: Date;
};

interface AuthContextType {
	user: User | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	isGuest: boolean;
	login: (email: string, password: string) => Promise<User>;
	register: (email: string, password: string, name?: string) => Promise<User>;
	continueAsGuest: () => Promise<User>;
	logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'devbrain-user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// Load user from localStorage on initial render
	useEffect(() => {
		const storedUser = localStorage.getItem(USER_STORAGE_KEY);
		if (storedUser) {
			try {
				const parsedUser = JSON.parse(storedUser);
				// Convert string dates back to Date objects
				parsedUser.createdAt = new Date(parsedUser.createdAt);
				parsedUser.updatedAt = new Date(parsedUser.updatedAt);
				setUser(parsedUser);
			} catch (error) {
				console.error('Failed to parse stored user:', error);
				localStorage.removeItem(USER_STORAGE_KEY);
			}
		}
		setIsLoading(false);
	}, []);

	const login = useCallback(async (email: string, password: string) => {
		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email, password }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(
					error.message || 'Failed to login. Please try again.',
				);
			}

			const userData = await response.json();
			// Convert string dates to Date objects
			userData.createdAt = new Date(userData.createdAt);
			userData.updatedAt = new Date(userData.updatedAt);

			setUser(userData);
			localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
			return userData;
		} catch (error) {
			console.error('Login error:', error);
			throw error;
		}
	}, []);

	const register = useCallback(
		async (email: string, password: string, name?: string) => {
			try {
				const response = await fetch('/api/auth/register', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ email, password, name }),
				});

				if (!response.ok) {
					const error = await response.json();
					throw new Error(
						error.message ||
							'Failed to register. Please try again.',
					);
				}

				const userData = await response.json();
				// Convert string dates to Date objects
				userData.createdAt = new Date(userData.createdAt);
				userData.updatedAt = new Date(userData.updatedAt);

				setUser(userData);
				localStorage.setItem(
					USER_STORAGE_KEY,
					JSON.stringify(userData),
				);
				return userData;
			} catch (error) {
				console.error('Registration error:', error);
				throw error;
			}
		},
		[],
	);

	const continueAsGuest = useCallback(async () => {
		try {
			const response = await fetch('/api/auth/guest', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(
					error.message ||
						'Failed to create guest account. Please try again.',
				);
			}

			const userData = await response.json();
			// Convert string dates to Date objects
			userData.createdAt = new Date(userData.createdAt);
			userData.updatedAt = new Date(userData.updatedAt);

			setUser(userData);
			localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
			return userData;
		} catch (error) {
			console.error('Guest login error:', error);
			throw error;
		}
	}, []);

	const logout = useCallback(() => {
		setUser(null);
		localStorage.removeItem(USER_STORAGE_KEY);
	}, []);

	const value = {
		user,
		isLoading,
		isAuthenticated: !!user,
		isGuest: user?.isGuest || false,
		login,
		register,
		continueAsGuest,
		logout,
	};

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}
