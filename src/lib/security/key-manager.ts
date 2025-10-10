/**
 * Key Manager
 * Manages encryption keys with secure storage and rotation
 */

import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import type { KeyInfo } from './encryption-manager';

export interface KeyStorageConfig {
  storageType: 'database' | 'file' | 'aws_kms' | 'azure_keyvault';
  databaseTable?: string;
  filePath?: string;
  awsRegion?: string;
  azureVaultUrl?: string;
  encryptionKey?: string; // For encrypting keys at rest
}

export interface KeyRotationPolicy {
  rotationInterval: number; // days
  maxKeyAge: number; // days
  gracePeriod: number; // days
  autoRotation: boolean;
  notificationDays: number[]; // days before rotation to notify
}

export interface KeyAuditLog {
  keyId: string;
  action: 'created' | 'rotated' | 'revoked' | 'accessed' | 'expired';
  timestamp: Date;
  userId?: string;
  details: Record<string, any>;
}

export class KeyManager {
  private supabase: any;
  private config: KeyStorageConfig;
  private rotationPolicy: KeyRotationPolicy;
  private auditLog: KeyAuditLog[] = [];

  constructor(config: KeyStorageConfig, rotationPolicy?: Partial<KeyRotationPolicy>) {
    this.config = config;
    this.rotationPolicy = {
      rotationInterval: 90,
      maxKeyAge: 90,
      gracePeriod: 30,
      autoRotation: true,
      notificationDays: [7, 3, 1],
      ...rotationPolicy
    };

    // Initialize Supabase if using database storage
    if (config.storageType === 'database') {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (supabaseUrl && supabaseServiceKey) {
        this.supabase = createClient(supabaseUrl, supabaseServiceKey);
      } else {
        console.warn('⚠️ Supabase not configured for key storage');
      }
    }

    this.initializeKeyStorage();
  }

  /**
   * Store encryption key securely
   */
  async storeKey(keyInfo: KeyInfo): Promise<boolean> {
    try {
      const encryptedKey = this.encryptKeyForStorage(keyInfo.key);
      
      const keyRecord = {
        key_id: keyInfo.keyId,
        encrypted_key: encryptedKey,
        algorithm: keyInfo.algorithm,
        created_at: keyInfo.createdAt.toISOString(),
        expires_at: keyInfo.expiresAt.toISOString(),
        status: keyInfo.status,
        metadata: {
          keyLength: keyInfo.key.length,
          storageType: this.config.storageType
        }
      };

      switch (this.config.storageType) {
        case 'database':
          return await this.storeKeyInDatabase(keyRecord);
        case 'file':
          return await this.storeKeyInFile(keyRecord);
        case 'aws_kms':
          return await this.storeKeyInAWSKMS(keyRecord);
        case 'azure_keyvault':
          return await this.storeKeyInAzureKeyVault(keyRecord);
        default:
          throw new Error(`Unsupported storage type: ${this.config.storageType}`);
      }
    } catch (error) {
      console.error('❌ Failed to store key:', error);
      return false;
    }
  }

  /**
   * Retrieve encryption key
   */
  async retrieveKey(keyId: string): Promise<KeyInfo | null> {
    try {
      let keyRecord: any;

      switch (this.config.storageType) {
        case 'database':
          keyRecord = await this.retrieveKeyFromDatabase(keyId);
          break;
        case 'file':
          keyRecord = await this.retrieveKeyFromFile(keyId);
          break;
        case 'aws_kms':
          keyRecord = await this.retrieveKeyFromAWSKMS(keyId);
          break;
        case 'azure_keyvault':
          keyRecord = await this.retrieveKeyFromAzureKeyVault(keyId);
          break;
        default:
          throw new Error(`Unsupported storage type: ${this.config.storageType}`);
      }

      if (!keyRecord) {
        return null;
      }

      const decryptedKey = this.decryptKeyFromStorage(keyRecord.encrypted_key);
      
      return {
        keyId: keyRecord.key_id,
        key: decryptedKey,
        createdAt: new Date(keyRecord.created_at),
        expiresAt: new Date(keyRecord.expires_at),
        algorithm: keyRecord.algorithm,
        status: keyRecord.status
      };
    } catch (error) {
      console.error('❌ Failed to retrieve key:', error);
      return null;
    }
  }

