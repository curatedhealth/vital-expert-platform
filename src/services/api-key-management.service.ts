import crypto from 'crypto';

import { createClient } from '@supabase/supabase-js';

import { AuditLogger, AuditAction, AuditSeverity } from '@/lib/security/audit-logger';

export interface ApiKey {
  id: string;
  provider_id: string;
  key_name: string;
  encrypted_key: string;
  key_hash: string;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  created_by: string;
  last_used_at: string | null;
  usage_count: number;
  provider_name?: string; // Joined from llm_providers
}

export interface CreateApiKeyData {
  provider_id: string;
  key_name: string;
  api_key: string;
  expires_at?: string;
}

export interface ApiKeyFilters {
  providerId?: string;
  isActive?: boolean;
  search?: string;
}

export interface ApiKeyPagination {
  page: number;
  limit: number;
  total?: number;
  totalPages?: number;
}

export interface ApiKeyResponse {
  data: ApiKey[];
  pagination: ApiKeyPagination;
}

export class ApiKeyManagementService {
  private supabase;
  private auditLogger: AuditLogger;
  private encryptionKey: string;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    this.auditLogger = AuditLogger.getInstance();
    this.encryptionKey = process.env.API_KEY_ENCRYPTION_KEY || 'default-key-change-in-production';
  }

  /**
   * Get current user's profile and role
   */
  async getCurrentUser(): Promise<{ user: any; profile: any; isSuperAdmin: boolean }> {
    const { data: { user }, error: authError } = await this.supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    const { data: profile, error: profileError } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      throw new Error('User profile not found');
    }

    const isSuperAdmin = profile.role === 'super_admin';

    return { user, profile, isSuperAdmin };
  }

  /**
   * Encrypt API key
   */
  private encryptApiKey(apiKey: string): { encrypted: string; hash: string } {
    const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
    let encrypted = cipher.update(apiKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const hash = crypto.createHash('sha256').update(apiKey).digest('hex');
    
    return { encrypted, hash };
  }

  /**
   * Decrypt API key (for display purposes only)
   */
  private decryptApiKey(encryptedKey: string): string {
    try {
      const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
      let decrypted = decipher.update(encryptedKey, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      throw new Error('Failed to decrypt API key');
    }
  }

  /**
   * Get API keys with filters and pagination
   */
  async getApiKeys(
    filters: ApiKeyFilters = {},
    pagination: Omit<ApiKeyPagination, 'total' | 'totalPages'> = { page: 1, limit: 50 }
  ): Promise<ApiKeyResponse> {
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('encrypted_api_keys')
      .select(`
        *,
        llm_providers!inner(name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.providerId) {
      query = query.eq('provider_id', filters.providerId);
    }

    if (filters.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    if (filters.search) {
      query = query.or(`key_name.ilike.%${filters.search}%`);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch API keys: ${error.message}`);
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    // Add provider name to each key
    const keysWithProvider = data?.map(key => ({
      ...key,
      provider_name: key.llm_providers?.name || 'Unknown Provider'
    })) || [];

    return {
      data: keysWithProvider,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  }

  /**
   * Create new API key
   */
  async createApiKey(
    keyData: CreateApiKeyData,
    currentUserId: string
  ): Promise<{ id: string; key: string }> {
    const { encrypted, hash } = this.encryptApiKey(keyData.api_key);

    const { data, error } = await this.supabase
      .from('encrypted_api_keys')
      .insert({
        provider_id: keyData.provider_id,
        key_name: keyData.key_name,
        encrypted_key: encrypted,
        key_hash: hash,
        is_active: true,
        expires_at: keyData.expires_at || null,
        created_by: currentUserId
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create API key: ${error.message}`);
    }

    // Log audit event
    await this.auditLogger.log({
      action: AuditAction.API_KEY_CREATED,
      resourceType: 'api_key',
      resourceId: data.id,
      newValues: {
        provider_id: keyData.provider_id,
        key_name: keyData.key_name,
        expires_at: keyData.expires_at
      },
      success: true,
      severity: AuditSeverity.MEDIUM,
      metadata: {
        createdBy: currentUserId
      }
    });

    return {
      id: data.id,
      key: keyData.api_key // Return original key for one-time display
    };
  }

  /**
   * Rotate API key
   */
  async rotateApiKey(
    keyId: string,
    newApiKey: string,
    currentUserId: string
  ): Promise<{ key: string }> {
    // Get current key for audit
    const { data: currentKey, error: fetchError } = await this.supabase
      .from('encrypted_api_keys')
      .select('*')
      .eq('id', keyId)
      .single();

    if (fetchError || !currentKey) {
      throw new Error('API key not found');
    }

    const { encrypted, hash } = this.encryptApiKey(newApiKey);

    const { error } = await this.supabase
      .from('encrypted_api_keys')
      .update({
        encrypted_key: encrypted,
        key_hash: hash,
        updated_at: new Date().toISOString()
      })
      .eq('id', keyId);

    if (error) {
      throw new Error(`Failed to rotate API key: ${error.message}`);
    }

    // Log audit event
    await this.auditLogger.log({
      action: AuditAction.API_KEY_ROTATED,
      resourceType: 'api_key',
      resourceId: keyId,
      oldValues: { key_hash: currentKey.key_hash },
      newValues: { key_hash: hash },
      success: true,
      severity: AuditSeverity.MEDIUM,
      metadata: {
        rotatedBy: currentUserId,
        keyName: currentKey.key_name
      }
    });

    return { key: newApiKey };
  }

  /**
   * Revoke API key (set inactive)
   */
  async revokeApiKey(
    keyId: string,
    currentUserId: string
  ): Promise<void> {
    // Get current key for audit
    const { data: currentKey, error: fetchError } = await this.supabase
      .from('encrypted_api_keys')
      .select('*')
      .eq('id', keyId)
      .single();

    if (fetchError || !currentKey) {
      throw new Error('API key not found');
    }

    const { error } = await this.supabase
      .from('encrypted_api_keys')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', keyId);

    if (error) {
      throw new Error(`Failed to revoke API key: ${error.message}`);
    }

    // Log audit event
    await this.auditLogger.log({
      action: AuditAction.API_KEY_DELETED,
      resourceType: 'api_key',
      resourceId: keyId,
      oldValues: { is_active: currentKey.is_active },
      newValues: { is_active: false },
      success: true,
      severity: AuditSeverity.MEDIUM,
      metadata: {
        revokedBy: currentUserId,
        keyName: currentKey.key_name
      }
    });
  }

  /**
   * Get LLM providers for dropdown
   */
  async getProviders() {
    const { data, error } = await this.supabase
      .from('llm_providers')
      .select('id, name, is_active')
      .eq('is_active', true)
      .order('name');

    if (error) {
      throw new Error(`Failed to fetch providers: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get API key statistics
   */
  async getApiKeyStats() {
    const { data, error } = await this.supabase
      .from('encrypted_api_keys')
      .select('is_active, created_at, last_used_at, provider_id');

    if (error) {
      throw new Error(`Failed to fetch API key stats: ${error.message}`);
    }

    const total = data?.length || 0;
    const active = data?.filter(key => key.is_active).length || 0;
    const inactive = total - active;
    const recentlyUsed = data?.filter(key => 
      key.last_used_at && 
      new Date(key.last_used_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length || 0;

    // Group by provider
    const providerCounts = data?.reduce((acc, key) => {
      acc[key.provider_id] = (acc[key.provider_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    return {
      total,
      active,
      inactive,
      recentlyUsed,
      providerCounts
    };
  }
}
