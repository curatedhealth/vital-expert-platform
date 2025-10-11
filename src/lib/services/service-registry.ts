/**
 * Service Registry
 * Manages service registration, discovery, and metadata
 */

import { createClient } from '@supabase/supabase-js';

import type { Service } from './service-discovery';

export interface ServiceRegistration {
  id: string;
  name: string;
  type: string;
  url: string;
  version: string;
  status: string;
  lastHealthCheck: string;
  metadata: Record<string, any>;
  healthCheck: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceQuery {
  type?: string;
  status?: string;
  environment?: string;
  region?: string;
  capabilities?: string[];
  limit?: number;
  offset?: number;
}

export interface ServiceMetrics {
  totalServices: number;
  servicesByType: Record<string, number>;
  servicesByStatus: Record<string, number>;
  servicesByEnvironment: Record<string, number>;
  averageResponseTime: number;
  uptimePercentage: number;
}

export class ServiceRegistry {
  private supabase: any;
  private cache: Map<string, Service> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private cacheTTL: number = 300000; // 5 minutes

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (supabaseUrl && supabaseServiceKey) {
      this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    } else {
      console.warn('⚠️ Supabase not configured - service registry will use in-memory storage only');
    }
  }

  /**
   * Register a service in the registry
   */
  async registerService(service: Service): Promise<boolean> {
    try {
      console.log(`📝 Registering service: ${service.name} (${service.id})`);
      
      // Store in cache
      this.cache.set(service.id, service);
      this.cacheExpiry.set(service.id, Date.now() + this.cacheTTL);
      
      // Store in database if available
      if (this.supabase) {
        await this.storeServiceInDatabase(service);
      }
      
      console.log(`✅ Service ${service.name} registered successfully`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to register service ${service.name}:`, error);
      return false;
    }
  }

  /**
   * Unregister a service from the registry
   */
  async unregisterService(serviceId: string): Promise<boolean> {
    try {
      console.log(`🗑️ Unregistering service: ${serviceId}`);
      
      // Remove from cache
      this.cache.delete(serviceId);
      this.cacheExpiry.delete(serviceId);
      
      // Remove from database if available
      if (this.supabase) {
        await this.removeServiceFromDatabase(serviceId);
      }
      
      console.log(`✅ Service ${serviceId} unregistered successfully`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to unregister service ${serviceId}:`, error);
      return false;
    }
  }

  /**
   * Get a service by ID
   */
  async getService(serviceId: string): Promise<Service | null> {
    // Check cache first
    if (this.cache.has(serviceId)) {
      const expiry = this.cacheExpiry.get(serviceId);
      if (expiry && Date.now() < expiry) {
        return this.cache.get(serviceId) || null;
      } else {
        // Cache expired, remove it
        this.cache.delete(serviceId);
        this.cacheExpiry.delete(serviceId);
      }
    }
    
    // Load from database if available
    if (this.supabase) {
      try {
        const service = await this.loadServiceFromDatabase(serviceId);
        if (service) {
          // Cache the service
          this.cache.set(serviceId, service);
          this.cacheExpiry.set(serviceId, Date.now() + this.cacheTTL);
          return service;
        }
      } catch (error) {
        console.error(`Failed to load service ${serviceId} from database:`, error);
      }
    }
    
    return null;
  }

