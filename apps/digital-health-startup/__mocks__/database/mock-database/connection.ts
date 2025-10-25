// Mock database connection for development
// This prevents build errors when no real database is configured

export const mockSupabase = {
  from: (table: string) => ({
    select: () => ({
      limit: () => Promise.resolve({ data: [], error: null }),
      eq: () => Promise.resolve({ data: [], error: null }),
      order: () => Promise.resolve({ data: [], error: null })
    }),
    insert: () => Promise.resolve({ data: [], error: null }),
    update: () => Promise.resolve({ data: [], error: null }),
    delete: () => Promise.resolve({ data: [], error: null })
  }),
  rpc: () => Promise.resolve({ data: null, error: null })
};

export default mockSupabase;
