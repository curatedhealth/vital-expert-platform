'use client';

/**
 * VITAL Platform - Keyboard Shortcuts System
 *
 * Provides global keyboard shortcuts for the Ask Expert service
 * with a command palette for discoverability.
 *
 * Design System: VITAL Brand v6.0
 * December 11, 2025
 */

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Command,
  Search,
  MessageSquare,
  Rocket,
  Settings,
  HelpCircle,
  X,
  ArrowUp,
  ArrowDown,
  CornerDownLeft,
  Keyboard,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

export interface Shortcut {
  id: string;
  keys: string[];
  label: string;
  description: string;
  category: ShortcutCategory;
  action: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export type ShortcutCategory =
  | 'navigation'
  | 'actions'
  | 'modes'
  | 'panels'
  | 'help';

export interface KeyboardShortcutsContextValue {
  shortcuts: Shortcut[];
  registerShortcut: (shortcut: Shortcut) => void;
  unregisterShortcut: (id: string) => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  isCommandPaletteOpen: boolean;
}

// =============================================================================
// CONTEXT
// =============================================================================

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextValue | null>(null);

export function useKeyboardShortcuts() {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error('useKeyboardShortcuts must be used within KeyboardShortcutsProvider');
  }
  return context;
}

// =============================================================================
// HELPERS
// =============================================================================

function formatKey(key: string): string {
  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().includes('MAC');

  const keyMap: Record<string, string> = {
    mod: isMac ? '⌘' : 'Ctrl',
    alt: isMac ? '⌥' : 'Alt',
    shift: '⇧',
    enter: '↵',
    escape: 'Esc',
    arrowup: '↑',
    arrowdown: '↓',
    arrowleft: '←',
    arrowright: '→',
  };

  return keyMap[key.toLowerCase()] || key.toUpperCase();
}

function matchesShortcut(event: KeyboardEvent, keys: string[]): boolean {
  const isMac = navigator.platform.toUpperCase().includes('MAC');
  const modKey = isMac ? event.metaKey : event.ctrlKey;

  for (const key of keys) {
    const lower = key.toLowerCase();
    if (lower === 'mod' && !modKey) return false;
    if (lower === 'shift' && !event.shiftKey) return false;
    if (lower === 'alt' && !event.altKey) return false;
    if (lower !== 'mod' && lower !== 'shift' && lower !== 'alt') {
      if (event.key.toLowerCase() !== lower) return false;
    }
  }

  return true;
}

function getCategoryIcon(category: ShortcutCategory): React.ReactNode {
  const icons: Record<ShortcutCategory, React.ReactNode> = {
    navigation: <ArrowUp className="w-4 h-4" />,
    actions: <Rocket className="w-4 h-4" />,
    modes: <MessageSquare className="w-4 h-4" />,
    panels: <Settings className="w-4 h-4" />,
    help: <HelpCircle className="w-4 h-4" />,
  };
  return icons[category];
}

function getCategoryLabel(category: ShortcutCategory): string {
  const labels: Record<ShortcutCategory, string> = {
    navigation: 'Navigation',
    actions: 'Actions',
    modes: 'Modes',
    panels: 'Panels',
    help: 'Help',
  };
  return labels[category];
}

// =============================================================================
// PROVIDER COMPONENT
// =============================================================================

export interface KeyboardShortcutsProviderProps {
  children: React.ReactNode;
  /** Default shortcuts to register */
  defaultShortcuts?: Omit<Shortcut, 'action'>[];
  /** Callbacks for default shortcuts */
  onNavigateInteractive?: () => void;
  onNavigateAutonomous?: () => void;
  onNewConversation?: () => void;
  onToggleSidebar?: () => void;
  onOpenSettings?: () => void;
  onOpenHelp?: () => void;
}

