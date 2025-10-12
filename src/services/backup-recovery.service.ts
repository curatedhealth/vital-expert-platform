/**
 * Backup & Recovery Service
 * 
 * Manages database backup operations, restore procedures, and scheduling
 * for the admin dashboard Phase 4 implementation.
 */

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

import { createClient } from '@supabase/supabase-js';

const execAsync = promisify(exec);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface BackupMetadata {
  id: string;
  backup_type: 'full' | 'incremental' | 'differential';
  backup_location: string;
  file_size?: number;
  database_size?: number;
  status: 'completed' | 'failed' | 'in_progress';
  tables_backed_up: string[];
  backup_duration_seconds?: number;
  retention_days: number;
  created_by: string;
  created_at: string;
  expires_at?: string;
  metadata: Record<string, any>;
}

export interface RestoreOperation {
  id: string;
  backup_id: string;
  restore_type: 'full' | 'partial' | 'point_in_time';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  tables_restored: string[];
  restore_duration_seconds?: number;
  performed_by: string;
  started_at: string;
  completed_at?: string;
  error_message?: string;
  metadata: Record<string, any>;
}

export interface BackupSchedule {
  id: string;
  name: string;
  backup_type: 'full' | 'incremental' | 'differential';
  cron_expression: string;
  retention_days: number;
  is_enabled: boolean;
  last_run_at?: string;
  next_run_at?: string;
  created_by: string;
  created_at: string;
}

export interface BackupFilters {
  status?: string;
  backup_type?: string;
  date_from?: string;
  date_to?: string;
}

export class BackupRecoveryService {
  private backupDir = process.env.BACKUP_DIR || '/tmp/backups';
  private scriptsDir = process.env.SCRIPTS_DIR || './scripts';

  constructor() {
    // Ensure backup directory exists
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * Get current user for audit logging
   */
  private async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    return { user };
  }

  // ============================================================================
  // BACKUP OPERATIONS
  // ============================================================================

  /**
   * Trigger a manual backup
   */
  async triggerBackup(
    backupType: 'full' | 'incremental' | 'differential' = 'full',
    tables?: string[]
  ): Promise<BackupMetadata> {
    const { user } = await this.getCurrentUser();
    const backupId = `backup_${Date.now()}`;
    const backupFile = path.join(this.backupDir, `${backupId}.sql`);

    // Create backup metadata record
    const { data: backupRecord, error: createError } = await supabase
      .from('backup_metadata')
      .insert({
        backup_type: backupType,
        backup_location: backupFile,
        status: 'in_progress',
        tables_backed_up: tables || [],
        retention_days: 90,
        created_by: user.id,
        metadata: {
          triggered_by: 'manual',
          backup_id: backupId
        }
      })
      .select()
      .single();

    if (createError) {
      throw new Error(`Failed to create backup record: ${createError.message}`);
    }

    try {
      // Execute backup script
      const scriptPath = path.join(this.scriptsDir, 'backup-db.sh');
      const command = `bash ${scriptPath} ${backupFile} ${backupType}`;
      
      const startTime = Date.now();
      const { stdout, stderr } = await execAsync(command);
      const duration = Math.round((Date.now() - startTime) / 1000);

      // Get file size
      const stats = fs.statSync(backupFile);
      const fileSize = stats.size;

      // Update backup record with success
      const { data: updatedBackup, error: updateError } = await supabase
        .from('backup_metadata')
        .update({
          status: 'completed',
          file_size: fileSize,
          backup_duration_seconds: duration,
          expires_at: new Date(Date.now() + (90 * 24 * 60 * 60 * 1000)).toISOString(),
          metadata: {
            ...backupRecord.metadata,
            stdout: stdout,
            stderr: stderr
          }
        })
        .eq('id', backupRecord.id)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to update backup record: ${updateError.message}`);
      }

      return updatedBackup;
    } catch (error) {
      // Update backup record with failure
      await supabase
        .from('backup_metadata')
        .update({
          status: 'failed',
          metadata: {
            ...backupRecord.metadata,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        })
        .eq('id', backupRecord.id);

      throw new Error(`Backup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get backup history with optional filtering
   */
  async getBackupHistory(filters: BackupFilters = {}): Promise<BackupMetadata[]> {
    let query = supabase
      .from('backup_metadata')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.backup_type) {
      query = query.eq('backup_type', filters.backup_type);
    }

    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('Backup metadata table not found, returning empty array:', error.message);
      return [];
    }

    return data || [];
  }

