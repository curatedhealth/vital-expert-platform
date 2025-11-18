import { useEffect, useCallback } from 'react'

export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  description: string
  action: () => void
  category: string
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled = true) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      // Don't trigger if user is typing in an input/textarea
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Allow Cmd+K even in inputs for quick search
        if (!(event.key === 'k' && (event.metaKey || event.ctrlKey))) {
          return
        }
      }

      for (const shortcut of shortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase()
        const ctrlMatches = !!shortcut.ctrlKey === event.ctrlKey
        const metaMatches = !!shortcut.metaKey === event.metaKey
        const shiftMatches = !!shortcut.shiftKey === event.shiftKey
        const altMatches = !!shortcut.altKey === event.altKey

        if (keyMatches && ctrlMatches && metaMatches && shiftMatches && altMatches) {
          event.preventDefault()
          event.stopPropagation()
          shortcut.action()
          break
        }
      }
    },
    [shortcuts, enabled]
  )

  useEffect(() => {
    if (!enabled) return

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown, enabled])
}

export function formatShortcutKey(shortcut: KeyboardShortcut): string {
  const parts: string[] = []

  // Detect platform
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0

  if (shortcut.ctrlKey) parts.push('Ctrl')
  if (shortcut.metaKey) parts.push(isMac ? '⌘' : 'Ctrl')
  if (shortcut.altKey) parts.push(isMac ? '⌥' : 'Alt')
  if (shortcut.shiftKey) parts.push(isMac ? '⇧' : 'Shift')

  parts.push(shortcut.key.toUpperCase())

  return parts.join(isMac ? '' : '+')
}
