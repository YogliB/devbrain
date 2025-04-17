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
				const registrations =
					await navigator.serviceWorker.getRegistrations();
				for (const registration of registrations) {
					await registration.unregister();
				}

				const registration = await registerServiceWorker();
				if (!registration) {
					console.warn('Service worker registration returned null');
				}
			} catch (error) {
				console.error('Failed to register service worker:', error);
			}
		};

		registerSW();

		return () => {
			if ('serviceWorker' in navigator) {
				navigator.serviceWorker
					.getRegistrations()
					.then((registrations) => {
						for (const registration of registrations) {
							registration.unregister();
						}
					});
			}
		};
	}, []);

	return null;
}
