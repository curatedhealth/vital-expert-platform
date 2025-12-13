/**
 * Landing Page Design Tokens
 *
 * Premium design system for world-class landing page
 * Based on: Clean & Sophisticated style (Notion, Figma, Linear)
 */

// Typography Scale (1.25 ratio, 16px base)
export const TYPOGRAPHY = {
  display: {
    xl: {
      fontSize: '4.5rem',    // 72px
      lineHeight: '1.1',
      letterSpacing: '-0.02em',
      fontWeight: 600,
    },
    lg: {
      fontSize: '3.75rem',   // 60px
      lineHeight: '1.13',
      letterSpacing: '-0.02em',
      fontWeight: 600,
    },
  },
  heading: {
    '2xl': {
      fontSize: '3rem',      // 48px
      lineHeight: '1.17',
      letterSpacing: '-0.01em',
      fontWeight: 600,
    },
    xl: {
      fontSize: '2.25rem',   // 36px
      lineHeight: '1.22',
      letterSpacing: '-0.01em',
      fontWeight: 600,
    },
    lg: {
      fontSize: '1.875rem',  // 30px
      lineHeight: '1.27',
      letterSpacing: 'normal',
      fontWeight: 600,
    },
    md: {
      fontSize: '1.5rem',    // 24px
      lineHeight: '1.33',
      letterSpacing: 'normal',
      fontWeight: 600,
    },
  },
  body: {
    xl: {
      fontSize: '1.25rem',   // 20px
      lineHeight: '1.5',
      letterSpacing: 'normal',
      fontWeight: 400,
    },
    lg: {
      fontSize: '1.125rem',  // 18px
      lineHeight: '1.56',
      letterSpacing: 'normal',
      fontWeight: 400,
    },
    md: {
      fontSize: '1rem',      // 16px
      lineHeight: '1.5',
      letterSpacing: 'normal',
      fontWeight: 400,
    },
    sm: {
      fontSize: '0.875rem',  // 14px
      lineHeight: '1.43',
      letterSpacing: 'normal',
      fontWeight: 400,
    },
  },
  label: {
    md: {
      fontSize: '0.875rem',  // 14px
      lineHeight: '1.43',
      letterSpacing: '0.05em',
      fontWeight: 500,
      textTransform: 'uppercase' as const,
    },
    sm: {
      fontSize: '0.75rem',   // 12px
      lineHeight: '1.33',
      letterSpacing: '0.05em',
      fontWeight: 500,
      textTransform: 'uppercase' as const,
    },
  },
} as const;

// Spacing Scale (8px base)
export const SPACING = {
  '4xs': '0.25rem',    // 4px
  '3xs': '0.5rem',     // 8px
  '2xs': '0.75rem',    // 12px
  xs: '1rem',          // 16px
  sm: '1.5rem',        // 24px
  md: '2rem',          // 32px
  lg: '3rem',          // 48px
  xl: '4rem',          // 64px
  '2xl': '6rem',       // 96px
  '3xl': '8rem',       // 128px
  '4xl': '10rem',      // 160px
} as const;

// Section Padding
export const SECTION_PADDING = {
  sm: 'py-16 md:py-24',           // 64px / 96px
  md: 'py-20 md:py-28',           // 80px / 112px
  lg: 'py-24 md:py-32',           // 96px / 128px
  xl: 'py-32 md:py-40 lg:py-48',  // Hero - 128px / 160px / 192px
} as const;

