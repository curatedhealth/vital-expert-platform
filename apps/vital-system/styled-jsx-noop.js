// No-op module to replace styled-jsx on the server
// This prevents "document is not defined" errors during SSR

module.exports = {
  style: () => null,
  flush: () => [],
  StyleRegistry: class StyleRegistry {
    add() {}
    remove() {}
    styles() { return [] }
    flush() { return [] }
  },
  createStyleRegistry: () => new module.exports.StyleRegistry(),
  StyleSheetRegistry: class StyleSheetRegistry {
    add() {}
    remove() {}
    styles() { return [] }
    flush() { return [] }
  },
}

// Export as default as well
module.exports.default = module.exports
