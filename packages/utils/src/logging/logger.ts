type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const shouldLog = (level: LogLevel) => {
  if (typeof window === 'undefined') return true;
  if (process.env.NODE_ENV === 'development') return true;
  return level !== 'debug';
};

export const logger = {
  debug: (message: string, data?: unknown) => {
    if (!shouldLog('debug')) return;
    console.debug(`[DEBUG] ${message}`, data ?? '');
  },
  info: (message: string, data?: unknown) => {
    if (!shouldLog('info')) return;
    console.info(`[INFO] ${message}`, data ?? '');
  },
  warn: (message: string, data?: unknown) => {
    if (!shouldLog('warn')) return;
    console.warn(`[WARN] ${message}`, data ?? '');
  },
  error: (message: string, error?: unknown) => {
    console.error(`[ERROR] ${message}`, error ?? '');
  },
};
