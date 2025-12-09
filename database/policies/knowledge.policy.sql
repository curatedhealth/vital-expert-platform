-- ============================================================================
-- VITAL Path - Knowledge/Documents Table RLS Policies
-- ============================================================================
-- 
-- Knowledge documents are tenant-isolated.
-- Used for RAG retrieval within tenant boundaries.
-- ============================================================================

-- Enable RLS on knowledge_documents table
ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owners
ALTER TABLE knowledge_documents FORCE ROW LEVEL SECURITY;

-- ============================================================================
-- SELECT POLICIES
-- ============================================================================

-- Users can view documents in their tenant
CREATE POLICY "knowledge_documents_select_tenant"
ON knowledge_documents
FOR SELECT
USING (
    tenant_id = auth.tenant_id()
);

-- Shared documents (system knowledge base) visible to all
CREATE POLICY "knowledge_documents_select_shared"
ON knowledge_documents
FOR SELECT
USING (
    is_shared = true
);

-- System admins can view all documents
CREATE POLICY "knowledge_documents_select_system"
ON knowledge_documents
FOR SELECT
USING (
    auth.is_system_admin()
);

-- ============================================================================
-- INSERT POLICIES
-- ============================================================================

-- Users can upload documents to their tenant
CREATE POLICY "knowledge_documents_insert_tenant"
ON knowledge_documents
FOR INSERT
WITH CHECK (
    tenant_id = auth.tenant_id()
    AND uploaded_by = auth.uid()
);

-- ============================================================================
-- UPDATE POLICIES
-- ============================================================================

-- Users can update documents they uploaded
CREATE POLICY "knowledge_documents_update_own"
ON knowledge_documents
FOR UPDATE
USING (
    tenant_id = auth.tenant_id()
    AND uploaded_by = auth.uid()
)
WITH CHECK (
    tenant_id = auth.tenant_id()
);

-- Tenant admins can update any document in their tenant
CREATE POLICY "knowledge_documents_update_tenant_admin"
ON knowledge_documents
FOR UPDATE
USING (
    tenant_id = auth.tenant_id()
    AND auth.is_tenant_admin()
)
WITH CHECK (
    tenant_id = auth.tenant_id()
);

-- ============================================================================
-- DELETE POLICIES
-- ============================================================================

-- Users can delete documents they uploaded
CREATE POLICY "knowledge_documents_delete_own"
ON knowledge_documents
FOR DELETE
USING (
    tenant_id = auth.tenant_id()
    AND uploaded_by = auth.uid()
);

-- Tenant admins can delete any document in their tenant
CREATE POLICY "knowledge_documents_delete_tenant_admin"
ON knowledge_documents
FOR DELETE
USING (
    tenant_id = auth.tenant_id()
    AND auth.is_tenant_admin()
);

-- ============================================================================
-- INDEXES FOR RLS PERFORMANCE
-- ============================================================================

-- Index for tenant filtering
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_tenant_id 
ON knowledge_documents(tenant_id);

-- Index for domain filtering within tenant
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_tenant_domain 
ON knowledge_documents(tenant_id, domain_id);

-- Index for shared documents
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_shared 
ON knowledge_documents(is_shared) WHERE is_shared = true;