  /**
   * List all stored keys
   */
  async listKeys(): Promise<KeyInfo[]> {
    try {
      let keyRecords: any[];

      switch (this.config.storageType) {
        case 'database':
          keyRecords = await this.listKeysFromDatabase();
          break;
        case 'file':
          keyRecords = await this.listKeysFromFile();
          break;
        case 'aws_kms':
          keyRecords = await this.listKeysFromAWSKMS();
          break;
        case 'azure_keyvault':
          keyRecords = await this.listKeysFromAzureKeyVault();
          break;
        default:
          throw new Error(`Unsupported storage type: ${this.config.storageType}`);
      }

      return keyRecords.map(record => ({
        keyId: record.key_id,
        key: this.decryptKeyFromStorage(record.encrypted_key),
        createdAt: new Date(record.created_at),
        expiresAt: new Date(record.expires_at),
        algorithm: record.algorithm,
        status: record.status
      }));
    } catch (error) {
      console.error('❌ Failed to list keys:', error);
      return [];
    }
  }

  /**
   * Revoke a key
   */
  async revokeKey(keyId: string, userId?: string): Promise<boolean> {
    try {
      const success = await this.updateKeyStatus(keyId, 'revoked');
      
      if (success) {
        this.logKeyAction(keyId, 'revoked', { userId });
      }
      
      return success;
    } catch (error) {
      console.error('❌ Failed to revoke key:', error);
      return false;
    }
  }

  /**
   * Check if key rotation is needed
   */
  async checkKeyRotationNeeded(): Promise<{ needed: boolean; keys: string[] }> {
    const keys = await this.listKeys();
    const now = new Date();
    const rotationNeeded: string[] = [];

    for (const key of keys) {
      if (key.status !== 'active') continue;

      const age = now.getTime() - key.createdAt.getTime();
      const ageInDays = age / (1000 * 60 * 60 * 24);

      if (ageInDays >= this.rotationPolicy.rotationInterval) {
        rotationNeeded.push(key.keyId);
      }
    }

    return {
      needed: rotationNeeded.length > 0,
      keys: rotationNeeded
    };
  }

  /**
   * Get keys expiring soon
   */
  async getKeysExpiringSoon(days: number = 7): Promise<KeyInfo[]> {
    const keys = await this.listKeys();
    const now = new Date();
    const threshold = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return keys.filter(key => 
      key.status === 'active' && 
      key.expiresAt <= threshold &&
      key.expiresAt > now
    );
  }

  /**
   * Get audit log
   */
  getAuditLog(keyId?: string, action?: string): KeyAuditLog[] {
    let filtered = this.auditLog;

    if (keyId) {
      filtered = filtered.filter(log => log.keyId === keyId);
    }

    if (action) {
      filtered = filtered.filter(log => log.action === action);
    }

    return [...filtered].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get key statistics
   */
  async getKeyStatistics(): Promise<{
    totalKeys: number;
    activeKeys: number;
    expiredKeys: number;
    revokedKeys: number;
    keysExpiringSoon: number;
    averageKeyAge: number;
  }> {
    const keys = await this.listKeys();
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const stats = {
      totalKeys: keys.length,
      activeKeys: keys.filter(k => k.status === 'active').length,
      expiredKeys: keys.filter(k => k.status === 'expired').length,
      revokedKeys: keys.filter(k => k.status === 'revoked').length,
      keysExpiringSoon: keys.filter(k => 
        k.status === 'active' && 
        k.expiresAt <= sevenDaysFromNow && 
        k.expiresAt > now
      ).length,
      averageKeyAge: 0
    };

    if (keys.length > 0) {
      const totalAge = keys.reduce((sum, key) => {
        const age = now.getTime() - key.createdAt.getTime();
        return sum + (age / (1000 * 60 * 60 * 24)); // Convert to days
      }, 0);
      stats.averageKeyAge = totalAge / keys.length;
    }

    return stats;
  }

  // Private helper methods
  private encryptKeyForStorage(key: Buffer): string {
    if (!this.config.encryptionKey) {
      // If no encryption key provided, use a simple base64 encoding
      // In production, this should use a proper key encryption key (KEK)
      return key.toString('base64');
    }

    const cipher = crypto.createCipher('aes-256-cbc', this.config.encryptionKey);
    let encrypted = cipher.update(key);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('base64');
  }

  private decryptKeyFromStorage(encryptedKey: string): Buffer {
    if (!this.config.encryptionKey) {
      // If no encryption key provided, assume it's base64 encoded
      return Buffer.from(encryptedKey, 'base64');
    }

    const decipher = crypto.createDecipher('aes-256-cbc', this.config.encryptionKey);
    let decrypted = decipher.update(Buffer.from(encryptedKey, 'base64'));
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted;
  }

  private async storeKeyInDatabase(keyRecord: any): Promise<boolean> {
    if (!this.supabase) {
      throw new Error('Supabase not configured');
    }

    const { error } = await this.supabase
      .from(this.config.databaseTable || 'encryption_keys')
      .insert(keyRecord);

    if (error) {
      console.error('Database storage error:', error);
      return false;
    }

    return true;
  }

  private async retrieveKeyFromDatabase(keyId: string): Promise<any> {
    if (!this.supabase) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await this.supabase
      .from(this.config.databaseTable || 'encryption_keys')
      .select('*')
      .eq('key_id', keyId)
      .single();

    if (error) {
      console.error('Database retrieval error:', error);
      return null;
    }

    return data;
  }

  private async listKeysFromDatabase(): Promise<any[]> {
    if (!this.supabase) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await this.supabase
      .from(this.config.databaseTable || 'encryption_keys')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database list error:', error);
      return [];
    }

    return data || [];
  }

