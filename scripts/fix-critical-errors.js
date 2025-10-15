#!/usr/bin/env node

/**
 * Critical Error Fix Script for VITAL Path
 * This script fixes the most critical TypeScript and build errors
 */

const fs = require('fs');
const path = require('path');

const fixes = [
  {
    file: 'src/auth-provider.tsx',
    fixes: [
      {
        search: 'const createAuthUser = eCallback(async (supabaseUser: SupabaseUser): Promise<AuthUser> => {',
        replace: 'const createAuthUser = useCallback(async (supabaseUser: SupabaseUser): Promise<AuthUser> => {'
      },
      {
        search: 'const withRetry = eCallback(async <T>(',
        replace: 'const withRetry = useCallback(async <T>('
      },
      {
        search: 'const authUser = ait createAuthUser(session.user);',
        replace: 'const authUser = await createAuthUser(session.user);'
      },
      {
        search: 'const authUser = ait createAuthUser(data.user);',
        replace: 'const authUser = await createAuthUser(data.user);'
      },
      {
        search: 'const authUser = ait createAuthUser(session.user);',
        replace: 'const authUser = await createAuthUser(session.user);'
      },
      {
        search: 'const handleFocus =  => {',
        replace: 'const handleFocus = () => {'
      },
      {
        search: 'const value: const AuthContextType = ser,',
        replace: 'const value: AuthContextType = {'
      },
      {
        search: '    session,',
        replace: '    user,'
      },
      {
        search: '    loading,',
        replace: '    session,'
      },
      {
        search: '    error,',
        replace: '    loading,'
      },
      {
        search: '    isInitialized,',
        replace: '    error,'
      },
      {
        search: '    signIn,',
        replace: '    isInitialized,'
      },
      {
        search: '    signOut,',
        replace: '    signIn,'
      },
      {
        search: '    refreshSession,',
        replace: '    signOut,'
      },
      {
        search: '    clearError',
        replace: '    refreshSession,'
      },
      {
        search: '  };',
        replace: '    clearError'
      },
      {
        search: '  return (',
        replace: '  };'
      },
      {
        search: '    <AuthContext.Provider const value = alue}>',
        replace: '  return ('
      },
      {
        search: '      {children}',
        replace: '    <AuthContext.Provider value={value}>'
      },
      {
        search: '    </AuthContext.Provider>',
        replace: '      {children}'
      },
      {
        search: '  );',
        replace: '    </AuthContext.Provider>'
      },
      {
        search: '}',
        replace: '  );'
      }
    ]
  },
  {
    file: 'src/auto-scroll-chat.tsx',
    fixes: [
      {
        search: '// 🎯 Conversation Context\n\n  scrollToBottom: () => void;',
        replace: '// 🎯 Conversation Context\nconst ConversationContext = createContext<{\n  scrollToBottom: () => void;'
      },
      {
        search: '  // Auto-scroll to bottom\n\n    if (containerRef.current) {',
        replace: '  const containerRef = useRef<HTMLDivElement>(null);\n  const isScrollingProgrammatically = useRef(false);\n  const lastScrollTop = useRef(0);\n\n  // Auto-scroll to bottom\n  const scrollToBottom = () => {\n    if (containerRef.current) {'
      },
      {
        search: '  // Check if user is at bottom\n\n    if (containerRef.current) {',
        replace: '  // Check if user is at bottom\n  const checkIfAtBottom = () => {\n    if (containerRef.current) {'
      },
      {
        search: '    if (containerRef.current) {\n\n      // Only set user intent if they actively scrolled up',
        replace: '    if (containerRef.current) {\n      const currentScrollTop = containerRef.current.scrollTop;\n\n      // Only set user intent if they actively scrolled up'
      },
      {
        search: 'export const Message: React.FC<MessageProps> = ({\n  from,\n  children,\n  className,\n}) => {\n\n  return (',
        replace: 'export const Message: React.FC<MessageProps> = ({\n  from,\n  children,\n  className,\n}) => {\n  const isUser = from === \'user\';\n\n  return ('
      }
    ]
  },
  {
    file: 'src/compliance-middleware.ts',
    fixes: [
      {
        search: 'const preExecutionRequest: const DataProcessingRequest = \n      user_id: context.user_id,',
        replace: 'const preExecutionRequest: DataProcessingRequest = {\n      user_id: context.user_id,'
      },
      {
        search: '      const validationResult = wait this.complianceManager.validateCompliance(preExecutionRequest);',
        replace: '      const validationResult = await this.complianceManager.validateCompliance(preExecutionRequest);'
      },
      {
        search: '            const sanitizedInputs = SON.parse(phiResult.redactedContent || \'{ /* TODO: implement */ }\');',
        replace: '            const sanitizedInputs = JSON.parse(phiResult.redactedContent || \'{}\');'
      },
      {
        search: '            const sanitizedInputs =  ...inputs, _phi_redacted: true };',
        replace: '            const sanitizedInputs = { ...inputs, _phi_redacted: true };'
      },
      {
        search: '        const phiDetected = rue;',
        replace: '        const phiDetected = true;'
      },
      {
        search: '      const agentResponse = wait agent.executePrompt(promptTitle, sanitizedInputs, context);',
        replace: '      const agentResponse = await agent.executePrompt(promptTitle, sanitizedInputs, context);'
      },
      {
        search: '      const failedValidationResult: const ComplianceValidationResult = ',
        replace: '      const failedValidationResult: ComplianceValidationResult = {'
      }
    ]
  }
];

function fixFile(filePath, fileFixes) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  fileFixes.forEach(fix => {
    if (content.includes(fix.search)) {
      content = content.replace(fix.search, fix.replace);
      modified = true;
      console.log(`✅ Fixed: ${filePath}`);
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content);
    return true;
  }

  return false;
}

function fixCriticalErrors() {
  console.log('🔧 Fixing critical TypeScript and build errors...\n');

  let totalFixed = 0;
  fixes.forEach(({ file, fixes: fileFixes }) => {
    if (fixFile(file, fileFixes)) {
      totalFixed++;
    }
  });

  console.log(`\n✅ Fixed ${totalFixed} files`);
  console.log('\n📋 Next steps:');
  console.log('1. Run "npm run type-check" to verify fixes');
  console.log('2. Run "npm run build" to test the build');
  console.log('3. Run "npm run dev" to start development server');
}

if (require.main === module) {
  fixCriticalErrors();
}

module.exports = { fixCriticalErrors };
