import { createClient } from '@supabase/supabase-js';

// Types
export interface AlertRule {
  id: string;
  name: string;
  description: string;
  condition: AlertCondition;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  notificationChannels: string[];
  escalationPolicy?: string;
  suppressionRules?: AlertSuppressionRule[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface AlertCondition {
  metric: string;
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne' | 'contains' | 'regex';
  threshold: number | string;
  timeWindow: number; // in minutes
  aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count';
  groupBy?: string[];
  filters?: Record<string, any>;
}

export interface AlertSuppressionRule {
  id: string;
  name: string;
  condition: string;
  duration: number; // in minutes
  isActive: boolean;
}

export interface NotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'slack' | 'webhook' | 'sms';
  config: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface AlertInstance {
  id: string;
  ruleId: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'firing' | 'resolved' | 'suppressed';
  labels: Record<string, string>;
  annotations: Record<string, string>;
  startedAt: string;
  resolvedAt?: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  escalationLevel: number;
  nextEscalationAt?: string;
}

export interface EscalationPolicy {
  id: string;
  name: string;
  description: string;
  levels: EscalationLevel[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface EscalationLevel {
  level: number;
  delay: number; // in minutes
  notificationChannels: string[];
  conditions?: Record<string, any>;
}

export class AlertManagerService {
  private supabase: any;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  // Alert Rules Management
  async getAlertRules(filters: { isActive?: boolean; createdBy?: string } = {}): Promise<AlertRule[]> {
    let query = this.supabase
      .from('alert_rules')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }
    if (filters.createdBy) {
      query = query.eq('created_by', filters.createdBy);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async createAlertRule(rule: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<AlertRule> {
    const { data, error } = await this.supabase
      .from('alert_rules')
      .insert({
        ...rule,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateAlertRule(id: string, updates: Partial<AlertRule>): Promise<AlertRule> {
    const { data, error } = await this.supabase
      .from('alert_rules')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteAlertRule(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('alert_rules')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Notification Channels Management
  async getNotificationChannels(): Promise<NotificationChannel[]> {
    const { data, error } = await this.supabase
      .from('notification_channels')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async createNotificationChannel(channel: Omit<NotificationChannel, 'id' | 'createdAt' | 'updatedAt'>): Promise<NotificationChannel> {
    const { data, error } = await this.supabase
      .from('notification_channels')
      .insert({
        ...channel,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateNotificationChannel(id: string, updates: Partial<NotificationChannel>): Promise<NotificationChannel> {
    const { data, error } = await this.supabase
      .from('notification_channels')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteNotificationChannel(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('notification_channels')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Alert Instances Management
  async getAlertInstances(filters: {
    ruleId?: string;
    status?: string;
    severity?: string;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<AlertInstance[]> {
    let query = this.supabase
      .from('alert_instances')
      .select('*')
      .order('started_at', { ascending: false });

    if (filters.ruleId) query = query.eq('rule_id', filters.ruleId);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.severity) query = query.eq('severity', filters.severity);
    if (filters.startDate) query = query.gte('started_at', filters.startDate);
    if (filters.endDate) query = query.lte('started_at', filters.endDate);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async createAlertInstance(instance: Omit<AlertInstance, 'id'>): Promise<AlertInstance> {
    const { data, error } = await this.supabase
      .from('alert_instances')
      .insert(instance)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateAlertInstance(id: string, updates: Partial<AlertInstance>): Promise<AlertInstance> {
    const { data, error } = await this.supabase
      .from('alert_instances')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async acknowledgeAlert(instanceId: string, acknowledgedBy: string): Promise<void> {
    await this.updateAlertInstance(instanceId, {
      acknowledgedAt: new Date().toISOString(),
      acknowledgedBy
    });
  }

  async resolveAlert(instanceId: string): Promise<void> {
    await this.updateAlertInstance(instanceId, {
      status: 'resolved',
      resolvedAt: new Date().toISOString()
    });
  }

  // Escalation Policies Management
  async getEscalationPolicies(): Promise<EscalationPolicy[]> {
    const { data, error } = await this.supabase
      .from('escalation_policies')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async createEscalationPolicy(policy: Omit<EscalationPolicy, 'id' | 'createdAt' | 'updatedAt'>): Promise<EscalationPolicy> {
    const { data, error } = await this.supabase
      .from('escalation_policies')
      .insert({
        ...policy,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateEscalationPolicy(id: string, updates: Partial<EscalationPolicy>): Promise<EscalationPolicy> {
    const { data, error } = await this.supabase
      .from('escalation_policies')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Alert Evaluation and Processing
  async evaluateAlertRules(): Promise<void> {
    const rules = await this.getAlertRules({ isActive: true });
    
    for (const rule of rules) {
      try {
        const isTriggered = await this.evaluateCondition(rule.condition);
        
        if (isTriggered) {
          await this.createAlertInstance({
            ruleId: rule.id,
            title: rule.name,
            description: rule.description,
            severity: rule.severity,
            status: 'firing',
            labels: {},
            annotations: {},
            startedAt: new Date().toISOString(),
            escalationLevel: 0,
            nextEscalationAt: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes default
          });

          // Send notifications
          await this.sendNotifications(rule, rule.notificationChannels);
        }
      } catch (error) {
        console.error(`Error evaluating alert rule ${rule.id}:`, error);
      }
    }
  }

  private async evaluateCondition(condition: AlertCondition): Promise<boolean> {
    // This is a simplified evaluation - in production, you'd integrate with your metrics system
    // For now, we'll simulate some basic conditions
    
    switch (condition.metric) {
      case 'error_rate':
        // Simulate error rate check
        return Math.random() > 0.8; // 20% chance of triggering
      
      case 'response_time':
        // Simulate response time check
        return Math.random() > 0.9; // 10% chance of triggering
      
      case 'cpu_usage':
        // Simulate CPU usage check
        return Math.random() > 0.85; // 15% chance of triggering
      
      case 'memory_usage':
        // Simulate memory usage check
        return Math.random() > 0.9; // 10% chance of triggering
      
      default:
        return false;
    }
  }

  private async sendNotifications(rule: AlertRule, channelIds: string[]): Promise<void> {
    const channels = await this.getNotificationChannels();
    const activeChannels = channels.filter(ch => channelIds.includes(ch.id));

    for (const channel of activeChannels) {
      try {
        await this.sendNotification(channel, rule);
      } catch (error) {
        console.error(`Error sending notification via ${channel.type}:`, error);
      }
    }
  }

  private async sendNotification(channel: NotificationChannel, rule: AlertRule): Promise<void> {
    const message = {
      title: `Alert: ${rule.name}`,
      message: rule.description,
      severity: rule.severity,
      timestamp: new Date().toISOString()
    };

    switch (channel.type) {
      case 'email':
        // Send email notification
        console.log('Sending email notification:', message);
        break;
      
      case 'slack':
        // Send Slack notification
        console.log('Sending Slack notification:', message);
        break;
      
      case 'webhook':
        // Send webhook notification
        console.log('Sending webhook notification:', message);
        break;
      
      case 'sms':
        // Send SMS notification
        console.log('Sending SMS notification:', message);
        break;
    }
  }

  // Statistics and Monitoring
  async getAlertStats(): Promise<{
    totalRules: number;
    activeRules: number;
    firingAlerts: number;
    resolvedAlerts: number;
    acknowledgedAlerts: number;
    alertsBySeverity: Array<{ severity: string; count: number }>;
    alertsByRule: Array<{ ruleName: string; count: number }>;
    averageResolutionTime: number; // in minutes
  }> {
    const [rules, instances] = await Promise.all([
      this.getAlertRules(),
      this.getAlertInstances()
    ]);

    const activeRules = rules.filter(r => r.isActive).length;
    const firingAlerts = instances.filter(i => i.status === 'firing').length;
    const resolvedAlerts = instances.filter(i => i.status === 'resolved').length;
    const acknowledgedAlerts = instances.filter(i => i.acknowledgedAt).length;

    // Calculate alerts by severity
    const alertsBySeverity = instances.reduce((acc, instance) => {
      acc[instance.severity] = (acc[instance.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate alerts by rule
    const alertsByRule = instances.reduce((acc, instance) => {
      const rule = rules.find(r => r.id === instance.ruleId);
      const ruleName = rule?.name || 'Unknown';
      acc[ruleName] = (acc[ruleName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate average resolution time
    const resolvedInstances = instances.filter(i => i.resolvedAt && i.startedAt);
    const averageResolutionTime = resolvedInstances.length > 0 
      ? resolvedInstances.reduce((sum, instance) => {
          const start = new Date(instance.startedAt).getTime();
          const end = new Date(instance.resolvedAt!).getTime();
          return sum + (end - start) / (1000 * 60); // Convert to minutes
        }, 0) / resolvedInstances.length
      : 0;

    return {
      totalRules: rules.length,
      activeRules,
      firingAlerts,
      resolvedAlerts,
      acknowledgedAlerts,
      alertsBySeverity: Object.entries(alertsBySeverity).map(([severity, count]) => ({ severity, count })),
      alertsByRule: Object.entries(alertsByRule).map(([ruleName, count]) => ({ ruleName, count })),
      averageResolutionTime: Math.round(averageResolutionTime)
    };
  }

  // Maintenance and Cleanup
  async cleanupOldAlerts(daysToKeep: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const { error } = await this.supabase
      .from('alert_instances')
      .delete()
      .lt('started_at', cutoffDate.toISOString())
      .eq('status', 'resolved');

    if (error) throw error;
  }

  // Suppression Rules
  async isAlertSuppressed(ruleId: string, labels: Record<string, string>): Promise<boolean> {
    const rules = await this.getAlertRules({ isActive: true });
    const rule = rules.find(r => r.id === ruleId);
    
    if (!rule?.suppressionRules) return false;

    for (const suppressionRule of rule.suppressionRules) {
      if (!suppressionRule.isActive) continue;
      
      // Simple condition evaluation - in production, use a proper expression evaluator
      if (this.evaluateSuppressionCondition(suppressionRule.condition, labels)) {
        return true;
      }
    }

    return false;
  }

  private evaluateSuppressionCondition(condition: string, labels: Record<string, string>): boolean {
    // Simple condition evaluation - in production, use a proper expression evaluator
    // This is a basic implementation that checks for label matches
    try {
      // Example: "severity == 'low' && environment == 'staging'"
      const expression = condition.replace(/(\w+)/g, (match) => {
        if (labels[match]) return `"${labels[match]}"`;
        return match;
      });
      
      // This is a simplified evaluation - in production, use a proper expression evaluator
      return eval(expression);
    } catch {
      return false;
    }
  }
}

export const alertManagerService = new AlertManagerService();