// Premium Shadow System (Layered, warm-tinted)
export const SHADOWS = {
  sm: '0 1px 2px rgba(41, 37, 36, 0.04), 0 2px 4px rgba(41, 37, 36, 0.02)',
  md: '0 2px 4px rgba(41, 37, 36, 0.06), 0 4px 8px rgba(41, 37, 36, 0.04), 0 8px 16px rgba(41, 37, 36, 0.02)',
  lg: '0 4px 8px rgba(41, 37, 36, 0.08), 0 8px 16px rgba(41, 37, 36, 0.06), 0 16px 32px rgba(41, 37, 36, 0.04)',
  xl: '0 8px 16px rgba(41, 37, 36, 0.1), 0 16px 32px rgba(41, 37, 36, 0.08), 0 32px 64px rgba(41, 37, 36, 0.06)',
  // Glows for interactive elements
  purpleGlow: '0 0 0 1px rgba(144, 85, 224, 0.1), 0 4px 12px rgba(144, 85, 224, 0.15), 0 8px 24px rgba(144, 85, 224, 0.1)',
  purpleGlowLg: '0 0 0 2px rgba(144, 85, 224, 0.15), 0 8px 24px rgba(144, 85, 224, 0.2), 0 16px 48px rgba(144, 85, 224, 0.15)',
} as const;

// Animation Presets
export const ANIMATIONS = {
  fadeInUp: {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
  },
  fadeInUpFast: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5, ease: 'easeOut' },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  },
  stagger: {
    container: {
      animate: { transition: { staggerChildren: 0.1 } },
    },
    child: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
    },
  },
  // Hover effects
  hoverLift: {
    whileHover: { y: -4, boxShadow: SHADOWS.lg },
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
  },
  hoverScale: {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.15, ease: [0.34, 1.56, 0.64, 1] },
  },
} as const;

// Border Radius
export const RADIUS = {
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  '3xl': '24px',
  full: '9999px',
} as const;

// Premium Tailwind Classes
export const tw = {
  // Containers
  container: 'max-w-7xl mx-auto px-6 md:px-8 lg:px-12',
  containerWide: 'max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20',

  // Backgrounds
  bgCanvas: 'bg-[#FAFAF9]',
  bgSurface: 'bg-[#F5F5F4]',
  bgWhite: 'bg-white',
  bgGradientSubtle: 'bg-gradient-to-b from-[#FAFAF9] via-[#FAFAF9] to-white',

  // Text
  textHeading: 'text-stone-800',
  textBody: 'text-stone-600',
  textSecondary: 'text-stone-500',
  textMuted: 'text-stone-400',
  textAccent: 'text-vital-primary-600',

  // Borders
  border: 'border border-stone-200',
  borderSubtle: 'border border-stone-100',
  borderAccent: 'border-2 border-vital-primary-600',

  // Buttons
  btnPrimary: 'bg-vital-primary-600 hover:bg-vital-primary-700 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md',
  btnSecondary: 'bg-white border border-stone-200 hover:border-vital-primary-600 text-stone-700 hover:text-vital-primary-600 font-medium px-6 py-3 rounded-lg transition-all duration-200',
  btnGhost: 'text-stone-600 hover:text-vital-primary-600 font-medium px-4 py-2 rounded-lg transition-colors duration-200',

  // Cards
  card: 'bg-white rounded-xl border border-stone-200 shadow-sm hover:shadow-md hover:border-stone-300 transition-all duration-200',
  cardElevated: 'bg-white rounded-xl border border-stone-100 shadow-md hover:shadow-lg transition-all duration-200',
  cardGlass: 'bg-white/80 backdrop-blur-sm rounded-xl border border-stone-200/50 shadow-sm',

  // Sections
  section: 'relative overflow-hidden',
  sectionPadding: 'py-20 md:py-28 lg:py-32',
  sectionPaddingLg: 'py-24 md:py-32 lg:py-40',

  // Labels
  label: 'text-sm font-medium tracking-wide uppercase text-vital-primary-600',
  badge: 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-vital-primary-50 text-vital-primary-700',
} as const;

// Gradient Text
export const GRADIENT_TEXT_STYLE = {
  background: 'linear-gradient(135deg, #9055E0 0%, #6366F1 50%, #EC4899 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
} as const;

// Export all tokens
export const DESIGN_TOKENS = {
  typography: TYPOGRAPHY,
  spacing: SPACING,
  sectionPadding: SECTION_PADDING,
  shadows: SHADOWS,
  animations: ANIMATIONS,
  radius: RADIUS,
  tw,
  gradientText: GRADIENT_TEXT_STYLE,
} as const;

export default DESIGN_TOKENS;
