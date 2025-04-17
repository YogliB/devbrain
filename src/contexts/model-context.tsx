'use client';

import React, { createContext, useContext } from 'react';

interface ModelContextType {
	modelAvailable: boolean;
}

const ModelContext = createContext<ModelContextType>({
	modelAvailable: true,
});

export function ModelProvider({ children }: { children: React.ReactNode }) {
	// In this simplified version, we're always returning that a model is available
	// This will be replaced with actual model loading logic in the future
	const value = {
		modelAvailable: true,
	};

	return (
		<ModelContext.Provider value={value}>{children}</ModelContext.Provider>
	);
}

export function useModel() {
	return useContext(ModelContext);
}
