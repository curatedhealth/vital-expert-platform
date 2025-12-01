# VITAL Platform - Customer Onboarding Guide
# Phase 1: Ask Expert Service

**Document Version**: 1.0
**Last Updated**: November 27, 2025
**Owner**: Customer Success Team
**Audience**: Customer Success Managers, Sales, Customers

---

## Quick Reference

```
ONBOARDING TIMELINE: 5-7 Business Days
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Day 1:    Welcome + Account Setup
Day 2-3:  Technical Integration + Training
Day 4-5:  Pilot Use Cases + Customization
Day 6-7:  Go-Live + Success Check-in

KEY CONTACTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Customer Success:  success@vital.health
Technical Support: support@vital.health
Sales:            sales@vital.health
Emergency:        +1-XXX-XXX-XXXX

SUPPORT HOURS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Standard:   9am - 6pm EST (Mon-Fri)
Emergency:  24/7 for P0 issues
```

---

## Part 1: Onboarding Overview

### 1.1 Onboarding Phases

```
┌─────────────────────────────────────────────────────────────────┐
│                    CUSTOMER ONBOARDING JOURNEY                   │
└─────────────────────────────────────────────────────────────────┘

Phase 1: WELCOME (Day 1)
├── Welcome email sent
├── Account credentials created
├── Kickoff call scheduled
└── Success criteria defined

Phase 2: SETUP (Days 2-3)
├── Account configuration
├── User provisioning
├── SSO setup (if applicable)
├── Initial training session
└── Agent catalog walkthrough

Phase 3: ACTIVATION (Days 4-5)
├── First use case execution
├── Workflow customization
├── Team training
└── Integration testing

Phase 4: GO-LIVE (Days 6-7)
├── Production deployment
├── Success metrics baseline
├── Ongoing support handoff
└── 30-day check-in scheduled
```

### 1.2 Onboarding Success Criteria

| Milestone | Target | Measurement |
|-----------|--------|-------------|
| Account Active | Day 1 | User can log in |
| First Query | Day 3 | First Ask Expert query submitted |
| Team Trained | Day 5 | All users complete training |
| 10 Queries | Day 7 | Usage threshold met |
| Value Realized | Day 14 | Customer confirms value |

---

## Part 2: Pre-Onboarding Checklist

### 2.1 Sales-to-Success Handoff

**Before kickoff call, ensure:**

```
□ Signed pilot agreement received
□ Customer contacts identified
  - Executive Sponsor: [Name, Email]
  - Project Lead: [Name, Email]
  - IT Contact: [Name, Email]
  - End Users: [Names, Emails]
□ Use cases documented
□ Success criteria agreed
□ Technical requirements gathered
□ Timeline confirmed
□ Billing information complete
```

### 2.2 Internal Setup Tasks

| Task | Owner | Timeline |
|------|-------|----------|
| Create tenant in Supabase | DevOps | Before Day 1 |
| Configure tenant settings | CS | Before Day 1 |
| Provision admin account | CS | Before Day 1 |
| Set up usage tracking | Analytics | Before Day 1 |
| Assign CSM | CS Manager | Before Day 1 |
| Schedule kickoff call | CSM | Before Day 1 |

### 2.3 Customer Requirements Gathering

```markdown
## Customer Intake Form

**Company Information**
- Company Name: ________________
- Industry: ________________
- Company Size: ________________
- Department: ________________

**Technical Requirements**
- SSO Provider: □ Okta □ Azure AD □ Google □ None
- IP Allowlisting Required: □ Yes □ No
- Data Residency Requirements: □ US □ EU □ Other: ______
- Compliance Requirements: □ HIPAA □ SOC2 □ Other: ______

**Users**
- Number of Users: ________________
- User Roles: □ Admin □ Power User □ Standard User
- Training Format Preference: □ Live □ Self-paced □ Both

**Use Cases**
Primary Use Case: ________________
Secondary Use Cases: ________________
Expected Query Volume: ________________/month

**Success Criteria**
How will you measure success? ________________
Key metrics to track: ________________
```