  /**
   * Query services with filters
   */
  async queryServices(query: ServiceQuery): Promise<Service[]> {
    // If no database, return cached services
    if (!this.supabase) {
      return this.queryCachedServices(query);
    }
    
    try {
      // Build database query
      let dbQuery = this.supabase
        .from('service_registry')
        .select('*');
      
      // Apply filters
      if (query.type) {
        dbQuery = dbQuery.eq('type', query.type);
      }
      
      if (query.status) {
        dbQuery = dbQuery.eq('status', query.status);
      }
      
      if (query.environment) {
        dbQuery = dbQuery.eq('metadata->environment', query.environment);
      }
      
      if (query.region) {
        dbQuery = dbQuery.eq('metadata->region', query.region);
      }
      
      if (query.capabilities && query.capabilities.length > 0) {
        dbQuery = dbQuery.contains('metadata->capabilities', query.capabilities);
      }
      
      // Apply pagination
      if (query.limit) {
        dbQuery = dbQuery.limit(query.limit);
      }
      
      if (query.offset) {
        dbQuery = dbQuery.range(query.offset, query.offset + (query.limit || 10) - 1);
      }
      
      // Execute query
      const { data, error } = await dbQuery;
      
      if (error) {
        console.error('Database query failed:', error);
        return this.queryCachedServices(query);
      }
      
      // Convert database records to Service objects
      const services = data.map(this.convertDatabaseRecordToService);
      
      // Update cache
      services.forEach(service => {
        this.cache.set(service.id, service);
        this.cacheExpiry.set(service.id, Date.now() + this.cacheTTL);
      });
      
      return services;
    } catch (error) {
      console.error('Failed to query services from database:', error);
      return this.queryCachedServices(query);
    }
  }

