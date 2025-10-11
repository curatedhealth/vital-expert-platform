export const AUTH_CONFIG = {
  superAdminEmails: ['hn@vitalexpert.com'],
  sessionRefreshInterval: 5 * 60 * 1000, // 5 minutes
  redirects: {
    login: '/login',
    afterLogin: '/dashboard',
    adminAfterLogin: '/admin',
    forbidden: '/admin/forbidden'
  },
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
  sessionWaitTime: 500, // 500ms wait before redirect
} as const;
