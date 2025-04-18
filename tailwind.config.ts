import type { Config } from 'tailwindcss';

const config: Config = {
	content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
	darkMode: 'class',
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px',
			},
		},
		extend: {
			colors: {
				border: 'var(--color-border)',
				input: 'var(--color-input)',
				ring: 'var(--color-ring)',
				background: 'var(--color-background)',
				foreground: 'var(--color-foreground)',
				primary: {
					DEFAULT: 'var(--color-primary)',
					foreground: 'var(--color-primary-foreground)',
				},
				secondary: {
					DEFAULT: 'var(--color-secondary)',
					foreground: 'var(--color-secondary-foreground)',
				},
				destructive: {
					DEFAULT: 'var(--color-destructive)',
					foreground: 'var(--color-destructive-foreground)',
				},
				muted: {
					DEFAULT: 'var(--color-muted)',
					foreground: 'var(--color-muted-foreground)',
				},
				accent: {
					DEFAULT: 'var(--color-accent)',
					foreground: 'var(--color-accent-foreground)',
				},
				popover: {
					DEFAULT: 'var(--color-popover)',
					foreground: 'var(--color-popover-foreground)',
				},
				card: {
					DEFAULT: 'var(--color-card)',
					foreground: 'var(--color-card-foreground)',
				},
				sidebar: {
					DEFAULT: 'var(--color-sidebar)',
					foreground: 'var(--color-sidebar-foreground)',
					primary: {
						DEFAULT: 'var(--color-sidebar-primary)',
						foreground: 'var(--color-sidebar-primary-foreground)',
					},
					accent: {
						DEFAULT: 'var(--color-sidebar-accent)',
						foreground: 'var(--color-sidebar-accent-foreground)',
					},
					border: 'var(--color-sidebar-border)',
					ring: 'var(--color-sidebar-ring)',
				},
			},
			borderRadius: {
				lg: 'var(--radius-lg)',
				md: 'var(--radius-md)',
				sm: 'var(--radius-sm)',
				xl: 'var(--radius-xl)',
			},
			fontFamily: {
				sans: ['var(--font-sans)'],
				mono: ['var(--font-mono)'],
			},
			keyframes: {
				pulse: {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.3' },
				},
				blink: {
					'0%': { opacity: '0.2' },
					'20%': { opacity: '1' },
					'100%': { opacity: '0.2' },
				},
			},
			animation: {
				'pulse-delay-0': 'pulse 1.5s ease-in-out infinite',
				'pulse-delay-300': 'pulse 1.5s ease-in-out 0.3s infinite',
				'pulse-delay-600': 'pulse 1.5s ease-in-out 0.6s infinite',
				'blink-delay-0': 'blink 1.4s infinite',
				'blink-delay-200': 'blink 1.4s 0.2s infinite',
				'blink-delay-400': 'blink 1.4s 0.4s infinite',
			},
		},
	},
};

export default config;
