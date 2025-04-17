import * as webllm from '@mlc-ai/web-llm';

self.addEventListener('activate', () => {
	new webllm.ServiceWorkerMLCEngineHandler();
});
