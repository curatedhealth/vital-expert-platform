import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SecureLogger, StructuredLogger } from '@/infrastructure/monitoring/logger/secure-logger';

describe('SecureLogger', () => {
  let logger: SecureLogger;
  let consoleSpy: any;

  beforeEach(() => {
    logger = new SecureLogger();
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('sanitize', () => {
    it('should sanitize sensitive fields in objects', () => {
      const data = {
        userId: 'user123',
        password: 'secret123',
        message: 'Hello world',
        email: 'user@example.com',
        apiKey: 'key123',
        normalField: 'normal value'
      };

      const sanitized = logger.sanitize(data);

      expect(sanitized.userId).toMatch(/^[a-f0-9]{8}$/); // Hashed
      expect(sanitized.password).toBe('[REDACTED]');
      expect(sanitized.message).toBe('[8 chars]');
      expect(sanitized.email).toBe('[REDACTED]');
      expect(sanitized.apiKey).toBe('[REDACTED]');
      expect(sanitized.normalField).toBe('normal value');
    });

    it('should sanitize nested objects', () => {
      const data = {
        user: {
          id: 'user123',
          password: 'secret123',
          profile: {
            email: 'user@example.com',
            name: 'John Doe'
          }
        },
        sessionId: 'session123'
      };

      const sanitized = logger.sanitize(data);

      expect(sanitized.user.id).toMatch(/^[a-f0-9]{8}$/);
      expect(sanitized.user.password).toBe('[REDACTED]');
      expect(sanitized.user.profile.email).toBe('[REDACTED]');
      expect(sanitized.user.profile.name).toBe('John Doe');
      expect(sanitized.sessionId).toMatch(/^[a-f0-9]{8}$/);
    });

    it('should sanitize arrays', () => {
      const data = {
        users: [
          { id: 'user1', password: 'pass1' },
          { id: 'user2', password: 'pass2' }
        ],
        messages: ['Hello', 'World']
      };

      const sanitized = logger.sanitize(data);

      expect(sanitized.users).toHaveLength(2);
      expect(sanitized.users[0].id).toMatch(/^[a-f0-9]{8}$/);
      expect(sanitized.users[0].password).toBe('[REDACTED]');
      expect(sanitized.users[1].id).toMatch(/^[a-f0-9]{8}$/);
      expect(sanitized.users[1].password).toBe('[REDACTED]');
      expect(sanitized.messages[0]).toBe('[5 chars]');
      expect(sanitized.messages[1]).toBe('[5 chars]');
    });

    it('should handle null and undefined values', () => {
      const data = {
        userId: null,
        password: undefined,
        message: 'test',
        empty: ''
      };

      const sanitized = logger.sanitize(data);

      expect(sanitized.userId).toBeNull();
      expect(sanitized.password).toBeUndefined();
      expect(sanitized.message).toBe('[4 chars]');
      expect(sanitized.empty).toBe('[0 chars]');
    });

    it('should handle primitive values', () => {
      expect(logger.sanitize('string')).toBe('string');
      expect(logger.sanitize(123)).toBe(123);
      expect(logger.sanitize(true)).toBe(true);
      expect(logger.sanitize(null)).toBe(null);
      expect(logger.sanitize(undefined)).toBe(undefined);
    });

    it('should handle empty objects and arrays', () => {
      expect(logger.sanitize({})).toEqual({});
      expect(logger.sanitize([])).toEqual([]);
    });

    it('should be case insensitive for sensitive fields', () => {
      const data = {
        USERID: 'user123',
        Password: 'secret123',
        MESSAGE: 'Hello world',
        ApiKey: 'key123'
      };

      const sanitized = logger.sanitize(data);

      expect(sanitized.USERID).toMatch(/^[a-f0-9]{8}$/);
      expect(sanitized.Password).toBe('[REDACTED]');
      expect(sanitized.MESSAGE).toBe('[11 chars]');
      expect(sanitized.ApiKey).toBe('[REDACTED]');
    });

    it('should handle partial matches in field names', () => {
      const data = {
        userPassword: 'secret123',
        userMessage: 'Hello world',
        userEmail: 'user@example.com',
        userApiKey: 'key123'
      };

      const sanitized = logger.sanitize(data);

      expect(sanitized.userPassword).toBe('[REDACTED]');
      expect(sanitized.userMessage).toBe('[11 chars]');
      expect(sanitized.userEmail).toBe('[REDACTED]');
      expect(sanitized.userApiKey).toBe('[REDACTED]');
    });
  });

  describe('log', () => {
    it('should log with sanitized data', () => {
      const message = 'Test log message';
      const data = {
        userId: 'user123',
        password: 'secret123',
        normalField: 'normal value'
      };

      logger.log('info', message, data);

      expect(consoleSpy).toHaveBeenCalledWith(
        JSON.stringify({
          timestamp: expect.any(String),
          level: 'info',
          message,
          data: {
            userId: expect.stringMatching(/^[a-f0-9]{8}$/),
            password: '[REDACTED]',
            normalField: 'normal value'
          }
        })
      );
    });

    it('should log without data', () => {
      const message = 'Test log message';

      logger.log('warn', message);

      expect(consoleSpy).toHaveBeenCalledWith(
        JSON.stringify({
          timestamp: expect.any(String),
          level: 'warn',
          message,
          data: undefined
        })
      );
    });

    it('should include timestamp in correct format', () => {
      const message = 'Test log message';
      const beforeTime = new Date().toISOString();

      logger.log('info', message);

      const afterTime = new Date().toISOString();
      const logCall = consoleSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);

      expect(logData.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(logData.timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(logData.timestamp).toBeLessThanOrEqual(afterTime);
    });

    it('should handle all log levels', () => {
      const message = 'Test message';
      const data = { userId: 'user123' };

      logger.log('info', message, data);
      logger.log('warn', message, data);
      logger.log('error', message, data);

      expect(consoleSpy).toHaveBeenCalledTimes(3);
      
      const calls = consoleSpy.mock.calls;
      expect(JSON.parse(calls[0][0]).level).toBe('info');
      expect(JSON.parse(calls[1][0]).level).toBe('warn');
      expect(JSON.parse(calls[2][0]).level).toBe('error');
    });
  });
});

describe('StructuredLogger', () => {
  let logger: StructuredLogger;
  let consoleSpy: any;

  beforeEach(() => {
    logger = new StructuredLogger('test-service');
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('service-specific logging', () => {
    it('should include service name in logs', () => {
      const message = 'Test message';
      const data = { userId: 'user123' };

      logger.log('info', message, data);

      const logCall = consoleSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);

      expect(logData.service).toBe('test-service');
      expect(logData.level).toBe('info');
      expect(logData.message).toBe(message);
    });

    it('should sanitize data like SecureLogger', () => {
      const message = 'Test message';
      const data = {
        userId: 'user123',
        password: 'secret123',
        normalField: 'normal value'
      };

      logger.log('info', message, data);

      const logCall = consoleSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);

      expect(logData.data.userId).toMatch(/^[a-f0-9]{8}$/);
      expect(logData.data.password).toBe('[REDACTED]');
      expect(logData.data.normalField).toBe('normal value');
    });

    it('should handle different service names', () => {
      const chatLogger = new StructuredLogger('chat-service');
      const agentLogger = new StructuredLogger('agent-service');

      chatLogger.log('info', 'Chat message');
      agentLogger.log('info', 'Agent message');

      const chatLog = JSON.parse(consoleSpy.mock.calls[0][0]);
      const agentLog = JSON.parse(consoleSpy.mock.calls[1][0]);

      expect(chatLog.service).toBe('chat-service');
      expect(agentLog.service).toBe('agent-service');
    });
  });

  describe('inheritance from SecureLogger', () => {
    it('should have sanitize method', () => {
      expect(typeof logger.sanitize).toBe('function');
    });

    it('should sanitize data correctly', () => {
      const data = { userId: 'user123', password: 'secret123' };
      const sanitized = logger.sanitize(data);

      expect(sanitized.userId).toMatch(/^[a-f0-9]{8}$/);
      expect(sanitized.password).toBe('[REDACTED]');
    });
  });
});