  private async updateKeyStatus(keyId: string, status: string): Promise<boolean> {
    if (!this.supabase) {
      throw new Error('Supabase not configured');
    }

    const { error } = await this.supabase
      .from(this.config.databaseTable || 'encryption_keys')
      .update({ status })
      .eq('key_id', keyId);

    if (error) {
      console.error('Database update error:', error);
      return false;
    }

    return true;
  }

  private async storeKeyInFile(keyRecord: any): Promise<boolean> {
    // File storage implementation would go here
    console.warn('File storage not implemented');
    return false;
  }

  private async retrieveKeyFromFile(keyId: string): Promise<any> {
    // File storage implementation would go here
    console.warn('File storage not implemented');
    return null;
  }

  private async listKeysFromFile(): Promise<any[]> {
    // File storage implementation would go here
    console.warn('File storage not implemented');
    return [];
  }

  private async storeKeyInAWSKMS(keyRecord: any): Promise<boolean> {
    // AWS KMS implementation would go here
    console.warn('AWS KMS storage not implemented');
    return false;
  }

  private async retrieveKeyFromAWSKMS(keyId: string): Promise<any> {
    // AWS KMS implementation would go here
    console.warn('AWS KMS storage not implemented');
    return null;
  }

  private async listKeysFromAWSKMS(): Promise<any[]> {
    // AWS KMS implementation would go here
    console.warn('AWS KMS storage not implemented');
    return [];
  }

  private async storeKeyInAzureKeyVault(keyRecord: any): Promise<boolean> {
    // Azure Key Vault implementation would go here
    console.warn('Azure Key Vault storage not implemented');
    return false;
  }

  private async retrieveKeyFromAzureKeyVault(keyId: string): Promise<any> {
    // Azure Key Vault implementation would go here
    console.warn('Azure Key Vault storage not implemented');
    return null;
  }

  private async listKeysFromAzureKeyVault(): Promise<any[]> {
    // Azure Key Vault implementation would go here
    console.warn('Azure Key Vault storage not implemented');
    return [];
  }

  private logKeyAction(keyId: string, action: string, details: Record<string, any>): void {
    const logEntry: KeyAuditLog = {
      keyId,
      action: action as any,
      timestamp: new Date(),
      details
    };

    this.auditLog.push(logEntry);

    // Keep only last 1000 audit entries
    if (this.auditLog.length > 1000) {
      this.auditLog = this.auditLog.slice(-1000);
    }
  }

  private async initializeKeyStorage(): Promise<void> {
    // Create database table if using database storage
    if (this.config.storageType === 'database' && this.supabase) {
      try {
        await this.supabase.rpc('create_encryption_keys_table');
        console.log('✅ Encryption keys table initialized');
      } catch (error) {
        console.warn('⚠️ Could not initialize encryption keys table:', error);
      }
    }
  }
}

export const keyManager = new KeyManager({
  storageType: 'database',
  databaseTable: 'encryption_keys',
  encryptionKey: process.env.KEY_ENCRYPTION_KEY
});
