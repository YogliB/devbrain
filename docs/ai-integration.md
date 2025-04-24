# AI Integration

## Overview

DevBrain integrates AI capabilities using WebLLM, which allows running large language models directly in the browser without sending data to external servers. This approach provides several benefits:

- **Privacy**: All data stays on the user's device
- **Offline Capability**: Models can be used without an internet connection once downloaded
- **Cost Efficiency**: No server costs for AI inference
- **Reduced Latency**: No network round-trips for AI processing

## Supported Models

DevBrain automatically selects the most appropriate model based on the user's device capabilities. The models are prioritized in the following order:

1. **DeepSeek-R1-Distill-Llama-8B-q4f16_1-MLC**: High-quality 8B parameter model with excellent reasoning capabilities
2. **Qwen2.5-7B-Instruct-q4f16_1-MLC**: Balanced 7B parameter model with good performance
3. **Gemma-2b-it**: Smaller 2B parameter model for devices with limited resources

## Model Loading and Management

Models are downloaded and stored in the browser's IndexedDB storage, allowing them to persist between sessions. The model loading process includes:

1. Checking device capabilities (memory, WebGPU support)
2. Selecting the appropriate model
3. Downloading the model if not already available
4. Loading the model into memory for inference

Users can:

- See the download progress in the UI
- Cancel downloads if needed
- Remove downloaded models to free up space

## Service Worker Integration

WebLLM uses a service worker to offload computation and maintain model state between page refreshes. This provides several benefits:

- Models don't need to be reloaded when the page refreshes
- Computation happens in a separate thread, keeping the UI responsive
- Models can be shared between different parts of the application

## AI Features

### Chat Interface

The AI chat interface allows users to:

- Ask questions about their sources
- Receive AI-generated responses based on the content of their sources
- See a "thinking" indicator while the AI is processing

### Suggested Questions

The AI can generate suggested questions based on the content of the user's sources:

- Questions are generated automatically when sources are added
- Users can regenerate questions manually
- Questions are persisted in the database for each notebook
- Questions can be clicked to automatically populate the chat input

## Implementation Details

The AI integration is implemented using:

- **WebLLM**: For model loading and inference
- **Service Worker**: For offloading computation
- **React Hooks**: For managing AI state and interactions
- **IndexedDB**: For storing downloaded models

The main components involved in the AI integration are:

- `ModelSelector`: Displays the selected model and loading status
- `ChatInterface`: Handles user interactions with the AI
- `SuggestedQuestions`: Displays and manages AI-generated questions
