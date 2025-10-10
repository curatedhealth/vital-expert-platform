import { createClient } from '@supabase/supabase-js';
import { createHash, createHmac } from 'crypto';
import { AuditLogger, AuditAction, AuditSeverity } from '@/lib/security/audit-logger';

export interface AuditBlock {
  id: string;
  previousHash: string | null;
  currentHash: string;
  timestamp: Date;
  blockNumber: number;
  auditEvents: AuditEvent[];
  merkleRoot: string;
  signature: string;
  isSealed: boolean;
  sealedAt?: Date;
}

export interface AuditEvent {
  id: string;
  timestamp: Date;
  action: string;
  resourceType: string;
  resourceId: string;
  userId: string;
  details: Record<string, any>;
  hash: string;
  blockId?: string;
}

export interface SIEMExport {
  id: string;
  blockId: string;
  exportType: 'full' | 'incremental';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  destination: string;
  format: 'json' | 'cef' | 'leef';
  startedAt: Date;
  completedAt?: Date;
  errorMessage?: string;
  recordCount: number;
  checksum: string;
}

export interface IntegrityCheck {
  blockId: string;
  isValid: boolean;
  checkedAt: Date;
  issues: IntegrityIssue[];
  verificationHash: string;
}

export interface IntegrityIssue {
  type: 'hash_mismatch' | 'chain_break' | 'signature_invalid' | 'timestamp_anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  details: Record<string, any>;
}

