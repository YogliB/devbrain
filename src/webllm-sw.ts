import * as webllm from '@mlc-ai/web-llm';

self.addEventListener('activate', (event) => {
	// @ts-expect-error - ExtendableEvent is not defined in the global scope
	event.waitUntil(self.clients.claim());

	new webllm.ServiceWorkerMLCEngineHandler();
});

self.addEventListener('message', (event) => {
	if (event.data === 'claim') {
		// @ts-expect-error - ExtendableEvent is not defined in the global scope
		event.waitUntil(self.clients.claim());
	}
});
