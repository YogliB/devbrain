/** @type {import('next').NextConfig} */
const nextConfig = {
	// Ensure bcryptjs works with Turbopack
	serverExternalPackages: ['bcryptjs'],
};

export default nextConfig;
