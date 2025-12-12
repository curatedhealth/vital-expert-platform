"""
VITAL Path Notification System
Comprehensive alert notification and communication system
"""

from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime, timedelta
import asyncio
import json
import logging
import smtplib
import aiohttp
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from abc import ABC, abstractmethod
import uuid
import os

from .monitoring_system import Alert, AlertSeverity

logger = logging.getLogger(__name__)

class NotificationChannel(str, Enum):
    EMAIL = "email"
    SLACK = "slack"
    TEAMS = "teams"
    SMS = "sms"
    WEBHOOK = "webhook"
    PHONE = "phone"
    PAGER = "pager"

class NotificationStatus(str, Enum):
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    FAILED = "failed"
    RETRY = "retry"

@dataclass
class NotificationTemplate:
    template_id: str
    channel: NotificationChannel
    severity: AlertSeverity
    subject_template: str
    body_template: str
    format: str = "text"  # text, html, markdown
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class NotificationRule:
    rule_id: str
    name: str
    channels: List[NotificationChannel]
    recipients: List[str]
    severity_filter: List[AlertSeverity]
    service_filter: Optional[List[str]] = None
    time_restrictions: Optional[Dict[str, Any]] = None
    rate_limiting: Optional[Dict[str, int]] = None
    active: bool = True

@dataclass
class NotificationRecord:
    notification_id: str
    alert_id: str
    channel: NotificationChannel
    recipient: str
    status: NotificationStatus
    sent_at: datetime
    delivered_at: Optional[datetime] = None
    error_message: Optional[str] = None
    retry_count: int = 0
    metadata: Dict[str, Any] = field(default_factory=dict)

class NotificationProvider(ABC):
    @abstractmethod
    async def send_notification(self, recipient: str, subject: str,
                              body: str, metadata: Dict[str, Any] = None) -> bool:
        """Send notification through this provider"""
        pass

    @abstractmethod
    def validate_recipient(self, recipient: str) -> bool:
        """Validate recipient format for this provider"""
        pass

class EmailProvider(NotificationProvider):
    def __init__(self, smtp_server: str, smtp_port: int, username: str,
                 password: str, use_tls: bool = True):
        self.smtp_server = smtp_server
        self.smtp_port = smtp_port
        self.username = username
        self.password = password
        self.use_tls = use_tls

    async def send_notification(self, recipient: str, subject: str,
                              body: str, metadata: Dict[str, Any] = None) -> bool:
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.username
            msg['To'] = recipient

            # Determine content type
            if metadata and metadata.get('format') == 'html':
                part = MIMEText(body, 'html')
            else:
                part = MIMEText(body, 'plain')

            msg.attach(part)

            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                if self.use_tls:
                    server.starttls()
                server.login(self.username, self.password)
                server.send_message(msg)

            logger.info(f"Email sent to {recipient}")
            return True

        except Exception as e:
            logger.error(f"Failed to send email to {recipient}: {e}")
            return False

    def validate_recipient(self, recipient: str) -> bool:
        import re
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(email_pattern, recipient))

class SlackProvider(NotificationProvider):
    def __init__(self, webhook_url: str):
        self.webhook_url = webhook_url

    async def send_notification(self, recipient: str, subject: str,
                              body: str, metadata: Dict[str, Any] = None) -> bool:
        try:
            # Format message for Slack
            alert_color = self._get_alert_color(metadata)

            payload = {
                "channel": recipient,
                "attachments": [
                    {
                        "color": alert_color,
                        "title": subject,
                        "text": body,
                        "ts": int(datetime.now().timestamp())
                    }
                ]
            }

            async with aiohttp.ClientSession() as session:
                async with session.post(self.webhook_url, json=payload) as response:
                    if response.status == 200:
                        logger.info(f"Slack notification sent to {recipient}")
                        return True
                    else:
                        logger.error(f"Slack API error: {response.status}")
                        return False

        except Exception as e:
            logger.error(f"Failed to send Slack notification to {recipient}: {e}")
            return False

    def validate_recipient(self, recipient: str) -> bool:
        # Slack channels start with # or @
        return recipient.startswith('#') or recipient.startswith('@')

    def _get_alert_color(self, metadata: Dict[str, Any]) -> str:
        if not metadata:
            return "warning"

        severity = metadata.get('severity', 'info').lower()
        color_map = {
            'critical': 'danger',
            'error': 'danger',
            'warning': 'warning',
            'info': 'good'
        }
        return color_map.get(severity, 'warning')