---

## Part 3: Day-by-Day Onboarding Plan

### Day 1: Welcome & Account Setup

#### Morning: Account Provisioning

**CSM Tasks:**
```
□ Send welcome email (use template below)
□ Create tenant in VITAL platform
□ Configure tenant settings
  - Company name
  - Logo upload
  - Default mode preferences
  - Agent access permissions
□ Provision admin user account
□ Generate temporary password
□ Verify admin can log in
```

**Admin Account Setup:**
```
1. Navigate to https://app.vital.health
2. Click "Sign In"
3. Enter provided credentials
4. Complete password reset
5. Enable MFA (required)
6. Complete profile setup
```

#### Afternoon: Kickoff Call (60 minutes)

**Agenda:**
| Time | Topic | Lead |
|------|-------|------|
| 0:00 | Introductions | CSM |
| 0:05 | VITAL Platform Overview | CSM |
| 0:15 | Use Case Review | Customer |
| 0:25 | Success Criteria Alignment | Both |
| 0:35 | Onboarding Timeline | CSM |
| 0:45 | Q&A | Both |
| 0:55 | Next Steps | CSM |

**Kickoff Call Checklist:**
```
□ Confirm executive sponsor support
□ Review and validate use cases
□ Agree on success metrics
□ Confirm user list for provisioning
□ Schedule training sessions
□ Assign customer project lead
□ Set communication cadence
□ Distribute onboarding timeline
```

---

### Day 2-3: Technical Integration & Training

#### Day 2: User Provisioning & Platform Tour

**Morning: User Setup**
```
□ Provision all user accounts
□ Send user invitations
□ Verify all users can access platform
□ Configure user roles and permissions
□ Set up SSO (if applicable)
```

**SSO Configuration (if applicable):**
```
1. Navigate to Settings > Authentication
2. Select SSO Provider
3. Enter IdP Metadata URL or upload XML
4. Configure attribute mappings:
   - Email: user.email
   - First Name: user.firstName
   - Last Name: user.lastName
   - Department: user.department
5. Test SSO connection
6. Enable for all users
```

**Afternoon: Platform Tour (90 minutes)**

| Time | Topic | Demo |
|------|-------|------|
| 0:00 | Dashboard Overview | Navigation, layout |
| 0:15 | Ask Expert Introduction | 4-mode system explained |
| 0:30 | Mode 1 Demo | Interactive + Manual |
| 0:45 | Mode 2 Demo | Interactive + Automatic |
| 1:00 | Agent Catalog | Browsing, selecting agents |
| 1:15 | Conversation History | Finding past conversations |
| 1:25 | Q&A | |

#### Day 3: Hands-On Training

**Training Session (2 hours)**

| Time | Activity | Outcome |
|------|----------|---------|
| 0:00 | Mode Selection Guide | Users understand when to use each mode |
| 0:20 | Hands-On: Mode 1 Practice | Each user submits 2+ queries |
| 0:50 | Hands-On: Mode 2 Practice | Each user submits 2+ queries |
| 1:20 | Best Practices | Query formulation tips |
| 1:40 | Common Mistakes | What to avoid |
| 1:50 | Q&A + Certification | |

**Training Certification Checklist:**
```
□ User can log in independently
□ User understands 4 modes
□ User has submitted Mode 1 query
□ User has submitted Mode 2 query
□ User can find conversation history
□ User knows how to get support
```

---

### Day 4-5: Pilot Use Cases & Customization

#### Day 4: Primary Use Case Execution

**Morning: Guided Use Case**
```
1. Review customer's primary use case
2. Identify optimal mode for use case
3. Select appropriate expert agents
4. CSM demonstrates query approach
5. Customer executes with guidance
6. Review results together
7. Iterate on approach if needed
```

