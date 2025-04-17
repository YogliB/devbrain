'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/webllm-service';

export function ServiceWorkerRegistrar() {
	useEffect(() => {
		const registerSW = async () => {
			try {
				const registration = await registerServiceWorker();
				if (registration) {
					console.log('Service worker registered successfully');
				}
			} catch (error) {
				console.error('Failed to register service worker:', error);
			}
		};

		registerSW();
	}, []);

	return null;
}
