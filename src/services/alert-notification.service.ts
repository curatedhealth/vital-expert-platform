import { createClient } from '@supabase/supabase-js';

import { ThreatEvent } from './threat-detection.service';

export interface AlertChannel {
  type: 'email' | 'slack' | 'sms' | 'webhook';
  config: Record<string, any>;
  enabled: boolean;
}

export interface AlertTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  channels: string[];
  severity: string[];
}

export interface AlertRule {
  id: string;
  name: string;
  conditions: {
    threatTypes: string[];
    severity: string[];
    organizations?: string[];
    users?: string[];
  };
  channels: string[];
  enabled: boolean;
  cooldownMinutes: number;
}

export class AlertNotificationService {
  private supabase: any;
  private channels: Map<string, AlertChannel> = new Map();
  private templates: Map<string, AlertTemplate> = new Map();
  private rules: Map<string, AlertRule> = new Map();
  private lastAlertTimes: Map<string, number> = new Map();

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    this.initializeChannels();
    this.initializeTemplates();
    this.initializeRules();
  }

  /**
   * Send alert for a threat event
   */
  async sendAlert(threat: ThreatEvent): Promise<void> {
    try {
      // Check if alert should be sent based on rules
      const applicableRules = this.getApplicableRules(threat);
      
      if (applicableRules.length === 0) {
        console.log(`No alert rules applicable for threat ${threat.id}`);
        return;
      }

      // Check cooldown periods
      const rulesToExecute = applicableRules.filter(rule => 
        this.isCooldownExpired(rule.id, rule.cooldownMinutes)
      );

      if (rulesToExecute.length === 0) {
        console.log(`All applicable rules for threat ${threat.id} are in cooldown`);
        return;
      }

      // Send alerts for each applicable rule
      for (const rule of rulesToExecute) {
        await this.sendAlertForRule(threat, rule);
        this.updateLastAlertTime(rule.id);
      }

      // Log alert sent
      await this.logAlertSent(threat, rulesToExecute);

    } catch (error) {
      console.error('Error sending alert:', error);
    }
  }

  /**
   * Send alert for a specific rule
   */
  private async sendAlertForRule(threat: ThreatEvent, rule: AlertRule): Promise<void> {
    const template = this.getTemplateForThreat(threat);
    if (!template) {
      console.error(`No template found for threat type ${threat.type}`);
      return;
    }

    // Send to each channel in the rule
    for (const channelId of rule.channels) {
      const channel = this.channels.get(channelId);
      if (!channel || !channel.enabled) {
        continue;
      }

      try {
        await this.sendToChannel(threat, template, channel);
      } catch (error) {
        console.error(`Error sending alert to channel ${channelId}:`, error);
      }
    }
  }

  /**
   * Send alert to a specific channel
   */
  private async sendToChannel(
    threat: ThreatEvent,
    template: AlertTemplate,
    channel: AlertChannel
  ): Promise<void> {
    const content = this.renderTemplate(template, threat);

    switch (channel.type) {
      case 'email':
        await this.sendEmail(channel.config, content);
        break;
      case 'slack':
        await this.sendSlackMessage(channel.config, content);
        break;
      case 'sms':
        await this.sendSMS(channel.config, content);
        break;
      case 'webhook':
        await this.sendWebhook(channel.config, content);
        break;
      default:
        console.error(`Unknown channel type: ${channel.type}`);
    }
  }

  /**
   * Send email alert
   */
  private async sendEmail(config: any, content: any): Promise<void> {
    // This would integrate with an email service like SendGrid, AWS SES, etc.
    console.log('Sending email alert:', {
      to: config.recipients,
      subject: content.subject,
      body: content.body
    });

    // For now, we'll just log the email content
    // In a real implementation, you would use an email service
  }

  /**
   * Send Slack message
   */
  private async sendSlackMessage(config: any, content: any): Promise<void> {
    const webhookUrl = config.webhookUrl;
    if (!webhookUrl) {
      console.error('Slack webhook URL not configured');
      return;
    }

    const payload = {
      text: content.subject,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${content.subject}*\n\n${content.body}`
          }
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Severity: ${content.severity} | Time: ${content.timestamp}`
            }
          ]
        }
      ]
    };

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Slack API error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error sending Slack message:', error);
    }
  }

  /**
   * Send SMS alert
   */
  private async sendSMS(config: any, content: any): Promise<void> {
    // This would integrate with an SMS service like Twilio, AWS SNS, etc.
    console.log('Sending SMS alert:', {
      to: config.recipients,
      message: content.body
    });
  }

  /**
   * Send webhook alert
   */
  private async sendWebhook(config: any, content: any): Promise<void> {
    const webhookUrl = config.url;
    if (!webhookUrl) {
      console.error('Webhook URL not configured');
      return;
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...config.headers
        },
        body: JSON.stringify(content),
      });

      if (!response.ok) {
        throw new Error(`Webhook error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error sending webhook:', error);
    }
  }

  /**
   * Render template with threat data
   */
  private renderTemplate(template: AlertTemplate, threat: ThreatEvent): any {
    const data = {
      threatId: threat.id,
      threatType: threat.type,
      severity: threat.severity,
      userId: threat.userId,
      organizationId: threat.organizationId,
      ipAddress: threat.ipAddress,
      userAgent: threat.userAgent,
      endpoint: threat.endpoint,
      timestamp: threat.timestamp.toISOString(),
      details: JSON.stringify(threat.details, null, 2)
    };

    let subject = template.subject;
    let body = template.body;

    // Replace placeholders in template
    for (const [key, value] of Object.entries(data)) {
      const placeholder = `{{${key}}}`;
      subject = subject.replace(new RegExp(placeholder, 'g'), String(value || ''));
      body = body.replace(new RegExp(placeholder, 'g'), String(value || ''));
    }

    return {
      subject,
      body,
      severity: threat.severity,
      timestamp: threat.timestamp.toISOString(),
      ...data
    };
  }

  /**
   * Get applicable rules for a threat
   */
  private getApplicableRules(threat: ThreatEvent): AlertRule[] {
    const applicableRules: AlertRule[] = [];

    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;

      const { conditions } = rule;
      
      // Check threat type
      if (conditions.threatTypes.length > 0 && !conditions.threatTypes.includes(threat.type)) {
        continue;
      }

      // Check severity
      if (conditions.severity.length > 0 && !conditions.severity.includes(threat.severity)) {
        continue;
      }

      // Check organization
      if (conditions.organizations && conditions.organizations.length > 0) {
        if (!threat.organizationId || !conditions.organizations.includes(threat.organizationId)) {
          continue;
        }
      }

      // Check user
      if (conditions.users && conditions.users.length > 0) {
        if (!threat.userId || !conditions.users.includes(threat.userId)) {
          continue;
        }
      }

      applicableRules.push(rule);
    }

    return applicableRules;
  }

  /**
   * Get template for threat type
   */
  private getTemplateForThreat(threat: ThreatEvent): AlertTemplate | null {
    // Find template that matches threat type and severity
    for (const template of this.templates.values()) {
      if (template.threatTypes.includes(threat.type) && template.severity.includes(threat.severity)) {
        return template;
      }
    }

    // Fallback to default template
    return this.templates.get('default') || null;
  }

  /**
   * Check if cooldown period has expired
   */
  private isCooldownExpired(ruleId: string, cooldownMinutes: number): boolean {
    const lastAlertTime = this.lastAlertTimes.get(ruleId);
    if (!lastAlertTime) return true;

    const cooldownMs = cooldownMinutes * 60 * 1000;
    return Date.now() - lastAlertTime > cooldownMs;
  }

  /**
   * Update last alert time for a rule
   */
  private updateLastAlertTime(ruleId: string): void {
    this.lastAlertTimes.set(ruleId, Date.now());
  }

  /**
   * Log alert sent
   */
  private async logAlertSent(threat: ThreatEvent, rules: AlertRule[]): Promise<void> {
    const { error } = await this.supabase
      .from('alert_logs')
      .insert({
        threat_id: threat.id,
        threat_type: threat.type,
        severity: threat.severity,
        rules_applied: rules.map(r => r.id),
        sent_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error logging alert:', error);
    }
  }

  /**
   * Initialize alert channels
   */
  private initializeChannels(): void {
    // Email channel
    this.channels.set('email', {
      type: 'email',
      config: {
        recipients: process.env.ALERT_EMAIL_RECIPIENTS?.split(',') || [],
        from: process.env.ALERT_EMAIL_FROM || 'alerts@vitalpath.com'
      },
      enabled: true
    });

    // Slack channel
    this.channels.set('slack', {
      type: 'slack',
      config: {
        webhookUrl: process.env.SLACK_WEBHOOK_URL
      },
      enabled: !!process.env.SLACK_WEBHOOK_URL
    });

    // SMS channel
    this.channels.set('sms', {
      type: 'sms',
      config: {
        recipients: process.env.ALERT_SMS_RECIPIENTS?.split(',') || []
      },
      enabled: !!process.env.ALERT_SMS_RECIPIENTS
    });

    // Webhook channel
    this.channels.set('webhook', {
      type: 'webhook',
      config: {
        url: process.env.ALERT_WEBHOOK_URL,
        headers: {
          'Authorization': `Bearer ${process.env.ALERT_WEBHOOK_TOKEN}`
        }
      },
      enabled: !!process.env.ALERT_WEBHOOK_URL
    });
  }

  /**
   * Initialize alert templates
   */
  private initializeTemplates(): void {
    // Default template
    this.templates.set('default', {
      id: 'default',
      name: 'Default Threat Alert',
      subject: 'Security Alert: {{threatType}} detected',
      body: `A {{severity}} security threat has been detected:

Threat Type: {{threatType}}
Severity: {{severity}}
User ID: {{userId}}
Organization ID: {{organizationId}}
IP Address: {{ipAddress}}
Endpoint: {{endpoint}}
Timestamp: {{timestamp}}

Details:
{{details}}`,
      channels: ['email', 'slack'],
      severity: ['low', 'medium', 'high', 'critical']
    });

    // Critical threat template
    this.templates.set('critical', {
      id: 'critical',
      name: 'Critical Threat Alert',
      subject: '🚨 CRITICAL SECURITY ALERT: {{threatType}}',
      body: `🚨 IMMEDIATE ATTENTION REQUIRED 🚨

A CRITICAL security threat has been detected and requires immediate action:

Threat Type: {{threatType}}
Severity: {{severity}}
User ID: {{userId}}
Organization ID: {{organizationId}}
IP Address: {{ipAddress}}
Endpoint: {{endpoint}}
Timestamp: {{timestamp}}

Details:
{{details}}

Please investigate and take appropriate action immediately.`,
      channels: ['email', 'slack', 'sms'],
      severity: ['critical']
    });
  }

  /**
   * Initialize alert rules
   */
  private initializeRules(): void {
    // Critical threats rule
    this.rules.set('critical_threats', {
      id: 'critical_threats',
      name: 'Critical Security Threats',
      conditions: {
        threatTypes: ['brute_force', 'sql_injection', 'credential_stuffing'],
        severity: ['critical', 'high']
      },
      channels: ['email', 'slack', 'sms'],
      enabled: true,
      cooldownMinutes: 5
    });

    // Medium threats rule
    this.rules.set('medium_threats', {
      id: 'medium_threats',
      name: 'Medium Security Threats',
      conditions: {
        threatTypes: ['unusual_access', 'rate_limit_abuse'],
        severity: ['medium']
      },
      channels: ['email', 'slack'],
      enabled: true,
      cooldownMinutes: 15
    });

    // Low threats rule
    this.rules.set('low_threats', {
      id: 'low_threats',
      name: 'Low Security Threats',
      conditions: {
        threatTypes: ['geographic_anomaly'],
        severity: ['low']
      },
      channels: ['email'],
      enabled: true,
      cooldownMinutes: 60
    });
  }
}

// Singleton instance
let alertNotificationService: AlertNotificationService | null = null;

export function getAlertNotificationService(): AlertNotificationService {
  if (!alertNotificationService) {
    alertNotificationService = new AlertNotificationService();
  }
  return alertNotificationService;
}
