import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/contexts/theme-context';
import { ModelProvider } from '@/contexts/model-context';
import { NotebookProvider } from '@/contexts/notebook-context';
import { TooltipProvider } from '@/components/ui/tooltip';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'DevBrain',
	description: 'A notebook app for developers with local LLM integration',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<ThemeProvider
					defaultTheme="system"
					storageKey="devbrain-theme"
				>
					<TooltipProvider>
						<ModelProvider>
							<NotebookProvider>{children}</NotebookProvider>
						</ModelProvider>
					</TooltipProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
