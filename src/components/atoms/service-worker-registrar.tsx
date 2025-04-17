'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/webllm-service';

export function ServiceWorkerRegistrar() {
	useEffect(() => {
		if (!('serviceWorker' in navigator)) {
			console.warn('Service workers are not supported in this browser');
			return;
		}

		const registerSW = async () => {
			try {
				await registerServiceWorker();
			} catch (error) {
				console.error('Failed to register service worker:', error);
			}
		};

		registerSW();
	}, []);

	return null;
}