**Use Case Documentation:**
```markdown
## Use Case: [Name]

**Objective**: [What the customer is trying to accomplish]

**Recommended Configuration**:
- Mode: [1/2/3/4]
- Toggle Settings: Autonomous [ON/OFF], Automatic [ON/OFF]
- Recommended Agents: [Agent names]

**Sample Queries**:
1. "[Example query 1]"
2. "[Example query 2]"

**Expected Response Time**: [X seconds]

**Quality Checklist**:
□ Response addresses the question
□ Citations provided
□ Actionable recommendations included
□ Appropriate confidence level

**Customer Feedback**: [Notes from customer]
```

#### Day 5: Advanced Features & Customization

**Morning: Advanced Training (90 minutes)**

| Time | Topic | Content |
|------|-------|---------|
| 0:00 | Mode 3: Autonomous + Manual | Deep workflow execution |
| 0:25 | Mode 4: Autonomous + Automatic | Multi-agent collaboration |
| 0:50 | Query Optimization | How to get best results |
| 1:10 | Conversation Context | Building on previous queries |
| 1:25 | Q&A | |

**Afternoon: Team Training**
```
□ Train remaining team members
□ Assign "super users" for peer support
□ Distribute quick reference cards
□ Share best practices documentation
□ Set up team communication channel
```

---

### Day 6-7: Go-Live & Success Check-in

#### Day 6: Production Go-Live

**Go-Live Checklist:**
```
□ All users provisioned and trained
□ Primary use case validated
□ Support escalation path understood
□ Usage tracking active
□ Success metrics baseline captured
□ CSM-to-Support handoff complete
```

**Production Readiness Verification:**
```
□ Test query in production environment
□ Verify response quality
□ Confirm usage appears in analytics
□ Test support ticket creation
□ Validate billing is active
```

#### Day 7: Success Check-in Call (30 minutes)

**Agenda:**
| Time | Topic |
|------|-------|
| 0:00 | How's it going? (General feedback) |
| 0:10 | Usage review (queries, users active) |
| 0:15 | Challenges or blockers |
| 0:20 | Additional training needs |
| 0:25 | Schedule 30-day review |

**Success Check-in Scorecard:**
```
□ Customer confirms value realized
□ No critical issues outstanding
□ Users are actively using platform
□ Primary use case successful
□ Customer would recommend VITAL
```

---

## Part 4: Customer Communication Templates

### 4.1 Welcome Email

```
Subject: Welcome to VITAL Platform - Let's Get Started!

Dear [Customer Name],

Welcome to VITAL Platform! We're excited to have [Company Name] join us
as a pilot customer for our Ask Expert service.

YOUR ACCOUNT IS READY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Platform URL: https://app.vital.health
Username: [email]
Temporary Password: [password]

Please log in and reset your password within 24 hours.

YOUR ONBOARDING JOURNEY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Day 1 (Today): Account setup complete ✓
Day 2-3: Technical integration + training
Day 4-5: Pilot use cases + customization
Day 6-7: Go-live + success check-in

KICKOFF CALL SCHEDULED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Date: [Date]
Time: [Time] [Timezone]
Join Link: [Calendar link]

YOUR SUCCESS TEAM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Customer Success Manager: [CSM Name]
Email: [CSM email]
Phone: [CSM phone]

We're here to ensure your success. Don't hesitate to reach out!

Best regards,
[CSM Name]
Customer Success Manager
VITAL Platform

---
VITAL Platform | https://vital.health
The Future of Healthcare Intelligence
```

### 4.2 Training Invitation

```
Subject: VITAL Platform Training - [Date] at [Time]

Hi [Name],

You're invited to VITAL Platform training!

SESSION DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Date: [Date]
Time: [Time] [Timezone]
Duration: [X] minutes
Join Link: [Video call link]

WHAT WE'LL COVER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Platform navigation
• Ask Expert 4-mode system
• Hands-on practice
• Best practices
• Q&A

BEFORE THE SESSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Please ensure you can:
□ Log in to https://app.vital.health
□ Reset your password
□ Enable MFA

Having trouble? Reply to this email or contact support@vital.health

See you there!

[CSM Name]
```