export function KeyboardShortcutsProvider({
  children,
  onNavigateInteractive,
  onNavigateAutonomous,
  onNewConversation,
  onToggleSidebar,
  onOpenSettings,
  onOpenHelp,
}: KeyboardShortcutsProviderProps) {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Register default shortcuts
  useEffect(() => {
    const defaultShortcuts: Shortcut[] = [
      {
        id: 'command-palette',
        keys: ['mod', 'k'],
        label: 'Command Palette',
        description: 'Open command palette to search actions',
        category: 'navigation',
        icon: <Command className="w-4 h-4" />,
        action: () => setIsCommandPaletteOpen(true),
      },
      {
        id: 'interactive-mode',
        keys: ['mod', '1'],
        label: 'Interactive Mode',
        description: 'Switch to interactive chat mode',
        category: 'modes',
        icon: <MessageSquare className="w-4 h-4" />,
        action: () => onNavigateInteractive?.(),
        disabled: !onNavigateInteractive,
      },
      {
        id: 'autonomous-mode',
        keys: ['mod', '2'],
        label: 'Autonomous Mode',
        description: 'Switch to autonomous mission mode',
        category: 'modes',
        icon: <Rocket className="w-4 h-4" />,
        action: () => onNavigateAutonomous?.(),
        disabled: !onNavigateAutonomous,
      },
      {
        id: 'new-conversation',
        keys: ['mod', 'n'],
        label: 'New Conversation',
        description: 'Start a new conversation or mission',
        category: 'actions',
        action: () => onNewConversation?.(),
        disabled: !onNewConversation,
      },
      {
        id: 'toggle-sidebar',
        keys: ['mod', 'b'],
        label: 'Toggle Sidebar',
        description: 'Show or hide the sidebar',
        category: 'panels',
        action: () => onToggleSidebar?.(),
        disabled: !onToggleSidebar,
      },
      {
        id: 'open-settings',
        keys: ['mod', ','],
        label: 'Settings',
        description: 'Open settings panel',
        category: 'panels',
        icon: <Settings className="w-4 h-4" />,
        action: () => onOpenSettings?.(),
        disabled: !onOpenSettings,
      },
      {
        id: 'open-help',
        keys: ['mod', '/'],
        label: 'Help',
        description: 'Open help and documentation',
        category: 'help',
        icon: <HelpCircle className="w-4 h-4" />,
        action: () => onOpenHelp?.(),
        disabled: !onOpenHelp,
      },
      {
        id: 'close-modal',
        keys: ['escape'],
        label: 'Close',
        description: 'Close current modal or panel',
        category: 'navigation',
        action: () => setIsCommandPaletteOpen(false),
      },
    ];

    setShortcuts(defaultShortcuts.filter(s => !s.disabled));
  }, [onNavigateInteractive, onNavigateAutonomous, onNewConversation, onToggleSidebar, onOpenSettings, onOpenHelp]);

  // Global keyboard event handler
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Ignore if user is typing in an input
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Allow Escape to close modals even in inputs
        if (event.key !== 'Escape') return;
      }

      for (const shortcut of shortcuts) {
        if (matchesShortcut(event, shortcut.keys)) {
          event.preventDefault();
          shortcut.action();
          return;
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  const registerShortcut = useCallback((shortcut: Shortcut) => {
    setShortcuts(prev => {
      // Replace if exists, otherwise add
      const filtered = prev.filter(s => s.id !== shortcut.id);
      return [...filtered, shortcut];
    });
  }, []);

  const unregisterShortcut = useCallback((id: string) => {
    setShortcuts(prev => prev.filter(s => s.id !== id));
  }, []);

  const value: KeyboardShortcutsContextValue = {
    shortcuts,
    registerShortcut,
    unregisterShortcut,
    openCommandPalette: () => setIsCommandPaletteOpen(true),
    closeCommandPalette: () => setIsCommandPaletteOpen(false),
    isCommandPaletteOpen,
  };

  return (
    <KeyboardShortcutsContext.Provider value={value}>
      {children}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        shortcuts={shortcuts}
      />
    </KeyboardShortcutsContext.Provider>
  );
}

// =============================================================================
// COMMAND PALETTE COMPONENT
// =============================================================================

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: Shortcut[];
}

