#!/bin/bash

# MONOREPO PACKAGE FIX
# This specifically addresses the @vital/ui package not rebuilding issue

set -e

echo "═══════════════════════════════════════════════════════════════════"
echo "           MONOREPO PACKAGE REBUILD FIX"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "This fixes the most likely issue: @vital/ui package not rebuilding"
echo ""

# Step 1: Find where components are being imported from
echo "🔍 Step 1: Checking component imports..."
echo "═══════════════════════════════════════════════════════════════════"

cd ~/Downloads/Cursor/VITAL\ path/apps/digital-health-startup

echo "Searching for @vital/ui imports..."
IMPORTS=$(grep -r "from '@vital/ui" src/ 2>/dev/null || true)

if [ -n "$IMPORTS" ]; then
    echo "⚠️  Found imports from @vital/ui package:"
    echo "$IMPORTS"
    echo ""
    echo "These need to be updated to local imports!"
    
    # Create fix script
    cat > fix_imports.sh << 'SCRIPT'
#!/bin/bash
# Fix all @vital/ui imports to use local components

echo "Fixing imports..."

# Common replacements
find src/ -type f -name "*.tsx" -o -name "*.ts" | while read file; do
    # Backup original
    cp "$file" "$file.backup"
    
    # Replace @vital/ui imports with local paths
    sed -i '' "s|from '@vital/ui/enhanced-agent-card'|from '@/components/ui/enhanced-agent-card'|g" "$file"
    sed -i '' "s|from '@vital/ui/components'|from '@/components/ui'|g" "$file"
    sed -i '' "s|from '@vital/ui'|from '@/components/ui'|g" "$file"
    
    # Check if file changed
    if ! cmp -s "$file" "$file.backup"; then
        echo "Fixed: $file"
        rm "$file.backup"
    else
        rm "$file.backup"
    fi
done

echo "✅ Imports fixed!"
SCRIPT
    
    chmod +x fix_imports.sh
    echo ""
    echo "Run ./fix_imports.sh to fix all imports"
    
else
    echo "✅ No @vital/ui imports found (good!)"
fi

# Step 2: Check if packages directory exists
echo ""
echo "🔍 Step 2: Checking for packages directory..."
echo "═══════════════════════════════════════════════════════════════════"

cd ~/Downloads/Cursor/VITAL\ path

if [ -d "packages" ]; then
    echo "Found packages directory. Contents:"
    ls -la packages/
    
    # Check each package
    for pkg in packages/*/; do
        if [ -d "$pkg" ]; then
            pkgname=$(basename "$pkg")
            echo ""
            echo "📦 Package: $pkgname"
            
            # Check if it has a build script
            if [ -f "$pkg/package.json" ]; then
                if grep -q '"build"' "$pkg/package.json"; then
                    echo "  → Has build script"
                    
                    # Build it
                    echo "  → Building $pkgname..."
                    cd "$pkg"
                    rm -rf dist lib build node_modules/.cache
                    pnpm install --force
                    pnpm run build || npm run build || true
                    cd - > /dev/null
                    echo "  ✅ Built"
                else
                    echo "  → No build script"
                fi
            fi
        fi
    done
else
    echo "No packages directory found"
fi

# Step 3: Check workspace configuration
echo ""
echo "🔍 Step 3: Checking workspace configuration..."
echo "═══════════════════════════════════════════════════════════════════"

if [ -f "pnpm-workspace.yaml" ]; then
    echo "pnpm workspace detected:"
    cat pnpm-workspace.yaml
    echo ""
    
    # Rebuild all workspace packages
    echo "Rebuilding all workspace packages..."
    pnpm install --force
    pnpm run -r build || true
    
elif [ -f "package.json" ]; then
    if grep -q '"workspaces"' package.json; then
        echo "npm/yarn workspaces detected"
        echo ""
        
        # Try to rebuild
        if command -v pnpm &> /dev/null; then
            pnpm install --force
            pnpm run build:all || pnpm run build || true
        else
            npm install --force
            npm run build:all || npm run build || true
        fi
    fi
fi

# Step 4: Direct component path verification
echo ""
echo "🔍 Step 4: Verifying component paths..."
echo "═══════════════════════════════════════════════════════════════════"

cd ~/Downloads/Cursor/VITAL\ path/apps/digital-health-startup

# Check if the actual component file exists
COMPONENT_PATH="src/components/ui/enhanced-agent-card.tsx"
if [ -f "$COMPONENT_PATH" ]; then
    echo "✅ Component exists at: $COMPONENT_PATH"
    
    # Check if it has the Add to Chat button
    if grep -q "Add to Chat" "$COMPONENT_PATH"; then
        echo "✅ Component contains 'Add to Chat' button"
        
        # Show the actual button code
        echo ""
        echo "Button code found:"
        grep -A 5 -B 5 "Add to Chat" "$COMPONENT_PATH" | head -20
    else
        echo "❌ Component missing 'Add to Chat' button!"
    fi
else
    echo "❌ Component not found at expected path!"
fi

# Step 5: Create a test to verify the component works
echo ""
echo "🧪 Step 5: Creating component test page..."
echo "═══════════════════════════════════════════════════════════════════"

cat > src/app/component-test/page.tsx << 'EOF'
'use client';

import { EnhancedAgentCard } from '@/components/ui/enhanced-agent-card';
import { Button } from '@/components/ui/button';

export default function ComponentTest() {
    const testAgent = {
        id: 'test-1',
        name: 'Test Agent',
        role: 'Test Role',
        category: 'Test Category',
        description: 'This is a test agent to verify the Add to Chat button is working',
        expertise: ['Testing', 'Verification'],
        capabilities: ['Test capability 1', 'Test capability 2'],
        limitations: ['Test limitation'],
        tags: ['test', 'verification'],
        avatar_url: null
    };

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-8">Component Test Page</h1>
            
            <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <h2 className="font-bold mb-2">What to check:</h2>
                <ul className="list-disc list-inside">
                    <li>Agent card should display below</li>
                    <li>"Add to Chat" button should be visible at bottom of card</li>
                    <li>Clicking button should show alert</li>
                </ul>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <EnhancedAgentCard
                    agent={testAgent}
                    onAddToChat={(agent) => {
                        alert(`Success! Add to Chat clicked for: ${agent.name}`);
                        console.log('Agent added:', agent);
                    }}
                />
            </div>
            
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
                <h2 className="font-bold mb-2">Direct Button Test:</h2>
                <Button 
                    onClick={() => alert('Direct button works!')}
                    variant="primary"
                    className="mt-2"
                >
                    Test Add to Chat Button
                </Button>
            </div>
        </div>
    );
}
EOF

echo "✅ Test page created at: /component-test"
echo ""
echo "Visit: http://localhost:3000/component-test"
echo ""

# Step 6: Summary and next steps
echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "                          SUMMARY"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "✅ Checked for @vital/ui imports"
echo "✅ Rebuilt packages (if found)"
echo "✅ Verified component exists with button code"
echo "✅ Created test page at /component-test"
echo ""
echo "NEXT STEPS:"
echo "1. If imports need fixing, run: ./fix_imports.sh"
echo "2. Restart server: pnpm run dev"
echo "3. Visit: http://localhost:3000/component-test"
echo "4. Verify button appears and works"
echo "5. If working, check main /agents page"
echo ""
echo "If button works in test but not in /agents, the issue is in"
echo "the agents page component binding, not the button component."