export interface WORMConfig {
  id: string;
  name: string;
  retentionPeriod: number; // in days
  isActive: boolean;
  encryptionKey: string;
  storageLocation: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ImmutableAuditService {
  private supabase;
  private auditLogger: AuditLogger;
  private encryptionKey: string;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    this.auditLogger = AuditLogger.getInstance();
    this.encryptionKey = process.env.AUDIT_ENCRYPTION_KEY || 'default-key-change-in-production';
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
   * Create a new audit block with hash chaining
   */
  async createAuditBlock(events: AuditEvent[]): Promise<AuditBlock> {
    try {
      // Get the last block to chain the hash
      const { data: lastBlock } = await this.supabase
        .from('audit_blocks')
        .select('*')
        .order('block_number', { ascending: false })
        .limit(1)
        .single();

      const blockNumber = lastBlock ? lastBlock.block_number + 1 : 1;
      const previousHash = lastBlock ? lastBlock.current_hash : null;

      // Calculate Merkle root for all events
      const merkleRoot = this.calculateMerkleRoot(events);

      // Create block hash
      const blockData = {
        blockNumber,
        previousHash,
        timestamp: new Date(),
        events: events.map(e => e.id),
        merkleRoot
      };

      const currentHash = this.calculateHash(JSON.stringify(blockData));

      // Create digital signature
      const signature = this.createSignature(JSON.stringify(blockData));

      const auditBlock: AuditBlock = {
        id: `block-${Date.now()}`,
        previousHash,
        currentHash,
        timestamp: new Date(),
        blockNumber,
        auditEvents: events,
        merkleRoot,
        signature,
        isSealed: false
      };

      // Store the block
      const { data, error } = await this.supabase
        .from('audit_blocks')
        .insert({
          id: auditBlock.id,
          previous_hash: previousHash,
          current_hash: currentHash,
          timestamp: auditBlock.timestamp.toISOString(),
          block_number: blockNumber,
          merkle_root: merkleRoot,
          signature: signature,
          is_sealed: false
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create audit block: ${error.message}`);
      }

      // Store individual events
      for (const event of events) {
        await this.supabase
          .from('audit_events')
          .insert({
            id: event.id,
            timestamp: event.timestamp.toISOString(),
            action: event.action,
            resource_type: event.resourceType,
            resource_id: event.resourceId,
            user_id: event.userId,
            details: event.details,
            hash: event.hash,
            block_id: auditBlock.id
          });
      }

      // Log audit event
      await this.auditLogger.log({
        action: AuditAction.SYSTEM_ACTION,
        resourceType: 'audit_block',
        resourceId: auditBlock.id,
        newValues: {
          blockNumber,
          eventCount: events.length,
          merkleRoot
        },
        success: true,
        severity: AuditSeverity.HIGH,
        metadata: {
          action: 'audit_block_created',
          blockId: auditBlock.id
        }
      });

      return auditBlock;
    } catch (error) {
      console.error('Error creating audit block:', error);
      throw error;
    }
  }

  /**
   * Seal an audit block (make it immutable)
   */
  async sealAuditBlock(blockId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('audit_blocks')
        .update({
          is_sealed: true,
          sealed_at: new Date().toISOString()
        })
        .eq('id', blockId);

      if (error) {
        throw new Error(`Failed to seal audit block: ${error.message}`);
      }

      // Log audit event
      await this.auditLogger.log({
        action: AuditAction.SYSTEM_ACTION,
        resourceType: 'audit_block',
        resourceId: blockId,
        newValues: { isSealed: true },
        success: true,
        severity: AuditSeverity.HIGH,
        metadata: {
          action: 'audit_block_sealed',
          blockId
        }
      });
    } catch (error) {
      console.error('Error sealing audit block:', error);
      throw error;
    }
  }

  /**
   * Verify integrity of audit blocks
   */
  async verifyIntegrity(blockId?: string): Promise<IntegrityCheck[]> {
    try {
      let query = this.supabase
        .from('audit_blocks')
        .select('*')
        .order('block_number', { ascending: true });

      if (blockId) {
        query = query.eq('id', blockId);
      }

      const { data: blocks, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch audit blocks: ${error.message}`);
      }

      const integrityChecks: IntegrityCheck[] = [];
      let previousHash: string | null = null;

      for (const block of blocks || []) {
        const issues: IntegrityIssue[] = [];
        let isValid = true;

        // Check hash chain
        if (block.previous_hash !== previousHash) {
          issues.push({
            type: 'chain_break',
            severity: 'critical',
            description: 'Hash chain is broken',
            details: {
              expected: previousHash,
              actual: block.previous_hash
            }
          });
          isValid = false;
        }

        // Verify block hash
        const blockData = {
          blockNumber: block.block_number,
          previousHash: block.previous_hash,
          timestamp: block.timestamp,
          merkleRoot: block.merkle_root
        };

        const expectedHash = this.calculateHash(JSON.stringify(blockData));
        if (block.current_hash !== expectedHash) {
          issues.push({
            type: 'hash_mismatch',
            severity: 'critical',
            description: 'Block hash mismatch',
            details: {
              expected: expectedHash,
              actual: block.current_hash
            }
          });
          isValid = false;
        }

        // Verify signature
        const signatureValid = this.verifySignature(
          JSON.stringify(blockData),
          block.signature
        );

        if (!signatureValid) {
          issues.push({
            type: 'signature_invalid',
            severity: 'high',
            description: 'Digital signature is invalid',
            details: { signature: block.signature }
          });
          isValid = false;
        }

        // Check timestamp anomalies
        const blockTime = new Date(block.timestamp);
        const now = new Date();
        const timeDiff = now.getTime() - blockTime.getTime();

        if (timeDiff < 0) {
          issues.push({
            type: 'timestamp_anomaly',
            severity: 'medium',
            description: 'Block timestamp is in the future',
            details: { timestamp: block.timestamp }
          });
          isValid = false;
        }

        const verificationHash = this.calculateHash(
          JSON.stringify({ blockId: block.id, isValid, issues })
        );

        integrityChecks.push({
          blockId: block.id,
          isValid,
          checkedAt: new Date(),
          issues,
          verificationHash
        });

        previousHash = block.current_hash;
      }

      return integrityChecks;
    } catch (error) {
      console.error('Error verifying integrity:', error);
      throw error;
    }
  }

  /**
   * Export audit data to SIEM
   */
  async exportToSIEM(
    blockId: string,
    destination: string,
    format: 'json' | 'cef' | 'leef' = 'json'
  ): Promise<SIEMExport> {
    try {
      // Get audit block and events
      const { data: block, error: blockError } = await this.supabase
        .from('audit_blocks')
        .select('*')
        .eq('id', blockId)
        .single();

      if (blockError || !block) {
        throw new Error('Audit block not found');
      }

      const { data: events, error: eventsError } = await this.supabase
        .from('audit_events')
        .select('*')
        .eq('block_id', blockId);

      if (eventsError) {
        throw new Error('Failed to fetch audit events');
      }

      // Create export record
      const exportId = `export-${Date.now()}`;
      const exportData: SIEMExport = {
        id: exportId,
        blockId,
        exportType: 'full',
        status: 'processing',
        destination,
        format,
        startedAt: new Date(),
        recordCount: events?.length || 0,
        checksum: ''
      };

      // Store export record
      const { error: exportError } = await this.supabase
        .from('siem_exports')
        .insert({
          id: exportId,
          block_id: blockId,
          export_type: 'full',
          status: 'processing',
          destination: destination,
          format: format,
          started_at: exportData.startedAt.toISOString(),
          record_count: exportData.recordCount
        });

      if (exportError) {
        throw new Error(`Failed to create export record: ${exportError.message}`);
      }

      // Process export (this would integrate with actual SIEM systems)
      try {
        const exportContent = this.formatForSIEM(block, events || [], format);
        const checksum = this.calculateHash(exportContent);

        // Update export record
        await this.supabase
          .from('siem_exports')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            checksum: checksum
          })
          .eq('id', exportId);

        exportData.status = 'completed';
        exportData.completedAt = new Date();
        exportData.checksum = checksum;

        // Log audit event
        await this.auditLogger.log({
          action: AuditAction.SYSTEM_ACTION,
          resourceType: 'siem_export',
          resourceId: exportId,
          newValues: {
            blockId,
            destination,
            format,
            recordCount: exportData.recordCount
          },
          success: true,
          severity: AuditSeverity.MEDIUM,
          metadata: {
            action: 'siem_export_completed',
            exportId
          }
        });

      } catch (exportError) {
        // Update export record with error
        await this.supabase
          .from('siem_exports')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString(),
            error_message: exportError instanceof Error ? exportError.message : 'Unknown error'
          })
          .eq('id', exportId);

