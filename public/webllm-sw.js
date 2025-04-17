// Import WebLLM from CDN
importScripts('https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.78/dist/mlc-llm.js');

let handler;

self.addEventListener('activate', (event) => {
  handler = new mlcllm.ServiceWorkerMLCEngineHandler();
  console.log('WebLLM Service Worker activated');

  // Claim clients so the service worker is used immediately
  event.waitUntil(self.clients.claim());
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (handler) {
    handler.onmessage(event);
  }
});

// Handle fetch events - needed for service worker registration
self.addEventListener('fetch', () => {
  // No-op fetch handler to ensure the service worker is properly registered
});
