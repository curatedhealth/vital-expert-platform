/**
 * Breach Notification Service
 * Handles all breach-related notifications including regulatory, user, and internal notifications
 */

import { createClient } from '@supabase/supabase-js';

import type { BreachIncident, NotificationResult } from './breach-response-system';

export interface NotificationTemplate {
  id: string;
  type: 'regulatory' | 'user' | 'internal' | 'executive';
  subject: string;
  body: string;
  channels: ('email' | 'sms' | 'webhook' | 'dashboard')[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  requiredFields: string[];
}

export interface NotificationRecipient {
  id: string;
  type: 'user' | 'regulatory' | 'internal' | 'executive';
  email?: string;
  phone?: string;
  name: string;
  role: string;
  department?: string;
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    webhook: boolean;
    dashboard: boolean;
  };
}

export interface NotificationChannel {
  type: 'email' | 'sms' | 'webhook' | 'dashboard';
  enabled: boolean;
  config: Record<string, any>;
  rateLimit?: {
    maxPerMinute: number;
    maxPerHour: number;
  };
}

export class BreachNotificationService {
  private supabase: any;
  private templates: Map<string, NotificationTemplate> = new Map();
  private channels: Map<string, NotificationChannel> = new Map();
  private recipients: Map<string, NotificationRecipient[]> = new Map();

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (supabaseUrl && supabaseServiceKey) {
      this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    }

