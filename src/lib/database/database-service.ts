/**
 * Database Service Wrapper
 * Provides graceful fallback to mock data when database is not available
 */

import { createClient } from '@supabase/supabase-js';
import { mockDatabase } from './mock-database';

export class DatabaseService {
  private static instance: DatabaseService;
  private supabase: any;
  private isConnected: boolean = false;
  private useMockData: boolean = true;

  constructor() {
    this.initializeSupabase();
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private initializeSupabase() {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('localhost')) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
        this.isConnected = true;
        this.useMockData = false;
        console.log('✅ Database connected successfully');
      } else {
        console.log('🔧 Using mock database for development');
        this.useMockData = true;
      }
    } catch (error) {
      console.log('⚠️ Database connection failed, using mock data:', error);
      this.useMockData = true;
    }
  }

  async query(table: string, operation: string = 'select', data?: any) {
    if (this.useMockData || !this.isConnected) {
      return await mockDatabase.query(table, operation, data);
    }

    try {
      switch (operation) {
        case 'select':
          const { data: result, error } = await this.supabase
            .from(table)
            .select('*');
          return { data: result, error };
        
        case 'insert':
          const { data: insertResult, error: insertError } = await this.supabase
            .from(table)
            .insert(data);
          return { data: insertResult, error: insertError };
        
        case 'update':
          const { data: updateResult, error: updateError } = await this.supabase
            .from(table)
            .update(data);
          return { data: updateResult, error: updateError };
        
        default:
          return { data: [], error: null };
      }
    } catch (error) {
      console.log(`⚠️ Database query failed for ${table}, falling back to mock data:`, error);
      return await mockDatabase.query(table, operation, data);
    }
  }

  async getLLMProviders() {
    return await this.query('llm_providers', 'select');
  }

  async getUsageLogs() {
    return await this.query('llm_usage_logs', 'select');
  }

  isUsingMockData(): boolean {
    return this.useMockData;
  }

  isDatabaseConnected(): boolean {
    return this.isConnected;
  }
}

export const databaseService = DatabaseService.getInstance();
