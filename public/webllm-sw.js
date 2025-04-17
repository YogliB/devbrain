importScripts('https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.78/dist/mlc-llm.js');

let handler;

self.addEventListener('activate', () => {
  handler = new mlcllm.ServiceWorkerMLCEngineHandler();
});

self.onmessage = (msg) => {
  handler.onmessage(msg);
};
