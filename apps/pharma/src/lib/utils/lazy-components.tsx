/**
 * Lazy-loaded component wrappers for code splitting
 * This file centralizes all dynamic imports to improve initial bundle size
 */

import dynamic from 'next/dynamic';

import {
  AgentGridSkeleton,
  ModalContentSkeleton,
  FormSkeleton,
  ChartSkeleton,
  TableSkeleton,
  AgentDetailsSkeleton,
} from '@/components/ui/loading-skeletons';

/**
 * Loading fallback for heavy components
 * Uses proper skeleton components for better UX
 */
const ComponentLoadingFallback = () => <div className="p-4"><FormSkeleton fields={6} /></div>;

/**
 * Simple loading fallback for modals and overlays
 */
const ModalLoadingFallback = () => <ModalContentSkeleton />;

// ===========================
// CHAT COMPONENTS
// ===========================

/**
 * Agent Creator Modal - Heavy form component with validation
 * Only loaded when user clicks "Create Agent"
 */
export const LazyAgentCreator = dynamic(
  () => import('@/features/chat/components/agent-creator').then((mod) => ({ default: mod.AgentCreator })),
  {
    loading: () => <ModalLoadingFallback />,
    ssr: false, // Modal should only render on client
  }
);

/**
 * Agents Board - Heavy grid component with filtering
 * Only loaded when user navigates to agents view
 */
export const LazyAgentsBoard = dynamic(
  () => import('@/features/agents/components/agents-board').then((mod) => ({ default: mod.AgentsBoard })),
  {
    loading: () => <div className="p-6"><AgentGridSkeleton count={9} /></div>,
    ssr: false,
  }
);

/**
 * Chat Sidebar - Can be lazy loaded since it's toggleable
 */
export const LazyChatSidebar = dynamic(
  () => import('@/features/chat/components/chat-sidebar').then((mod) => ({ default: mod.ChatSidebar })),
  {
    loading: () => {
      const { ChatSidebarSkeleton } = require('@/components/ui/loading-skeletons');
      return <ChatSidebarSkeleton />;
    },
    ssr: false,
  }
);

// ===========================
// ADMIN COMPONENTS
// ===========================

/**
 * Prompt Admin Dashboard - Heavy admin panel
 */
export const LazyPromptAdminDashboard = dynamic(
  () => import('@/components/admin/EnhancedPromptAdminDashboard'),
  {
    loading: () => <ComponentLoadingFallback />,
    ssr: false,
  }
);

/**
 * Batch Upload Panel - Heavy file upload component
 */
export const LazyBatchUploadPanel = dynamic(
  () => import('@/components/admin/batch-upload-panel'),
  {
    loading: () => <ComponentLoadingFallback />,
    ssr: false,
  }
);

/**
 * Prompt CRUD Manager - Heavy data grid
 */
export const LazyPromptCRUDManager = dynamic(
  () => import('@/components/admin/PromptCRUDManager'),
  {
    loading: () => <ComponentLoadingFallback />,
    ssr: false,
  }
);

// ===========================
// RAG COMPONENTS
// ===========================

/**
 * RAG Management - Heavy vector store management UI
 */
export const LazyRagManagement = dynamic(
  () => import('@/components/rag/RagManagement'),
  {
    loading: () => <ComponentLoadingFallback />,
    ssr: false,
  }
);

/**
 * RAG Analytics Dashboard - Heavy charts and metrics
 */
