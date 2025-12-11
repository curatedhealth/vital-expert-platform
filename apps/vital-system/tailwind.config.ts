import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    '!./src/**/_archived*/**',
    '!./src/**/*.backup',
    '!./src/**/*.disabled',
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
  			// VITAL Platform Design Tokens v2.0
  			// Canvas tokens - Soft white backgrounds
  			canvas: {
  				primary: '#FFFAFA',   // Snow - main background (80-90% of UI)
  				surface: '#FFFFFF',   // Pure white - elevated cards, modals
  				alt: '#F8F8FF',       // Ghost White - alternate surfaces
  				muted: '#FAF9F6',     // Off White - subtle backgrounds
  			},
  			// Cool Neutral Scale (aligned with Snow)
  			neutral: {
  				50: '#FAFAFA',
  				100: '#F5F5F5',
  				200: '#EEEEEE',
  				300: '#E0E0E0',
  				400: '#BDBDBD',
  				500: '#9E9E9E',
  				600: '#757575',
  				700: '#616161',
  				800: '#424242',
  				900: '#212121',
  			},
  			// Warm Stone Neutrals (Brand v6.0)
  			stone: {
  				50: '#FAFAF9',
  				100: '#F5F5F4',
  				200: '#E7E5E4',
  				300: '#D6D3D1',
  				400: '#A8A29E',
  				500: '#78716C',
  				600: '#57534E',
  				700: '#44403C',
  				800: '#292524',
  				900: '#1C1917',
  			},
  			// VITAL Brand Colors (v6.0 - Warm Purple)
  			vital: {
  				primary: {
  					50: '#FAF5FF',    // Selected backgrounds
  					100: '#F3E8FF',   // Hover backgrounds
  					200: '#E9D5FF',
  					300: '#D8B4FE',
  					400: '#C084FC',
  					500: '#A855F7',   // Secondary accent
  					600: '#9055E0',   // PRIMARY - Warm Purple
  					700: '#7C3AED',   // Hover state
  					800: '#6B21A8',   // Active/pressed
  					900: '#581C87',
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
  				from: { height: '0' },
  				to: { height: 'var(--radix-accordion-content-height)' }
  			},
  			'accordion-up': {
  				from: { height: 'var(--radix-accordion-content-height)' },
  				to: { height: '0' }
  			},
  			'fade-in': {
  				from: { opacity: '0', transform: 'translateY(20px)' },
  				to: { opacity: '1', transform: 'translateY(0)' }
  			},
  			'journey-pulse': {
  				'0%, 100%': { opacity: '1' },
  				'50%': { opacity: '0.5' }
  			},
  			// Ask Expert animations
  			'thinking-pulse': {
  				'0%, 100%': {
  					boxShadow: '0 0 15px rgba(144, 85, 224, 0.1)',
  					borderColor: 'rgba(144, 85, 224, 0.2)'
  				},
  				'50%': {
  					boxShadow: '0 0 25px rgba(144, 85, 224, 0.2)',
  					borderColor: 'rgba(144, 85, 224, 0.4)'
  				}
  			},
  			'cursor-blink': {
  				'0%, 49%': { opacity: '1' },
  				'50%, 100%': { opacity: '0' }
  			},
  			'shimmer': {
  				'0%': { transform: 'translateX(-100%)' },
  				'100%': { transform: 'translateX(100%)' }
  			},
  			'pulse-subtle': {
  				'0%, 100%': { opacity: '1' },
  				'50%': { opacity: '0.85' }
  			},
  			'slide-up': {
  				from: { opacity: '0', transform: 'translateY(10px)' },
  				to: { opacity: '1', transform: 'translateY(0)' }
  			},
  			'scale-in': {
  				from: { opacity: '0', transform: 'scale(0.95)' },
  				to: { opacity: '1', transform: 'scale(1)' }
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'fade-in': 'fade-in 0.5s ease-out',
  			'journey-pulse': 'journey-pulse 2s ease-in-out infinite',
  			// Ask Expert animations
  			'thinking-pulse': 'thinking-pulse 1.5s ease-in-out infinite',
  			'cursor-blink': 'cursor-blink 1s step-end infinite',
  			'shimmer': 'shimmer 2s ease-in-out infinite',
  			'pulse-subtle': 'pulse-subtle 1.5s ease-in-out infinite',
  			'slide-up': 'slide-up 200ms ease-out',
  			'scale-in': 'scale-in 200ms ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}

export default config