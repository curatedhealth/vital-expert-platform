#!/usr/bin/env python3
"""
Fix all template literals in page.tsx to use string concatenation.
Turbopack has issues parsing template literals with ${} interpolation.
"""

import re

def fix_template_literals(content):
    """Replace template literals with string concatenation."""
    
    # Pattern 1: `${process.env.NEXT_PUBLIC_PYTHON_AI_ENGINE_URL || 'http://localhost:8080'}/api/...`
    content = re.sub(
        r'`\$\{process\.env\.NEXT_PUBLIC_PYTHON_AI_ENGINE_URL \|\| \'http://localhost:8080\'\}/([^`]+)`',
        r"(process.env.NEXT_PUBLIC_PYTHON_AI_ENGINE_URL || 'http://localhost:8080') + '/\1'",
        content
    )
    
    # Pattern 2: `${variable}-${i}` (for IDs)
    content = re.sub(
        r'`\$\{([^}]+)\}-\$\{([^}]+)\}`',
        r"\1 + '-' + \2.toString()",
        content
    )
    
    # Pattern 3: `HTTP ${response.status}`
    content = re.sub(
        r'`HTTP \$\{([^}]+)\}`',
        r"'HTTP ' + \1",
        content
    )
    
    # Pattern 4: `${prev}\n\n${text}` (multi-line concatenation)
    content = re.sub(
        r'`\$\{([^}]+)\}\\n\\n\$\{([^}]+)\}`',
        r"\1 + '\\n\\n' + \2",
        content
    )
    
    # Pattern 5: Generic `text ${var} more text`
    # This is tricky - need to handle cases carefully
    def replace_generic(match):
        full = match.group(0)
        # Extract parts: prefix ${var} suffix
        parts = re.split(r'\$\{([^}]+)\}', full[1:-1])  # Remove backticks
        result = []
        for i, part in enumerate(parts):
            if i % 2 == 0:  # Text part
                if part:
                    result.append(f"'{part}'")
            else:  # Variable part
                result.append(part)
        return ' + '.join(result) if result else "''"
    
    content = re.sub(r'`[^`]*\$\{[^}]+\}[^`]*`', replace_generic, content)
    
    return content

def main():
    file_path = 'page.tsx'
    
    print(f"Reading {file_path}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print("Fixing template literals...")
    fixed_content = fix_template_literals(content)
    
    print(f"Writing back to {file_path}...")
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(fixed_content)
    
    print("✅ Template literals fixed!")
    print("\nVerifying...")
    
    # Count remaining template literals with ${
    remaining = len(re.findall(r'`[^`]*\$\{', fixed_content))
    print(f"Remaining template literals with ${{}}: {remaining}")
    
    if remaining > 0:
        print("\nRemaining template literals:")
        for i, match in enumerate(re.finditer(r'`[^`]*\$\{[^}]*\}[^`]*`', fixed_content), 1):
            line_num = fixed_content[:match.start()].count('\n') + 1
            snippet = match.group()[:100]
            print(f"  {i}. Line {line_num}: {snippet}...")

if __name__ == '__main__':
    main()