class TeamsProvider(NotificationProvider):
    def __init__(self, webhook_url: str):
        self.webhook_url = webhook_url

    async def send_notification(self, recipient: str, subject: str,
                              body: str, metadata: Dict[str, Any] = None) -> bool:
        try:
            # Format message for Microsoft Teams
            theme_color = self._get_theme_color(metadata)

            payload = {
                "@type": "MessageCard",
                "@context": "http://schema.org/extensions",
                "themeColor": theme_color,
                "title": subject,
                "text": body,
                "sections": [
                    {
                        "facts": []
                    }
                ]
            }

            if metadata:
                for key, value in metadata.items():
                    if key not in ['format', 'severity']:
                        payload["sections"][0]["facts"].append({
                            "name": key.replace('_', ' ').title(),
                            "value": str(value)
                        })

            async with aiohttp.ClientSession() as session:
                async with session.post(self.webhook_url, json=payload) as response:
                    if response.status == 200:
                        logger.info(f"Teams notification sent")
                        return True
                    else:
                        logger.error(f"Teams API error: {response.status}")
                        return False

        except Exception as e:
            logger.error(f"Failed to send Teams notification: {e}")
            return False

    def validate_recipient(self, recipient: str) -> bool:
        # Teams doesn't require specific recipient format for webhook
        return True

    def _get_theme_color(self, metadata: Dict[str, Any]) -> str:
        if not metadata:
            return "FFD700"

        severity = metadata.get('severity', 'info').lower()
        color_map = {
            'critical': 'FF0000',
            'error': 'FF4500',
            'warning': 'FFD700',
            'info': '00FF00'
        }
        return color_map.get(severity, 'FFD700')

class WebhookProvider(NotificationProvider):
    def __init__(self, webhook_url: str, headers: Dict[str, str] = None):
        self.webhook_url = webhook_url
        self.headers = headers or {'Content-Type': 'application/json'}

    async def send_notification(self, recipient: str, subject: str,
                              body: str, metadata: Dict[str, Any] = None) -> bool:
        try:
            payload = {
                "recipient": recipient,
                "subject": subject,
                "body": body,
                "timestamp": datetime.now().isoformat(),
                "metadata": metadata or {}
            }

            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.webhook_url,
                    json=payload,
                    headers=self.headers
                ) as response:
                    if 200 <= response.status < 300:
                        logger.info(f"Webhook notification sent to {recipient}")
                        return True
                    else:
                        logger.error(f"Webhook API error: {response.status}")
                        return False

        except Exception as e:
            logger.error(f"Failed to send webhook notification to {recipient}: {e}")
            return False

    def validate_recipient(self, recipient: str) -> bool:
        # Webhook recipient can be any string identifier
        return len(recipient.strip()) > 0

class SMSProvider(NotificationProvider):
    def __init__(self, api_key: str, api_secret: str, service_url: str):
        self.api_key = api_key
        self.api_secret = api_secret
        self.service_url = service_url

    async def send_notification(self, recipient: str, subject: str,
                              body: str, metadata: Dict[str, Any] = None) -> bool:
        try:
            # Combine subject and body for SMS (character limit considerations)
            message = f"{subject}\n{body}"
            if len(message) > 160:
                message = message[:157] + "..."

            payload = {
                "to": recipient,
                "message": message,
                "api_key": self.api_key,
                "api_secret": self.api_secret
            }

            async with aiohttp.ClientSession() as session:
                async with session.post(self.service_url, json=payload) as response:
                    if response.status == 200:
                        logger.info(f"SMS sent to {recipient}")
                        return True
                    else:
                        logger.error(f"SMS API error: {response.status}")
                        return False

        except Exception as e:
            logger.error(f"Failed to send SMS to {recipient}: {e}")
            return False

    def validate_recipient(self, recipient: str) -> bool:
        import re
        # Basic phone number validation (international format)
        phone_pattern = r'^\+?[1-9]\d{1,14}$'
        return bool(re.match(phone_pattern, recipient.replace('-', '').replace(' ', '')))