  /**
   * Get a single backup by ID
   */
  async getBackup(id: string): Promise<BackupMetadata> {
    const { data, error } = await supabase
      .from('backup_metadata')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch backup: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete a backup and its file
   */
  async deleteBackup(id: string): Promise<void> {
    const backup = await this.getBackup(id);

    // Delete the backup file
    if (fs.existsSync(backup.backup_location)) {
      fs.unlinkSync(backup.backup_location);
    }

    // Delete the database record
    const { error } = await supabase
      .from('backup_metadata')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete backup: ${error.message}`);
    }
  }

  // ============================================================================
  // RESTORE OPERATIONS
  // ============================================================================

  /**
   * Start a restore operation
   */
  async startRestore(
    backupId: string,
    restoreType: 'full' | 'partial' | 'point_in_time' = 'full',
    tables?: string[]
  ): Promise<RestoreOperation> {
    const { user } = await this.getCurrentUser();

    // Verify backup exists and is completed
    const backup = await this.getBackup(backupId);
    if (backup.status !== 'completed') {
      throw new Error('Cannot restore from incomplete backup');
    }

    // Create restore operation record
    const { data: restoreRecord, error: createError } = await supabase
      .from('restore_operations')
      .insert({
        backup_id: backupId,
        restore_type: restoreType,
        status: 'pending',
        tables_restored: tables || [],
        performed_by: user.id,
        metadata: {
          triggered_by: 'manual',
          backup_location: backup.backup_location
        }
      })
      .select()
      .single();

    if (createError) {
      throw new Error(`Failed to create restore record: ${createError.message}`);
    }

    // Start restore in background
    this.executeRestore(restoreRecord.id, backup.backup_location, restoreType, tables);

    return restoreRecord;
  }

  /**
   * Execute restore operation (background)
   */
  private async executeRestore(
    restoreId: string,
    backupLocation: string,
    restoreType: string,
    tables?: string[]
  ): Promise<void> {
    try {
      // Update status to in_progress
      await supabase
        .from('restore_operations')
        .update({ status: 'in_progress' })
        .eq('id', restoreId);

      const startTime = Date.now();
      const scriptPath = path.join(this.scriptsDir, 'restore-db.sh');
      const command = `bash ${scriptPath} ${backupLocation} ${restoreType}`;
      
      const { stdout, stderr } = await execAsync(command);
      const duration = Math.round((Date.now() - startTime) / 1000);

      // Update with success
      await supabase
        .from('restore_operations')
        .update({
          status: 'completed',
          restore_duration_seconds: duration,
          completed_at: new Date().toISOString(),
          metadata: {
            stdout: stdout,
            stderr: stderr
          }
        })
        .eq('id', restoreId);

    } catch (error) {
      // Update with failure
      await supabase
        .from('restore_operations')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          completed_at: new Date().toISOString()
        })
        .eq('id', restoreId);
    }
  }

  /**
   * Get restore operations history
   */
  async getRestoreHistory(): Promise<RestoreOperation[]> {
    const { data, error } = await supabase
      .from('restore_operations')
      .select('*')
      .order('started_at', { ascending: false });

    if (error) {
      console.warn('Restore operations table not found, returning empty array:', error.message);
      return [];
    }

    return data || [];
  }

  /**
   * Get restore operation by ID
   */
  async getRestoreOperation(id: string): Promise<RestoreOperation> {
    const { data, error } = await supabase
      .from('restore_operations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch restore operation: ${error.message}`);
    }