### 4.3 Go-Live Confirmation

```
Subject: You're Live on VITAL Platform!

Dear [Customer Name],

Congratulations! [Company Name] is now officially live on VITAL Platform!

WHAT THIS MEANS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ All users are provisioned and trained
✓ Primary use cases are validated
✓ Support channels are active
✓ Your pilot period has begun

QUICK ACCESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Platform: https://app.vital.health
User Guide: https://docs.vital.health/guide
Support: support@vital.health

GETTING SUPPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• In-app chat: Available 9am-6pm EST
• Email: support@vital.health
• Emergency: +1-XXX-XXX-XXXX

NEXT STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 30-Day Review scheduled for [Date]

We'll review your usage, gather feedback, and ensure you're
getting maximum value from VITAL.

Welcome aboard!

[CSM Name]
Customer Success Manager
```

### 4.4 Weekly Check-in Template

```
Subject: VITAL Platform - Weekly Check-in | [Company Name]

Hi [Name],

Here's your weekly VITAL Platform summary:

THIS WEEK'S USAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Queries: [X]
Active Users: [X] of [Y]
Most Used Mode: Mode [X]
Top Agents Used: [Agent 1], [Agent 2], [Agent 3]

HIGHLIGHTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• [Highlight 1]
• [Highlight 2]

TIPS FOR THIS WEEK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Contextual tip based on their usage]

QUESTIONS OR FEEDBACK?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Reply to this email or book time with me: [Calendar link]

Best,
[CSM Name]
```

---

## Part 5: User Training Materials

### 5.1 Quick Start Guide (1-Page)

```
┌─────────────────────────────────────────────────────────────────┐
│              VITAL PLATFORM - QUICK START GUIDE                  │
└─────────────────────────────────────────────────────────────────┘

STEP 1: LOG IN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Go to https://app.vital.health
2. Enter your email and password
3. Complete MFA verification

STEP 2: CHOOSE YOUR MODE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Two toggles control your experience:

┌─────────────────────────────────────────────────────────────────┐
│ AUTONOMOUS Toggle:                                               │
│   OFF = Interactive (conversation)                               │
│   ON  = Autonomous (goal-driven execution)                       │
│                                                                   │
│ AUTOMATIC Toggle:                                                 │
│   OFF = Manual (you choose expert)                               │
│   ON  = Automatic (AI selects experts)                           │
└─────────────────────────────────────────────────────────────────┘

STEP 3: PICK THE RIGHT MODE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Mode 1: "I want to talk to THIS specific expert"
        → Autonomous OFF, Automatic OFF

Mode 2: "Find me the best expert for my question"
        → Autonomous OFF, Automatic ON

Mode 3: "Execute this workflow with my chosen expert"
        → Autonomous ON, Automatic OFF

Mode 4: "Assemble a team and complete this goal"
        → Autonomous ON, Automatic ON

STEP 4: ASK YOUR QUESTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Be specific (include context)
• State your goal clearly
• Mention constraints or requirements

Example: "I need a competitive analysis of the CAR-T therapy
market focusing on pricing strategies for the US market."

STEP 5: REVIEW & ITERATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Review the response
• Ask follow-up questions
• Request citations if needed

NEED HELP?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Support: support@vital.health
Docs: docs.vital.health
```

### 5.2 Mode Selection Decision Tree

