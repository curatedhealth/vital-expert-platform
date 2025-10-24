import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		colors: {
  			// VITAL.expert Brand Colors
  			'vital-black': '#0A0A0A',
  			'vital-white': '#FFFFFF',
  			'vital-gray-95': '#FAFAFA',
  			'vital-gray-90': '#F5F5F5',
  			'vital-gray-80': '#E5E5E5',
  			'vital-gray-60': '#999999',
  			'vital-gray-40': '#666666',

  			// VITAL Expert Landing Page Colors
  			'vital-blue': {
  				50: '#eff6ff',
  				100: '#dbeafe',
  				200: '#bfdbfe',
  				300: '#93c5fd',
  				400: '#60a5fa',
  				500: '#3b82f6',
  				600: '#2563eb',
  				700: '#1d4ed8',
  				800: '#1e40af',
  				900: '#1e3a8a',
  			},
  			'vital-purple': {
  				400: '#c084fc',
  				500: '#a855f7',
  				600: '#9333ea',
  			},
  			'vital-teal': {
  				400: '#2dd4bf',
  				500: '#14b8a6',
  				600: '#0d9488',
  			},
  			'vital-amber': {
  				400: '#fbbf24',
  				500: '#f59e0b',
  				600: '#d97706',
  			},
  			'vital-pink': {
  				400: '#f472b6',
  				500: '#ec4899',
  				600: '#db2777',
  			},

  			// Service Line Colors
  			'regulatory-blue': '#0066FF',
  			'clinical-green': '#00CC88',
  			'safety-red': '#FF3366',
  			'data-purple': '#9933FF',
  			'market-orange': '#FF6600',
  			'research-cyan': '#00CCFF',
  			'quality-gold': '#FFAA00',
  			'strategy-navy': '#003399',

  			// Legacy colors (for backwards compatibility)
  			'trust-blue': '#0066FF',
  			'progress-teal': '#00CC88',
  			'deep-charcoal': '#0A0A0A',
  			'regulatory-gold': '#FFAA00',
  			'market-purple': '#9933FF',
  			'medical-gray': '#999999',
  			'light-gray': '#E5E5E5',
  			'background-gray': '#FAFAFA',
			border: 'hsl(var(--border))',
			input: 'hsl(var(--input))',
			ring: 'hsl(var(--ring) / 0.2)',
  			background: 'var(--background)',
  			foreground: 'var(--foreground)',
  			primary: {
  				DEFAULT: 'var(--primary)',
  				foreground: 'var(--primary-foreground)'
  			},
  			secondary: {
  				DEFAULT: 'var(--secondary)',
  				foreground: 'var(--secondary-foreground)'
  			},
  			destructive: {
  				DEFAULT: 'var(--destructive)',
  				foreground: 'var(--destructive-foreground)'
  			},
  			muted: {
  				DEFAULT: 'var(--muted)',
  				foreground: 'var(--muted-foreground)'
  			},
  			accent: {
  				DEFAULT: 'var(--accent)',
  				foreground: 'var(--accent-foreground)'
  			},
  			popover: {
  				DEFAULT: 'var(--popover)',
  				foreground: 'var(--popover-foreground)'
  			},
  			card: {
  				DEFAULT: 'var(--card)',
  				foreground: 'var(--card-foreground)'
  			},
			sidebar: {
				DEFAULT: 'var(--sidebar)',
				foreground: 'var(--sidebar-foreground)',
				primary: 'var(--sidebar-primary)',
				'primary-foreground': 'var(--sidebar-primary-foreground)',
				accent: 'var(--sidebar-accent)',
				'accent-foreground': 'var(--sidebar-accent-foreground)',
				border: 'var(--sidebar-border)',
				ring: 'var(--sidebar-ring)'
			},
			// Status Colors
			success: {
				DEFAULT: 'oklch(var(--success))',
				foreground: 'oklch(var(--success-foreground))',
				hover: 'oklch(var(--success-hover))',
				active: 'oklch(var(--success-active))',
				bg: 'oklch(var(--success-bg))'
			},
			warning: {
				DEFAULT: 'oklch(var(--warning))',
				foreground: 'oklch(var(--warning-foreground))',
				hover: 'oklch(var(--warning-hover))',
				active: 'oklch(var(--warning-active))',
				bg: 'oklch(var(--warning-bg))'
			},
			info: {
				DEFAULT: 'oklch(var(--info))',
				foreground: 'oklch(var(--info-foreground))',
				hover: 'oklch(var(--info-hover))',
				active: 'oklch(var(--info-active))',
				bg: 'oklch(var(--info-bg))'
			},
  			chart: {
  				'1': 'var(--chart-1)',
  				'2': 'var(--chart-2)',
  				'3': 'var(--chart-3)',
  				'4': 'var(--chart-4)',
  				'5': 'var(--chart-5)'
  			}
  		},
		fontFamily: {
			sans: [
				'Outfit',
				'Inter',
				'system-ui',
				'sans-serif'
			],
			mono: [
				'Fira Code',
				'JetBrains Mono',
				'monospace'
			]
		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
		zIndex: {
			base: 'var(--z-base)',
			dropdown: 'var(--z-dropdown)',
			sticky: 'var(--z-sticky)',
			fixed: 'var(--z-fixed)',
			'modal-backdrop': 'var(--z-modal-backdrop)',
			modal: 'var(--z-modal)',
			popover: 'var(--z-popover)',
			tooltip: 'var(--z-tooltip)',
			toast: 'var(--z-toast)',
			max: 'var(--z-max)'
		},
		spacing: {
			'0': 'var(--space-0)',
			'px': 'var(--space-px)',
			'0.5': 'var(--space-0-5)',
			'1': 'var(--space-1)',
			'1.5': 'var(--space-1-5)',
			'2': 'var(--space-2)',
			'2.5': 'var(--space-2-5)',
			'3': 'var(--space-3)',
			'3.5': 'var(--space-3-5)',
			'4': 'var(--space-4)',
			'5': 'var(--space-5)',
			'6': 'var(--space-6)',
			'7': 'var(--space-7)',
			'8': 'var(--space-8)',
			'9': 'var(--space-9)',
			'10': 'var(--space-10)',
			'11': 'var(--space-11)',
			'12': 'var(--space-12)',
			'14': 'var(--space-14)',
			'16': 'var(--space-16)',
			'20': 'var(--space-20)',
			'24': 'var(--space-24)',
			'28': 'var(--space-28)',
			'32': 'var(--space-32)',
			'36': 'var(--space-36)',
			'40': 'var(--space-40)',
			'44': 'var(--space-44)',
			'48': 'var(--space-48)',
			'52': 'var(--space-52)',
			'56': 'var(--space-56)',
			'60': 'var(--space-60)',
			'64': 'var(--space-64)',
			'72': 'var(--space-72)',
			'80': 'var(--space-80)',
			'96': 'var(--space-96)'
		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			'fade-in': {
  				from: {
  					opacity: '0',
  					transform: 'translateY(20px)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'journey-pulse': {
  				'0%, 100%': {
  					opacity: '1'
  				},
  				'50%': {
  					opacity: '0.5'
  				}
  			},
  			'gradient': {
  				'0%, 100%': {
  					'background-size': '200% 200%',
  					'background-position': 'left center',
  				},
  				'50%': {
  					'background-size': '200% 200%',
  					'background-position': 'right center',
  				},
  			},
  			'fade-in-up': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(20px)',
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)',
  				},
  			},
  			'pulse-slow': {
  				'0%, 100%': {
  					opacity: '1',
  				},
  				'50%': {
  					opacity: '0.5',
  				},
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'fade-in': 'fade-in 0.5s ease-out',
  			'journey-pulse': 'journey-pulse 2s ease-in-out infinite',
  			'gradient': 'gradient 8s ease infinite',
  			'fade-in-up': 'fade-in-up 0.8s ease-out',
  			'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}

export default config