    return data;
  }

  // ============================================================================
  // BACKUP SCHEDULING
  // ============================================================================

  /**
   * Create a backup schedule
   */
  async createBackupSchedule(scheduleData: Omit<BackupSchedule, 'id' | 'created_at' | 'created_by'>): Promise<BackupSchedule> {
    const { user } = await this.getCurrentUser();

    const { data, error } = await supabase
      .from('backup_schedules')
      .insert({
        ...scheduleData,
        created_by: user.id
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create backup schedule: ${error.message}`);
    }

    return data;
  }

  /**
   * Get all backup schedules
   */
  async getBackupSchedules(): Promise<BackupSchedule[]> {
    const { data, error } = await supabase
      .from('backup_schedules')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch backup schedules: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Update a backup schedule
   */
  async updateBackupSchedule(id: string, updates: Partial<BackupSchedule>): Promise<BackupSchedule> {
    const { data, error } = await supabase
      .from('backup_schedules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update backup schedule: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete a backup schedule
   */
  async deleteBackupSchedule(id: string): Promise<void> {
    const { error } = await supabase
      .from('backup_schedules')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete backup schedule: ${error.message}`);
    }
  }

  /**
   * Toggle backup schedule enabled status
   */
  async toggleBackupSchedule(id: string, enabled: boolean): Promise<BackupSchedule> {
    return this.updateBackupSchedule(id, { is_enabled: enabled });
  }

  // ============================================================================
  // BACKUP HEALTH MONITORING
  // ============================================================================

  /**
   * Get backup health status
   */
  async getBackupHealth(): Promise<{
    total_backups: number;
    successful_backups: number;
    failed_backups: number;
    last_backup: string | null;
    next_scheduled: string | null;
    storage_used: number;
    health_score: number;
  }> {
    const [backups, schedules] = await Promise.all([
      this.getBackupHistory(),
      this.getBackupSchedules()
    ]);

    const totalBackups = backups.length;
    const successfulBackups = backups.filter(b => b.status === 'completed').length;
    const failedBackups = backups.filter(b => b.status === 'failed').length;
    const lastBackup = backups.length > 0 ? backups[0].created_at : null;
    
    const enabledSchedules = schedules.filter(s => s.is_enabled);
    const nextScheduled = enabledSchedules.length > 0 
      ? enabledSchedules[0].next_run_at 
      : null;

    const storageUsed = backups
      .filter(b => b.status === 'completed' && b.file_size)
      .reduce((sum, b) => sum + (b.file_size || 0), 0);

    const healthScore = totalBackups > 0 
      ? Math.round((successfulBackups / totalBackups) * 100)
      : 100;

    return {
      total_backups: totalBackups,
      successful_backups: successfulBackups,
      failed_backups: failedBackups,
      last_backup: lastBackup,
      next_scheduled: nextScheduled,
      storage_used: storageUsed,
      health_score: healthScore
    };
  }

  /**
   * Clean up expired backups
   */
  async cleanupExpiredBackups(): Promise<number> {
    const now = new Date().toISOString();
    
    const { data: expiredBackups, error: fetchError } = await supabase
      .from('backup_metadata')
      .select('id, backup_location')
      .lt('expires_at', now);

    if (fetchError) {
      throw new Error(`Failed to fetch expired backups: ${fetchError.message}`);
    }

    let cleanedCount = 0;

    for (const backup of expiredBackups || []) {
      try {
        // Delete backup file
        if (fs.existsSync(backup.backup_location)) {
          fs.unlinkSync(backup.backup_location);
        }

        // Delete database record
        await supabase
          .from('backup_metadata')
          .delete()
          .eq('id', backup.id);

        cleanedCount++;
      } catch (error) {
        console.error(`Failed to cleanup backup ${backup.id}:`, error);
      }
    }

    return cleanedCount;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get backup file size in human readable format
   */
  formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Validate cron expression
   */
  validateCronExpression(cron: string): boolean {
    const cronRegex = /^(\*|([0-5]?\d)) (\*|([01]?\d|2[0-3])) (\*|([012]?\d|3[01])) (\*|([0]?\d|1[0-2])) (\*|([0-6]))$/;
    return cronRegex.test(cron);
  }

  /**
   * Calculate next run time from cron expression
   */
  calculateNextRun(cronExpression: string): Date | null {
    // This is a simplified implementation
    // In production, you'd want to use a proper cron parser library
    try {
      const parts = cronExpression.split(' ');
      if (parts.length !== 6) return null;

      const now = new Date();
      const nextRun = new Date(now);
      
      // Add 1 hour for simple hourly schedules
      if (parts[0] === '0' && parts[1] === '*' && parts[2] === '*' && parts[3] === '*' && parts[4] === '*') {
        nextRun.setHours(nextRun.getHours() + 1);
        return nextRun;
      }

      // Add 1 day for daily schedules
      if (parts[0] === '0' && parts[1] === '0' && parts[2] === '*' && parts[3] === '*' && parts[4] === '*') {
        nextRun.setDate(nextRun.getDate() + 1);
        return nextRun;
      }

      return null;
    } catch {
      return null;
    }
  }
}
