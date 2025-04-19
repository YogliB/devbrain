import * as webllm from '@mlc-ai/web-llm';

// TypeScript doesn't know about service worker globals, so we need to use any
const sw = self as any;

// Initialize the WebLLM service worker handler
new webllm.ServiceWorkerMLCEngineHandler();

// Log when the service worker is installed
sw.addEventListener('install', (event: ExtendableEvent) => {
	console.log('[Service Worker] Installed');
	// Skip waiting to activate immediately
	event.waitUntil(sw.skipWaiting());
});

// Claim clients when activated
sw.addEventListener('activate', (event: ExtendableEvent) => {
	console.log('[Service Worker] Activated');
	event.waitUntil(
		Promise.all([
			// Skip the waiting phase
			sw.skipWaiting(),
			// Claim all clients
			sw.clients.claim(),
			// Notify all clients that the service worker is active
			sw.clients.matchAll().then((clients: any[]) => {
				clients.forEach((client: any) => {
					client.postMessage({ type: 'SW_ACTIVATED' });
				});
			}),
		]),
	);
});

// Handle messages from clients
sw.addEventListener('message', (event: ExtendableMessageEvent) => {
	console.log('[Service Worker] Message received:', event.data);

	if (event.data === 'claim') {
		console.log('[Service Worker] Claim request received');
		event.waitUntil(
			Promise.all([
				sw.clients.claim(),
				sw.clients.matchAll().then((clients: any[]) => {
					clients.forEach((client: any) => {
						client.postMessage({ type: 'SW_CLAIMED' });
					});
				}),
			]),
		);
	}
});

// Define types for TypeScript
interface ExtendableEvent extends Event {
	waitUntil(promise: Promise<any>): void;
}

interface ExtendableMessageEvent extends ExtendableEvent {
	data: any;
	origin: string;
	lastEventId: string;
	source: any;
	ports: ReadonlyArray<any>;
}
