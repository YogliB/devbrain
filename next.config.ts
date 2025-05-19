import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	serverExternalPackages: ['bcryptjs', 'postgres', 'pg'],
};

export default nextConfig;
