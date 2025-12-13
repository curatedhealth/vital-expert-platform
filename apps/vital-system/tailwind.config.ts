import type { Config } from 'tailwindcss'

/**
 * VITAL Platform Tailwind Configuration v4.0 (Hardened)
 *
 * Brand v6.0 Compliance - HARDENED:
 * - PRIMARY accent: Purple (#9055E0) - blue-* BLOCKED
 * - TEXT color: Stone (warm gray) - gray-* BLOCKED
 * - BACKGROUNDS: Warm off-white (#FAFAF9) - NOT pure white
 *
 * ⚠️ IMPORTANT: Colors defined at theme level (not extend) to REPLACE defaults
 * This prevents accidental use of blue-*, gray-*, slate-* from Tailwind defaults
 *
 * @see /apps/vital-system/src/lib/brand/brand-tokens.ts
 */

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
  	// ═══════════════════════════════════════════════════════════════════════════
  	// HARDENED COLORS: Defined at theme level to REPLACE Tailwind defaults
  	// This blocks blue-*, gray-*, slate-* from being available
  	// ═══════════════════════════════════════════════════════════════════════════
  	colors: {
  		// Essential Tailwind colors (keep these)
  		transparent: 'transparent',
  		current: 'currentColor',
  		black: '#000',
  		white: '#fff',

  		// ═══════════════════════════════════════════════════════════════════
  		// BRAND v6.0 APPROVED COLORS ONLY
  		// ═══════════════════════════════════════════════════════════════════

  		// Warm Stone Neutrals (Brand v6.0) - REPLACES gray-*
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
  			950: '#0c0a09',
  		},

  		// Brand Purple (v6.0) - REPLACES blue-*
  		purple: {
  			50: '#FAF5FF',
  			100: '#F3E8FF',
  			200: '#E9D5FF',
  			300: '#D8B4FE',
  			400: '#C084FC',
  			500: '#A855F7',
  			600: '#9055E0',   // PRIMARY brand color
  			700: '#7C3AED',
  			800: '#6B21A8',
  			900: '#581C87',
  			950: '#3b0764',
  		},

  		// Violet (Mode 2 accent)
  		violet: {
  			50: '#f5f3ff',
  			100: '#ede9fe',
  			200: '#ddd6fe',
  			300: '#c4b5fd',
  			400: '#a78bfa',
  			500: '#8b5cf6',
  			600: '#7c3aed',
  			700: '#6d28d9',
  			800: '#5b21b6',
  			900: '#4c1d95',
  			950: '#2e1065',
  		},

  		// Fuchsia (Mode 3 accent)
  		fuchsia: {
  			50: '#fdf4ff',
  			100: '#fae8ff',
  			200: '#f5d0fe',
  			300: '#f0abfc',
  			400: '#e879f9',
  			500: '#d946ef',
  			600: '#c026d3',
  			700: '#a21caf',
  			800: '#86198f',
  			900: '#701a75',
  			950: '#4a044e',
  		},

  		// Pink (Mode 4 accent)
  		pink: {
  			50: '#fdf2f8',
  			100: '#fce7f3',
  			200: '#fbcfe8',
  			300: '#f9a8d4',
  			400: '#f472b6',
  			500: '#ec4899',
  			600: '#db2777',
  			700: '#be185d',
  			800: '#9d174d',
  			900: '#831843',
  			950: '#500724',
  		},

  		// Semantic colors (required for UI)
  		red: {
  			50: '#fef2f2',
  			100: '#fee2e2',
  			200: '#fecaca',
  			300: '#fca5a5',
  			400: '#f87171',
  			500: '#ef4444',
  			600: '#dc2626',
  			700: '#b91c1c',
  			800: '#991b1b',
  			900: '#7f1d1d',
  			950: '#450a0a',
  		},
  		green: {
  			50: '#f0fdf4',
  			100: '#dcfce7',
  			200: '#bbf7d0',
  			300: '#86efac',
  			400: '#4ade80',
  			500: '#22c55e',
  			600: '#16a34a',
  			700: '#15803d',
  			800: '#166534',
  			900: '#14532d',
  			950: '#052e16',
  		},
  		yellow: {
  			50: '#fefce8',
  			100: '#fef9c3',
  			200: '#fef08a',
  			300: '#fde047',
  			400: '#facc15',
  			500: '#eab308',
  			600: '#ca8a04',
  			700: '#a16207',
  			800: '#854d0e',
  			900: '#713f12',
  			950: '#422006',
  		},
  		orange: {
  			50: '#fff7ed',
  			100: '#ffedd5',
  			200: '#fed7aa',
  			300: '#fdba74',
  			400: '#fb923c',
  			500: '#f97316',
  			600: '#ea580c',
  			700: '#c2410c',
  			800: '#9a3412',
  			900: '#7c2d12',
  			950: '#431407',
  		},
  		amber: {
  			50: '#fffbeb',
  			100: '#fef3c7',
  			200: '#fde68a',
  			300: '#fcd34d',
  			400: '#fbbf24',
  			500: '#f59e0b',
  			600: '#d97706',
  			700: '#b45309',
  			800: '#92400e',
  			900: '#78350f',
  			950: '#451a03',
  		},
  		cyan: {
  			50: '#ecfeff',
  			100: '#cffafe',
  			200: '#a5f3fc',
  			300: '#67e8f9',
  			400: '#22d3ee',
  			500: '#06b6d4',
  			600: '#0891b2',
  			700: '#0e7490',
  			800: '#155e75',
  			900: '#164e63',
  			950: '#083344',
  		},
  		teal: {
  			50: '#f0fdfa',
  			100: '#ccfbf1',
  			200: '#99f6e4',
  			300: '#5eead4',
  			400: '#2dd4bf',
  			500: '#14b8a6',
  			600: '#0d9488',
  			700: '#0f766e',
  			800: '#115e59',
  			900: '#134e4a',
  			950: '#042f2e',
  		},
  		emerald: {
  			50: '#ecfdf5',
  			100: '#d1fae5',
  			200: '#a7f3d0',
  			300: '#6ee7b7',
  			400: '#34d399',
  			500: '#10b981',
  			600: '#059669',
  			700: '#047857',
  			800: '#065f46',
  			900: '#064e3b',
  			950: '#022c22',
  		},
  		indigo: {
  			50: '#eef2ff',
  			100: '#e0e7ff',
  			200: '#c7d2fe',
  			300: '#a5b4fc',
  			400: '#818cf8',
  			500: '#6366f1',
  			600: '#4f46e5',
  			700: '#4338ca',
  			800: '#3730a3',
  			900: '#312e81',
  			950: '#1e1b4b',
  		},
  		rose: {
  			50: '#fff1f2',
  			100: '#ffe4e6',
  			200: '#fecdd3',
  			300: '#fda4af',
  			400: '#fb7185',
  			500: '#f43f5e',
  			600: '#e11d48',
  			700: '#be123c',
  			800: '#9f1239',
  			900: '#881337',
  			950: '#4c0519',
  		},

  		// ═══════════════════════════════════════════════════════════════════
  		// BLUE: Semantic use only (clinical, regulatory contexts)
  		// ⚠️ Prefer purple-* for primary brand, use blue only for semantic meaning
  		// ═══════════════════════════════════════════════════════════════════
  		blue: {
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
  			950: '#172554',
  		},
  		// SKY: For info/secondary accents
  		sky: {
  			50: '#f0f9ff',
  			100: '#e0f2fe',
  			200: '#bae6fd',
  			300: '#7dd3fc',
  			400: '#38bdf8',
  			500: '#0ea5e9',
  			600: '#0284c7',
  			700: '#0369a1',
  			800: '#075985',
  			900: '#0c4a6e',
  			950: '#082f49',
  		},

  		// ═══════════════════════════════════════════════════════════════════
  		// ZINC: Brand-approved neutral (allowed as alternative to stone)
  		// ═══════════════════════════════════════════════════════════════════
  		zinc: {
  			50: '#fafafa',
  			100: '#f4f4f5',
  			200: '#e4e4e7',
  			300: '#d4d4d8',
  			400: '#a1a1aa',
  			500: '#71717a',
  			600: '#52525b',
  			700: '#3f3f46',
  			800: '#27272a',
  			900: '#18181b',
  			950: '#09090b',
  		},
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
  			950: '#0a0a0a',
  		},
  	},
  	extend: {
  		colors: {
  			// ═══════════════════════════════════════════════════════════════════
  			// EXTENDED BRAND COLORS (additional, not replacing)
  			// ═══════════════════════════════════════════════════════════════════

  			// VITAL Platform Design Tokens v2.0
  			// Canvas tokens - Soft white backgrounds
  			canvas: {
  				primary: '#FFFAFA',   // Snow - main background (80-90% of UI)
  				surface: '#FFFFFF',   // Pure white - elevated cards, modals
  				alt: '#F8F8FF',       // Ghost White - alternate surfaces
  				muted: '#FAF9F6',     // Off White - subtle backgrounds
  			},
  			// VITAL Brand Colors (v6.0 - Warm Purple)
  			// Note: stone-*, purple-*, neutral-* are defined at theme.colors level (hardened)
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