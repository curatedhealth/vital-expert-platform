/**
 * VITAL Platform - Polish Components Index
 *
 * Exports all polish/enhancement components for the Ask Expert service.
 * These components provide keyboard shortcuts, onboarding, and
 * mobile responsive utilities.
 *
 * Phase 3 Implementation - December 11, 2025
 */

// =============================================================================
// KEYBOARD SHORTCUTS
// =============================================================================

export {
  KeyboardShortcutsProvider,
  useKeyboardShortcuts,
  ShortcutHint,
  KeyboardShortcutsHelp,
} from './KeyboardShortcuts';

export type {
  Shortcut,
  ShortcutCategory,
  KeyboardShortcutsContextValue,
  KeyboardShortcutsProviderProps,
  ShortcutHintProps,
  KeyboardShortcutsHelpProps,
} from './KeyboardShortcuts';

// =============================================================================
// ONBOARDING TOUR
// =============================================================================

export {
  OnboardingTourProvider,
  useOnboardingTour,
  StartTourButton,
  TourTarget,
} from './OnboardingTour';

export type {
  TourStep,
  TourStepPosition,
  TourAction,
  OnboardingTourContextValue,
  OnboardingTourProviderProps,
  StartTourButtonProps,
  TourTargetProps,
} from './OnboardingTour';

// =============================================================================
// MOBILE RESPONSIVE
// =============================================================================

export {
  ResponsiveProvider,
  useResponsive,
  ShowOn,
  HideOn,
  MobileOnly,
  DesktopOnly,
  MobileDrawer,
  MobileBottomSheet,
  MobileMenuButton,
  SwipeAction,
  PullToRefresh,
  ResponsiveGrid,
} from './MobileResponsive';

export type {
  Breakpoint,
  ResponsiveContextValue,
  ResponsiveProviderProps,
  ShowOnProps,
  MobileDrawerProps,
  MobileBottomSheetProps,
  MobileMenuButtonProps,
  SwipeActionProps,
  PullToRefreshProps,
  ResponsiveGridProps,
} from './MobileResponsive';