class NotificationTemplateEngine:
    def __init__(self):
        self.templates: Dict[str, NotificationTemplate] = {}
        self._load_default_templates()

    def _load_default_templates(self):
        """Load default notification templates"""
        default_templates = [
            NotificationTemplate(
                template_id="email_critical",
                channel=NotificationChannel.EMAIL,
                severity=AlertSeverity.CRITICAL,
                subject_template="🚨 CRITICAL ALERT: {alert_name}",
                body_template="""
CRITICAL ALERT TRIGGERED

Alert: {alert_name}
Description: {description}
Severity: {severity}
Triggered: {triggered_at}
Metric: {metric_name} = {metric_value} (threshold: {threshold})

Service: {service}
Environment: {environment}

This is a critical alert that requires immediate attention.

View Details: {dashboard_url}
                """.strip(),
                format="text"
            ),
            NotificationTemplate(
                template_id="slack_warning",
                channel=NotificationChannel.SLACK,
                severity=AlertSeverity.WARNING,
                subject_template="⚠️ Warning: {alert_name}",
                body_template="""
*Alert:* {alert_name}
*Severity:* {severity}
*Service:* {service}
*Metric:* {metric_name} = {metric_value} (threshold: {threshold})
*Time:* {triggered_at}

{description}
                """.strip(),
                format="markdown"
            ),
            NotificationTemplate(
                template_id="teams_error",
                channel=NotificationChannel.TEAMS,
                severity=AlertSeverity.ERROR,
                subject_template="🔴 Error Alert: {alert_name}",
                body_template="""
An error condition has been detected in the VITAL Path system.

**Alert Details:**
- **Name:** {alert_name}
- **Severity:** {severity}
- **Service:** {service}
- **Triggered:** {triggered_at}
- **Metric:** {metric_name} = {metric_value}
- **Threshold:** {threshold}

**Description:** {description}

Please investigate and resolve this issue promptly.
                """.strip(),
                format="markdown"
            ),
            NotificationTemplate(
                template_id="sms_critical",
                channel=NotificationChannel.SMS,
                severity=AlertSeverity.CRITICAL,
                subject_template="CRITICAL: {alert_name}",
                body_template="CRITICAL ALERT: {alert_name} - {metric_name}={metric_value} (>{threshold}). Check dashboard immediately.",
                format="text"
            )
        ]

        for template in default_templates:
            self.templates[template.template_id] = template

    def add_template(self, template: NotificationTemplate):
        """Add custom notification template"""
        self.templates[template.template_id] = template
        logger.info(f"Notification template added: {template.template_id}")

    def render_notification(self, alert: Alert, channel: NotificationChannel,
                          metadata: Dict[str, Any] = None) -> tuple:
        """Render notification content for alert"""
        # Find appropriate template
        template = self._find_template(channel, alert.severity)

        if not template:
            # Fallback to default template
            subject = f"Alert: {alert.name}"
            body = f"Alert {alert.name} triggered at {alert.triggered_at}"
            return subject, body, "text"

        # Prepare template variables
        template_vars = {
            "alert_name": alert.name,
            "description": alert.description,
            "severity": alert.severity.value.upper(),
            "triggered_at": alert.triggered_at.strftime("%Y-%m-%d %H:%M:%S UTC"),
            "metric_name": alert.labels.get("metric", "unknown"),
            "metric_value": alert.metric_value or "unknown",
            "threshold": alert.threshold or "unknown",
            "service": alert.labels.get("service", "vital-path"),
            "environment": metadata.get("environment", "production") if metadata else "production",
            "dashboard_url": metadata.get("dashboard_url", "#") if metadata else "#"
        }

        # Render templates
        try:
            subject = template.subject_template.format(**template_vars)
            body = template.body_template.format(**template_vars)
            return subject, body, template.format
        except KeyError as e:
            logger.error(f"Template rendering error: Missing variable {e}")
            # Fallback
            subject = f"Alert: {alert.name}"
            body = f"Alert {alert.name} triggered. Template error: {e}"
            return subject, body, "text"

    def _find_template(self, channel: NotificationChannel,
                      severity: AlertSeverity) -> Optional[NotificationTemplate]:
        """Find best matching template"""
        # Look for exact match first
        exact_matches = [
            t for t in self.templates.values()
            if t.channel == channel and t.severity == severity
        ]
        if exact_matches:
            return exact_matches[0]

        # Look for channel match with any severity
        channel_matches = [
            t for t in self.templates.values()
            if t.channel == channel
        ]
        if channel_matches:
            return channel_matches[0]

        return None

