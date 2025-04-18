export interface ModelConfig {
	id: string;
	name: string;
	description: string;
	size: number; // Size in MB
	minMemory: number; // Minimum memory required in MB
	requiresWebGPU: boolean;
}

export const AVAILABLE_MODELS: ModelConfig[] = [
	{
		id: 'DeepSeek-R1-Distill-Qwen-14B-q4f16_1-MLC',
		name: 'DeepSeek R1 Distill Qwen 14B',
		description:
			'High-quality 14B parameter model with excellent reasoning capabilities',
		size: 7800, // Approximate size in MB
		minMemory: 8000, // Minimum memory required in MB
		requiresWebGPU: true,
	},
	{
		id: 'Qwen2.5-7B-Instruct-q4f16_1-MLC',
		name: 'Qwen 2.5 7B Instruct',
		description: 'Balanced 7B parameter model with good performance',
		size: 4000, // Approximate size in MB
		minMemory: 4500, // Minimum memory required in MB
		requiresWebGPU: true,
	},
	{
		id: 'gemma-2b-it-q4f16_1-MLC',
		name: 'Gemma 2B Instruct',
		description:
			'Lightweight 2B parameter model for devices with limited resources',
		size: 1200, // Approximate size in MB
		minMemory: 2000, // Minimum memory required in MB
		requiresWebGPU: false, // Can run on CPU if needed
	},
];

export type DeviceCapabilities = {
	webGPUSupported: boolean;
	estimatedMemory: number; // in MB
	deviceType: 'high-end' | 'mid-range' | 'low-end' | 'unknown';
};

/**
 * Detects device capabilities including WebGPU support and available memory
 */
export async function detectDeviceCapabilities(): Promise<DeviceCapabilities> {
	// Default capabilities for fallback
	const defaultCapabilities: DeviceCapabilities = {
		webGPUSupported: false,
		estimatedMemory: 2000, // Conservative default
		deviceType: 'unknown',
	};

	try {
		// Check WebGPU support
		const webGPUSupported =
			typeof navigator !== 'undefined' && 'gpu' in navigator;

		// Estimate available memory
		let estimatedMemory = 2000; // Default conservative estimate (2GB)

		if (typeof navigator !== 'undefined') {
			// Try to use deviceMemory API if available (returns memory in GB)
			if ('deviceMemory' in navigator) {
				// @ts-expect-error - deviceMemory is not in the standard navigator type
				estimatedMemory = (navigator.deviceMemory || 2) * 1024;
			}

			// Use performance.memory if available (Chromium-based browsers)
			// @ts-expect-error - performance.memory is not in the standard Performance type
			if (
				performance &&
				performance.memory &&
				performance.memory.jsHeapSizeLimit
			) {
				// Convert bytes to MB
				// @ts-expect-error - memory is not in the standard Performance type
				const heapSizeLimit =
					performance.memory.jsHeapSizeLimit / (1024 * 1024);
				estimatedMemory = Math.max(estimatedMemory, heapSizeLimit);
			}
		}

		// Determine device type based on memory and WebGPU support
		let deviceType: DeviceCapabilities['deviceType'] = 'unknown';
		if (estimatedMemory >= 8000 && webGPUSupported) {
			deviceType = 'high-end';
		} else if (estimatedMemory >= 4000 && webGPUSupported) {
			deviceType = 'mid-range';
		} else {
			deviceType = 'low-end';
		}

		return {
			webGPUSupported,
			estimatedMemory,
			deviceType,
		};
	} catch (error) {
		console.error('Error detecting device capabilities:', error);
		return defaultCapabilities;
	}
}

/**
 * Selects the best model based on device capabilities
 */
export async function selectBestModel(): Promise<ModelConfig> {
	const capabilities = await detectDeviceCapabilities();
	console.log('Detected device capabilities:', capabilities);

	// Filter models that can run on the device
	const compatibleModels = AVAILABLE_MODELS.filter((model) => {
		// If model requires WebGPU, check if it's supported
		if (model.requiresWebGPU && !capabilities.webGPUSupported) {
			return false;
		}

		// Check if device has enough memory
		if (model.minMemory > capabilities.estimatedMemory) {
			return false;
		}

		return true;
	});

	// Sort compatible models by size (largest first)
	const sortedModels = [...compatibleModels].sort((a, b) => b.size - a.size);

	// Select the largest compatible model
	const selectedModel =
		sortedModels[0] || AVAILABLE_MODELS[AVAILABLE_MODELS.length - 1];

	console.log('Selected model:', selectedModel);
	return selectedModel;
}
