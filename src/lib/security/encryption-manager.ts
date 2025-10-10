/**
 * Encryption Manager
 * Implements comprehensive data encryption for HIPAA compliance
 */

import crypto from 'crypto';

export interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  ivLength: number;
  tagLength: number;
  keyRotationDays: number;
  maxKeyAge: number;
}

export interface EncryptionResult {
  encryptedData: string;
  iv: string;
  tag: string;
  keyId: string;
  algorithm: string;
  timestamp: Date;
}

export interface DecryptionResult {
  decryptedData: string;
  keyId: string;
  algorithm: string;
  timestamp: Date;
}

export interface KeyInfo {
  keyId: string;
  key: Buffer;
  createdAt: Date;
  expiresAt: Date;
  algorithm: string;
  status: 'active' | 'expired' | 'revoked';
}

export interface EncryptionMetrics {
  totalEncryptions: number;
  totalDecryptions: number;
  encryptionErrors: number;
  decryptionErrors: number;
  keyRotations: number;
  averageEncryptionTime: number;
  averageDecryptionTime: number;
}

export class EncryptionManager {
  private config: EncryptionConfig;
  private keys: Map<string, KeyInfo> = new Map();
  private currentKeyId: string | null = null;
  private metrics: EncryptionMetrics = {
    totalEncryptions: 0,
    totalDecryptions: 0,
    encryptionErrors: 0,
    decryptionErrors: 0,
    keyRotations: 0,
    averageEncryptionTime: 0,
    averageDecryptionTime: 0
  };

  constructor(config?: Partial<EncryptionConfig>) {
    this.config = {
      algorithm: 'aes-256-gcm',
      keyLength: 32, // 256 bits
      ivLength: 16,  // 128 bits
      tagLength: 16, // 128 bits
      keyRotationDays: 90,
      maxKeyAge: 90 * 24 * 60 * 60 * 1000, // 90 days in milliseconds
      ...config
    };

    this.initializeKeys();
    this.startKeyRotation();
  }

  /**
   * Initialize encryption keys
   */
  private initializeKeys(): void {
    // Generate initial key
    const keyId = this.generateKeyId();
    const key = this.generateKey();
    const now = new Date();
    
    this.keys.set(keyId, {
      keyId,
      key,
      createdAt: now,
      expiresAt: new Date(now.getTime() + this.config.maxKeyAge),
      algorithm: this.config.algorithm,
      status: 'active'
    });

    this.currentKeyId = keyId;
    console.log(`🔐 Initialized encryption with key: ${keyId}`);
  }