class NotificationManager:
    def __init__(self):
        self.providers: Dict[NotificationChannel, NotificationProvider] = {}
        self.rules: List[NotificationRule] = []
        self.templates = NotificationTemplateEngine()
        self.notification_history: List[NotificationRecord] = []
        self.rate_limits: Dict[str, List[datetime]] = {}

    def add_provider(self, channel: NotificationChannel, provider: NotificationProvider):
        """Add notification provider"""
        self.providers[channel] = provider
        logger.info(f"Notification provider added for {channel}")

    def add_rule(self, rule: NotificationRule):
        """Add notification rule"""
        self.rules.append(rule)
        logger.info(f"Notification rule added: {rule.name}")

    async def process_alert(self, alert: Alert, metadata: Dict[str, Any] = None):
        """Process alert and send notifications according to rules"""
        matching_rules = self._find_matching_rules(alert)

        for rule in matching_rules:
            if not rule.active:
                continue

            # Check time restrictions
            if not self._check_time_restrictions(rule):
                continue

            for channel in rule.channels:
                if channel not in self.providers:
                    logger.warning(f"No provider configured for {channel}")
                    continue

                provider = self.providers[channel]

                for recipient in rule.recipients:
                    # Validate recipient
                    if not provider.validate_recipient(recipient):
                        logger.warning(f"Invalid recipient {recipient} for {channel}")
                        continue

                    # Check rate limiting
                    if not self._check_rate_limit(rule, channel, recipient):
                        logger.info(f"Rate limit exceeded for {recipient} on {channel}")
                        continue

                    # Send notification
                    await self._send_notification(
                        alert, channel, recipient, provider, rule, metadata
                    )

    def _find_matching_rules(self, alert: Alert) -> List[NotificationRule]:
        """Find notification rules that match the alert"""
        matching_rules = []

        for rule in self.rules:
            # Check severity filter
            if alert.severity not in rule.severity_filter:
                continue

            # Check service filter if specified
            if rule.service_filter:
                alert_service = alert.labels.get("service")
                if alert_service and alert_service not in rule.service_filter:
                    continue

            matching_rules.append(rule)

        return matching_rules

    def _check_time_restrictions(self, rule: NotificationRule) -> bool:
        """Check if current time is within rule's time restrictions"""
        if not rule.time_restrictions:
            return True

        current_time = datetime.now()
        current_hour = current_time.hour
        current_day = current_time.strftime("%A").lower()

        # Check business hours
        if "business_hours_only" in rule.time_restrictions:
            if rule.time_restrictions["business_hours_only"]:
                if current_hour < 9 or current_hour >= 17:
                    return False

        # Check allowed days
        if "allowed_days" in rule.time_restrictions:
            allowed_days = rule.time_restrictions["allowed_days"]
            if current_day not in [day.lower() for day in allowed_days]:
                return False

        # Check quiet hours
        if "quiet_hours" in rule.time_restrictions:
            quiet_start = rule.time_restrictions["quiet_hours"]["start"]
            quiet_end = rule.time_restrictions["quiet_hours"]["end"]
            if quiet_start <= current_hour < quiet_end:
                return False

        return True

    def _check_rate_limit(self, rule: NotificationRule, channel: NotificationChannel,
                         recipient: str) -> bool:
        """Check rate limiting for recipient"""
        if not rule.rate_limiting:
            return True

        rate_key = f"{rule.rule_id}:{channel}:{recipient}"
        current_time = datetime.now()

        if rate_key not in self.rate_limits:
            self.rate_limits[rate_key] = []

        # Clean old entries
        cutoff_time = current_time - timedelta(hours=1)
        self.rate_limits[rate_key] = [
            t for t in self.rate_limits[rate_key] if t > cutoff_time
        ]

        # Check limits
        max_per_hour = rule.rate_limiting.get("max_per_hour", 10)
        if len(self.rate_limits[rate_key]) >= max_per_hour:
            return False

        # Add current notification
        self.rate_limits[rate_key].append(current_time)
        return True

    async def _send_notification(self, alert: Alert, channel: NotificationChannel,
                               recipient: str, provider: NotificationProvider,
                               rule: NotificationRule, metadata: Dict[str, Any] = None):
        """Send individual notification"""
        notification_id = str(uuid.uuid4())

        try:
            # Render notification content
            subject, body, format_type = self.templates.render_notification(
                alert, channel, metadata
            )

            # Create notification record
            notification = NotificationRecord(
                notification_id=notification_id,
                alert_id=alert.alert_id,
                channel=channel,
                recipient=recipient,
                status=NotificationStatus.PENDING,
                sent_at=datetime.now(),
                metadata={
                    "rule_id": rule.rule_id,
                    "format": format_type,
                    "severity": alert.severity.value
                }
            )

            # Send notification
            send_metadata = {
                "format": format_type,
                "severity": alert.severity.value
            }
            if metadata:
                send_metadata.update(metadata)

            success = await provider.send_notification(
                recipient, subject, body, send_metadata
            )

            # Update notification record
            if success:
                notification.status = NotificationStatus.SENT
                logger.info(f"Notification sent: {channel} to {recipient} for alert {alert.name}")
            else:
                notification.status = NotificationStatus.FAILED
                notification.error_message = "Provider send failed"
                logger.error(f"Failed to send notification: {channel} to {recipient}")

            self.notification_history.append(notification)

        except Exception as e:
            # Create failed notification record
            notification = NotificationRecord(
                notification_id=notification_id,
                alert_id=alert.alert_id,
                channel=channel,
                recipient=recipient,
                status=NotificationStatus.FAILED,
                sent_at=datetime.now(),
                error_message=str(e)
            )
            self.notification_history.append(notification)
            logger.error(f"Notification error: {e}")

    def get_notification_stats(self, hours: int = 24) -> Dict[str, Any]:
        """Get notification statistics"""
        cutoff_time = datetime.now() - timedelta(hours=hours)
        recent_notifications = [
            n for n in self.notification_history
            if n.sent_at >= cutoff_time
        ]

        stats = {
            "total_notifications": len(recent_notifications),
            "successful": len([n for n in recent_notifications
                             if n.status == NotificationStatus.SENT]),
            "failed": len([n for n in recent_notifications
                          if n.status == NotificationStatus.FAILED]),
            "by_channel": {},
            "by_severity": {}
        }

        for notification in recent_notifications:
            # By channel
            channel = notification.channel.value
            if channel not in stats["by_channel"]:
                stats["by_channel"][channel] = {"total": 0, "successful": 0, "failed": 0}

            stats["by_channel"][channel]["total"] += 1
            if notification.status == NotificationStatus.SENT:
                stats["by_channel"][channel]["successful"] += 1
            else:
                stats["by_channel"][channel]["failed"] += 1

            # By severity
            severity = notification.metadata.get("severity", "unknown")
            if severity not in stats["by_severity"]:
                stats["by_severity"][severity] = 0
            stats["by_severity"][severity] += 1

        return stats