        exportData.status = 'failed';
        exportData.completedAt = new Date();
        exportData.errorMessage = exportError instanceof Error ? exportError.message : 'Unknown error';
      }

      return exportData;
    } catch (error) {
      console.error('Error exporting to SIEM:', error);
      throw error;
    }
  }

  /**
   * Get SIEM exports
   */
  async getSIEMExports(): Promise<SIEMExport[]> {
    try {
      const { data, error } = await this.supabase
        .from('siem_exports')
        .select('*')
        .order('started_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch SIEM exports: ${error.message}`);
      }

      return (data || []).map(export_ => ({
        id: export_.id,
        blockId: export_.block_id,
        exportType: export_.export_type,
        status: export_.status,
        destination: export_.destination,
        format: export_.format,
        startedAt: new Date(export_.started_at),
        completedAt: export_.completed_at ? new Date(export_.completed_at) : undefined,
        errorMessage: export_.error_message,
        recordCount: export_.record_count,
        checksum: export_.checksum
      }));
    } catch (error) {
      console.error('Error fetching SIEM exports:', error);
      return [];
    }
  }

  /**
   * Get WORM configuration
   */
  async getWORMConfig(): Promise<WORMConfig[]> {
    try {
      const { data, error } = await this.supabase
        .from('worm_configs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch WORM configs: ${error.message}`);
      }

      return (data || []).map(config => ({
        id: config.id,
        name: config.name,
        retentionPeriod: config.retention_period,
        isActive: config.is_active,
        encryptionKey: config.encryption_key,
        storageLocation: config.storage_location,
        createdAt: new Date(config.created_at),
        updatedAt: new Date(config.updated_at)
      }));
    } catch (error) {
      console.error('Error fetching WORM configs:', error);
      return [];
    }
  }

  /**
   * Calculate Merkle root for events
   */
  private calculateMerkleRoot(events: AuditEvent[]): string {
    if (events.length === 0) return '';

    const hashes = events.map(event => event.hash);
    
    while (hashes.length > 1) {
      const nextLevel: string[] = [];
      for (let i = 0; i < hashes.length; i += 2) {
        const left = hashes[i];
        const right = hashes[i + 1] || left;
        nextLevel.push(this.calculateHash(left + right));
      }
      hashes.splice(0, hashes.length, ...nextLevel);
    }

    return hashes[0];
  }

  /**
   * Calculate SHA-256 hash
   */
  private calculateHash(data: string): string {
    return createHash('sha256').update(data).digest('hex');
  }

  /**
   * Create HMAC signature
   */
  private createSignature(data: string): string {
    return createHmac('sha256', this.encryptionKey).update(data).digest('hex');
  }

  /**
   * Verify HMAC signature
   */
  private verifySignature(data: string, signature: string): boolean {
    const expectedSignature = this.createSignature(data);
    return expectedSignature === signature;
  }

  /**
   * Format data for SIEM export
   */
  private formatForSIEM(block: any, events: any[], format: string): string {
    switch (format) {
      case 'json':
        return JSON.stringify({ block, events }, null, 2);
      case 'cef':
        return this.formatAsCEF(events);
      case 'leef':
        return this.formatAsLEEF(events);
      default:
        return JSON.stringify({ block, events }, null, 2);
    }
  }

  /**
   * Format events as CEF (Common Event Format)
   */
  private formatAsCEF(events: any[]): string {
    return events.map(event => {
      const timestamp = new Date(event.timestamp).toISOString();
      return `CEF:0|VITAL|Audit|1.0|${event.action}|${event.resource_type}|5|start=${timestamp} src=${event.user_id} act=${event.action} rt=${event.resource_type} rid=${event.resource_id}`;
    }).join('\n');
  }

  /**
   * Format events as LEEF (Log Event Extended Format)
   */
  private formatAsLEEF(events: any[]): string {
    return events.map(event => {
      const timestamp = new Date(event.timestamp).toISOString();
      return `LEEF:1.0|VITAL|Audit|1.0|${event.action}|${timestamp}|src=${event.user_id} act=${event.action} rt=${event.resource_type} rid=${event.resource_id}`;
    }).join('\n');
  }
}