function CommandPalette({ isOpen, onClose, shortcuts }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filter shortcuts by search
  const filteredShortcuts = shortcuts.filter(
    s =>
      s.label.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
  );

  // Group by category
  const groupedShortcuts = filteredShortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<ShortcutCategory, Shortcut[]>);

  // Flatten for index-based selection
  const flatShortcuts = Object.values(groupedShortcuts).flat();

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Reset search when opening
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Keyboard navigation within palette
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(i => Math.min(i + 1, flatShortcuts.length - 1));
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(i => Math.max(i - 1, 0));
          break;
        case 'Enter':
          event.preventDefault();
          if (flatShortcuts[selectedIndex]) {
            flatShortcuts[selectedIndex].action();
            onClose();
          }
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, flatShortcuts, selectedIndex, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-50"
          >
            <div className="bg-white rounded-xl shadow-2xl border overflow-hidden">
              {/* Search input */}
              <div className="flex items-center gap-3 p-4 border-b">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search commands..."
                  className="flex-1 outline-none text-slate-900 placeholder:text-slate-400"
                  autoFocus
                />
                <button
                  onClick={onClose}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-auto p-2">
                {flatShortcuts.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No commands found</p>
                  </div>
                ) : (
                  Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
                    <div key={category} className="mb-2">
                      <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-slate-500 uppercase tracking-wider">
                        {getCategoryIcon(category as ShortcutCategory)}
                        {getCategoryLabel(category as ShortcutCategory)}
                      </div>
                      {categoryShortcuts.map((shortcut) => {
                        const globalIndex = flatShortcuts.indexOf(shortcut);
                        const isSelected = globalIndex === selectedIndex;

                        return (
                          <button
                            key={shortcut.id}
                            onClick={() => {
                              shortcut.action();
                              onClose();
                            }}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            className={cn(
                              'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                              isSelected
                                ? 'bg-purple-50 text-purple-900'
                                : 'text-slate-700 hover:bg-slate-50'
                            )}
                          >
                            <div
                              className={cn(
                                'w-8 h-8 rounded-lg flex items-center justify-center',
                                isSelected
                                  ? 'bg-purple-100 text-purple-600'
                                  : 'bg-slate-100 text-slate-500'
                              )}
                            >
                              {shortcut.icon || getCategoryIcon(shortcut.category)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium">{shortcut.label}</div>
                              <div className="text-xs text-slate-500 truncate">
                                {shortcut.description}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {shortcut.keys.map((key, i) => (
                                <kbd
                                  key={i}
                                  className="px-1.5 py-0.5 rounded bg-slate-100 text-xs font-mono text-slate-600"
                                >
                                  {formatKey(key)}
                                </kbd>
                              ))}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-2 border-t bg-slate-50 text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <ArrowUp className="w-3 h-3" />
                    <ArrowDown className="w-3 h-3" />
                    to navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <CornerDownLeft className="w-3 h-3" />
                    to select
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 rounded bg-slate-200 font-mono">Esc</kbd>
                    to close
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Keyboard className="w-3 h-3" />
                  {flatShortcuts.length} commands
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// =============================================================================
// SHORTCUT HINT COMPONENT
// =============================================================================

export interface ShortcutHintProps {
  keys: string[];
  className?: string;
}

export function ShortcutHint({ keys, className }: ShortcutHintProps) {
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)}>
      {keys.map((key, i) => (
        <kbd
          key={i}
          className="px-1 py-0.5 rounded bg-slate-100 text-[10px] font-mono text-slate-500"
        >
          {formatKey(key)}
        </kbd>
      ))}
    </span>
  );
}

// =============================================================================
// KEYBOARD SHORTCUTS HELP MODAL
// =============================================================================

export interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  const { shortcuts } = useKeyboardShortcuts();

  // Group by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<ShortcutCategory, Shortcut[]>);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl z-50"
          >
            <div className="bg-white rounded-xl shadow-2xl border overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <Keyboard className="w-5 h-5 text-purple-600" />
                  <h2 className="font-semibold text-slate-900">Keyboard Shortcuts</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 max-h-[60vh] overflow-auto">
                <div className="grid grid-cols-2 gap-6">
                  {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
                    <div key={category}>
                      <h3 className="flex items-center gap-2 font-medium text-slate-900 mb-3">
                        {getCategoryIcon(category as ShortcutCategory)}
                        {getCategoryLabel(category as ShortcutCategory)}
                      </h3>
                      <div className="space-y-2">
                        {categoryShortcuts.map((shortcut) => (
                          <div
                            key={shortcut.id}
                            className="flex items-center justify-between py-1"
                          >
                            <span className="text-sm text-slate-600">{shortcut.label}</span>
                            <ShortcutHint keys={shortcut.keys} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t bg-slate-50 text-sm text-slate-500">
                Press <ShortcutHint keys={['mod', 'k']} className="mx-1" /> anytime to open the
                command palette
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default KeyboardShortcutsProvider;