# Convenience function to setup common notification providers
def setup_notification_providers(config: Dict[str, Any]) -> NotificationManager:
    """Setup notification manager with common providers"""
    manager = NotificationManager()

    # Email provider
    if "email" in config:
        email_config = config["email"]
        provider = EmailProvider(
            smtp_server=email_config["smtp_server"],
            smtp_port=email_config["smtp_port"],
            username=email_config["username"],
            password=email_config["password"],
            use_tls=email_config.get("use_tls", True)
        )
        manager.add_provider(NotificationChannel.EMAIL, provider)

    # Slack provider
    if "slack" in config:
        provider = SlackProvider(config["slack"]["webhook_url"])
        manager.add_provider(NotificationChannel.SLACK, provider)

    # Teams provider
    if "teams" in config:
        provider = TeamsProvider(config["teams"]["webhook_url"])
        manager.add_provider(NotificationChannel.TEAMS, provider)

    # SMS provider
    if "sms" in config:
        sms_config = config["sms"]
        provider = SMSProvider(
            api_key=sms_config["api_key"],
            api_secret=sms_config["api_secret"],
            service_url=sms_config["service_url"]
        )
        manager.add_provider(NotificationChannel.SMS, provider)

    # Webhook provider
    if "webhook" in config:
        webhook_config = config["webhook"]
        provider = WebhookProvider(
            webhook_url=webhook_config["url"],
            headers=webhook_config.get("headers", {})
        )
        manager.add_provider(NotificationChannel.WEBHOOK, provider)

    return manager