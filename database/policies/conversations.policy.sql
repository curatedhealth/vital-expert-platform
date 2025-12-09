-- ============================================================================
-- VITAL Path - Conversations Table RLS Policies
-- ============================================================================
-- 
-- Conversations contain sensitive AI interactions.
-- Users can only access their own conversations.
-- Tenant admins can access all conversations in their tenant (for audit).
-- ============================================================================

-- Enable RLS on conversations table
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owners
ALTER TABLE conversations FORCE ROW LEVEL SECURITY;

-- ============================================================================
-- SELECT POLICIES
-- ============================================================================

-- Users can view their own conversations
CREATE POLICY "conversations_select_own"
ON conversations
FOR SELECT
USING (
    tenant_id = auth.tenant_id()
    AND user_id = auth.uid()
);

-- Tenant admins can view all conversations in their tenant (audit)
CREATE POLICY "conversations_select_tenant_admin"
ON conversations
FOR SELECT
USING (
    tenant_id = auth.tenant_id()
    AND auth.is_tenant_admin()
);

-- System admins can view all conversations
CREATE POLICY "conversations_select_system"
ON conversations
FOR SELECT
USING (
    auth.is_system_admin()
);

-- ============================================================================
-- INSERT POLICIES
-- ============================================================================

-- Users can create conversations
CREATE POLICY "conversations_insert_own"
ON conversations
FOR INSERT
WITH CHECK (
    tenant_id = auth.tenant_id()
    AND user_id = auth.uid()
);

-- ============================================================================
-- UPDATE POLICIES
-- ============================================================================

-- Users can update their own conversations (e.g., rename, archive)
CREATE POLICY "conversations_update_own"
ON conversations
FOR UPDATE
USING (
    tenant_id = auth.tenant_id()
    AND user_id = auth.uid()
)
WITH CHECK (
    tenant_id = auth.tenant_id()
    AND user_id = auth.uid()
);

-- ============================================================================
-- DELETE POLICIES
-- ============================================================================

-- Users can delete their own conversations
CREATE POLICY "conversations_delete_own"
ON conversations
FOR DELETE
USING (
    tenant_id = auth.tenant_id()
    AND user_id = auth.uid()
);

-- Tenant admins can delete any conversation in their tenant
CREATE POLICY "conversations_delete_tenant_admin"
ON conversations
FOR DELETE
USING (
    tenant_id = auth.tenant_id()
    AND auth.is_tenant_admin()
);

-- ============================================================================
-- INDEXES FOR RLS PERFORMANCE
-- ============================================================================

-- Index for user's conversations
CREATE INDEX IF NOT EXISTS idx_conversations_tenant_user 
ON conversations(tenant_id, user_id);

-- Index for recent conversations
CREATE INDEX IF NOT EXISTS idx_conversations_tenant_user_updated 
ON conversations(tenant_id, user_id, updated_at DESC);