export const LazyRagAnalytics = dynamic(
  () => import('@/components/rag/RagAnalytics'),
  {
    loading: () => (
      <div className="p-6 space-y-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    ),
    ssr: false,
  }
);

/**
 * Agent RAG Assignments - Heavy configuration panel
 */
export const LazyAgentRagAssignments = dynamic(
  () => import('@/components/rag/AgentRagAssignments'),
  {
    loading: () => (
      <div className="p-6">
        <TableSkeleton rows={8} columns={4} />
      </div>
    ),
    ssr: false,
  }
);

// ===========================
// LLM DASHBOARD COMPONENTS
// ===========================

/**
 * OpenAI Usage Dashboard - Heavy metrics and charts
 */
export const LazyOpenAIUsageDashboard = dynamic(
  () => import('@/components/llm/OpenAIUsageDashboard'),
  {
    loading: () => (
      <div className="p-6 space-y-6">
        <ChartSkeleton />
        <TableSkeleton rows={5} columns={3} />
      </div>
    ),
    ssr: false,
  }
);

/**
 * Medical Models Dashboard - Heavy model configuration
 */
export const LazyMedicalModelsDashboard = dynamic(
  () => import('@/components/llm/MedicalModelsDashboard'),
  {
    loading: () => <ComponentLoadingFallback />,
    ssr: false,
  }
);

/**
 * Usage Analytics Dashboard - Heavy analytics with charts
 */
export const LazyUsageAnalyticsDashboard = dynamic(
  () => import('@/components/llm/UsageAnalyticsDashboard'),
  {
    loading: () => <ComponentLoadingFallback />,
    ssr: false,
  }
);

/**
 * LLM Provider Dashboard - Heavy provider management
 */
export const LazyLLMProviderDashboard = dynamic(
  () => import('@/components/llm/LLMProviderDashboard'),
  {
    loading: () => <ComponentLoadingFallback />,
    ssr: false,
  }
);

// ===========================
// MODAL COMPONENTS
// ===========================

/**
 * Agent Details Modal - Heavy modal with tabs
 */
export const LazyAgentDetailsModal = dynamic(
  () => import('@/features/agents/components/agent-details-modal').then((mod) => ({ default: mod.AgentDetailsModal })),
  {
    loading: () => <AgentDetailsSkeleton />,
    ssr: false,
  }
);

/**
 * Avatar Picker Modal - Heavy icon grid
 */
export const LazyAvatarPickerModal = dynamic(
  () => import('@/components/avatar-picker-modal'),
  {
    loading: () => <ModalLoadingFallback />,
    ssr: false,
  }
);

/**
 * Icon Selection Modal - Heavy icon library
 */
export const LazyIconSelectionModal = dynamic(
  () => import('@/components/ui/icon-selection-modal'),
  {
    loading: () => <ModalLoadingFallback />,
    ssr: false,
  }
);

/**
 * RAG Context Modal - Heavy document viewer
 */
export const LazyRagContextModal = dynamic(
  () => import('@/components/rag/RagContextModal'),
  {
    loading: () => <ModalLoadingFallback />,
    ssr: false,
  }
);

/**
 * Prompt Enhancement Modal - Heavy AI-powered editor
 */
export const LazyPromptEnhancementModal = dynamic(
  () => import('@/components/chat/PromptEnhancementModal'),
  {
    loading: () => <ModalLoadingFallback />,
    ssr: false,
  }
);

// ===========================
// SPECIALIZED COMPONENTS
// ===========================

/**
 * Enhanced Chat Interface - Heavy full-featured chat
 */
export const LazyEnhancedChatInterface = dynamic(
  () => import('@/components/enhanced/EnhancedChatInterface'),
  {
    loading: () => <ComponentLoadingFallback />,
    ssr: false,
  }
);

/**
 * Autonomous Chat Interface - Heavy AI agent interface
 */
export const LazyAutonomousChatInterface = dynamic(
  () => import('@/components/chat/autonomous/AutonomousChatInterface'),
  {
    loading: () => <ComponentLoadingFallback />,
    ssr: false,
  }
);

/**
 * Dashboard Main - Heavy dashboard with widgets
 */
export const LazyDashboardMain = dynamic(
  () => import('@/components/dashboard/dashboard-main'),
  {
    loading: () => <ComponentLoadingFallback />,
    ssr: false,
  }
);

/**
 * Agent Manager - Heavy CRUD interface
 */
export const LazyAgentManager = dynamic(
  () => import('@/components/agents/agent-manager'),
  {
    loading: () => <ComponentLoadingFallback />,
    ssr: false,
  }
);

/**
 * Reasoning Demo - Heavy visualization component
 */
export const LazyReasoningDemo = dynamic(
  () => import('@/components/ai/reasoning-demo'),
  {
    loading: () => <ComponentLoadingFallback />,
    ssr: false,
  }
);
