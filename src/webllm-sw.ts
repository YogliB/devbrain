import * as webllm from '@mlc-ai/web-llm';

// Initialize the ServiceWorkerMLCEngineHandler during the initial evaluation
// This ensures the message event handler is registered properly
// We need to instantiate this during initial script evaluation to avoid the warning:
// "Event handler of 'message' event must be added on the initial evaluation of worker script"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handler = new webllm.ServiceWorkerMLCEngineHandler();

self.addEventListener('activate', (event) => {
	// @ts-expect-error - ExtendableEvent is not defined in the global scope
	event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
	if (event.data === 'claim') {
		// @ts-expect-error - ExtendableEvent is not defined in the global scope
		event.waitUntil(self.clients.claim());
	}
});
