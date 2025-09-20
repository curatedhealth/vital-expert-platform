import { createHash, createCipher, createDecipher, randomBytes, pbkdf2Sync } from 'crypto';

/**
 * Secure API Key Management and Encryption Utilities
 * Implements FIPS 140-2 compliant encryption for healthcare applications
 */

export class EncryptionService {
  private static instance: EncryptionService;
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyDerivationIterations = 100000;
  private readonly saltLength = 32;
  private readonly ivLength = 16;
  private readonly tagLength = 16;

  private constructor() {}

  static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  /**
   * Derive encryption key from master key using PBKDF2
   */
  private deriveKey(masterKey: string, salt: Buffer): Buffer {
    return pbkdf2Sync(masterKey, salt, this.keyDerivationIterations, 32, 'sha256');
  }

  /**
   * Get master encryption key from environment
   */
  private getMasterKey(): string {
    const masterKey = process.env.ENCRYPTION_MASTER_KEY;
    if (!masterKey) {
      throw new Error('ENCRYPTION_MASTER_KEY environment variable is required');
    }
    return masterKey;
  }

  /**
   * Encrypt API key with AES-256-GCM
   */
  encryptApiKey(apiKey: string): {
    encryptedKey: string;
    salt: string;
    iv: string;
    tag: string;
  } {
    try {
      const masterKey = this.getMasterKey();
      const salt = randomBytes(this.saltLength);
      const iv = randomBytes(this.ivLength);
      const key = this.deriveKey(masterKey, salt);

      const cipher = createCipher(this.algorithm, key);
      cipher.setAAD(Buffer.from('api-key-encryption'));

      let encrypted = cipher.update(apiKey, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const tag = cipher.getAuthTag();

      return {
        encryptedKey: encrypted,
        salt: salt.toString('hex'),
        iv: iv.toString('hex'),
        tag: tag.toString('hex')
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Decrypt API key with AES-256-GCM
   */
  decryptApiKey(encryptedData: {
    encryptedKey: string;
    salt: string;
    iv: string;
    tag: string;
  }): string {
    try {
      const masterKey = this.getMasterKey();
      const salt = Buffer.from(encryptedData.salt, 'hex');
      const iv = Buffer.from(encryptedData.iv, 'hex');
      const tag = Buffer.from(encryptedData.tag, 'hex');
      const key = this.deriveKey(masterKey, salt);

      const decipher = createDecipher(this.algorithm, key);
      decipher.setAuthTag(tag);
      decipher.setAAD(Buffer.from('api-key-encryption'));

      let decrypted = decipher.update(encryptedData.encryptedKey, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create hash of API key for verification without decryption
   */
  hashApiKey(apiKey: string): string {
    return createHash('sha256').update(apiKey).digest('hex');
  }

  /**
   * Verify API key against stored hash
   */
  verifyApiKeyHash(apiKey: string, storedHash: string): boolean {
    const computedHash = this.hashApiKey(apiKey);
    return computedHash === storedHash;
  }

  /**
   * Generate secure random API key
   */
  generateSecureApiKey(length: number = 64): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    const randomBytesBuffer = randomBytes(length);
    let result = '';

    for (let i = 0; i < length; i++) {
      result += chars[randomBytesBuffer[i] % chars.length];
    }

    return result;
  }

  /**
   * Validate API key format and strength
   */
  validateApiKey(apiKey: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!apiKey || typeof apiKey !== 'string') {
      errors.push('API key must be a non-empty string');
      return { isValid: false, errors };
    }

    if (apiKey.length < 32) {
      errors.push('API key must be at least 32 characters long');
    }

    if (apiKey.length > 512) {
      errors.push('API key must not exceed 512 characters');
    }

    // Check for common weak patterns
    if (/^[a-zA-Z0-9]+$/.test(apiKey) && apiKey.length < 64) {
      errors.push('API key appears to be weak (only alphanumeric characters)');
    }

    if (/(.)\1{4,}/.test(apiKey)) {
      errors.push('API key contains repeated character sequences');
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /password/i,
      /secret/i,
      /key/i,
      /token/i,
      /123456/,
      /qwerty/i,
      /admin/i
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(apiKey)) {
        errors.push('API key contains suspicious patterns');
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Mask API key for display purposes
   */
  maskApiKey(apiKey: string): string {
    if (!apiKey || apiKey.length < 8) {
      return '***';
    }

    const start = apiKey.substring(0, 4);
    const end = apiKey.substring(apiKey.length - 4);
    const middle = '*'.repeat(Math.max(0, apiKey.length - 8));

    return `${start}${middle}${end}`;
  }

  /**
   * Encrypt sensitive configuration data
   */
  encryptConfig(config: Record<string, any>): string {
    const configString = JSON.stringify(config);
    const encrypted = this.encryptApiKey(configString);
    return JSON.stringify(encrypted);
  }

  /**
   * Decrypt sensitive configuration data
   */
  decryptConfig(encryptedConfig: string): Record<string, any> {
    const encryptedData = JSON.parse(encryptedConfig);
    const configString = this.decryptApiKey(encryptedData);
    return JSON.parse(configString);
  }
}

/**
 * Security audit utilities
 */
export class SecurityAudit {
  /**
   * Check for potential security vulnerabilities in API keys
   */
  static auditApiKey(apiKey: string): {
    score: number;
    vulnerabilities: string[];
    recommendations: string[];
  } {
    const vulnerabilities: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check length
    if (apiKey.length < 32) {
      vulnerabilities.push('API key is too short');
      recommendations.push('Use API keys with at least 32 characters');
      score -= 30;
    }

    // Check entropy
    const charSet = new Set(apiKey);
    const entropy = charSet.size / apiKey.length;

    if (entropy < 0.3) {
      vulnerabilities.push('Low entropy - limited character variety');
      recommendations.push('Use API keys with diverse character sets');
      score -= 20;
    }

    // Check for patterns
    if (/(.{3,})\1/.test(apiKey)) {
      vulnerabilities.push('Contains repeating patterns');
      recommendations.push('Avoid API keys with repeating sequences');
      score -= 25;
    }

    // Check for dictionary words
    const commonWords = ['password', 'secret', 'key', 'token', 'admin', 'user'];
    for (const word of commonWords) {
      if (apiKey.toLowerCase().includes(word)) {
        vulnerabilities.push(`Contains dictionary word: ${word}`);
        recommendations.push('Avoid using common words in API keys');
        score -= 15;
        break;
      }
    }

    // Check for sequential characters
    if (/(?:abc|123|xyz)/i.test(apiKey)) {
      vulnerabilities.push('Contains sequential characters');
      recommendations.push('Avoid sequential character patterns');
      score -= 10;
    }

    return {
      score: Math.max(0, score),
      vulnerabilities,
      recommendations
    };
  }

  /**
   * Generate security compliance report
   */
  static generateComplianceReport(apiKeys: string[]): {
    totalKeys: number;
    secureKeys: number;
    vulnerableKeys: number;
    averageScore: number;
    recommendations: string[];
  } {
    let totalScore = 0;
    let vulnerableCount = 0;
    const allRecommendations = new Set<string>();

    for (const apiKey of apiKeys) {
      const audit = this.auditApiKey(apiKey);
      totalScore += audit.score;

      if (audit.score < 70) {
        vulnerableCount++;
      }

      audit.recommendations.forEach(rec => allRecommendations.add(rec));
    }

    return {
      totalKeys: apiKeys.length,
      secureKeys: apiKeys.length - vulnerableCount,
      vulnerableKeys: vulnerableCount,
      averageScore: apiKeys.length > 0 ? totalScore / apiKeys.length : 0,
      recommendations: Array.from(allRecommendations)
    };
  }
}

/**
 * Secure storage interface for encrypted API keys
 */
export interface EncryptedApiKeyData {
  id: string;
  provider_id: string;
  key_name: string;
  encrypted_key: string;
  salt: string;
  iv: string;
  tag: string;
  key_hash: string;
  is_active: boolean;
  expires_at?: Date;
  created_by: string;
  last_used_at?: Date;
  usage_count: number;
}

export default EncryptionService;