  /**
   * Update service status
   */
  async updateServiceStatus(serviceId: string, status: string): Promise<boolean> {
    try {
      // Update cache
      const service = this.cache.get(serviceId);
      if (service) {
        service.status = status as any;
        service.lastHealthCheck = new Date();
        this.cache.set(serviceId, service);
      }
      
      // Update database if available
      if (this.supabase) {
        await this.supabase
          .from('service_registry')
          .update({
            status,
            last_health_check: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', serviceId);
      }
      
      return true;
    } catch (error) {
      console.error(`Failed to update service status for ${serviceId}:`, error);
      return false;
    }
  }

  /**
   * Get service metrics
   */
  async getServiceMetrics(): Promise<ServiceMetrics> {
    try {
      if (!this.supabase) {
        return this.getCachedServiceMetrics();
      }
      
      // Get total services
      const { count: totalServices } = await this.supabase
        .from('service_registry')
        .select('*', { count: 'exact', head: true });
      
      // Get services by type
      const { data: typeData } = await this.supabase
        .from('service_registry')
        .select('type');
      
      const servicesByType = typeData?.reduce((acc: Record<string, number>, record: any) => {
        acc[record.type] = (acc[record.type] || 0) + 1;
        return acc;
      }, {}) || {};
      
      // Get services by status
      const { data: statusData } = await this.supabase
        .from('service_registry')
        .select('status');
      
      const servicesByStatus = statusData?.reduce((acc: Record<string, number>, record: any) => {
        acc[record.status] = (acc[record.status] || 0) + 1;
        return acc;
      }, {}) || {};
      
      // Get services by environment
      const { data: envData } = await this.supabase
        .from('service_registry')
        .select('metadata');
      
      const servicesByEnvironment = envData?.reduce((acc: Record<string, number>, record: any) => {
        const env = record.metadata?.environment || 'unknown';
        acc[env] = (acc[env] || 0) + 1;
        return acc;
      }, {}) || {};
      
      return {
        totalServices: totalServices || 0,
        servicesByType,
        servicesByStatus,
        servicesByEnvironment,
        averageResponseTime: 0, // Would need health check data
        uptimePercentage: 0 // Would need health check data
      };
    } catch (error) {
      console.error('Failed to get service metrics:', error);
      return this.getCachedServiceMetrics();
    }
  }

  /**
   * Search services by name or capabilities
   */
  async searchServices(searchTerm: string, limit: number = 10): Promise<Service[]> {
    try {
      if (!this.supabase) {
        return this.searchCachedServices(searchTerm, limit);
      }
      
      const { data, error } = await this.supabase
        .from('service_registry')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,metadata->capabilities.cs.{${searchTerm}}`)
        .limit(limit);
      
      if (error) {
        console.error('Search failed:', error);
        return this.searchCachedServices(searchTerm, limit);
      }
      
      return data.map(this.convertDatabaseRecordToService);
    } catch (error) {
      console.error('Failed to search services:', error);
      return this.searchCachedServices(searchTerm, limit);
    }
  }

  /**
   * Get services by capability
   */
  async getServicesByCapability(capability: string): Promise<Service[]> {
    const query: ServiceQuery = {
      capabilities: [capability],
      limit: 50
    };
    
    return this.queryServices(query);
  }

  /**
   * Cleanup expired cache entries
   */
  cleanupCache(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    for (const [key, expiry] of this.cacheExpiry.entries()) {
      if (now >= expiry) {
        expiredKeys.push(key);
      }
    }
    
    expiredKeys.forEach(key => {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
    });
    
    if (expiredKeys.length > 0) {
      console.log(`🧹 Cleaned up ${expiredKeys.length} expired cache entries`);
    }
  }

  // Private helper methods
  private async storeServiceInDatabase(service: Service): Promise<void> {
    if (!this.supabase) return;
    
    const registration: ServiceRegistration = {
      id: service.id,
      name: service.name,
      type: service.type,
      url: service.url,
      version: service.version,
      status: service.status,
      lastHealthCheck: service.lastHealthCheck.toISOString(),
      metadata: service.metadata,
      healthCheck: service.healthCheck,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await this.supabase
      .from('service_registry')
      .upsert(registration);
  }

  private async removeServiceFromDatabase(serviceId: string): Promise<void> {
    if (!this.supabase) return;
    
    await this.supabase
      .from('service_registry')
      .delete()
      .eq('id', serviceId);
  }

  private async loadServiceFromDatabase(serviceId: string): Promise<Service | null> {
    if (!this.supabase) return null;
    
    const { data, error } = await this.supabase
      .from('service_registry')
      .select('*')
      .eq('id', serviceId)
      .single();
    
    if (error) {
      console.error(`Failed to load service ${serviceId}:`, error);
      return null;
    }
    
    return this.convertDatabaseRecordToService(data);
  }

  private convertDatabaseRecordToService(record: any): Service {
    return {
      id: record.id,
      name: record.name,
      type: record.type,
      url: record.url,
      version: record.version,
      status: record.status,
      lastHealthCheck: new Date(record.last_health_check),
      metadata: record.metadata || {},
      healthCheck: record.health_check || {
        endpoint: '/health',
        interval: 30,
        timeout: 5000,
        retries: 3,
        expectedStatus: [200]
      }
    };
  }

  private queryCachedServices(query: ServiceQuery): Service[] {
    let services = Array.from(this.cache.values());
    
    // Apply filters
    if (query.type) {
      services = services.filter(s => s.type === query.type);
    }
    
    if (query.status) {
      services = services.filter(s => s.status === query.status);
    }
    
    if (query.environment) {
      services = services.filter(s => s.metadata.environment === query.environment);
    }
    
    if (query.region) {
      services = services.filter(s => s.metadata.region === query.region);
    }
    
    if (query.capabilities && query.capabilities.length > 0) {
      services = services.filter(s => 
        query.capabilities!.every(cap => s.metadata.capabilities?.includes(cap))
      );
    }
    
    // Apply pagination
    if (query.offset) {
      services = services.slice(query.offset);
    }
    
    if (query.limit) {
      services = services.slice(0, query.limit);
    }
    
    return services;
  }

  private searchCachedServices(searchTerm: string, limit: number): Service[] {
    const services = Array.from(this.cache.values());
    const term = searchTerm.toLowerCase();
    
    return services
      .filter(service => 
        service.name.toLowerCase().includes(term) ||
        service.metadata.capabilities?.some((cap: string) => 
          cap.toLowerCase().includes(term)
        )
      )
      .slice(0, limit);
  }

  private getCachedServiceMetrics(): ServiceMetrics {
    const services = Array.from(this.cache.values());
    
    const servicesByType = services.reduce((acc, service) => {
      acc[service.type] = (acc[service.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const servicesByStatus = services.reduce((acc, service) => {
      acc[service.status] = (acc[service.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const servicesByEnvironment = services.reduce((acc, service) => {
      const env = service.metadata.environment || 'unknown';
      acc[env] = (acc[env] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalServices: services.length,
      servicesByType,
      servicesByStatus,
      servicesByEnvironment,
      averageResponseTime: 0,
      uptimePercentage: 0
    };
  }
}

export const serviceRegistry = new ServiceRegistry();