    this.initializeTemplates();
    this.initializeChannels();
    this.loadRecipients();
  }

  /**
   * Initialize notification templates
   */
  private initializeTemplates(): void {
    // Regulatory notification template
    this.templates.set('regulatory_ocr', {
      id: 'regulatory_ocr',
      type: 'regulatory',
      subject: 'HIPAA Breach Notification - OCR HHS',
      body: `
HIPAA Breach Notification

Incident ID: {{incidentId}}
Date: {{timestamp}}
Severity: {{severity}}
Affected Users: {{affectedUsers}}
Affected Data Types: {{affectedDataTypes}}
Description: {{description}}
Risk Score: {{riskScore}}

This notification is being sent in compliance with HIPAA breach notification requirements.
      `.trim(),
      channels: ['webhook', 'email'],
      priority: 'critical',
      requiredFields: ['incidentId', 'timestamp', 'severity', 'affectedUsers', 'affectedDataTypes']
    });

    // User notification template
    this.templates.set('user_notification', {
      id: 'user_notification',
      type: 'user',
      subject: 'Important: Data Security Incident Notification',
      body: `
Dear {{userName}},

We are writing to inform you of a data security incident that may have affected your personal information.

Incident Details:
- Date: {{timestamp}}
- Type: {{incidentType}}
- Affected Data: {{affectedDataTypes}}

What we are doing:
- We have immediately contained the incident
- We are conducting a thorough investigation
- We are implementing additional security measures

What you can do:
- Monitor your accounts for suspicious activity
- Consider changing your passwords
- Contact us if you have any questions

For more information, please contact our privacy team at privacy@vitalpath.com or call 1-800-VITAL-1.

Sincerely,
VITAL Path Security Team
      `.trim(),
      channels: ['email', 'sms', 'dashboard'],
      priority: 'high',
      requiredFields: ['userName', 'timestamp', 'incidentType', 'affectedDataTypes']
    });

    // Internal notification template
    this.templates.set('internal_alert', {
      id: 'internal_alert',
      type: 'internal',
      subject: 'SECURITY ALERT: Breach Incident {{incidentId}}',
      body: `
SECURITY ALERT

A potential breach incident has been detected and requires immediate attention.

Incident Details:
- ID: {{incidentId}}
- Severity: {{severity}}
- Type: {{incidentType}}
- Affected Users: {{affectedUsers}}
- Risk Score: {{riskScore}}
- Status: {{status}}

Immediate Actions Required:
{{recommendedActions}}

Please respond immediately to this alert.

Security Team
      `.trim(),
      channels: ['email', 'webhook', 'dashboard'],
      priority: 'critical',
      requiredFields: ['incidentId', 'severity', 'incidentType', 'affectedUsers', 'riskScore']
    });

    // Executive notification template
    this.templates.set('executive_briefing', {
      id: 'executive_briefing',
      type: 'executive',
      subject: 'Executive Briefing: Security Incident {{incidentId}}',
      body: `
Executive Security Briefing

Incident Summary:
- ID: {{incidentId}}
- Severity: {{severity}}
- Business Impact: {{businessImpact}}
- Regulatory Impact: {{regulatoryImpact}}
- Financial Impact: {{financialImpact}}

Current Status:
- Detection: {{detectionTime}}
- Containment: {{containmentTime}}
- Investigation: {{investigationStatus}}

Next Steps:
{{nextSteps}}

Recommendations:
{{recommendations}}

For questions, contact the CISO immediately.

Security Team
      `.trim(),
      channels: ['email', 'webhook'],
      priority: 'critical',
      requiredFields: ['incidentId', 'severity', 'businessImpact', 'regulatoryImpact']
    });
  }

  /**
   * Initialize notification channels
   */
  private initializeChannels(): void {
    // Email channel
    this.channels.set('email', {
      type: 'email',
      enabled: !!process.env.SMTP_HOST,
      config: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      },
      rateLimit: {
        maxPerMinute: 100,
        maxPerHour: 1000
      }
    });

    // SMS channel
    this.channels.set('sms', {
      type: 'sms',
      enabled: !!process.env.TWILIO_ACCOUNT_SID,
      config: {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        fromNumber: process.env.TWILIO_FROM_NUMBER
      },
      rateLimit: {
        maxPerMinute: 50,
        maxPerHour: 500
      }
    });

    // Webhook channel
    this.channels.set('webhook', {
      type: 'webhook',
      enabled: !!process.env.BREACH_WEBHOOK_URL,
      config: {
        url: process.env.BREACH_WEBHOOK_URL,
        headers: {
          'Authorization': `Bearer ${process.env.BREACH_WEBHOOK_TOKEN}`,
          'Content-Type': 'application/json'
        }
      },
      rateLimit: {
        maxPerMinute: 200,
        maxPerHour: 2000
      }
    });

    // Dashboard channel
    this.channels.set('dashboard', {
      type: 'dashboard',
      enabled: true,
      config: {
        realTimeUpdates: true,
        alertLevel: 'critical',
        autoRefresh: true
      }
    });
  }

  /**
   * Load notification recipients
   */
  private async loadRecipients(): Promise<void> {
    if (!this.supabase) return;

    try {
      // Load regulatory recipients
      const { data: regulatoryRecipients } = await this.supabase
        .from('notification_recipients')
        .select('*')
        .eq('type', 'regulatory');

      this.recipients.set('regulatory', regulatoryRecipients || []);

      // Load internal recipients
      const { data: internalRecipients } = await this.supabase
        .from('notification_recipients')
        .select('*')
        .eq('type', 'internal');

      this.recipients.set('internal', internalRecipients || []);

      // Load executive recipients
      const { data: executiveRecipients } = await this.supabase
        .from('notification_recipients')
        .select('*')
        .eq('type', 'executive');

      this.recipients.set('executive', executiveRecipients || []);
    } catch (error) {
      console.error('Failed to load notification recipients:', error);
    }
  }

  /**
   * Send regulatory notifications
   */
  async sendRegulatoryNotification(breach: BreachIncident): Promise<NotificationResult> {
    console.log('📢 Sending regulatory notifications...');

    const template = this.templates.get('regulatory_ocr');
    if (!template) {
      throw new Error('Regulatory notification template not found');
    }

    const recipients = this.recipients.get('regulatory') || [];
    const results: NotificationResult[] = [];

    for (const recipient of recipients) {
      try {
        const result = await this.sendNotification(recipient, template, breach);
        results.push(result);
      } catch (error) {
        console.error(`Failed to send regulatory notification to ${recipient.email}:`, error);
        results.push({
          success: false,
          recipients: [recipient.email || ''],
          channels: ['email'],
          timestamp: new Date(),
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return this.aggregateResults(results);
  }

  /**
   * Send user notifications
   */
  async sendUserNotification(breach: BreachIncident, users: any[]): Promise<NotificationResult> {
    console.log(`📧 Sending user notifications to ${users.length} users...`);

    const template = this.templates.get('user_notification');
    if (!template) {
      throw new Error('User notification template not found');
    }

    const results: NotificationResult[] = [];

    for (const user of users) {
      try {
        const recipient: NotificationRecipient = {
          id: user.id,
          type: 'user',
          email: user.email,
          name: user.name,
          role: 'user',
          notificationPreferences: {
            email: true,
            sms: user.phone ? true : false,
            webhook: false,
            dashboard: true
          }
        };

        const result = await this.sendNotification(recipient, template, breach);
        results.push(result);
      } catch (error) {
        console.error(`Failed to send user notification to ${user.email}:`, error);
        results.push({
          success: false,
          recipients: [user.email],
          channels: ['email'],
          timestamp: new Date(),
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return this.aggregateResults(results);
  }

  /**
   * Send internal notifications
   */
  async sendInternalNotification(breach: BreachIncident): Promise<NotificationResult> {
    console.log('🔔 Sending internal notifications...');

    const template = this.templates.get('internal_alert');
    if (!template) {
      throw new Error('Internal notification template not found');
    }

    const recipients = this.recipients.get('internal') || [];
    const results: NotificationResult[] = [];

    for (const recipient of recipients) {
      try {
        const result = await this.sendNotification(recipient, template, breach);
        results.push(result);
      } catch (error) {
        console.error(`Failed to send internal notification to ${recipient.email}:`, error);
        results.push({
          success: false,
          recipients: [recipient.email || ''],
          channels: ['email'],
          timestamp: new Date(),
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return this.aggregateResults(results);
  }

  /**
   * Send executive notifications
   */
  async sendExecutiveNotification(breach: BreachIncident): Promise<NotificationResult> {
    console.log('👔 Sending executive notifications...');

    const template = this.templates.get('executive_briefing');
    if (!template) {
      throw new Error('Executive notification template not found');
    }

    const recipients = this.recipients.get('executive') || [];
    const results: NotificationResult[] = [];

    for (const recipient of recipients) {
      try {
        const result = await this.sendNotification(recipient, template, breach);
        results.push(result);
      } catch (error) {
        console.error(`Failed to send executive notification to ${recipient.email}:`, error);
        results.push({
          success: false,
          recipients: [recipient.email || ''],
          channels: ['email'],
          timestamp: new Date(),
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return this.aggregateResults(results);
  }

  /**
   * Send notification to a specific recipient
   */
  private async sendNotification(
    recipient: NotificationRecipient,
    template: NotificationTemplate,
    breach: BreachIncident
  ): Promise<NotificationResult> {
    const channels = template.channels.filter(channel => 
      this.channels.get(channel)?.enabled && 
      recipient.notificationPreferences[channel]
    );

    if (channels.length === 0) {
      throw new Error('No enabled channels available for recipient');
    }

    const results: NotificationResult[] = [];

    for (const channelType of channels) {
      try {
        const channel = this.channels.get(channelType);
        if (!channel) continue;

        const result = await this.sendViaChannel(recipient, template, breach, channel);
        results.push(result);
      } catch (error) {
        console.error(`Failed to send via ${channelType}:`, error);
        results.push({
          success: false,
          recipients: [recipient.email || recipient.phone || ''],
          channels: [channelType],
          timestamp: new Date(),
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return this.aggregateResults(results);
  }

  /**
   * Send notification via specific channel
   */
  private async sendViaChannel(
    recipient: NotificationRecipient,
    template: NotificationTemplate,
    breach: BreachIncident,
    channel: NotificationChannel
  ): Promise<NotificationResult> {
    const content = this.renderTemplate(template, breach, recipient);

    switch (channel.type) {
      case 'email':
        return this.sendEmail(recipient, content, channel);
      case 'sms':
        return this.sendSMS(recipient, content, channel);
      case 'webhook':
        return this.sendWebhook(recipient, content, channel);
      case 'dashboard':
        return this.sendDashboard(recipient, content, channel);
      default:
        throw new Error(`Unsupported channel type: ${channel.type}`);
    }
  }

  /**
   * Render notification template with data
   */
  private renderTemplate(
    template: NotificationTemplate,
    breach: BreachIncident,
    recipient: NotificationRecipient
  ): { subject: string; body: string } {
    const data = {
      incidentId: breach.id,
      timestamp: breach.timestamp.toISOString(),
      severity: breach.severity,
      affectedUsers: breach.affectedUsers,
      affectedDataTypes: breach.affectedDataTypes.join(', '),
      description: breach.description,
      riskScore: breach.riskScore,
      incidentType: breach.type,
      status: breach.status,
      userName: recipient.name,
      recommendedActions: this.getRecommendedActions(breach).join('\n'),
      businessImpact: this.assessBusinessImpact(breach),
      regulatoryImpact: this.assessRegulatoryImpact(breach),
      financialImpact: this.assessFinancialImpact(breach),
      detectionTime: breach.timestamp.toISOString(),
      containmentTime: new Date().toISOString(),
      investigationStatus: 'In Progress',
      nextSteps: this.getNextSteps(breach),
      recommendations: this.getRecommendations(breach)
    };

    let subject = template.subject;
    let body = template.body;

    // Replace placeholders
    for (const [key, value] of Object.entries(data)) {
      const placeholder = `{{${key}}}`;
      subject = subject.replace(new RegExp(placeholder, 'g'), String(value));
      body = body.replace(new RegExp(placeholder, 'g'), String(value));
    }

    return { subject, body };
  }

  /**
   * Send email notification
   */
  private async sendEmail(
    recipient: NotificationRecipient,
    content: { subject: string; body: string },
    channel: NotificationChannel
  ): Promise<NotificationResult> {
    // Simulate email sending - in production, use actual SMTP
    console.log(`📧 Sending email to ${recipient.email}: ${content.subject}`);
    
    return {
      success: true,
      recipients: [recipient.email || ''],
      channels: ['email'],
      timestamp: new Date(),
      messageId: `email-${Date.now()}`
    };
  }

  /**
   * Send SMS notification
   */
  private async sendSMS(
    recipient: NotificationRecipient,
    content: { subject: string; body: string },
    channel: NotificationChannel
  ): Promise<NotificationResult> {
    // Simulate SMS sending - in production, use Twilio or similar
    console.log(`📱 Sending SMS to ${recipient.phone}: ${content.body.substring(0, 50)}...`);
    
    return {
      success: true,
      recipients: [recipient.phone || ''],
      channels: ['sms'],
      timestamp: new Date(),
      messageId: `sms-${Date.now()}`
    };
  }

  /**
   * Send webhook notification
   */
  private async sendWebhook(
    recipient: NotificationRecipient,
    content: { subject: string; body: string },
    channel: NotificationChannel
  ): Promise<NotificationResult> {
    // Simulate webhook sending - in production, use actual HTTP client
    console.log(`🔗 Sending webhook to ${channel.config.url}`);
    
    return {
      success: true,
      recipients: [channel.config.url],
      channels: ['webhook'],
      timestamp: new Date(),
      messageId: `webhook-${Date.now()}`
    };
  }

  /**
   * Send dashboard notification
   */
  private async sendDashboard(
    recipient: NotificationRecipient,
    content: { subject: string; body: string },
    channel: NotificationChannel
  ): Promise<NotificationResult> {
    // Simulate dashboard notification - in production, use real-time updates
    console.log(`📊 Sending dashboard notification: ${content.subject}`);
    
    return {
      success: true,
      recipients: ['dashboard'],
      channels: ['dashboard'],
      timestamp: new Date(),
      messageId: `dashboard-${Date.now()}`
    };
  }

  /**
   * Aggregate multiple notification results
   */
  private aggregateResults(results: NotificationResult[]): NotificationResult {
    const allRecipients = results.flatMap(r => r.recipients);
    const allChannels = results.flatMap(r => r.channels);
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;

    return {
      success: successCount > 0,
      recipients: [...new Set(allRecipients)],
      channels: [...new Set(allChannels)],
      timestamp: new Date(),
      messageId: `aggregated-${Date.now()}`,
      error: successCount < totalCount ? `${totalCount - successCount} notifications failed` : undefined
    };
  }

  // Helper methods
  private getRecommendedActions(breach: BreachIncident): string[] {
    const actions = ['Document incident details', 'Preserve evidence'];
    
    if (breach.severity === 'critical') {
      actions.push('Immediately isolate affected systems', 'Notify incident response team');
    }
    
    if (breach.affectedDataTypes.includes('phi')) {
      actions.push('Assess PHI exposure scope', 'Prepare regulatory notifications');
    }
    
    return actions;
  }

  private assessBusinessImpact(breach: BreachIncident): string {
    if (breach.affectedUsers > 1000) return 'High - Significant user impact';
    if (breach.affectedUsers > 100) return 'Medium - Moderate user impact';
    return 'Low - Limited user impact';
  }

  private assessRegulatoryImpact(breach: BreachIncident): string {
    if (breach.affectedDataTypes.includes('phi')) return 'High - HIPAA notification required';
    if (breach.severity === 'critical') return 'Medium - Regulatory review recommended';
    return 'Low - Internal review sufficient';
  }

  private assessFinancialImpact(breach: BreachIncident): string {
    if (breach.affectedUsers > 1000) return 'High - Potential significant costs';
    if (breach.affectedUsers > 100) return 'Medium - Moderate potential costs';
    return 'Low - Limited financial impact';
  }

  private getNextSteps(breach: BreachIncident): string {
    return 'Complete investigation, implement containment measures, prepare regulatory notifications';
  }

  private getRecommendations(breach: BreachIncident): string {
    return 'Review security procedures, conduct post-incident analysis, implement additional safeguards';
  }
}

export const breachNotificationService = new BreachNotificationService();
