const esbuild = require('esbuild');

esbuild
	.build({
		entryPoints: ['src/webllm-sw.ts'],
		bundle: true,
		outfile: 'public/webllm-sw.js',
		format: 'esm',
		target: 'esnext',
		minify: true,
	})
	.catch(() => process.exit(1));
