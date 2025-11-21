import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './src/components/langgraph-gui/**/*.{ts,tsx}',
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
  			// VITAL Brand Colors v2.0
  			vital: {
  				primary: {
  					50: '#F9F5FD',
  					100: '#F5EEFD',
  					200: '#E9DCFB',
  					300: '#D4B9F7',
  					400: '#B896F3',
  					500: '#9B5DE0',
  					600: '#8A4FD0',
  					700: '#7A41C0',
  					800: '#6A35B0',
  					900: '#5A2AA0',
  				},
  				secondary: {
  					400: '#00E5FF',
  					500: '#00CAFF',
  					600: '#00B8E6',
  				},
  				accent: {
  					mint: '#00FFDE',
  					violet: '#4300FF',
  				},
  				pharma: '#2563EB',
  				startups: '#EC4899',
  				payers: '#F59E0B',
  				consulting: '#64748B',
  				success: '#22C55E',
  				warning: '#F59E0B',
  				error: '#EF4444',
  				info: '#06B6D4',
  				slate: {
  					50: '#F8FAFC',
  					100: '#F1F5F9',
  					200: '#E2E8F0',
  					300: '#CBD5E1',
  					400: '#94A3B8',
  					500: '#64748B',
  					600: '#475569',
  					700: '#334155',
  					800: '#1E293B',
  					900: '#0F172A',
  				},
  			},
  			// Legacy support - mapped to new colors
  			'vital-black': '#0F172A',
  			'vital-white': '#FFFFFF',
  			'vital-gray-95': '#F8FAFC',
  			'vital-gray-90': '#F1F5F9',
  			'vital-gray-80': '#E2E8F0',
  			'vital-gray-60': '#64748B',
  			'vital-gray-40': '#334155',
  			'regulatory-blue': '#2563EB',
  			'clinical-green': '#22C55E',
  			'safety-red': '#EF4444',
  			'data-purple': '#9B5DE0',
  			'market-orange': '#F59E0B',
  			'research-cyan': '#00CAFF',
  			'quality-gold': '#F59E0B',
  			'strategy-navy': '#1E293B',
  			'trust-blue': '#2563EB',
  			'progress-teal': '#22C55E',
  			'deep-charcoal': '#0F172A',
  			'regulatory-gold': '#F59E0B',
  			'market-purple': '#9B5DE0',
  			'medical-gray': '#64748B',
  			'light-gray': '#E2E8F0',
  			'background-gray': '#F8FAFC',
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'Inter',
  				'system-ui',
  				'sans-serif'
  			],
  			mono: [
  				'JetBrains Mono',
  				'monospace'
  			]
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
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
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'fade-in': 'fade-in 0.5s ease-out',
  			'journey-pulse': 'journey-pulse 2s ease-in-out infinite'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}

export default config