```
START HERE: What do you need?
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│ Do you know which expert you want?                               │
└─────────────────────────────────────────────────────────────────┘
          │
    ┌─────┴─────┐
    │           │
   YES          NO
    │           │
    ▼           ▼
┌───────────────────┐  ┌───────────────────┐
│ Is it a simple    │  │ Is it a simple    │
│ question or       │  │ question or       │
│ conversation?     │  │ conversation?     │
└───────────────────┘  └───────────────────┘
    │                       │
┌───┴───┐              ┌────┴────┐
│       │              │         │
YES     NO             YES       NO
│       │              │         │
▼       ▼              ▼         ▼
┌─────┐ ┌─────┐       ┌─────┐   ┌─────┐
│MODE │ │MODE │       │MODE │   │MODE │
│  1  │ │  3  │       │  2  │   │  4  │
└─────┘ └─────┘       └─────┘   └─────┘

MODE 1: Focused Expert Conversation
        30-45 seconds | You select expert

MODE 2: Smart Expert Discussion
        45-60 seconds | AI selects 1-2 experts

MODE 3: Expert-Driven Workflow
        3-5 minutes | You select expert, autonomous execution

MODE 4: AI Collaborative Workflow
        5-10 minutes | AI assembles team, autonomous execution
```

### 5.3 Best Practices Cheat Sheet

```
┌─────────────────────────────────────────────────────────────────┐
│                    VITAL BEST PRACTICES                          │
└─────────────────────────────────────────────────────────────────┘

✅ DO THIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Be specific about your industry/context
  "For a Phase 3 oncology trial in the US..."

• State your desired outcome
  "I need a recommendation on..."

• Include relevant constraints
  "Budget is $500K, timeline is 6 months..."

• Ask for citations when needed
  "Please cite sources for regulatory requirements"

• Use follow-up questions
  "Can you elaborate on point #3?"

• Try different modes for different needs
  Mode 2 for exploration, Mode 4 for execution


❌ AVOID THIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Vague questions
  ❌ "Tell me about FDA"
  ✅ "What are FDA requirements for 510(k) submissions for
     Class II cardiovascular devices?"

• Missing context
  ❌ "Is this a good strategy?"
  ✅ "Is this market entry strategy appropriate for a
     mid-size biotech entering the EU market?"

• Overloading single queries
  ❌ "Create complete regulatory strategy, market analysis,
     pricing model, and launch plan"
  ✅ Break into separate queries or use Mode 4

• Ignoring expert recommendations
  The experts suggest next steps - follow up on them!


💡 PRO TIPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Start with Mode 2 if you're unsure which expert to use
2. Save complex multi-step work for Mode 3 or 4
3. Build on previous conversations - experts remember context
4. Check the confidence score in responses
5. Request alternative perspectives when making decisions
```

---

## Part 6: Customer Success Metrics

### 6.1 Onboarding Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Time to First Query | <3 days | Analytics |
| Users Trained | 100% | Training records |
| Training Satisfaction | >4.5/5 | Survey |
| First Week Queries | >20 | Analytics |
| Issues Reported | <3 | Support tickets |

### 6.2 Ongoing Success Metrics

| Metric | Target | Frequency |
|--------|--------|-----------|
| Monthly Active Users | >80% of licenses | Monthly |
| Queries per User | >50/month | Monthly |
| NPS Score | >50 | Quarterly |
| Support Tickets | <5/month | Monthly |
| Renewal Intent | >90% | Quarterly |

### 6.3 Health Score Calculation

```
Customer Health Score =
  (Usage Score × 0.3) +
  (Engagement Score × 0.3) +
  (Support Score × 0.2) +
  (Satisfaction Score × 0.2)

Usage Score:
  - >80% MAU = 100
  - 60-80% MAU = 75
  - 40-60% MAU = 50
  - <40% MAU = 25

Engagement Score:
  - Attended all check-ins = 100
  - Attended most = 75
  - Attended some = 50
  - Rarely attends = 25

Support Score:
  - <2 tickets/month = 100
  - 2-5 tickets/month = 75
  - 5-10 tickets/month = 50
  - >10 tickets/month = 25

Satisfaction Score:
  - NPS 50+ = 100
  - NPS 30-49 = 75
  - NPS 0-29 = 50
  - NPS <0 = 25

Health Interpretation:
  - 85-100: Healthy (green)
  - 65-84: Needs attention (yellow)
  - <65: At risk (red)
```

---

