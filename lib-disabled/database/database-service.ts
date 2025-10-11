/**
 * Database Service Wrapper
 * Provides graceful fallback to mock data when database is not available
 */

import { createClient } from '@supabase/supabase-js';
import { mockDatabase } from './mock-database';

export class DatabaseService {
  private static instance: DatabaseService;
  private supabase: any = null;
  private isConnected: boolean = false;
  private useMockData: boolean = true;

  constructor() {
    // Lazy initialization - don't create Supabase client in constructor
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private initializeSupabase() {
    if (this.supabase) return; // Already initialized
    
    try {
      // Always use cloud instance - local Supabase is deprecated
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xazinxsiglqokwfmogyk.supabase.co';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODkzNzgsImV4cCI6MjA1MDI2NTM3OH0.5qrfkThPewEuFize6meh47xngCvg_9FRKcepFZ7IxsY';

      if (supabaseUrl && supabaseKey) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
        this.isConnected = true;
        this.useMockData = false;
        console.log('✅ Database connected to cloud instance:', supabaseUrl);
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
    this.initializeSupabase(); // Ensure Supabase client is initialized
    
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
