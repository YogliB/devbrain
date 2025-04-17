import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy API route to handle CORS issues with external resources
 * This route will proxy requests to external services like Hugging Face
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: { path: string[] } },
) {
	try {
		// Get the path from the URL parameters
		const pathSegments = params.path;

		// Get the target URL from the query parameters
		const targetUrl = request.nextUrl.searchParams.get('url');

		if (!targetUrl) {
			return NextResponse.json(
				{ error: 'Missing url parameter' },
				{ status: 400 },
			);
		}

		// Decode the URL to handle any encoded characters
		const decodedUrl = decodeURIComponent(targetUrl);

		console.log(`Proxying request to: ${decodedUrl}`);

		// Fetch the resource from the target URL
		const response = await fetch(decodedUrl);

		if (!response.ok) {
			return NextResponse.json(
				{
					error: `Failed to fetch from ${decodedUrl}`,
					status: response.status,
				},
				{ status: response.status },
			);
		}

		// Get the content type from the response
		const contentType = response.headers.get('content-type');

		// For binary data, we need to return it as an array buffer
		const data = await response.arrayBuffer();

		// Create a new response with the data
		const proxyResponse = new NextResponse(data);

		// Set the content type header if it exists
		if (contentType) {
			proxyResponse.headers.set('content-type', contentType);
		}

		// Set cache control headers to improve performance
		proxyResponse.headers.set('cache-control', 'public, max-age=31536000');

		return proxyResponse;
	} catch (error) {
		console.error('Proxy error:', error);
		return NextResponse.json(
			{ error: 'Failed to proxy request', details: String(error) },
			{ status: 500 },
		);
	}
}