  /**
   * Encrypt data using AES-256-GCM
   */
  async encrypt(data: string, keyId?: string): Promise<EncryptionResult> {
    const startTime = Date.now();
    
    try {
      const targetKeyId = keyId || this.currentKeyId;
      if (!targetKeyId) {
        throw new Error('No encryption key available');
      }

      const keyInfo = this.keys.get(targetKeyId);
      if (!keyInfo || keyInfo.status !== 'active') {
        throw new Error(`Key ${targetKeyId} not found or not active`);
      }

      // Generate random IV
      const iv = crypto.randomBytes(this.config.ivLength);
      
      // Create cipher
      const cipher = crypto.createCipher(this.config.algorithm, keyInfo.key);
      cipher.setAAD(Buffer.from('vital-path-encryption', 'utf8'));

      // Encrypt data
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Get authentication tag
      const tag = cipher.getAuthTag();

      const result: EncryptionResult = {
        encryptedData: encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex'),
        keyId: targetKeyId,
        algorithm: this.config.algorithm,
        timestamp: new Date()
      };

      // Update metrics
      this.updateEncryptionMetrics(Date.now() - startTime, true);

      console.log(`🔐 Encrypted data with key: ${targetKeyId}`);
      return result;

    } catch (error) {
      this.updateEncryptionMetrics(Date.now() - startTime, false);
      console.error('❌ Encryption failed:', error);
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Decrypt data using AES-256-GCM
   */
  async decrypt(encryptionResult: EncryptionResult): Promise<DecryptionResult> {
    const startTime = Date.now();
    
    try {
      const keyInfo = this.keys.get(encryptionResult.keyId);
      if (!keyInfo) {
        throw new Error(`Key ${encryptionResult.keyId} not found`);
      }

      // Convert hex strings back to buffers
      const iv = Buffer.from(encryptionResult.iv, 'hex');
      const tag = Buffer.from(encryptionResult.tag, 'hex');

      // Create decipher
      const decipher = crypto.createDecipher(this.config.algorithm, keyInfo.key);
      decipher.setAAD(Buffer.from('vital-path-encryption', 'utf8'));
      decipher.setAuthTag(tag);

      // Decrypt data
      let decrypted = decipher.update(encryptionResult.encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      const result: DecryptionResult = {
        decryptedData: decrypted,
        keyId: encryptionResult.keyId,
        algorithm: encryptionResult.algorithm,
        timestamp: new Date()
      };

      // Update metrics
      this.updateDecryptionMetrics(Date.now() - startTime, true);

      console.log(`🔓 Decrypted data with key: ${encryptionResult.keyId}`);
      return result;

    } catch (error) {
      this.updateDecryptionMetrics(Date.now() - startTime, false);
      console.error('❌ Decryption failed:', error);
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Encrypt object data
   */
  async encryptObject(obj: any, keyId?: string): Promise<EncryptionResult> {
    const jsonString = JSON.stringify(obj);
    return this.encrypt(jsonString, keyId);
  }

  /**
   * Decrypt object data
   */
  async decryptObject<T = any>(encryptionResult: EncryptionResult): Promise<T> {
    const decryptionResult = await this.decrypt(encryptionResult);
    return JSON.parse(decryptionResult.decryptedData);
  }

  /**
   * Encrypt sensitive fields in an object
   */
  async encryptSensitiveFields(
    obj: any, 
    sensitiveFields: string[], 
    keyId?: string
  ): Promise<{ encrypted: any; encryptionInfo: Record<string, EncryptionResult> }> {
    const encrypted = { ...obj };
    const encryptionInfo: Record<string, EncryptionResult> = {};

    for (const field of sensitiveFields) {
      if (obj[field] && typeof obj[field] === 'string') {
        try {
          const encryptionResult = await this.encrypt(obj[field], keyId);
          encrypted[field] = encryptionResult.encryptedData;
          encryptionInfo[field] = encryptionResult;
        } catch (error) {
          console.error(`Failed to encrypt field ${field}:`, error);
          // Keep original value if encryption fails
        }
      }
    }

    return { encrypted, encryptionInfo };
  }

  /**
   * Decrypt sensitive fields in an object
   */
  async decryptSensitiveFields(
    obj: any, 
    encryptionInfo: Record<string, EncryptionResult>
  ): Promise<any> {
    const decrypted = { ...obj };

    for (const [field, encryptionResult] of Object.entries(encryptionInfo)) {
      try {
        const decryptionResult = await this.decrypt(encryptionResult);
        decrypted[field] = decryptionResult.decryptedData;
      } catch (error) {
        console.error(`Failed to decrypt field ${field}:`, error);
        // Keep encrypted value if decryption fails
      }
    }

    return decrypted;
  }

  /**
   * Rotate encryption keys
   */
  async rotateKeys(): Promise<void> {
    console.log('🔄 Starting key rotation...');
    
    try {
      // Generate new key
      const newKeyId = this.generateKeyId();
      const newKey = this.generateKey();
      const now = new Date();

      this.keys.set(newKeyId, {
        keyId: newKeyId,
        key: newKey,
        createdAt: now,
        expiresAt: new Date(now.getTime() + this.config.maxKeyAge),
        algorithm: this.config.algorithm,
        status: 'active'
      });

      // Mark old key as expired (but keep for decryption)
      if (this.currentKeyId) {
        const oldKey = this.keys.get(this.currentKeyId);
        if (oldKey) {
          oldKey.status = 'expired';
        }
      }

      this.currentKeyId = newKeyId;
      this.metrics.keyRotations++;

      console.log(`✅ Key rotation completed. New key: ${newKeyId}`);

      // Schedule cleanup of old keys
      this.scheduleKeyCleanup();

    } catch (error) {
      console.error('❌ Key rotation failed:', error);
      throw error;
    }
  }

  /**
   * Get current active key ID
   */
  getCurrentKeyId(): string | null {
    return this.currentKeyId;
  }

  /**
   * Get all key information
   */
  getKeys(): KeyInfo[] {
    return Array.from(this.keys.values());
  }

  /**
   * Get encryption metrics
   */
  getMetrics(): EncryptionMetrics {
    return { ...this.metrics };
  }

  /**
   * Check if key needs rotation
   */
  needsKeyRotation(): boolean {
    if (!this.currentKeyId) return true;

    const keyInfo = this.keys.get(this.currentKeyId);
    if (!keyInfo) return true;

    const now = new Date();
    const age = now.getTime() - keyInfo.createdAt.getTime();
    
    return age > this.config.maxKeyAge;
  }

  /**
   * Validate encryption configuration
   */
  validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (this.config.keyLength < 16) {
      errors.push('Key length must be at least 16 bytes (128 bits)');
    }

    if (this.config.ivLength < 12) {
      errors.push('IV length must be at least 12 bytes (96 bits)');
    }

    if (this.config.keyRotationDays < 30) {
      errors.push('Key rotation period must be at least 30 days');
    }

    if (!['aes-256-gcm', 'aes-256-cbc'].includes(this.config.algorithm)) {
      errors.push('Only AES-256-GCM and AES-256-CBC algorithms are supported');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Private helper methods
  private generateKeyId(): string {
    return `key_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  private generateKey(): Buffer {
    return crypto.randomBytes(this.config.keyLength);
  }

  private updateEncryptionMetrics(time: number, success: boolean): void {
    this.metrics.totalEncryptions++;
    if (!success) {
      this.metrics.encryptionErrors++;
    }

    // Update average time
    const totalTime = this.metrics.averageEncryptionTime * (this.metrics.totalEncryptions - 1) + time;
    this.metrics.averageEncryptionTime = totalTime / this.metrics.totalEncryptions;
  }

  private updateDecryptionMetrics(time: number, success: boolean): void {
    this.metrics.totalDecryptions++;
    if (!success) {
      this.metrics.decryptionErrors++;
    }

    // Update average time
    const totalTime = this.metrics.averageDecryptionTime * (this.metrics.totalDecryptions - 1) + time;
    this.metrics.averageDecryptionTime = totalTime / this.metrics.totalDecryptions;
  }

  private startKeyRotation(): void {
    // Check for key rotation every hour
    setInterval(() => {
      if (this.needsKeyRotation()) {
        this.rotateKeys().catch(error => {
          console.error('❌ Automatic key rotation failed:', error);
        });
      }
    }, 60 * 60 * 1000); // 1 hour
  }

  private scheduleKeyCleanup(): void {
    // Clean up expired keys after 30 days
    setTimeout(() => {
      this.cleanupExpiredKeys();
    }, 30 * 24 * 60 * 60 * 1000); // 30 days
  }

  private cleanupExpiredKeys(): void {
    const now = new Date();
    let cleaned = 0;

    for (const [keyId, keyInfo] of this.keys.entries()) {
      if (keyInfo.status === 'expired' && now.getTime() - keyInfo.expiresAt.getTime() > 30 * 24 * 60 * 60 * 1000) {
        this.keys.delete(keyId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired encryption keys`);
    }
  }
}

export const encryptionManager = new EncryptionManager();