## Part 7: Troubleshooting During Onboarding

### 7.1 Common Issues

| Issue | Cause | Resolution |
|-------|-------|------------|
| Can't log in | Wrong credentials | Reset password via "Forgot Password" |
| MFA not working | Time sync issue | Sync device time, regenerate codes |
| SSO fails | Misconfigured IdP | Verify attribute mappings |
| Slow responses | Network issues | Check internet, try different network |
| Agent not responding | Mode mismatch | Verify correct mode selected |
| Empty response | Query too vague | Rephrase with more specificity |

### 7.2 Escalation Path

```
Level 1: Self-Service
├── User Guide: docs.vital.health
├── FAQ: docs.vital.health/faq
└── In-app Help: Click "?" icon

Level 2: Support Team
├── In-app Chat: 9am-6pm EST
├── Email: support@vital.health
└── Response time: <4 hours

Level 3: Customer Success Manager
├── Email: [CSM email]
├── Phone: [CSM phone]
└── Slack: [Customer Slack channel]

Level 4: Emergency
├── Phone: +1-XXX-XXX-XXXX
└── Available: 24/7 for P0 issues
```

---

## Part 8: Post-Onboarding Transition

### 8.1 Handoff to Ongoing Support

**CSM Handoff Checklist:**
```
□ Customer profile updated in CRM
□ Use cases documented
□ Success criteria recorded
□ Key contacts verified
□ Support team briefed
□ 30-day review scheduled
□ Quarterly business review scheduled
□ Renewal date noted
```

### 8.2 Ongoing Engagement Calendar

| Touchpoint | Timing | Format | Owner |
|------------|--------|--------|-------|
| Weekly Usage Email | Every Monday | Automated email | System |
| Bi-weekly Check-in | Every 2 weeks | 15-min call | CSM |
| Monthly Review | Monthly | 30-min call | CSM |
| QBR | Quarterly | 1-hour meeting | CSM + Exec |
| Renewal Discussion | 60 days before | Meeting | CSM + Sales |

### 8.3 Expansion Opportunities

**When to introduce additional features:**

| Trigger | Opportunity | Approach |
|---------|-------------|----------|
| High Mode 2 usage | Ask Panel | "Your team uses multi-expert frequently..." |
| Complex queries | Mode 3-4 training | "Let me show you autonomous modes..." |
| New team members | User expansion | "Ready to add more users?" |
| New use cases | Additional agents | "We have agents for that..." |
| Success stories | Case study | "Can we share your success?" |

---

## Appendix A: Onboarding Checklist (Printable)

```
┌─────────────────────────────────────────────────────────────────┐
│            VITAL CUSTOMER ONBOARDING CHECKLIST                   │
│                     Customer: _______________                    │
│                     CSM: _______________                         │
│                     Start Date: _______________                  │
└─────────────────────────────────────────────────────────────────┘

PRE-ONBOARDING
□ Pilot agreement signed
□ Customer contacts identified
□ Use cases documented
□ Tenant created
□ Admin account provisioned
□ Kickoff call scheduled

DAY 1: WELCOME
□ Welcome email sent
□ Admin can log in
□ Kickoff call completed
□ Success criteria agreed
□ Training scheduled

DAY 2-3: SETUP
□ All users provisioned
□ SSO configured (if applicable)
□ Platform tour completed
□ Hands-on training completed
□ All users certified

DAY 4-5: ACTIVATION
□ Primary use case executed
□ Use case documented
□ Team training complete
□ Super users identified
□ Quick reference distributed

DAY 6-7: GO-LIVE
□ Production verification passed
□ Go-live confirmed
□ Success check-in completed
□ 30-day review scheduled
□ Support handoff complete

SIGN-OFF
Customer: _______________ Date: _______________
CSM: _______________ Date: _______________
```

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Nov 27, 2025 | Launch Strategy Agent | Initial version |

---

*This guide should be reviewed and updated based on customer feedback after each onboarding cycle.*
