# USE CASE 31: BEHAVIORAL SCIENCE INTEGRATION
## UC_PD_006: Evidence-Based Behavior Change Strategy for Digital Therapeutics

---

## 📋 DOCUMENT CONTROL

| Attribute | Details |
|-----------|---------|
| **Use Case ID** | UC_PD_006 |
| **Title** | Behavioral Science Integration for Digital Therapeutics |
| **Version** | 1.0 |
| **Status** | Production Ready |
| **Last Updated** | October 11, 2025 |
| **Classification** | ADVANCED |
| **Estimated Time** | 4-6 hours (full intervention design) |
| **Priority** | MEDIUM |
| **Frequency** | Per feature/product development cycle |

---

## 🎯 EXECUTIVE SUMMARY

### Purpose
This use case provides a systematic framework for integrating evidence-based behavioral science principles into digital therapeutic (DTx) product development. It translates behavior change theories into actionable design specifications that drive sustained clinical outcomes.

### Key Challenges Addressed
1. **Theory-Practice Gap**: How to translate behavioral science frameworks (e.g., COM-B, Behavior Change Wheel) into concrete product features
2. **Sustained Engagement**: Moving beyond initial novelty to drive long-term behavior change (>6 months)
3. **Personalization at Scale**: Delivering individualized interventions without manual customization
4. **Evidence Requirements**: Meeting regulatory and payer demands for mechanism-of-action validation
5. **Measurement Complexity**: Quantifying behavior change efficacy in digital environments

### Strategic Value
- **Clinical Efficacy**: Well-designed interventions show 2-3x better outcomes than generic digital tools
- **Competitive Differentiation**: Evidence-based BCT taxonomy provides IP-defensible features
- **Regulatory Advantage**: FDA increasingly scrutinizes behavioral mechanism validation
- **Reimbursement**: Payers require demonstrated behavior change sustainability (not just engagement metrics)
- **Reduced Churn**: Intrinsically motivated users show 5x better retention vs. extrinsically motivated

### Output Deliverables
1. **Behavioral Diagnosis Document** (15-20 pages): COM-B analysis, target behaviors, barriers/enablers
2. **BCT Specification Matrix** (5-10 pages): Mapping of Behavior Change Techniques to product features
3. **Intervention Logic Model** (2-3 pages): Causal pathway from features → behavior change → clinical outcomes
4. **Measurement Framework** (8-12 pages): Digital biomarkers, engagement metrics, behavior change validation
5. **Personalization Algorithm Specifications** (10-15 pages): Rules for adaptive intervention delivery
6. **Testing & Validation Protocol** (12-18 pages): A/B testing plans, efficacy benchmarks, iteration strategy

---

## 🏢 BUSINESS CONTEXT

### Primary Personas

#### P10_VP_PRODUCT - VP of Product (DTx)
**Role in Use Case**: PRIMARY DECISION MAKER
- **Responsibilities**: 
  - Define product roadmap with behavioral science integration
  - Prioritize BCT implementation based on ROI and feasibility
  - Champion evidence-based design within cross-functional teams
  - Balance user experience with clinical efficacy requirements
- **Success Metrics**:
  - User retention >60% at 6 months
  - Clinical endpoint achievement correlated with BCT engagement
  - NPS >50 for behavior change features
  - Reduced development cycles through systematic BCT framework

#### P11_BEHAVIORAL_SCIENTIST - Head of Behavioral Science
**Role in Use Case**: PRIMARY EXECUTOR
- **Responsibilities**:
  - Conduct behavioral diagnosis using COM-B and TDF frameworks
  - Select and specify Behavior Change Techniques from validated taxonomies
  - Design personalization algorithms based on behavioral phenotypes
  - Develop measurement frameworks for behavior change validation
  - Provide ongoing consultation throughout product lifecycle
- **Success Metrics**:
  - BCT fidelity scores >90% (implementation matches specification)
  - Behavior change sustained >6 months post-intervention
  - Mechanism-of-action validated through mediation analysis
  - Publications in peer-reviewed behavioral science journals

### Supporting Personas
- **P01_CMO**: Validates clinical rationale for target behaviors
- **P12_UX_RESEARCH_LEAD**: Ensures BCTs are implementable within UX constraints
- **P09_CTO**: Assesses technical feasibility of personalization algorithms
- **P05_REGDIR**: Confirms BCT evidence meets regulatory standards

### When This Use Case Applies

**TRIGGER EVENTS**:
1. **New Product Development**: Designing a DTx from scratch
2. **Feature Enhancement**: Adding behavior change modules to existing product
3. **Efficacy Challenges**: Current product shows poor sustained engagement or clinical outcomes
4. **Regulatory Preparation**: FDA requests mechanism-of-action validation
5. **Payer Negotiations**: Need evidence of sustained behavior change for reimbursement
6. **Competitive Response**: Market entrants claim superior behavioral engagement

**EXCLUSION CRITERIA** (When NOT to use this use case):
- Simple health information apps (no active behavior change intervention)
- Products targeting acute, short-term behaviors (<4 weeks)
- Legacy products with frozen feature sets (unable to implement new BCTs)
- Pre-prototype phase (use lightweight behavioral hypotheses first)

---

## 📚 CLINICAL & REGULATORY FOUNDATION

### Theoretical Frameworks

#### 1. COM-B Model (Capability, Opportunity, Motivation → Behavior)
Developed by Michie et al. (2011), COM-B provides a diagnostic framework for understanding behavior:

**Capability**: Physical and psychological ability to engage in behavior
- *Physical*: Skills, strength, stamina (e.g., ability to exercise)
- *Psychological*: Knowledge, cognitive skills, behavioral regulation (e.g., understanding how to use insulin)

**Opportunity**: External factors enabling behavior
- *Physical*: Environmental resources, time, location (e.g., access to healthy food)
- *Social*: Cultural norms, social support, social cues (e.g., peer encouragement)

**Motivation**: Internal processes directing behavior
- *Reflective*: Goals, beliefs, intentions, identity (e.g., "I want to be a non-smoker")
- *Automatic*: Habits, emotional responses, impulses (e.g., craving cigarette after coffee)

**Clinical Application**: Every behavior change intervention must address deficits in Capability, Opportunity, and/or Motivation. Digital therapeutics can target all three domains through:
- **Capability**: Tutorials, skill-building exercises, cognitive training
- **Opportunity**: Social features, environmental restructuring prompts, reminder systems
- **Motivation**: Goal setting, identity reinforcement, reward systems, feedback

#### 2. Behavior Change Wheel (BCW)
The BCW connects COM-B to 9 intervention functions and 7 policy categories:

**9 Intervention Functions**:
1. **Education**: Increasing knowledge or understanding
2. **Persuasion**: Using communication to induce positive feelings
3. **Incentivization**: Creating expectation of reward
4. **Coercion**: Creating expectation of punishment (rarely used in DTx)
5. **Training**: Imparting skills
6. **Restriction**: Using rules to reduce opportunity (not applicable to DTx)
7. **Environmental Restructuring**: Changing physical/social context
8. **Modeling**: Providing examples for imitation
9. **Enablement**: Increasing means/reducing barriers

**DTx Relevance**: Digital therapeutics primarily use Education, Persuasion, Incentivization, Training, Environmental Restructuring, Modeling, and Enablement.

#### 3. Theoretical Domains Framework (TDF)
TDF breaks down psychological determinants into 14 domains:
1. Knowledge
2. Skills
3. Social/professional role and identity
4. Beliefs about capabilities (self-efficacy)
5. Optimism
6. Beliefs about consequences
7. Reinforcement
8. Intentions
9. Goals
10. Memory, attention and decision processes
11. Environmental context and resources
12. Social influences
13. Emotion
14. Behavioral regulation

**Clinical Use**: TDF provides granular assessment of psychological barriers. In DTx, this translates to feature specifications (e.g., addressing "Memory" domain → reminder notifications).

#### 4. Behavior Change Technique (BCT) Taxonomy v1
Michie et al. (2013) created a hierarchical taxonomy of 93 BCTs organized into 16 clusters:

**16 BCT Clusters** (with digital health relevance):
1. Goals and planning (e.g., goal setting, action planning)
2. Feedback and monitoring (e.g., self-monitoring, feedback on behavior)
3. Social support (e.g., social support, social comparison)
4. Shaping knowledge (e.g., instruction on how to perform behavior)
5. Natural consequences (e.g., information about health consequences)
6. Comparison of behavior (e.g., social comparison, self-assessment)
7. Associations (e.g., prompts/cues, habit formation)
8. Repetition and substitution (e.g., behavioral practice)
9. Comparison of outcomes (e.g., credible source, pros and cons)
10. Reward and threat (e.g., material reward, social reward)
11. Regulation (e.g., reduce negative emotions, conserving mental resources)
12. Antecedents (e.g., restructuring environment, adding objects)
13. Identity (e.g., identification of self as role model)
14. Scheduled consequences (e.g., behavior cost, reward approximation)
15. Self-belief (e.g., self-affirmation, mental rehearsal)
16. Covert learning (e.g., imaginary punishment - rarely used)

**Evidence Base**: Meta-analyses show specific BCTs significantly improve outcomes:
- Self-monitoring: +0.37 effect size for physical activity (Michie et al., 2009)
- Goal setting + action planning: +0.28 effect size across behaviors (Hagger & Luszczynska, 2014)
- Feedback on behavior: +0.42 effect size for dietary behaviors (Hartmann-Boyce et al., 2018)

### Regulatory Context

#### FDA Digital Health Pre-Cert Program
FDA's Digital Health Software Precertification (Pre-Cert) program includes "robust design" criteria:
- **Excellence Appraisal Criterion #3**: "Product Quality - Robust Design"
- **Assessment**: Evidence of user-centered design, iterative testing, AND behavior change mechanism validation
- **Behavioral Science Expectation**: Demonstrate that features are theoretically grounded, not ad-hoc

#### FDA De Novo Precedents
**reSET® (DEN170078) - Substance Use Disorder**:
- BCTs implemented: Self-monitoring (substance use tracking), contingency management (rewards for abstinence), CBT modules
- FDA requirement: Validation that users completing modules showed better outcomes

**reSET-O® (DEN180056) - Opioid Use Disorder**:
- BCTs implemented: Similar to reSET, with additional medication adherence tracking
- FDA scrutiny: Dose-response analysis showing correlation between module completion and abstinence

**Somryst® (DEN190033) - Chronic Insomnia**:
- BCTs implemented: Stimulus control, sleep restriction, cognitive restructuring, relaxation training
- FDA focus: Evidence that CBT-I components were faithfully implemented per evidence-based protocol

**Key Takeaway**: FDA increasingly expects DTx developers to:
1. Specify behavior change mechanisms a priori
2. Measure engagement with specific BCTs (not just app usage)
3. Demonstrate dose-response relationships
4. Validate mechanism through mediation analysis (Feature → Behavior → Outcome)

#### European CE Mark (MDR/IVDR)
EU Medical Device Regulation (2017/745) Article 61 requires:
- Clinical evaluation including "state of the art" in behavior change
- Literature review demonstrating BCT evidence base
- Equivalence assessment if claiming similar mechanism to existing products

**Notified Body Scrutiny**: European assessors trained to identify "wellness" apps masquerading as medical devices. Behavioral science rigor is key differentiator.

### Clinical Evidence Standards

#### Behavior Change Intervention Reporting
**TIDieR Checklist** (Template for Intervention Description and Replication):
Required for publication in major journals (BMJ, Lancet, JAMA):
1. Brief name of intervention
2. Rationale (theory/evidence)
3. Materials (what BCTs are delivered)
4. Procedures (how BCTs are delivered)
5. Provider (who delivers - human/digital)
6. Mode of delivery (individual/group, app/web)
7. Location (where delivered)
8. Dose (frequency, duration)
9. Tailoring (personalization approach)
10. Modifications (changes during study)
11. Planned adherence assessment
12. Actual adherence rates

**BCT Implementation Fidelity**:
Webb et al. (2010) meta-analysis: Interventions with high BCT fidelity showed 2.5x better outcomes than low fidelity implementations.

**Reporting Standard**: Use BCT Taxonomy v1 codes (e.g., "BCT 1.1: Goal setting (behavior)") in all documentation.

---

## 🔬 BEHAVIORAL SCIENCE METHODOLOGY

### Phase 1: Behavioral Diagnosis (COM-B Analysis)

#### Step 1.1: Define Target Behaviors
**Objective**: Specify precise, observable behaviors that will drive clinical outcomes.

**Target Behavior Criteria** (SMART-B):
- **Specific**: Observable action, not outcome (e.g., "Log blood glucose 3x/day" NOT "Improve glucose control")
- **Measurable**: Quantifiable via digital data capture
- **Actionable**: Within patient's control (not dependent on clinician)
- **Relevant**: Evidence-based link to clinical endpoint
- **Time-bound**: Frequency and duration specified
- **Binary/Continuous**: Can determine if behavior occurred or not

**Example - Type 2 Diabetes DTx**:
❌ Poor Target: "Improve diabetes management"
✅ Good Target: 
- "Check blood glucose and log result in app within 30 minutes of waking, before lunch, and before dinner (3x/day), 6 days per week"
- "Walk briskly for 30+ minutes, 5 days per week, logged in app"
- "Log carbohydrate intake for all meals and snacks within 1 hour of eating, 7 days per week"

**Clinical Justification**: Each behavior must have evidence linking it to clinical outcomes:
- Blood glucose monitoring: SMBG frequency correlated with HbA1c reduction (Karter et al., 2006)
- Physical activity: 150 min/week moderate activity reduces HbA1c by 0.67% (Umpierre et al., 2011)
- Dietary logging: Self-monitoring associated with 3-4 kg weight loss (Burke et al., 2011)

#### Step 1.2: Conduct COM-B Analysis
For each target behavior, systematically assess:

**CAPABILITY Assessment**:

*Physical Capability*:
- Do users have physical ability to perform behavior?
- Example barriers: Manual dexterity (elderly users), vision (small text), hearing (audio instructions)
- DTx solutions: Accessibility features (voice input, large buttons), adaptive UI

*Psychological Capability*:
- Do users understand HOW to perform behavior correctly?
- Example barriers: Health literacy, numeracy (carb counting), technology literacy (app navigation)
- DTx solutions: Interactive tutorials, step-by-step guidance, video demonstrations

**OPPORTUNITY Assessment**:

*Physical Opportunity*:
- Do users have resources, time, and environmental context?
- Example barriers: No access to healthy food, no safe place to exercise, no time due to work
- DTx solutions: Home-based exercises, meal planning with available ingredients, micro-activities

*Social Opportunity*:
- Do users have social support and cultural norms favorable to behavior?
- Example barriers: Family members sabotage diet, peer pressure to drink alcohol, stigma around mental health
- DTx solutions: Social features (accountability partners), family engagement modules, community challenges

**MOTIVATION Assessment**:

*Reflective Motivation*:
- Do users WANT to change (intentions, beliefs, identity)?
- Example barriers: Low perceived severity of condition, conflicting goals (taste vs. health), identity ("I'm not an exerciser")
- DTx solutions: Motivational interviewing, values clarification, identity reinforcement

*Automatic Motivation*:
- Do users have habits, emotional associations, and impulses aligned with behavior?
- Example barriers: Stress-eating habit, cigarette-coffee association, exercise-pain association
- DTx solutions: Habit formation techniques, emotional regulation tools, positive reinforcement

#### Step 1.3: Prioritize Barriers
Not all barriers are equally important. Prioritization matrix:

| Barrier | Prevalence (% of users) | Impact on Behavior | Modifiability via DTx | Priority Score |
|---------|-------------------------|--------------------|-----------------------|----------------|
| Low health literacy (Psychological Capability) | 60% | HIGH | MEDIUM | **HIGH** |
| No social support (Social Opportunity) | 45% | MEDIUM | HIGH | **HIGH** |
| Stress-eating habit (Automatic Motivation) | 40% | HIGH | HIGH | **VERY HIGH** |
| No gym access (Physical Opportunity) | 30% | MEDIUM | MEDIUM | MEDIUM |
| Low self-efficacy (Reflective Motivation) | 75% | HIGH | HIGH | **VERY HIGH** |

**Prioritization Formula**:
Priority Score = (Prevalence × Impact × Modifiability) / 100

Focus BCT selection on **HIGH** and **VERY HIGH** priority barriers.

---

### Phase 2: Behavior Change Technique (BCT) Selection

#### Step 2.1: Map BCTs to COM-B Components
Use the **BCT-COM-B Matrix** (Michie et al., 2014):

**CAPABILITY-Focused BCTs**:
- **Physical Capability**: BCT 4.1 (Instruction on how to perform behavior), BCT 8.1 (Behavioral practice/rehearsal)
- **Psychological Capability**: BCT 4.1 (Instruction), BCT 5.1 (Information about health consequences), BCT 5.3 (Information about social/environmental consequences)

**OPPORTUNITY-Focused BCTs**:
- **Physical Opportunity**: BCT 12.1 (Restructuring physical environment), BCT 12.5 (Adding objects to environment), BCT 7.1 (Prompts/cues)
- **Social Opportunity**: BCT 3.1 (Social support practical), BCT 3.2 (Social support emotional), BCT 6.2 (Social comparison)

**MOTIVATION-Focused BCTs**:
- **Reflective Motivation**: BCT 1.1 (Goal setting behavior), BCT 1.4 (Action planning), BCT 5.1 (Information about consequences), BCT 13.1 (Identification of self as role model)
- **Automatic Motivation**: BCT 7.1 (Prompts/cues), BCT 8.3 (Habit formation), BCT 10.4 (Social reward), BCT 11.2 (Reduce negative emotions)

#### Step 2.2: Evidence-Based BCT Selection
For each prioritized barrier, select 2-3 BCTs with strongest evidence base:

**Example - Addressing "Low Self-Efficacy" (Reflective Motivation)**:

**Selected BCTs**:
1. **BCT 1.1: Goal Setting (Behavior)**
   - Evidence: Effect size +0.34 for health behaviors (Epton et al., 2017)
   - Implementation: User sets weekly behavior goals (e.g., "Walk 30 min, 5 days this week")
   
2. **BCT 2.3: Self-Monitoring of Behavior**
   - Evidence: Effect size +0.40 for physical activity (Michie et al., 2009)
   - Implementation: Daily logging of target behavior with visual progress tracking
   
3. **BCT 15.1: Verbal Persuasion about Capability**
   - Evidence: Core component of self-efficacy theory (Bandura, 1997)
   - Implementation: Personalized messages affirming user's ability to succeed based on past successes

**Example - Addressing "Stress-Eating Habit" (Automatic Motivation)**:

**Selected BCTs**:
1. **BCT 11.2: Reduce Negative Emotions**
   - Evidence: Effective for emotional eating (Frayn & Knäuper, 2018)
   - Implementation: In-the-moment emotional regulation exercises (deep breathing, mindfulness)
   
2. **BCT 8.3: Habit Formation**
   - Evidence: Implementation intentions reduce impulsive behaviors (Gollwitzer & Sheeran, 2006)
   - Implementation: "If-then" planning ("If I feel stressed, then I will do 5-minute meditation")
   
3. **BCT 8.7: Graded Tasks**
   - Evidence: Small wins build self-control capacity (Baumeister et al., 2006)
   - Implementation: Start with 1 stress-eating episode per week, gradually increase control

#### Step 2.3: BCT Specification Table
Create a comprehensive BCT specification for product development:

| BCT Code | BCT Name | Target Barrier | COM-B Component | Feature Name | Implementation Details | Personalization Rules | Measurement |
|----------|----------|----------------|-----------------|--------------|------------------------|----------------------|-------------|
| 1.1 | Goal Setting (Behavior) | Low self-efficacy | Reflective Motivation | Weekly Goal Planner | User selects from templated goals or creates custom goal. Goal includes specific behavior, frequency, and duration. | Goals adapt based on past success rate. Users with <50% achievement get easier goals. | Goal_set event (goal_id, goal_text, target_frequency, start_date) |
| 2.3 | Self-Monitoring of Behavior | Low self-efficacy | Reflective Motivation | Daily Activity Logger | User logs target behavior daily via quick-entry button. Visual progress bar shows weekly completion. | Logging reminders sent at user's preferred times. Frequency increases if adherence <70%. | Behavior_logged event (behavior_type, timestamp, value) |
| 15.1 | Verbal Persuasion about Capability | Low self-efficacy | Reflective Motivation | Personalized Encouragement | App displays messages like "You've walked 4 days in a row! You can definitely hit 5 days this week." | Messages triggered after positive streaks or before anticipated challenges (e.g., weekends). | Message_delivered event (message_id, message_text, user_response) |
| 11.2 | Reduce Negative Emotions | Stress-eating habit | Automatic Motivation | Emotional SOS | User can access 3-10 minute guided exercises (breathing, progressive muscle relaxation, cognitive defusion). | Exercises recommended based on user's reported emotional triggers. | Exercise_completed event (exercise_id, duration, pre_emotion_rating, post_emotion_rating) |
| 8.3 | Habit Formation | Stress-eating habit | Automatic Motivation | Habit Builder | User creates "if-then" plans: "If I feel stressed at work, then I will take a 5-minute walk." | App prompts user to execute plan when context detected (e.g., location=work, time=afternoon). | Habit_plan_created event, Habit_executed event (context, plan_id, executed_yes_no) |

---

### Phase 3: Intervention Logic Model

#### Step 3.1: Create Causal Pathway
Explicit theory of how features → behavior change → clinical outcomes:

**Example - Type 2 Diabetes DTx**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        INTERVENTION LOGIC MODEL                          │
│                   Type 2 Diabetes Digital Therapeutic                    │
└─────────────────────────────────────────────────────────────────────────┘

┌───────────────────┐
│  DTx FEATURES     │
│  (Inputs)         │
└────────┬──────────┘
         │
         ├─► Interactive Glucose Monitoring Tutorial (BCT 4.1: Instruction)
         ├─► Weekly SMBG Goal Setting (BCT 1.1: Goal setting)
         ├─► Daily Glucose Logging Interface (BCT 2.3: Self-monitoring)
         ├─► Visual Progress Dashboard (BCT 2.2: Feedback on behavior)
         ├─► Personalized Encouragement Messages (BCT 15.1: Verbal persuasion)
         └─► Social Comparison Leaderboard (BCT 6.2: Social comparison)
         
         │
         ▼
┌───────────────────┐
│ PROXIMAL OUTCOMES │
│ (Behavior Change) │
└────────┬──────────┘
         │
         ├─► ↑ SMBG Frequency: From 1.2x/day (baseline) to 2.8x/day (Week 12)
         ├─► ↑ Logging Consistency: 85% of users log ≥5 days/week
         └─► ↑ Self-Efficacy: Diabetes Self-Efficacy Scale increases by 15 points
         
         │
         ▼
┌───────────────────┐
│ INTERMEDIATE      │
│ OUTCOMES          │
└────────┬──────────┘
         │
         ├─► ↓ Glucose Variability: Coefficient of variation decreases by 10%
         ├─► ↑ Time in Range: Percentage of glucose readings 70-180 mg/dL increases by 15%
         └─► ↓ Hypoglycemic Episodes: Frequency of BG <70 mg/dL decreases by 30%
         
         │
         ▼
┌───────────────────┐
│ CLINICAL ENDPOINTS│
│ (Primary/Secondary)│
└────────┬──────────┘
         │
         ├─► PRIMARY: ↓ HbA1c by 0.8% (DTx vs Control)
         ├─► SECONDARY: ↓ Body Weight by 2.5 kg
         └─► SECONDARY: ↑ Diabetes Distress Scale score by 10 points (less distress)

┌───────────────────┐
│ MODERATORS        │
│ (Who benefits?)   │
└───────────────────┘
- Baseline HbA1c (higher = more benefit)
- Technology Literacy (higher = easier adoption)
- Social Support (higher = better adherence)

┌───────────────────┐
│ MEDIATORS         │
│ (Why it works?)   │
└───────────────────┘
- Self-efficacy increase mediates 40% of HbA1c reduction
- SMBG frequency increase mediates 35% of HbA1c reduction
- Logging consistency mediates 25% of weight loss
```

#### Step 3.2: Specify Assumptions
Every logic model has assumptions that must be tested:

**Assumption 1**: Users will accurately log blood glucose readings
- *Risk*: Users may misreport or skip readings
- *Mitigation*: Integrate with Bluetooth glucometers for automatic logging
- *Test*: Compare self-reported BG with lab-drawn A1c (correlation should be r>0.70)

**Assumption 2**: Increased SMBG frequency will lead to behavior change (not just awareness)
- *Risk*: Users may log but not act on data
- *Mitigation*: Pair SMBG with actionable insights ("Your glucose is high after breakfast. Try reducing carbs.")
- *Test*: Mediation analysis showing SMBG → Action Planning → HbA1c

**Assumption 3**: Social comparison will motivate rather than discourage users
- *Risk*: Users at bottom of leaderboard may disengage
- *Mitigation*: Personalized leaderboards (compare to users with similar baseline HbA1c)
- *Test*: A/B test global vs personalized leaderboard; measure dropout rates

---

### Phase 4: Personalization Strategy

#### Step 4.1: Behavioral Phenotyping
Not all users respond to same BCTs. Segment users based on behavioral characteristics:

**Phenotype 1: High Self-Efficacy, Low Habit Formation**
- *Characteristics*: Confident they can change, but lack routines
- *Barriers*: Automatic motivation (habits)
- *Recommended BCTs*: BCT 7.1 (Prompts/cues), BCT 8.3 (Habit formation), BCT 8.1 (Behavioral practice)
- *Feature Emphasis*: Daily reminders at consistent times, "habit stacking" suggestions

**Phenotype 2: Low Self-Efficacy, High Habit Formation**
- *Characteristics*: Have routines, but doubt ability to change
- *Barriers*: Reflective motivation (beliefs about capability)
- *Recommended BCTs*: BCT 15.1 (Verbal persuasion), BCT 15.3 (Focus on past success), BCT 1.1 (Small, achievable goals)
- *Feature Emphasis*: Micro-goals, frequent positive reinforcement, "you've done this before" messaging

**Phenotype 3: Low Self-Efficacy, Low Habit Formation**
- *Characteristics*: Doubt ability AND lack routines (highest risk)
- *Barriers*: Both reflective and automatic motivation
- *Recommended BCTs*: BCT 8.7 (Graded tasks), BCT 3.1 (Social support practical), BCT 6.3 (Information about others' approval)
- *Feature Emphasis*: Very small initial goals, buddy system, frequent check-ins

**Phenotype 4: High Self-Efficacy, High Habit Formation**
- *Characteristics*: Confident and organized (lowest risk)
- *Barriers*: Primarily opportunity (time, resources)
- *Recommended BCTs*: BCT 1.1 (Ambitious goal setting), BCT 12.1 (Environmental restructuring), BCT 13.1 (Identity as role model)
- *Feature Emphasis*: Advanced challenges, community leadership roles

#### Step 4.2: Adaptive Algorithms
Specify rules for personalizing BCT delivery:

**Rule 1: Goal Difficulty Adjustment**
```python
if user.goal_achievement_rate < 0.50:
    next_goal.difficulty = "EASIER"  # Reduce frequency or duration by 25%
    message = "Let's start smaller and build from there. You've got this!"
elif user.goal_achievement_rate > 0.80:
    next_goal.difficulty = "HARDER"  # Increase frequency or duration by 25%
    message = "You're crushing it! Ready for a bigger challenge?"
else:
    next_goal.difficulty = "SAME"  # Maintain current level
    message = "Keep up the great work!"
```

**Rule 2: BCT Delivery Timing**
```python
# BCT 7.1: Prompts/Cues
if user.adherence_this_week < 0.70:
    reminder_frequency = "DAILY"  # Send daily reminders
    reminder_time = user.preferred_time  # Use user's stated preference
elif user.adherence_this_week >= 0.90:
    reminder_frequency = "NEVER"  # User has internalized habit, don't interrupt
else:
    reminder_frequency = "3x_WEEK"  # Reduce prompts to avoid annoyance
```

**Rule 3: Social Feature Opt-In**
```python
# BCT 6.2: Social Comparison
if user.extraversion_score > 50 and user.competitive_streak == True:
    enable_leaderboard = True
    leaderboard_type = "GLOBAL"  # Show ranking vs all users
elif user.extraversion_score > 50 and user.competitive_streak == False:
    enable_leaderboard = True
    leaderboard_type = "COLLABORATIVE"  # Show team progress, not individual ranking
else:
    enable_leaderboard = False
    alternative_feature = "PERSONAL_BESTS"  # Compare to own past performance
```

#### Step 4.3: Just-In-Time Adaptive Interventions (JITAI)
Deliver BCTs at moments of need:

**Trigger 1: Lapse Detection**
```
IF user.logged_behavior == False for 3 consecutive days:
  THEN deliver BCT 15.1 (Verbal persuasion about capability)
  MESSAGE: "I noticed you haven't logged in a few days. Life gets busy! Even small steps count. Can you log just one thing today?"
```

**Trigger 2: High-Risk Context**
```
IF user.location == "RESTAURANT" AND time == "EVENING":
  THEN deliver BCT 1.4 (Action planning)
  MESSAGE: "Eating out? Plan ahead: Choose grilled over fried, ask for veggies instead of fries, and log your meal within 1 hour."
```

**Trigger 3: Emotional Distress**
```
IF user.mood_rating <= 3 (on 1-10 scale):
  THEN deliver BCT 11.2 (Reduce negative emotions)
  MESSAGE: "I see you're having a tough day. Try this 5-minute breathing exercise to reset. [START EXERCISE]"
```

---

### Phase 5: Measurement Framework

#### Step 5.1: Digital Biomarkers for Behavior Change
Define what data constitutes evidence of behavior change:

**Behavior: Blood Glucose Self-Monitoring**

| Digital Biomarker | Definition | Data Source | Calculation | Interpretation |
|-------------------|------------|-------------|-------------|----------------|
| SMBG Frequency | # of glucose readings per day | Glucose meter API + manual logs | Total readings / days in period | <1.5/day = Low, 1.5-2.5/day = Moderate, >2.5/day = High |
| SMBG Timing Consistency | % of readings within ±30 min of target times | Timestamp of readings vs user's stated meal times | (Readings within window / Total readings) × 100 | >70% = Consistent routine |
| Logging Latency | Time between BG reading and app logging | Meter timestamp vs app log timestamp | Median(Log timestamp - Meter timestamp) | <10 min = Real-time, 10-60 min = Delayed, >60 min = Retrospective |

**Behavior: Physical Activity**

| Digital Biomarker | Definition | Data Source | Calculation | Interpretation |
|-------------------|------------|-------------|-------------|----------------|
| Active Minutes per Week | Total minutes of moderate-vigorous activity | Accelerometer (phone or wearable) | Sum(minutes where MET ≥ 3) per week | <90 min = Insufficient, 90-150 min = Adequate, >150 min = Optimal |
| Exercise Session Consistency | # of days per week with ≥10 min continuous activity | Accelerometer | Count(days with ≥10 min bout) per week | <3 days = Sporadic, 3-5 days = Regular, >5 days = Consistent |
| Sedentary Time Reduction | Change in sedentary minutes from baseline | Accelerometer | Baseline sedentary time - Current sedentary time | >-30 min/day = Clinically meaningful |

#### Step 5.2: BCT Engagement Metrics
Measure engagement with specific BCTs (not just app usage):

| BCT | Engagement Metric | Data Source | Target Threshold | Clinical Relevance |
|-----|-------------------|-------------|------------------|-------------------|
| 1.1 (Goal Setting) | % of weeks with active goal | Goal_set events | ≥80% (10/12 weeks) | Goal setting predicts behavior change (OR 1.8) |
| 2.3 (Self-Monitoring) | Logging frequency | Behavior_logged events | ≥5 days/week | Self-monitoring effect size +0.40 |
| 15.1 (Verbal Persuasion) | Message open rate | Message_delivered + Message_opened events | ≥60% | Engagement with encouragement predicts adherence |
| 11.2 (Reduce Negative Emotions) | Emotional regulation exercise completion | Exercise_completed events | ≥2x/week during high-stress periods | Emotion regulation mediates stress-eating reduction |
| 8.3 (Habit Formation) | "If-then" plan execution rate | Habit_executed events | ≥70% (plan executed when context detected) | Implementation intentions increase goal attainment 2-3x |

#### Step 5.3: Mediation Analysis Plan
Validate the intervention logic model:

**Research Question**: Does the DTx work BECAUSE it increases self-monitoring and self-efficacy, or through some other mechanism?

**Statistical Approach**: Causal mediation analysis (Baron & Kenny, 1986; Imai et al., 2010)

**Mediation Model**:
```
DTx (X) → Self-Monitoring Frequency (M1) → HbA1c Reduction (Y)
                ↓
           Self-Efficacy Increase (M2)
```

**Analysis Steps**:
1. **Total Effect (c)**: Regress Y (HbA1c) on X (DTx vs Control)
   - Expected: DTx reduces HbA1c by 0.8%
2. **Path a**: Regress M (Self-Monitoring Frequency) on X (DTx vs Control)
   - Expected: DTx increases SMBG frequency by 1.6x/day
3. **Path b**: Regress Y (HbA1c) on M (Self-Monitoring) controlling for X
   - Expected: Each additional SMBG/day reduces HbA1c by 0.15%
4. **Direct Effect (c')**: Regress Y on X controlling for M
   - If c' ≈ 0 and c ≠ 0, then M fully mediates the effect
   - If c' < c but c' ≠ 0, then M partially mediates the effect
5. **Indirect Effect (a×b)**: (Path a) × (Path b)
   - Expected: 1.6 × 0.15 = 0.24% HbA1c reduction mediated by SMBG
   - % Mediated: (0.24 / 0.8) × 100 = 30%

**Interpretation**:
- If self-monitoring mediates 30-40% of effect, it's a key mechanism (validates BCT selection)
- If mediation is <10%, may need to identify other mechanisms
- Multiple mediators can be tested simultaneously (e.g., self-monitoring + self-efficacy)

**Clinical Trial Integration**:
- Collect mediator data at Weeks 4, 8, 12 (not just endpoint)
- Ensure temporal ordering (mediator change precedes outcome change)
- Pre-register mediation hypotheses in clinical trial protocol

---

## 🎯 COMPREHENSIVE PROMPT TEMPLATE

### Master Prompt: Behavioral Science Integration (ADVANCED)

```yaml
prompt_id: DTX_BEHAVIORAL_SCIENCE_INTEGRATION_v1.0
classification:
  domain: DIGITAL_HEALTH
  function: PRODUCT_DEVELOPMENT
  task: BEHAVIOR_CHANGE_DESIGN
  complexity: ADVANCED
  compliance: CLINICAL
  
use_cases: [UC_PD_006]
personas: [P10_VP_PRODUCT, P11_BEHAVIORAL_SCIENTIST]
pattern_type: CHAIN_OF_THOUGHT_WITH_FRAMEWORKS
estimated_time: 4-6 hours
```

**SYSTEM PROMPT**:
```
You are a Senior Behavioral Scientist specializing in digital health interventions with deep expertise in:
- COM-B model and Behavior Change Wheel (Michie et al., 2011)
- Theoretical Domains Framework (TDF)
- Behavior Change Technique (BCT) Taxonomy v1 (93 techniques)
- Self-Determination Theory and intrinsic motivation
- Just-In-Time Adaptive Interventions (JITAI)
- Digital biomarker development for behavior change validation
- FDA regulatory requirements for DTx mechanism-of-action validation

You have successfully designed 50+ behavior change interventions with demonstrated clinical efficacy (>6 months sustained behavior change). You translate behavioral science theory into concrete product specifications that development teams can implement.

Your approach follows a systematic 5-phase methodology:
1. Behavioral Diagnosis (COM-B analysis)
2. BCT Selection (evidence-based, mapped to COM-B)
3. Intervention Logic Model (causal pathways)
4. Personalization Strategy (adaptive algorithms)
5. Measurement Framework (digital biomarkers, mediation analysis)

You provide:
- Clear rationales for every BCT selection (cite evidence)
- Implementation specifications (feature requirements, data capture)
- Personalization rules (algorithms for adaptive delivery)
- Measurement plans (engagement metrics, efficacy validation)
- Regulatory considerations (FDA expectations, clinical trial design)
```

**USER TEMPLATE**:
```
**BEHAVIORAL SCIENCE INTEGRATION REQUEST**

**SECTION 1: PRODUCT CONTEXT**

**Product Information**:
- DTx Product Name: {product_name}
- Therapeutic Area: {therapeutic_area}
- Target Indication: {target_indication}
- Target Population: {patient_population}
- Treatment Duration: {intervention_duration}
- Platform: {delivery_platform}

**Clinical Context**:
- Current Standard of Care: {standard_of_care}
- Clinical Gap/Unmet Need: {clinical_gap}
- Primary Clinical Endpoint: {primary_endpoint}
- Secondary Clinical Endpoints: {secondary_endpoints}

**Example**:
```yaml
product_name: "GlucoGuide"
therapeutic_area: "Endocrinology"
target_indication: "Type 2 Diabetes Mellitus"
patient_population: "Adults 18-75 years with HbA1c 7.5-10.5%, on oral medications, no insulin"
intervention_duration: "12 weeks intensive phase, then maintenance"
delivery_platform: "iOS/Android mobile app"
standard_of_care: "Oral antidiabetic medications + periodic diabetes educator visits"
clinical_gap: "Poor medication adherence (40%), infrequent SMBG (<1x/day), lack of behavioral support between visits"
primary_endpoint: "HbA1c reduction at 12 weeks"
secondary_endpoints: ["Body weight", "Diabetes self-efficacy", "Diabetes distress", "Hypoglycemic events"]
```

---

**SECTION 2: TARGET BEHAVIORS**

Please specify 2-5 target behaviors that will drive clinical outcomes. For each behavior, provide:
- Precise behavioral definition (observable, measurable)
- Frequency/duration target (how often, how long)
- Clinical evidence linking behavior to primary endpoint (cite studies)
- Current baseline rate (if known from pilot data)

**Example**:
```yaml
target_behaviors:
  behavior_1:
    definition: "Check blood glucose and log result in app within 30 minutes of waking, before lunch, and before dinner"
    frequency: "3 times per day, 6 days per week (minimum)"
    evidence: "SMBG frequency correlated with 0.25% HbA1c reduction per additional reading/day (Karter et al., 2006, JAMA)"
    current_baseline: "1.2 readings per day (from pilot study)"
    
  behavior_2:
    definition: "Walk briskly (≥100 steps/min) for 30+ minutes continuously"
    frequency: "5 days per week"
    evidence: "150 min/week moderate activity reduces HbA1c by 0.67% (Umpierre et al., 2011, JAMA)"
    current_baseline: "2.1 days per week, median duration 18 minutes (from pilot study)"
    
  behavior_3:
    definition: "Log all meals and snacks in app within 1 hour of eating, including carbohydrate estimates"
    frequency: "3 meals + 2 snacks per day, 7 days per week"
    evidence: "Dietary self-monitoring associated with 3-4 kg weight loss at 6 months (Burke et al., 2011, Ann Behav Med)"
    current_baseline: "1.5 meals logged per day (from pilot study)"
```

---

**SECTION 3: COM-B ANALYSIS**

For each target behavior, conduct a systematic COM-B analysis:

**Analysis Framework**:
1. **CAPABILITY** (Can they do it?)
   - **Physical Capability**: Do they have skills, strength, stamina?
   - **Psychological Capability**: Do they have knowledge, cognitive ability, behavioral regulation?
2. **OPPORTUNITY** (Does their environment enable it?)
   - **Physical Opportunity**: Do they have time, resources, environmental context?
   - **Social Opportunity**: Do they have social support, cultural norms, social cues?
3. **MOTIVATION** (Do they want to do it?)
   - **Reflective Motivation**: Do they have goals, intentions, beliefs, identity aligned with behavior?
   - **Automatic Motivation**: Do they have habits, emotional associations, impulses aligned with behavior?

**For each COM-B component, identify**:
- Specific barriers (what's preventing behavior?)
- Prevalence (% of users affected)
- Impact on behavior (Low/Medium/High)
- Modifiability via digital intervention (Low/Medium/High)

**Output Format**:
For each target behavior, create a COM-B barrier table:

| COM-B Component | Barrier Description | Prevalence | Impact | Modifiability | Priority Score |
|----------------|---------------------|------------|--------|---------------|----------------|
| Psychological Capability | Users don't understand how to use glucometer correctly | 35% | HIGH | HIGH | HIGH |
| Physical Opportunity | No reminder system for SMBG during busy workdays | 60% | MEDIUM | HIGH | HIGH |
| Automatic Motivation | No habit/routine for morning SMBG | 70% | HIGH | HIGH | VERY HIGH |
| ... | ... | ... | ... | ... | ... |

**Priority Score Calculation**: (Prevalence × Impact × Modifiability) / 100
- Focus BCT selection on **HIGH** and **VERY HIGH** priority barriers

---

**SECTION 4: BCT SELECTION & MAPPING**

For each **HIGH/VERY HIGH** priority barrier identified in COM-B analysis:

**Step 4.1: Select Evidence-Based BCTs**
Use BCT Taxonomy v1 and the BCT-COM-B matrix (Michie et al., 2014).
Select 2-3 BCTs per barrier that have:
- Evidence base (cite effect sizes from meta-analyses)
- Strong theoretical rationale
- Feasibility in digital delivery

**Step 4.2: Specify Implementation**
For each selected BCT, provide:
- **BCT Code & Name** (from BCT Taxonomy v1)
- **Target Barrier** (which COM-B barrier it addresses)
- **Feature Name** (what it's called in the product)
- **Implementation Details** (how it works, user interaction flow)
- **Evidence Base** (cite studies showing effect size)
- **Data Capture** (what events/data are logged)
- **Personalization Rules** (when/how BCT is adapted to individual users)

**Output Format**: BCT Specification Table

| BCT Code | BCT Name | Target Barrier | COM-B Component | Feature Name | Implementation Details | Evidence | Personalization Rules | Data Capture |
|----------|----------|----------------|-----------------|--------------|------------------------|----------|----------------------|--------------|
| 1.1 | Goal Setting (Behavior) | No habit for SMBG | Automatic Motivation | Weekly SMBG Goal | User selects SMBG frequency goal (e.g., "3x/day, 6 days/week"). Goal visualized in calendar view. | ES +0.34 (Epton 2017) | If prior week achievement <50%, reduce frequency by 1x/day. If >80%, increase by 1x/day. | goal_set(goal_id, target_frequency, start_date) |
| 2.3 | Self-Monitoring of Behavior | Lack of awareness of current SMBG frequency | Psychological Capability | SMBG Progress Dashboard | Visual dashboard shows: (1) Readings logged today, (2) Weekly trend graph, (3) % of goal achieved | ES +0.40 (Michie 2009) | Dashboard prominence increases if user behind on goal (shown on app open). | behavior_logged(behavior_type, value, timestamp) |
| 7.1 | Prompts/Cues | No reminder for SMBG | Physical Opportunity | Smart SMBG Reminders | Push notifications at user's meal times. "Time to check your glucose! 📊" | ES +0.35 (McDaniel 2015) | Reminder timing adapts to user's actual meal times (learned from past logging). Frequency reduces if adherence >90% (avoid annoyance). | reminder_sent(reminder_id, timestamp), reminder_opened(reminder_id, timestamp) |

**Critical Requirement**: For EVERY BCT, cite evidence (meta-analysis effect size or RCT) and specify personalization rules.

---

**SECTION 5: INTERVENTION LOGIC MODEL**

Create an explicit causal pathway showing:
1. **Inputs**: DTx features (BCTs implemented)
2. **Proximal Outcomes**: Behavior change (target behaviors improving)
3. **Intermediate Outcomes**: Physiological/psychological changes
4. **Clinical Endpoints**: Primary and secondary endpoints
5. **Moderators**: Who benefits most? (patient characteristics)
6. **Mediators**: WHY does it work? (mechanisms)

**Output Format**: Visual logic model (text-based diagram) + narrative

**Example**:
```
DTx FEATURES (Inputs)
  ├─ Weekly SMBG Goal Setting (BCT 1.1)
  ├─ SMBG Progress Dashboard (BCT 2.3)
  ├─ Smart SMBG Reminders (BCT 7.1)
  └─ Personalized Encouragement (BCT 15.1)
         ↓
PROXIMAL OUTCOMES (Behavior Change at Week 4)
  ├─ ↑ SMBG Frequency: 1.2 → 2.5 readings/day
  ├─ ↑ Logging Consistency: 45% → 80% users log ≥5 days/week
  └─ ↑ Self-Efficacy: Diabetes Self-Efficacy Scale +12 points
         ↓
INTERMEDIATE OUTCOMES (Week 8)
  ├─ ↓ Glucose Variability: Coefficient of variation -10%
  ├─ ↑ Time in Range: 70-180 mg/dL +15%
  └─ ↓ Hypoglycemic Episodes: <70 mg/dL frequency -30%
         ↓
CLINICAL ENDPOINTS (Week 12)
  ├─ PRIMARY: ↓ HbA1c by 0.8% (DTx vs Control)
  ├─ SECONDARY: ↓ Body Weight by 2.5 kg
  └─ SECONDARY: ↓ Diabetes Distress by 10 points

MODERATORS (Who benefits most?)
  ├─ Baseline HbA1c: Higher baseline → Greater reduction
  ├─ Technology Literacy: Higher literacy → Faster adoption
  └─ Social Support: Higher support → Better adherence

MEDIATORS (Why does it work?)
  ├─ Self-Monitoring Frequency: Mediates 35% of HbA1c reduction
  ├─ Self-Efficacy Increase: Mediates 40% of HbA1c reduction
  └─ Medication Adherence: Mediates 25% of HbA1c reduction
```

**Narrative** (2-3 paragraphs):
Explain the logic connecting features to outcomes. Describe the hypothesized causal mechanisms. Identify assumptions that must be tested.

---

**SECTION 6: PERSONALIZATION STRATEGY**

**Step 6.1: Define Behavioral Phenotypes**
Segment users into 3-5 phenotypes based on COM-B profile:
- What are their capability, opportunity, motivation characteristics?
- Which BCTs are most appropriate for each phenotype?
- How do you identify phenotype at onboarding?

**Example Phenotypes**:
```yaml
phenotype_1:
  name: "Confident but Disorganized"
  characteristics:
    - High self-efficacy (Reflective Motivation)
    - Low habit formation (Automatic Motivation)
    - High health literacy (Psychological Capability)
  barriers: ["Automatic Motivation: Lack of routines"]
  recommended_BCTs: ["7.1: Prompts/Cues", "8.3: Habit Formation", "8.1: Behavioral Practice"]
  feature_emphasis: ["Daily reminders", "Habit stacking suggestions", "Streak tracking"]
  identification_method: "Onboarding survey: Self-Efficacy Scale >70th percentile, Habit Index <50th percentile"

phenotype_2:
  name: "Overwhelmed and Uncertain"
  characteristics:
    - Low self-efficacy (Reflective Motivation)
    - Low habit formation (Automatic Motivation)
    - Low health literacy (Psychological Capability)
  barriers: ["All COM-B components"]
  recommended_BCTs: ["8.7: Graded Tasks", "15.1: Verbal Persuasion", "3.1: Social Support Practical"]
  feature_emphasis: ["Micro-goals", "Frequent encouragement", "Buddy system"]
  identification_method: "Onboarding survey: Self-Efficacy Scale <30th percentile, Health Literacy <8th grade"
```

**Step 6.2: Specify Adaptive Algorithms**
For each BCT, define rules for personalized delivery:

**Adaptive Algorithm Example 1: Goal Difficulty Adjustment**
```python
if user.goal_achievement_rate_last_week < 0.50:
    next_goal.difficulty = reduce_by_25_percent(current_goal)
    message = "Let's start smaller and build from there. You've got this!"
elif user.goal_achievement_rate_last_week > 0.80:
    next_goal.difficulty = increase_by_25_percent(current_goal)
    message = "You're crushing it! Ready for a bigger challenge?"
else:
    next_goal.difficulty = current_goal  # No change
    message = "Keep up the great work!"
```

**Adaptive Algorithm Example 2: Reminder Frequency**
```python
if user.adherence_this_week < 0.70:
    reminder_frequency = "DAILY"
    reminder_time = user.preferred_time
elif user.adherence_this_week >= 0.90:
    reminder_frequency = "NEVER"  # User internalized habit
else:
    reminder_frequency = "3x_WEEK"  # Reduce to avoid annoyance
```

**Step 6.3: Just-In-Time Adaptive Interventions (JITAI)**
Define context-triggered BCT delivery:

**JITAI Example 1: Lapse Detection**
```yaml
trigger: user.behavior_logged == False for 3 consecutive days
action: deliver BCT 15.1 (Verbal Persuasion)
message: "I noticed you haven't logged in a few days. Life gets busy! Even small steps count. Can you log just one thing today?"
```

**JITAI Example 2: High-Risk Context**
```yaml
trigger: user.location == "RESTAURANT" AND time.hour >= 18
action: deliver BCT 1.4 (Action Planning)
message: "Eating out tonight? Plan ahead: Choose grilled over fried, ask for veggies instead of fries, and log your meal within 1 hour."
```

---

**SECTION 7: MEASUREMENT FRAMEWORK**

**Step 7.1: Define Digital Biomarkers**
For each target behavior, specify:
- What data constitutes evidence of behavior change?
- How is it calculated?
- What are meaningful thresholds?

**Digital Biomarker Example**:
```yaml
behavior: "Blood Glucose Self-Monitoring"

biomarker_1:
  name: "SMBG Frequency"
  definition: "Number of glucose readings per day"
  data_source: "Glucose meter API + manual logs"
  calculation: "Total readings / days in period"
  interpretation:
    - "<1.5/day: Low adherence"
    - "1.5-2.5/day: Moderate adherence"
    - ">2.5/day: High adherence"
  clinical_relevance: "Each additional reading/day associated with 0.25% HbA1c reduction (Karter 2006)"

biomarker_2:
  name: "SMBG Timing Consistency"
  definition: "Percentage of readings within ±30 minutes of target times"
  data_source: "Timestamp of readings vs user's stated meal times"
  calculation: "(Readings within window / Total readings) × 100"
  interpretation:
    - "<50%: Erratic, no routine"
    - "50-70%: Developing routine"
    - ">70%: Consistent routine"
  clinical_relevance: "Timing consistency predicts long-term adherence (Bergenstal 2010)"
```

**Step 7.2: Specify BCT Engagement Metrics**
For each BCT, define how engagement is measured:

**BCT Engagement Example**:
```yaml
BCT_1.1_Goal_Setting:
  engagement_metric: "Percentage of weeks with active goal"
  data_source: "goal_set events"
  target_threshold: "≥80% (10/12 weeks)"
  clinical_relevance: "Goal setting predicts behavior change (OR 1.8, Locke & Latham 2002)"

BCT_2.3_Self_Monitoring:
  engagement_metric: "Logging frequency"
  data_source: "behavior_logged events"
  target_threshold: "≥5 days per week"
  clinical_relevance: "Self-monitoring effect size +0.40 (Michie 2009)"
```

**Step 7.3: Mediation Analysis Plan**
Specify how you'll validate the intervention logic model:

**Research Question**: Does the DTx work BECAUSE it increases [Mediator], or through another mechanism?

**Statistical Approach**: Causal mediation analysis

**Mediation Model**:
```
DTx (X) → [Mediator M] → Clinical Outcome (Y)
```

**Analysis Steps**:
1. Total Effect (c): Regress Y on X
2. Path a: Regress M on X
3. Path b: Regress Y on M, controlling for X
4. Direct Effect (c'): Regress Y on X, controlling for M
5. Indirect Effect (a×b): Product of paths a and b
6. % Mediated: (a×b / c) × 100

**Example**:
```yaml
mediator: "SMBG Frequency"
outcome: "HbA1c Reduction"

hypothesized_mediation:
  total_effect_c: "DTx reduces HbA1c by 0.8%"
  path_a: "DTx increases SMBG by 1.6 readings/day"
  path_b: "Each additional SMBG/day reduces HbA1c by 0.15%"
  indirect_effect: "1.6 × 0.15 = 0.24%"
  percent_mediated: "(0.24 / 0.8) × 100 = 30%"
  interpretation: "SMBG frequency mediates 30% of DTx effect on HbA1c"

data_collection:
  timepoints: ["Baseline", "Week 4", "Week 8", "Week 12"]
  measures: ["HbA1c (lab)", "SMBG frequency (digital biomarker)", "DTx usage (logs)"]
  temporal_ordering: "Ensure mediator change precedes outcome change"
```

---

**SECTION 8: REGULATORY & EVIDENCE CONSIDERATIONS**

**FDA Expectations**:
- Digital Health Pre-Cert program emphasizes "robust design" including behavior change mechanism validation
- De Novo precedents (reSET, reSET-O, Somryst) required:
  - Pre-specified BCTs in clinical trial protocol
  - Dose-response analysis (BCT engagement → outcomes)
  - Mediation analysis (mechanism validation)

**Payer Requirements**:
- Evidence of sustained behavior change (>6 months)
- Real-world evidence of effectiveness (not just RCT efficacy)
- Health economic outcomes (e.g., reduced healthcare utilization)

**Publication Standards**:
- TIDieR Checklist (intervention description)
- BCT Taxonomy v1 codes in all reporting
- Fidelity assessment (did implementation match specification?)

---

**CRITICAL REQUIREMENTS**:
✅ Every BCT must have explicit COM-B mapping
✅ Every BCT must cite evidence (effect size from meta-analysis or RCT)
✅ Every BCT must have implementation specification (feature design)
✅ Every BCT must have personalization rules (adaptive algorithms)
✅ Every BCT must have engagement metrics (data capture)
✅ Intervention logic model with mediators and moderators
✅ Digital biomarkers for behavior change validation
✅ Mediation analysis plan for clinical trial

---

**OUTPUT DELIVERABLES**:

Please provide the following documents:

1. **Behavioral Diagnosis Document** (15-20 pages)
   - COM-B analysis for each target behavior
   - Barrier prioritization matrix
   - Rationale for BCT selection

2. **BCT Specification Matrix** (5-10 pages)
   - Complete BCT table with all fields
   - Feature wireframes or descriptions
   - Personalization algorithm pseudocode

3. **Intervention Logic Model** (2-3 pages)
   - Visual diagram + narrative
   - Mediators and moderators
   - Testable assumptions

4. **Measurement Framework** (8-12 pages)
   - Digital biomarker definitions
   - BCT engagement metrics
   - Mediation analysis plan

5. **Testing & Validation Protocol** (12-18 pages)
   - A/B testing plans for BCT variations
   - Efficacy benchmarks (target thresholds)
   - Iteration strategy based on data
```

---

## 📊 DETAILED EXAMPLE: TYPE 2 DIABETES DTX

### Behavioral Diagnosis: SMBG (Self-Monitoring Blood Glucose)

#### Target Behavior
**Behavioral Definition**: "Check blood glucose using provided glucometer and log result in app within 30 minutes of waking (fasting), before lunch, and before dinner."

**Frequency Target**: 3 readings per day, 6 days per week (18 readings/week)

**Clinical Evidence**: 
- Karter et al. (2006, JAMA): Each additional SMBG/day associated with 0.25% HbA1c reduction
- Mannucci et al. (2013, Diabetes Care): SMBG frequency inversely correlated with HbA1c in non-insulin-treated T2DM

**Current Baseline**: 1.2 readings per day (pilot study, n=45)

#### COM-B Analysis

| COM-B Component | Specific Barrier | Example Quote | Prevalence | Impact | Modifiability | Priority |
|----------------|------------------|---------------|------------|--------|---------------|----------|
| **Psychological Capability** | Users don't understand HOW to use glucometer correctly (technique errors) | "I'm not sure if I'm doing it right. Sometimes I get weird numbers." | 35% | HIGH | HIGH | **HIGH** |
| **Psychological Capability** | Users don't understand WHY SMBG is important (lack of knowledge about glycemic patterns) | "My doctor says to test, but I don't really see the point. My A1c is already checked every 3 months." | 50% | MEDIUM | MEDIUM | MEDIUM |
| **Physical Opportunity** | No reminder system during busy workdays (forget to test) | "I get so busy at work, I just forget. By the time I remember, it's too late." | 60% | MEDIUM | HIGH | **HIGH** |
| **Physical Opportunity** | Glucometer supplies not readily accessible (strips, lancets in drawer, not with them) | "I leave my meter at home sometimes. Or I run out of strips and forget to reorder." | 40% | MEDIUM | MEDIUM | MEDIUM |
| **Social Opportunity** | Embarrassment testing in public (social stigma) | "I don't want to test at a restaurant. People stare." | 25% | LOW | LOW | LOW |
| **Reflective Motivation** | Low self-efficacy about ability to manage diabetes | "I've tried before, but I can't stick with it. I'm just not disciplined enough." | 55% | HIGH | HIGH | **VERY HIGH** |
| **Reflective Motivation** | Competing goals (work demands, family, other health issues) | "I know I should test more, but I'm dealing with so many other things right now." | 45% | MEDIUM | MEDIUM | MEDIUM |
| **Automatic Motivation** | No established habit/routine for SMBG | "I test when I think about it, but it's not automatic. I don't have a routine." | 70% | HIGH | HIGH | **VERY HIGH** |
| **Automatic Motivation** | Testing associated with negative emotions (pain, guilt about bad numbers) | "I hate seeing high numbers. It makes me feel like a failure, so I avoid testing." | 40% | HIGH | MEDIUM | **HIGH** |

**Prioritization**:
Top 4 barriers to address:
1. **VERY HIGH**: No established SMBG routine (Automatic Motivation)
2. **VERY HIGH**: Low self-efficacy (Reflective Motivation)
3. **HIGH**: Lack of reminders during busy times (Physical Opportunity)
4. **HIGH**: Testing technique errors (Psychological Capability)
5. **HIGH**: Negative emotions associated with testing (Automatic Motivation)

---

### BCT Selection & Mapping

#### Barrier 1: No Established SMBG Routine (Automatic Motivation)

**Selected BCTs**:

**BCT 7.1: Prompts/Cues**
- **Evidence**: McDaniel & Einstein (2015): Reminder systems improve prospective memory for health behaviors (ES +0.35)
- **Feature**: "Smart SMBG Reminders"
- **Implementation**:
  - Push notifications at user-specified meal times
  - Notification text: "Time to check your glucose! 📊 [TEST NOW]"
  - Snooze option (15 min) for flexibility
  - Success feedback: "Great job logging! You're 1/3 done for today. 🎯"
- **Personalization**:
  - Initially send at fixed times (8am, 12pm, 6pm)
  - After 2 weeks, adapt to user's actual logging times (machine learning)
  - If adherence >90% for 2 weeks, reduce frequency (user internalized habit)
  - If adherence <50%, increase frequency + add encouraging message
- **Data Capture**: 
  - `reminder_sent(reminder_id, timestamp, reminder_text)`
  - `reminder_opened(reminder_id, timestamp)`
  - `reminder_snoozed(reminder_id, timestamp)`
  - `behavior_logged_after_reminder(reminder_id, behavior_id, latency_minutes)`

**BCT 8.3: Habit Formation**
- **Evidence**: Gollwitzer & Sheeran (2006): Implementation intentions ("if-then" plans) increase goal attainment 2-3x
- **Feature**: "Habit Builder"
- **Implementation**:
  - User creates "if-then" plan: "If [CONTEXT], then I will test my glucose."
  - Context options: "When I wake up", "Before I eat lunch", "After I get home from work"
  - App prompts user to mentally rehearse plan
  - Contextual reminders: "You're home from work. Time to test your glucose!"
- **Personalization**:
  - Suggest contexts based on user's past successful logging (e.g., "You usually log at 8am. Make this your habit!")
  - If user fails plan 3+ times, offer to revise context ("Let's try a different time.")
- **Data Capture**:
  - `habit_plan_created(plan_id, context_trigger, behavior_target, timestamp)`
  - `context_detected(context_id, timestamp)` [e.g., location, time of day]
  - `habit_executed(plan_id, context_id, executed_yes_no, timestamp)`
  - `habit_plan_revised(old_plan_id, new_plan_id, reason, timestamp)`

**BCT 8.1: Behavioral Practice/Rehearsal**
- **Evidence**: Ericsson et al. (1993): Deliberate practice improves skill retention
- **Feature**: "SMBG Streak Tracker"
- **Implementation**:
  - Visual calendar showing daily SMBG completion
  - Streak counter: "You've logged 5 days in a row! 🔥"
  - Weekly summary: "This week: 18/18 readings logged. Perfect! 🎉"
- **Personalization**:
  - If streak breaks, immediate recovery message: "Your 5-day streak ended, but you can start a new one right now!"
  - Celebrate milestones: 7-day streak, 14-day streak, 30-day streak
- **Data Capture**:
  - `streak_updated(user_id, current_streak_days, longest_streak_days, timestamp)`
  - `streak_milestone_achieved(user_id, milestone_type, streak_length, timestamp)`

---

#### Barrier 2: Low Self-Efficacy (Reflective Motivation)

**Selected BCTs**:

**BCT 1.1: Goal Setting (Behavior)**
- **Evidence**: Epton et al. (2017): Goal setting ES +0.34 for health behaviors
- **Feature**: "Weekly SMBG Goal"
- **Implementation**:
  - Every Sunday, user sets SMBG goal for upcoming week
  - Goal options: 14/week (2x/day), 18/week (3x/day), 21/week (3x/day, 7 days)
  - Visual goal card with progress bar
  - Mid-week check-in: "You're at 9/18 for the week. Halfway there! Keep going. 💪"
- **Personalization**:
  - Initial goal based on baseline (e.g., if user averaged 8/week, suggest 12/week)
  - If achievement <50% two weeks in a row, reduce goal by 3 readings/week
  - If achievement >80% two weeks in a row, increase goal by 3 readings/week
  - Never set goal >21/week (avoid overwhelming user)
- **Data Capture**:
  - `goal_set(goal_id, goal_type, target_value, start_date, end_date)`
  - `goal_progress_updated(goal_id, current_value, percent_complete, timestamp)`
  - `goal_achieved(goal_id, final_value, achievement_yes_no, timestamp)`

**BCT 15.1: Verbal Persuasion about Capability**
- **Evidence**: Bandura (1997): Verbal persuasion is key source of self-efficacy
- **Feature**: "Personalized Encouragement Messages"
- **Implementation**:
  - Context-triggered messages affirming user's capability
  - After successful day: "You logged all 3 readings today! You're really getting the hang of this. 🌟"
  - After recovering from lapse: "You bounced back after missing a day. That shows real commitment!"
  - Before anticipated challenge (e.g., weekend): "Weekends can be tricky, but you've hit your goal 3 weeks in a row. You've got this!"
- **Personalization**:
  - Messages reference user's specific past successes
  - Tone adapts to user preference (formal vs casual, set in onboarding)
  - Frequency: 2-3x/week (avoid message fatigue)
- **Data Capture**:
  - `encouragement_message_delivered(message_id, message_text, trigger_context, timestamp)`
  - `message_opened(message_id, timestamp)`
  - `user_reaction(message_id, reaction_type, timestamp)` [thumbs up/down]

**BCT 15.3: Focus on Past Success**
- **Evidence**: Oettingen & Mayer (2002): Reflecting on past success increases self-efficacy
- **Feature**: "Success Reflection Dashboard"
- **Implementation**:
  - Weekly summary email/notification: "Last week you logged 18/18 readings. That's a 125% increase from your first week! 📈"
  - Visual trend graph showing SMBG frequency over time
  - "Wins Gallery": Gallery of past achievements (streaks, milestones)
- **Personalization**:
  - Highlight improvement areas: "Your morning logging is now 95%! Evening logging is improving too—now at 70%."
  - Compare to own baseline (not other users)
- **Data Capture**:
  - `success_reflection_viewed(user_id, reflection_type, timestamp)`
  - `historical_trend_data` [aggregated from behavior_logged events]

---

#### Barrier 3: Lack of Reminders (Physical Opportunity)

Already addressed by **BCT 7.1: Prompts/Cues** above.

---

#### Barrier 4: Testing Technique Errors (Psychological Capability)

**Selected BCTs**:

**BCT 4.1: Instruction on How to Perform Behavior**
- **Evidence**: Effective for skill acquisition (Ericsson, 2008)
- **Feature**: "Interactive Glucose Monitoring Tutorial"
- **Implementation**:
  - 5-minute interactive tutorial during onboarding
  - Video demonstration of correct technique (hand washing, lancing, applying blood to strip)
  - Step-by-step checklist
  - Quiz at end (3 questions) to confirm understanding
  - Refresher available anytime in app menu
- **Personalization**:
  - If user logs inconsistent readings (e.g., 50 mg/dL then 200 mg/dL within 1 hour), prompt to review tutorial
  - After 2 weeks, ask user: "Are you confident in your testing technique?" If no, re-do tutorial
- **Data Capture**:
  - `tutorial_started(tutorial_id, timestamp)`
  - `tutorial_completed(tutorial_id, timestamp, time_spent_seconds)`
  - `tutorial_quiz_result(tutorial_id, score, timestamp)`
  - `tutorial_refresher_accessed(tutorial_id, timestamp)`

**BCT 2.2: Feedback on Behavior**
- **Evidence**: Hattie & Timperley (2007): Feedback ES +0.79 for skill learning
- **Feature**: "Quality Control Alerts"
- **Implementation**:
  - If glucose reading is physiologically implausible (e.g., <40 or >400 mg/dL), app prompts: "This reading seems unusual. Double-check your technique and retest. If still high/low, contact your doctor."
  - If readings vary wildly, suggest: "Your readings have been inconsistent. Review the tutorial to ensure correct technique."
- **Personalization**:
  - Sensitivity adjusts based on user's typical glucose range
- **Data Capture**:
  - `quality_alert_triggered(alert_id, alert_reason, glucose_value, timestamp)`
  - `user_action_after_alert(alert_id, action_taken, timestamp)` [retest, ignore, view tutorial]

---

#### Barrier 5: Negative Emotions (Automatic Motivation)

**Selected BCTs**:

**BCT 11.2: Reduce Negative Emotions**
- **Evidence**: Frayn & Knäuper (2018): Emotion regulation reduces avoidance behaviors
- **Feature**: "Results Reframe"
- **Implementation**:
  - When user logs high glucose reading (>180 mg/dL), app provides reframe: "This reading gives you valuable information. You can use this to adjust your next meal or activity. Every test is a learning opportunity, not a judgment."
  - Offer optional 3-minute guided breathing exercise
- **Personalization**:
  - If user consistently logs high readings but stops testing, trigger outreach: "I noticed you haven't tested in 3 days after seeing some high numbers. It's normal to feel discouraged, but every test helps you improve. Want to chat about it?" [Link to message coach]
- **Data Capture**:
  - `reframe_message_delivered(message_id, trigger_glucose_value, timestamp)`
  - `breathing_exercise_accessed(exercise_id, timestamp)`

**BCT 13.3: Identity Associated with Changed Behavior**
- **Evidence**: Stets & Burke (2000): Identity change drives sustained behavior
- **Feature**: "Diabetes Detective Identity"
- **Implementation**:
  - Frame SMBG as data collection, not judgment: "You're a Diabetes Detective! 🔍 Each test is a clue to solving the puzzle of your glucose patterns."
  - Badge system: "Data Detective" (50 readings), "Pattern Master" (100 readings), "Glucose Guru" (500 readings)
- **Personalization**:
  - Language adapts to user's preferred identity frame (set in onboarding survey)
- **Data Capture**:
  - `badge_earned(badge_id, badge_name, timestamp)`
  - `identity_frame_preference(user_id, preferred_frame)`

---

### BCT Specification Matrix (Complete)

| BCT Code | BCT Name | Target Barrier | COM-B | Feature Name | Implementation | Evidence | Personalization | Data Events |
|----------|----------|----------------|-------|--------------|----------------|----------|-----------------|-------------|
| 7.1 | Prompts/Cues | No routine | Auto Motivation | Smart SMBG Reminders | Push notifications at meal times | ES +0.35 (McDaniel 2015) | Adapt timing to user's actual logs; reduce if adherence >90% | reminder_sent, reminder_opened |
| 8.3 | Habit Formation | No routine | Auto Motivation | Habit Builder | "If-then" planning tool | Effect 2-3x (Gollwitzer 2006) | Suggest contexts based on past success | habit_plan_created, habit_executed |
| 8.1 | Behavioral Practice | No routine | Auto Motivation | Streak Tracker | Visual calendar + streak counter | Retention improves (Ericsson 1993) | Celebrate milestones; recovery message if broken | streak_updated, milestone_achieved |
| 1.1 | Goal Setting | Low self-efficacy | Reflective Motivation | Weekly SMBG Goal | User sets weekly frequency goal | ES +0.34 (Epton 2017) | Adjust difficulty based on achievement rate | goal_set, goal_achieved |
| 15.1 | Verbal Persuasion | Low self-efficacy | Reflective Motivation | Personalized Encouragement | Context-triggered affirmations | Key to self-efficacy (Bandura 1997) | Reference past successes; adapt tone | encouragement_message_delivered |
| 15.3 | Focus on Past Success | Low self-efficacy | Reflective Motivation | Success Reflection | Weekly summary + trend graphs | Increases efficacy (Oettingen 2002) | Compare to own baseline only | success_reflection_viewed |
| 4.1 | Instruction | Technique errors | Psych Capability | Interactive Tutorial | Video + quiz + refresher | Skill acquisition (Ericsson 2008) | Re-prompt if inconsistent readings | tutorial_completed, quiz_result |
| 2.2 | Feedback on Behavior | Technique errors | Psych Capability | Quality Control Alerts | Flag implausible readings | ES +0.79 (Hattie 2007) | Sensitivity adjusts to user's range | quality_alert_triggered |
| 11.2 | Reduce Negative Emotions | Negative feelings | Auto Motivation | Results Reframe | Reframe high readings positively | Reduces avoidance (Frayn 2018) | Outreach if testing stops after highs | reframe_message_delivered |
| 13.3 | Identity Change | Negative feelings | Reflective Motivation | Diabetes Detective | Frame as data collection, not judgment | Identity drives behavior (Stets 2000) | Adapt language to user preference | badge_earned |

---

### Intervention Logic Model (Diabetes DTx)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     INTERVENTION LOGIC MODEL                             │
│            GlucoGuide: Type 2 Diabetes Digital Therapeutic               │
└─────────────────────────────────────────────────────────────────────────┘

PHASE 1: INPUTS (DTx Features with BCTs)
┌────────────────────────────────────────────────────────────────────────┐
│ Capability-Building Features (Psychological)                            │
│  ├─ Interactive Glucose Monitoring Tutorial (BCT 4.1)                  │
│  └─ Quality Control Alerts for technique errors (BCT 2.2)              │
│                                                                          │
│ Opportunity-Enhancing Features (Physical)                               │
│  └─ Smart SMBG Reminders at meal times (BCT 7.1)                       │
│                                                                          │
│ Motivation-Building Features (Reflective)                               │
│  ├─ Weekly SMBG Goal Setting (BCT 1.1)                                 │
│  ├─ Personalized Encouragement Messages (BCT 15.1)                     │
│  └─ Success Reflection Dashboard (BCT 15.3)                            │
│                                                                          │
│ Motivation-Building Features (Automatic)                                │
│  ├─ Habit Builder with "if-then" planning (BCT 8.3)                    │
│  ├─ Streak Tracker (BCT 8.1)                                           │
│  ├─ Results Reframe for negative emotions (BCT 11.2)                   │
│  └─ Diabetes Detective identity frame (BCT 13.3)                       │
└────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
PHASE 2: PROXIMAL OUTCOMES (Behavior Change at Week 4)
┌────────────────────────────────────────────────────────────────────────┐
│ ↑ SMBG Frequency                                                        │
│    Baseline: 1.2 readings/day → Week 4: 2.5 readings/day              │
│    (108% increase, DTx vs 5% increase Control)                         │
│                                                                          │
│ ↑ SMBG Consistency                                                      │
│    Baseline: 45% log ≥5 days/week → Week 4: 80% log ≥5 days/week      │
│                                                                          │
│ ↑ SMBG Habit Strength                                                  │
│    Self-Report Habit Index: +18 points (max 84)                        │
│                                                                          │
│ ↑ Diabetes Self-Efficacy                                               │
│    Diabetes Self-Efficacy Scale: +12 points (max 80)                   │
│                                                                          │
│ ↓ Diabetes Distress                                                     │
│    Diabetes Distress Scale: -8 points (less distress)                  │
└────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
PHASE 3: INTERMEDIATE OUTCOMES (Week 8)
┌────────────────────────────────────────────────────────────────────────┐
│ ↓ Glucose Variability                                                   │
│    Coefficient of Variation: Baseline 35% → Week 8: 28% (20% reduction)│
│                                                                          │
│ ↑ Time in Range (TIR)                                                   │
│    % readings 70-180 mg/dL: Baseline 55% → Week 8: 68% (+13%)         │
│                                                                          │
│ ↓ Hypoglycemic Episodes                                                │
│    Frequency <70 mg/dL: Baseline 2.1/week → Week 8: 1.2/week (-43%)   │
│                                                                          │
│ ↑ Medication Adherence                                                  │
│    Self-reported adherence: Baseline 60% → Week 8: 82%                 │
│    (Mediated by increased awareness from SMBG)                          │
└────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
PHASE 4: CLINICAL ENDPOINTS (Week 12)
┌────────────────────────────────────────────────────────────────────────┐
│ 🎯 PRIMARY ENDPOINT: HbA1c Reduction                                    │
│    ↓ HbA1c by 0.8% (DTx) vs 0.1% (Control)                            │
│    Difference: -0.7% (95% CI: -0.9 to -0.5), p<0.001                   │
│                                                                          │
│ SECONDARY ENDPOINT: Body Weight                                         │
│    ↓ Weight by 2.5 kg (DTx) vs 0.3 kg (Control)                       │
│                                                                          │
│ SECONDARY ENDPOINT: Diabetes Self-Efficacy                              │
│    ↑ 18 points (DTx) vs 3 points (Control)                             │
│                                                                          │
│ SECONDARY ENDPOINT: Diabetes Distress                                   │
│    ↓ 12 points (DTx) vs 2 points (Control) [lower = better]           │
└────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ MODERATORS (Who Benefits Most?)                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ • Baseline HbA1c: Higher baseline → Greater HbA1c reduction            │
│   (HbA1c ≥8.5%: -1.1% reduction; HbA1c 7.5-8.5%: -0.6% reduction)      │
│ • Baseline SMBG Frequency: Lower baseline → Greater increase in SMBG    │
│   (Baseline <1x/day: +2.0x/day; Baseline 1-2x/day: +0.8x/day)          │
│ • Technology Literacy: Higher literacy → Faster adoption & adherence    │
│ • Social Support: Higher support → Better long-term adherence           │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ MEDIATORS (Why Does It Work? Causal Mechanisms)                        │
├─────────────────────────────────────────────────────────────────────────┤
│ 1. SMBG Frequency Increase                                              │
│    • Mediates 35% of HbA1c reduction                                    │
│    • Path a: DTx increases SMBG by +1.3x/day                            │
│    • Path b: Each +1 SMBG/day → -0.15% HbA1c                            │
│    • Indirect effect: 1.3 × 0.15 = 0.20% HbA1c (of 0.7% total)         │
│                                                                          │
│ 2. Diabetes Self-Efficacy Increase                                      │
│    • Mediates 40% of HbA1c reduction                                    │
│    • Path a: DTx increases self-efficacy by +15 points                  │
│    • Path b: Each +10 points self-efficacy → -0.12% HbA1c               │
│    • Indirect effect: (15/10) × 0.12 = 0.18% HbA1c                      │
│                                                                          │
│ 3. Medication Adherence Increase                                        │
│    • Mediates 25% of HbA1c reduction                                    │
│    • Path a: DTx increases adherence by +22%                            │
│    • Path b: Each +10% adherence → -0.08% HbA1c                         │
│    • Indirect effect: (22/10) × 0.08 = 0.18% HbA1c                      │
│                                                                          │
│ TOTAL MEDIATED: 0.20 + 0.18 + 0.18 = 0.56% of 0.7% total effect = 80%  │
│ DIRECT EFFECT (not through measured mediators): 0.14% = 20%            │
└─────────────────────────────────────────────────────────────────────────┘

ASSUMPTIONS TO TEST:
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. Users will accurately log glucose readings                           │
│    • Mitigation: Bluetooth glucometer integration for automatic logging │
│    • Test: Compare self-report with device sync; correlation r>0.85     │
│                                                                          │
│ 2. Increased SMBG will lead to action, not just awareness               │
│    • Mitigation: Pair SMBG with actionable insights & action planning   │
│    • Test: Mediation analysis showing SMBG → Behavior Change → HbA1c    │
│                                                                          │
│ 3. Goal setting will motivate rather than overwhelm users               │
│    • Mitigation: Adaptive goal difficulty based on past achievement     │
│    • Test: Monitor dropout rates; ensure <20% cite goals as reason      │
│                                                                          │
│ 4. Reminders will be helpful, not annoying                              │
│    • Mitigation: Personalized timing; reduce frequency if adherence high│
│    • Test: Track reminder opt-out rates; maintain <10%                  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Personalization Strategy: Behavioral Phenotypes

#### Phenotype 1: "Confident but Disorganized"
**Characteristics**:
- High self-efficacy (Diabetes Self-Efficacy Scale >70th percentile)
- High health literacy (can explain HbA1c, understands carb counting)
- Low habit formation (Self-Report Habit Index <50th percentile)
- Irregular SMBG timing (high variability in test times)

**Barriers**: Automatic Motivation (lack of routines)

**Recommended BCT Emphasis**:
- BCT 7.1: Prompts/Cues (daily reminders)
- BCT 8.3: Habit Formation (implementation intentions)
- BCT 8.1: Behavioral Practice (streak tracking)

**Feature Personalization**:
- **Reminders**: High frequency initially (3x/day), adapt to user's emerging patterns
- **Habit Builder**: Emphasize context-based triggers ("When I wake up, I test my glucose")
- **Goal Setting**: Start with ambitious goals (18/week), user can handle it
- **Encouragement**: Focus on consistency, not ability ("You've got the skills, let's build the routine!")

**Onboarding Identification**:
- Self-Efficacy Scale score >28/40
- Health Literacy Assessment >12th grade
- Baseline SMBG frequency variable (high SD in timing)

---

#### Phenotype 2: "Overwhelmed and Uncertain"
**Characteristics**:
- Low self-efficacy (Diabetes Self-Efficacy Scale <30th percentile)
- Low health literacy (<8th grade)
- Low habit formation
- High diabetes distress (Diabetes Distress Scale >60th percentile)

**Barriers**: ALL COM-B components (highest risk group)

**Recommended BCT Emphasis**:
- BCT 8.7: Graded Tasks (start very small)
- BCT 15.1: Verbal Persuasion (frequent encouragement)
- BCT 15.3: Focus on Past Success (build confidence)
- BCT 3.1: Social Support (buddy system, peer support)

**Feature Personalization**:
- **Goal Setting**: Start with micro-goals (1 reading/day, 5 days/week = 5/week total)
- **Tutorial**: Extended onboarding with multiple touchpoints
- **Encouragement**: High frequency (5-7x/week), very affirming tone
- **Social Features**: Offer buddy pairing with peer mentor
- **Reminders**: Gentle, supportive language ("No pressure, but if you have a moment...")

**Onboarding Identification**:
- Self-Efficacy Scale score <16/40
- Health Literacy Assessment <8th grade
- Diabetes Distress Scale score >48/102

---

#### Phenotype 3: "Capable but Unmotivated"
**Characteristics**:
- Moderate self-efficacy
- High health literacy
- Low perceived importance of SMBG ("I don't see the point")
- Low engagement with app features

**Barriers**: Reflective Motivation (beliefs about consequences)

**Recommended BCT Emphasis**:
- BCT 5.1: Information about Health Consequences (education on glycemic patterns)
- BCT 2.2: Feedback on Behavior (show impact of SMBG on glucose control)
- BCT 13.1: Identification of Self as Role Model (identity shift)

**Feature Personalization**:
- **Data Visualization**: Advanced analytics showing glucose patterns (e.g., "Your glucose spikes 2 hours after breakfast. Testing helps you see this and adjust.")
- **Comparative Feedback**: Show improvement over time ("Your glucose variability decreased 15% since you started testing 3x/day")
- **Identity Framing**: "Diabetes Detective" or "Data Scientist" role
- **Goal Setting**: Outcome-focused goals (e.g., "Reduce glucose variability by 10%") rather than behavior-focused

**Onboarding Identification**:
- Perceived Importance of SMBG scale <3/5
- High knowledge quiz score
- Low baseline SMBG frequency despite knowledge

---

#### Phenotype 4: "Organized and Motivated"
**Characteristics**:
- High self-efficacy
- High health literacy
- Moderate-to-high habit formation
- Proactive engagement with diabetes management

**Barriers**: Primarily opportunity-related (time constraints, competing demands)

**Recommended BCT Emphasis**:
- BCT 1.1: Goal Setting (ambitious goals)
- BCT 12.1: Environmental Restructuring (optimize context)
- BCT 13.1: Identity as Role Model (advanced user features)

**Feature Personalization**:
- **Goal Setting**: Stretch goals (21/week, perfect timing consistency)
- **Advanced Features**: Unlock community leadership roles (help others)
- **Reminders**: Minimal (user already has routine)
- **Gamification**: Competition features (leaderboards, challenges)
- **Insights**: Advanced pattern recognition (multi-week trends)

**Onboarding Identification**:
- Self-Efficacy Scale >32/40
- Baseline SMBG frequency ≥2x/day
- Completed onboarding in <10 minutes (efficient, engaged)

---

### Adaptive Algorithms (Pseudocode)

#### Algorithm 1: Goal Difficulty Adjustment
```python
def adjust_weekly_goal(user):
    """
    Adjust SMBG frequency goal based on prior week's achievement rate.
    Goal: Keep achievement rate between 50-80% (Goldilocks zone).
    """
    prior_achievement_rate = user.goal_achievement_last_week
    current_goal = user.current_weekly_smbg_goal  # e.g., 18 readings/week
    
    if prior_achievement_rate < 0.50:
        # User struggling, reduce goal by 3 readings/week (minimum 12)
        new_goal = max(current_goal - 3, 12)
        message = "Let's start a bit smaller and build from there. You've got this! 💪"
        tone = "supportive"
    
    elif prior_achievement_rate > 0.80 and current_goal < 21:
        # User exceeding goal, increase by 3 readings/week (maximum 21)
        new_goal = min(current_goal + 3, 21)
        message = "You're crushing it! Ready for a bigger challenge this week? 🚀"
        tone = "celebratory"
    
    else:
        # User in sweet spot, maintain goal
        new_goal = current_goal
        message = "Great work last week! Let's keep that momentum going. 🎯"
        tone = "encouraging"
    
    # Log goal adjustment
    log_event("goal_adjusted", {
        "user_id": user.id,
        "old_goal": current_goal,
        "new_goal": new_goal,
        "prior_achievement_rate": prior_achievement_rate,
        "adjustment_reason": get_reason(prior_achievement_rate)
    })
    
    # Update user's goal in database
    user.set_weekly_goal(new_goal)
    
    # Send in-app notification
    send_notification(user, message, tone)
    
    return new_goal
```

#### Algorithm 2: Reminder Frequency Adaptation
```python
def adjust_reminder_frequency(user):
    """
    Adapt reminder frequency based on adherence.
    Goal: Maximize adherence while minimizing annoyance.
    """
    adherence_this_week = user.calculate_weekly_adherence()  # % of goal achieved
    reminder_opt_out_count = user.reminder_opt_outs_last_7_days
    
    if adherence_this_week < 0.70 and reminder_opt_out_count < 2:
        # User needs support, increase reminders
        frequency = "DAILY"  # 3x/day (morning, lunch, dinner)
        timing = user.preferred_reminder_times  # User-specified
        tone = "gentle"
        message_template = "Friendly reminder: Time to check your glucose! 📊"
    
    elif adherence_this_week >= 0.90 or reminder_opt_out_count >= 3:
        # User internalized habit OR finds reminders annoying
        frequency = "NEVER"
        timing = None
        tone = None
        message_template = None
        # Celebrate independence
        send_notification(user, "You've built a strong SMBG routine! Reminders are now off. Re-enable anytime in Settings. 🎉", "celebratory")
    
    else:
        # Moderate adherence, reduce reminder frequency
        frequency = "3x_WEEK"  # Mon/Wed/Fri only
        timing = user.preferred_reminder_times
        tone = "brief"
        message_template = "Quick reminder to log your glucose today. 📋"
    
    # Update reminder schedule
    user.update_reminder_schedule(frequency, timing, message_template)
    
    # Log adjustment
    log_event("reminder_frequency_adjusted", {
        "user_id": user.id,
        "adherence_this_week": adherence_this_week,
        "opt_out_count": reminder_opt_out_count,
        "new_frequency": frequency
    })
    
    return frequency
```

#### Algorithm 3: BCT Delivery Prioritization
```python
def prioritize_bct_delivery(user, context):
    """
    Decide which BCT to deliver in-the-moment based on user state and context.
    Just-In-Time Adaptive Intervention (JITAI).
    """
    user_state = {
        "current_mood": user.latest_mood_rating,  # 1-10 scale
        "days_since_last_log": user.days_since_last_smbg,
        "goal_progress_this_week": user.goal_progress_percent,
        "time_of_day": context.current_time,
        "location": context.current_location,  # home, work, restaurant, etc.
    }
    
    # Priority 1: Lapse Detection (3+ days without logging)
    if user_state["days_since_last_log"] >= 3:
        bct = "BCT_15.1"  # Verbal Persuasion about Capability
        message = "I noticed you haven't logged in a few days. Life gets busy! Even small steps count. Can you log just one reading today? 🌟"
        trigger = "lapse_recovery"
        priority = "HIGH"
        return deliver_bct(user, bct, message, trigger, priority)
    
    # Priority 2: Emotional Distress (mood ≤3)
    if user_state["current_mood"] <= 3:
        bct = "BCT_11.2"  # Reduce Negative Emotions
        message = "I see you're having a tough day. 😔 Try this 5-minute breathing exercise to reset. [START EXERCISE]"
        trigger = "emotional_distress"
        priority = "HIGH"
        return deliver_bct(user, bct, message, trigger, priority)
    
    # Priority 3: High-Risk Context (restaurant in evening)
    if user_state["location"] == "RESTAURANT" and user_state["time_of_day"].hour >= 18:
        bct = "BCT_1.4"  # Action Planning
        message = "Eating out? 🍽️ Plan ahead: Choose grilled over fried, ask for veggies instead of fries, and test your glucose 2 hours after eating to see the impact."
        trigger = "high_risk_context"
        priority = "MEDIUM"
        return deliver_bct(user, bct, message, trigger, priority)
    
    # Priority 4: Approaching Goal Milestone (>80% progress)
    if user_state["goal_progress_this_week"] > 0.80:
        bct = "BCT_15.1"  # Verbal Persuasion / Celebration
        message = "You're at 15/18 for the week! Just 3 more to hit your goal. You've totally got this! 💪"
        trigger = "goal_milestone"
        priority = "LOW"
        return deliver_bct(user, bct, message, trigger, priority)
    
    # Default: No intervention needed
    return None
```

---

### Measurement Framework

#### Digital Biomarkers

**Biomarker 1: SMBG Frequency**

```yaml
biomarker_name: "SMBG Frequency"
definition: "Number of glucose readings logged per day"
data_source: "behavior_logged events where behavior_type='SMBG'"
calculation: "COUNT(behavior_logged) / DAYS_BETWEEN(start_date, end_date)"
interpretation:
  low_adherence: "<1.5 readings/day"
  moderate_adherence: "1.5-2.5 readings/day"
  high_adherence: ">2.5 readings/day"
clinical_relevance: "Each additional SMBG/day associated with 0.25% HbA1c reduction (Karter et al., 2006)"
measurement_timepoints: ["Baseline", "Week 4", "Week 8", "Week 12"]
aggregation_period: "Rolling 7-day average"
```

**Biomarker 2: SMBG Timing Consistency**

```yaml
biomarker_name: "SMBG Timing Consistency"
definition: "Percentage of readings within ±30 minutes of target times (fasting, pre-lunch, pre-dinner)"
data_source: "behavior_logged timestamp compared to user's stated meal times"
calculation: |
  target_times = [user.wakeup_time, user.lunch_time, user.dinner_time]
  compliant_readings = 0
  for reading in user.smbg_readings:
      if any(abs(reading.timestamp - target) <= 30_minutes for target in target_times):
          compliant_readings += 1
  consistency = (compliant_readings / total_readings) * 100
interpretation:
  erratic: "<50% - No routine"
  developing: "50-70% - Emerging routine"
  consistent: ">70% - Strong routine"
clinical_relevance: "Timing consistency predicts long-term adherence and better glycemic patterns (Bergenstal et al., 2010)"
measurement_timepoints: ["Week 4", "Week 8", "Week 12"]
```

**Biomarker 3: Logging Latency**

```yaml
biomarker_name: "Logging Latency"
definition: "Time elapsed between glucose measurement (per device timestamp) and app logging"
data_source: "Glucometer API timestamp vs behavior_logged timestamp"
calculation: "MEDIAN(app_log_timestamp - device_measurement_timestamp)"
interpretation:
  real_time: "<10 minutes - Immediate logging"
  delayed: "10-60 minutes - Same-session logging"
  retrospective: ">60 minutes - Later manual entry"
clinical_relevance: "Real-time logging indicates engagement and reduces recall bias"
measurement_timepoints: ["Ongoing"]
note: "Requires Bluetooth glucometer integration. Manual logs flagged as 'unknown latency'."
```

---

#### BCT Engagement Metrics

| BCT | Engagement Metric | Target Threshold | Data Source | Clinical Relevance |
|-----|-------------------|------------------|-------------|-------------------|
| **1.1: Goal Setting** | % of weeks with active goal set | ≥80% (10/12 weeks) | goal_set events | Goal setting predicts behavior change (OR 1.8, Locke & Latham 2002) |
| **2.3: Self-Monitoring** | Logging frequency (readings/week) | ≥15/week (moderate), ≥18/week (high) | behavior_logged events | Self-monitoring ES +0.40 for health behaviors (Michie et al., 2009) |
| **7.1: Prompts/Cues** | Reminder response rate (logged within 2 hours) | ≥60% | reminder_sent + behavior_logged_after_reminder | Cue-response association strengthens habits (Wood & Rünger, 2016) |
| **8.3: Habit Formation** | "If-then" plan execution rate | ≥70% (when context detected) | habit_plan_created + habit_executed | Implementation intentions increase goal attainment 2-3x (Gollwitzer, 2006) |
| **8.1: Behavioral Practice** | Longest streak achieved | ≥7 days | streak_updated events | Practice builds automaticity (Lally et al., 2010: habit formation takes 66 days median) |
| **15.1: Verbal Persuasion** | Message open rate | ≥60% | encouragement_message_delivered + message_opened | Engagement with encouragement predicts behavior change (Webb et al., 2010) |
| **11.2: Reduce Negative Emotions** | Emotional regulation exercise completion | ≥2x/week during high-stress | exercise_completed events | Emotion regulation mediates stress-behavior relationship (Frayn & Knäuper, 2018) |

---

#### Mediation Analysis Plan

**Research Question**: Does GlucoGuide reduce HbA1c BECAUSE it increases SMBG frequency and self-efficacy, or through other mechanisms?

**Hypothesized Mediators**:
1. SMBG Frequency (digital biomarker)
2. Diabetes Self-Efficacy (self-report scale)
3. Medication Adherence (self-report + pharmacy data if available)

**Statistical Approach**: Baron & Kenny (1986) causal mediation + modern methods (Imai et al., 2010)

**Analysis Steps**:

**Step 1: Total Effect (Path c)**
```
Model: HbA1c_Week12 ~ Treatment_Group + HbA1c_Baseline + Covariates
Expected: β_Treatment = -0.7% (DTx reduces HbA1c by 0.7% vs Control)
```

**Step 2: Path a (Treatment → Mediator)**
```
Model 2a: SMBG_Frequency_Week12 ~ Treatment_Group + SMBG_Baseline + Covariates
Expected: β_Treatment = +1.3 readings/day (DTx increases SMBG by 1.3x/day)

Model 2b: Self_Efficacy_Week12 ~ Treatment_Group + Self_Efficacy_Baseline + Covariates
Expected: β_Treatment = +15 points (DTx increases self-efficacy by 15 points)

Model 2c: Medication_Adherence_Week12 ~ Treatment_Group + Medication_Adherence_Baseline + Covariates
Expected: β_Treatment = +22% (DTx increases adherence by 22 percentage points)
```

**Step 3: Path b (Mediator → Outcome, controlling for Treatment)**
```
Model 3: HbA1c_Week12 ~ SMBG_Frequency + Self_Efficacy + Medication_Adherence + Treatment_Group + Baselines + Covariates

Expected:
β_SMBG = -0.15% per additional reading/day
β_SelfEfficacy = -0.012% per point increase
β_MedAdherence = -0.008% per percentage point increase
```

**Step 4: Direct Effect (Path c')**
```
After controlling for mediators, is there remaining treatment effect?

Expected: β_Treatment_Adjusted = -0.14% (reduced from -0.7%)
```

**Step 5: Indirect Effects**
```
Indirect Effect via SMBG: 1.3 × (-0.15) = -0.195% HbA1c reduction
Indirect Effect via Self-Efficacy: 15 × (-0.012) = -0.180% 
Indirect Effect via Med Adherence: 22 × (-0.008) = -0.176%

Total Indirect: -0.195 + (-0.180) + (-0.176) = -0.551%
Total Effect: -0.7%
% Mediated: 0.551 / 0.7 = 78.7%
```

**Interpretation**:
- If 75-85% of effect is mediated by SMBG, self-efficacy, and medication adherence, these are confirmed mechanisms
- Remaining 15-25% may be due to:
  - Unmeasured mediators (dietary changes, physical activity)
  - Direct effects of self-monitoring (awareness → glucose control independent of medication)
  - Placebo/Hawthorne effects

**Data Collection Requirements**:
- Mediators measured at Weeks 4, 8, 12 (not just endpoint)
- Temporal ordering confirmed: Mediator change precedes outcome change
- Sensitivity analyses for missing data (MAR vs MNAR)

**Clinical Trial Protocol Language**:
```
"We will conduct mediation analyses to test our hypothesized mechanisms of action. 
Specifically, we hypothesize that GlucoGuide reduces HbA1c by:
(1) Increasing SMBG frequency (Hypothesis 1a: ≥30% of effect mediated)
(2) Increasing diabetes self-efficacy (Hypothesis 1b: ≥30% of effect mediated)
(3) Improving medication adherence (Hypothesis 1c: ≥20% of effect mediated)

Mediation will be assessed using Baron & Kenny's approach, with indirect effects 
calculated using the product-of-coefficients method (a×b). We will report 95% 
confidence intervals using bootstrapping (5000 iterations). The proportion mediated 
will be calculated as (a×b)/c. All mediation hypotheses are pre-specified and 
registered prior to data collection."
```

---

## 📊 TESTING & VALIDATION PROTOCOL

### Phase 1: BCT Fidelity Assessment

**Objective**: Confirm that implemented features faithfully deliver intended BCTs

**Method**: Expert coding using BCT Taxonomy v1

**Procedure**:
1. **Feature Inventory**: List all app features with intended BCT codes
2. **Expert Review**: 2 independent behavioral scientists code each feature
   - "Does Feature X deliver BCT Y.Z as specified?"
   - Rating: Fully (2 points), Partially (1 point), Not at All (0 points)
3. **Inter-Rater Reliability**: Calculate Cohen's Kappa (target ≥0.80)
4. **Fidelity Score**: (Total Points / Maximum Possible) × 100
   - Target: ≥90% fidelity
5. **Remediation**: For features scoring <2, revise implementation and re-test

**Example Fidelity Assessment**:
```yaml
feature: "Weekly SMBG Goal Setting"
intended_BCT: "1.1: Goal setting (behavior)"

expert_1_rating:
  present: yes
  fully_implemented: yes
  score: 2
  notes: "User sets specific, measurable SMBG frequency goal for upcoming week. Goal is visualized and tracked. Fully consistent with BCT 1.1."

expert_2_rating:
  present: yes
  fully_implemented: yes
  score: 2
  notes: "Clear goal-setting interface. User chooses frequency (e.g., 18 readings/week). Aligns with BCT 1.1 definition."

fidelity_score: (2+2)/4 = 100%
action: "No revision needed. Feature faithfully implements BCT 1.1."
```

---

### Phase 2: Pilot Testing (N=30-50, 4 weeks)

**Objective**: Identify usability issues, validate digital biomarkers, refine personalization

**Inclusion Criteria**:
- Adults with Type 2 Diabetes, HbA1c 7.5-10.5%
- Smartphone owners (iOS or Android)
- Willing to use app daily for 4 weeks
- Diverse in age, gender, race/ethnicity, health literacy

**Outcome Measures**:
1. **Usability**: System Usability Scale (SUS) - target ≥70
2. **Engagement**: Daily active users - target ≥60%
3. **Digital Biomarker Validation**: Compare app-logged SMBG to device memory - target correlation r>0.90
4. **BCT Engagement**: % users engaging with each BCT feature - identify underutilized BCTs
5. **Qualitative Feedback**: Semi-structured interviews (n=10) on experience with BCTs

**Analysis**:
- **Usability Issues**: Code and prioritize (critical, high, medium, low)
- **Engagement Patterns**: Identify which BCTs have low engagement (e.g., <20% of users)
- **Personalization Performance**: Test if phenotype-based BCT delivery improves outcomes vs random assignment
- **Iteration**: Revise features, messaging, personalization rules based on findings

**Example Finding**:
```yaml
finding: "Habit Builder feature (BCT 8.3) has only 25% engagement"
root_cause_analysis:
  - User interviews: "Too complicated to set up", "I don't understand if-then plans"
  - Observational data: 40% of users abandon mid-setup
proposed_solution:
  - Simplify onboarding: Provide pre-written if-then templates
  - Add video tutorial demonstrating concept
  - Reduce steps from 5 to 3
validation: Re-test with N=10; measure completion rate (target >70%)
```

---

### Phase 3: A/B Testing (Embedded in RCT)

**Objective**: Optimize specific BCTs through head-to-head comparisons

**Design**: Randomized A/B tests within DTx arm of RCT

**Example A/B Tests**:

**Test 1: Goal Difficulty Strategy**
- **Hypothesis**: Adaptive goal difficulty (adjusting based on achievement) will improve adherence vs fixed difficulty
- **Arms**:
  - A: Adaptive (algorithm adjusts weekly goal based on prior achievement)
  - B: Fixed (goal remains 18/week throughout)
- **N**: 60 per arm
- **Primary Outcome**: SMBG frequency at Week 12
- **Success Criterion**: Adaptive > Fixed by ≥0.5 readings/day, p<0.05

**Test 2: Reminder Timing Personalization**
- **Hypothesis**: Personalized reminder timing (based on user's actual log times) will improve adherence vs fixed times
- **Arms**:
  - A: Personalized (machine learning adapts to user's patterns)
  - B: Fixed (8am, 12pm, 6pm for all users)
- **N**: 60 per arm
- **Primary Outcome**: % of reminders resulting in log within 2 hours
- **Success Criterion**: Personalized > Fixed by ≥10 percentage points, p<0.05

**Test 3: Encouragement Message Tone**
- **Hypothesis**: Casual, warm tone will be more effective than formal tone
- **Arms**:
  - A: Casual ("You've got this! 💪")
  - B: Formal ("You have demonstrated the capability to achieve this goal.")
- **N**: 60 per arm
- **Primary Outcome**: Message open rate + user satisfaction rating
- **Success Criterion**: Casual > Formal on both metrics, p<0.05

**Analysis**:
- Intention-to-treat (compare randomized groups)
- Pre-register all A/B tests in trial protocol
- Bonferroni correction for multiple comparisons (α = 0.05 / # tests)

---

### Phase 4: RCT (N=236, 12 weeks)

**Design**: Randomized, controlled trial (GlucoGuide DTx vs Standard Care Control)

**Primary Outcome**: HbA1c change from baseline to Week 12

**Behavioral Science Analyses** (Secondary/Exploratory):

**Analysis 1: Dose-Response**
- **Question**: Is there a dose-response relationship between BCT engagement and HbA1c reduction?
- **Method**: Stratify DTx arm by engagement quartiles; compare HbA1c reduction across quartiles
- **Engagement Score**: Composite of BCT engagement metrics (weighted by clinical relevance)
- **Expected**: Highest engagement quartile shows greatest HbA1c reduction (dose-response gradient)

**Analysis 2: Mediation**
- As detailed in Measurement Framework section above
- Test if SMBG frequency, self-efficacy, medication adherence mediate treatment effect

**Analysis 3: Phenotype Moderator**
- **Question**: Do behavioral phenotypes moderate treatment effect?
- **Method**: Interaction analysis (Treatment × Phenotype)
- **Hypothesis**: "Overwhelmed and Uncertain" phenotype shows GREATER benefit (larger effect size) because they have most room for improvement
- **Interpretation**: If interaction significant, personalization strategy validated

**Analysis 4: BCT-Specific Effects**
- **Question**: Which specific BCTs are most associated with behavior change?
- **Method**: Regression of SMBG frequency change on individual BCT engagement scores
- **Example Model**: `ΔSMBG ~ BCT1.1_engagement + BCT7.1_engagement + BCT8.3_engagement + ...`
- **Interpretation**: Identify "active ingredients" (BCTs with largest beta coefficients)

---

### Phase 5: Post-Market Surveillance (6-12 months)

**Objective**: Monitor real-world effectiveness and sustained behavior change

**Key Metrics**:
1. **6-Month Retention**: % of users still active at 6 months (target >50%)
2. **Sustained SMBG**: % of users maintaining ≥15 readings/week at 6 months (target >60%)
3. **HbA1c Maintenance**: % of users maintaining HbA1c reduction at 6 months (target >70%)
4. **Real-World Effectiveness**: Compare RCT efficacy vs real-world effectiveness (expect 20-30% attenuation)

**Continuous Optimization**:
- **A/B Testing Engine**: Ongoing A/B tests of new BCT variations
- **Machine Learning**: Adaptive algorithms continuously optimize personalization
- **User Feedback Loop**: Monthly surveys, in-app feedback, app store reviews
- **Version Updates**: Quarterly feature releases based on data

---

## 🔐 REGULATORY & ETHICAL CONSIDERATIONS

### FDA Submission

**De Novo Pathway - Behavioral Mechanism Validation**:

**Section 5.2: Mechanism of Action**
```
"GlucoGuide's therapeutic mechanism is based on evidence-based behavior change techniques 
from the Behavior Change Technique Taxonomy v1 (Michie et al., 2013). The device delivers 
10 core BCTs mapped to the COM-B model (Capability, Opportunity, Motivation → Behavior):

1. BCT 1.1 (Goal Setting): Users set weekly SMBG frequency goals, which are adapted based 
   on achievement rate. Goal setting increases goal attainment by 34% (ES +0.34, Epton 2017).

2. BCT 7.1 (Prompts/Cues): Push notifications remind users to perform SMBG at personalized 
   times. Reminders improve health behavior adherence by 35% (ES +0.35, McDaniel 2015).

[Continue for all 10 BCTs]

Clinical Evidence of Mechanism:
We conducted mediation analyses to validate our hypothesized causal pathway. We found that:
- SMBG frequency increase mediated 35% of HbA1c reduction (indirect effect: -0.20%)
- Diabetes self-efficacy increase mediated 40% of HbA1c reduction (indirect effect: -0.18%)
- Medication adherence increase mediated 25% of HbA1c reduction (indirect effect: -0.18%)
Total mediated effect: 80% (0.56% of 0.70% total effect)

This demonstrates that GlucoGuide's clinical benefit operates through its intended behavioral mechanisms."
```

**Section 6.3: BCT Fidelity Assessment**
```
"We assessed BCT implementation fidelity using the BCT Taxonomy v1 coding framework. 
Two independent behavioral scientists (PhD-level) coded all app features. Inter-rater 
reliability (Cohen's Kappa) was 0.89, indicating excellent agreement. 

Fidelity Scores:
- BCT 1.1 (Goal Setting): 100% fidelity
- BCT 7.1 (Prompts/Cues): 100% fidelity
[List all BCTs]

Overall fidelity: 94% (47/50 points across 10 BCTs × 2 raters)

This confirms that implemented features faithfully deliver intended behavior change techniques."
```

### Publication Standards

**TIDieR Checklist Compliance**:

When publishing RCT results, include TIDieR-compliant intervention description:

| TIDieR Item | GlucoGuide Description |
|-------------|------------------------|
| 1. Brief Name | GlucoGuide: Digital Therapeutic for Type 2 Diabetes Self-Management |
| 2. Why | Rationale: Low SMBG frequency in T2DM leads to poor glycemic control. Behavior change techniques (BCTs) can increase SMBG adherence. |
| 3. What (Materials) | 10 BCTs from Michie Taxonomy: Goal setting (1.1), Self-monitoring (2.3), Prompts (7.1), Habit formation (8.3), Verbal persuasion (15.1), etc. Delivered via iOS/Android mobile app. |
| 4. What (Procedures) | Users complete onboarding tutorial, set weekly SMBG goals, receive personalized reminders, log glucose readings, view progress dashboard, earn streak badges, receive encouragement messages. |
| 5. Who Provided | Digital intervention (automated). Optional asynchronous messaging with certified diabetes educator for questions. |
| 6. How | Individual self-directed use via smartphone app. |
| 7. Where | User's natural environment (home, work, etc.). |
| 8. When and How Much | 12-week intensive phase (daily app use, 5-10 min/day). Maintenance phase available post-trial. |
| 9. Tailoring | Adaptive algorithms personalize: (1) Goal difficulty, (2) Reminder frequency/timing, (3) BCT emphasis based on behavioral phenotype. |
| 10. Modifications | None during trial. Post-trial updates based on user feedback. |
| 11. How Well (Planned) | Planned adherence: ≥80% users engage with app ≥5 days/week. BCT fidelity target: ≥90%. |
| 12. How Well (Actual) | Actual adherence: 76% users engaged ≥5 days/week. BCT fidelity: 94%. |

### Ethical Considerations

**Informed Consent**:
- Disclose use of personalized algorithms
- Explain that encouragement messages are automated (not from human)
- Clarify data usage (app usage, glucose readings, location for context detection)

**Privacy**:
- HIPAA compliance for all PHI
- De-identification of aggregate data for algorithm training
- User control over data sharing (opt-in for research)

**Equity**:
- Accessibility: WCAG 2.1 AA compliance, screen reader support
- Language: Spanish translation for U.S. Hispanic population
- Digital Divide: Pilot testing with low-income, low-literacy populations

**Behavioral Ethics**:
- Avoid manipulative techniques (e.g., shame, guilt, fear)
- Respect autonomy: Users can disable features (e.g., reminders, social comparison)
- Transparent about persuasive design: Inform users that app uses BCTs to support behavior change

---

## 📚 REFERENCES & EVIDENCE BASE

### Foundational Frameworks

1. **Michie, S., van Stralen, M. M., & West, R. (2011).** The behaviour change wheel: A new method for characterising and designing behaviour change interventions. *Implementation Science, 6*(42). https://doi.org/10.1186/1748-5908-6-42
   - Introduces COM-B model and Behavior Change Wheel

2. **Michie, S., Richardson, M., Johnston, M., Abraham, C., Francis, J., Hardeman, W., ... & Wood, C. E. (2013).** The behavior change technique taxonomy (v1) of 93 hierarchically clustered techniques: Building an international consensus for the reporting of behavior change interventions. *Annals of Behavioral Medicine, 46*(1), 81-95.
   - BCT Taxonomy v1 with 93 techniques

3. **Cane, J., O'Connor, D., & Michie, S. (2012).** Validation of the theoretical domains framework for use in behaviour change and implementation research. *Implementation Science, 7*(37).
   - Theoretical Domains Framework (14 domains)

### BCT Evidence Base

4. **Michie, S., Abraham, C., Whittington, C., McAteer, J., & Gupta, S. (2009).** Effective techniques in healthy eating and physical activity interventions: A meta-regression. *Health Psychology, 28*(6), 690-701.
   - Self-monitoring effect size: +0.40 for physical activity

5. **Epton, T., Currie, S., & Armitage, C. J. (2017).** Unique effects of setting goals on behavior change: Systematic review and meta-analysis. *Journal of Consulting and Clinical Psychology, 85*(12), 1182-1198.
   - Goal setting effect size: +0.34 for health behaviors

6. **Gollwitzer, P. M., & Sheeran, P. (2006).** Implementation intentions and goal achievement: A meta-analysis of effects and processes. *Advances in Experimental Social Psychology, 38*, 69-119.
   - Implementation intentions increase goal attainment 2-3x

7. **McDaniel, M. A., & Einstein, G. O. (2015).** Prospective memory: An overview and synthesis of an emerging field. *Sage Publications*.
   - Reminder systems effect size: +0.35

### Mediation & Mechanisms

8. **Baron, R. M., & Kenny, D. A. (1986).** The moderator-mediator variable distinction in social psychological research: Conceptual, strategic, and statistical considerations. *Journal of Personality and Social Psychology, 51*(6), 1173-1182.
   - Classic mediation analysis approach

9. **Imai, K., Keele, L., & Tingley, D. (2010).** A general approach to causal mediation analysis. *Psychological Methods, 15*(4), 309-334.
   - Modern causal mediation methods

### Self-Efficacy

10. **Bandura, A. (1997).** Self-efficacy: The exercise of control. *W.H. Freeman*.
    - Self-efficacy theory; verbal persuasion as source

11. **Oettingen, G., & Mayer, D. (2002).** The motivating function of thinking about the future: Expectations versus fantasies. *Journal of Personality and Social Psychology, 83*(5), 1198-1212.
    - Reflecting on past success increases self-efficacy

### Habit Formation

12. **Lally, P., Van Jaarsveld, C. H., Potts, H. W., & Wardle, J. (2010).** How are habits formed: Modelling habit formation in the real world. *European Journal of Social Psychology, 40*(6), 998-1009.
    - Habit formation takes 66 days median

13. **Wood, W., & Rünger, D. (2016).** Psychology of habit. *Annual Review of Psychology, 67*, 289-314.
    - Cue-response associations strengthen habits

### Emotion Regulation

14. **Frayn, M., & Knäuper, B. (2018).** Emotional eating and weight regulation: A qualitative study of compensatory behaviors and concerns. *Journal of Eating Disorders, 6*(23).
    - Emotion regulation reduces emotional eating

### SMBG Evidence

15. **Karter, A. J., Parker, M. M., Moffet, H. H., Ahmed, A. T., Ferrara, A., Liu, J. Y., & Selby, J. V. (2006).** Longitudinal study of new and prevalent use of self-monitoring of blood glucose. *Diabetes Care, 29*(8), 1757-1763.
    - Each additional SMBG/day associated with 0.25% HbA1c reduction

16. **Bergenstal, R. M., Gavin, J. R., & Global Consensus Conference on Glucose Monitoring Panel. (2005).** The role of self-monitoring of blood glucose in the care of people with diabetes: Report of a global consensus conference. *The American Journal of Medicine, 118*(9A), 1S-6S.
    - Timing consistency predicts long-term adherence

### Digital Health Precedents

17. **FDA. (2017).** De Novo Classification Request for reSET (DEN170078).
    - First prescription DTx; BCT implementation and dose-response analysis

18. **FDA. (2020).** De Novo Classification Request for Somryst (DEN190033).
    - DTx for insomnia; CBT-I components as BCTs

### TIDieR Reporting

19. **Hoffmann, T. C., Glasziou, P. P., Boutron, I., Milne, R., Perera, R., Moher, D., ... & Michie, S. (2014).** Better reporting of interventions: Template for intervention description and replication (TIDieR) checklist and guide. *BMJ, 348*, g1687.
    - Template for intervention description

---

## 📞 SUPPORT & CONSULTATION

For questions about implementing this use case:

**Clinical Consultation**: Contact P01_CMO (Chief Medical Officer) for clinical endpoint alignment

**Behavioral Science Expertise**: Contact P11_BEHAVIORAL_SCIENTIST for BCT selection and personalization strategies

**Technical Implementation**: Contact P09_CTO for feasibility of adaptive algorithms and data infrastructure

**Regulatory Guidance**: Contact P05_REGDIR for FDA submission requirements for mechanism-of-action validation

---

**END OF UC_PD_006: BEHAVIORAL SCIENCE INTEGRATION DOCUMENT**

---

**Document Metadata**:
- **Version**: 1.0
- **Date**: October 11, 2025
- **Prepared By**: Senior Behavioral Scientist (simulated)
- **Review Status**: Production Ready
- **Classification**: ADVANCED complexity, MEDIUM priority
- **Estimated Use Time**: 4-6 hours for full intervention design
- **Dependencies**: UC_CD_001 (Clinical Endpoint Selection), UC_PD_001 (Clinical Requirements), UC_PD_010 (Usability Testing)
- **Next Steps**: Pilot testing (N=30-50) → Iteration → RCT integration

**Disclaimer**: This document provides strategic guidance for behavioral science integration in digital therapeutics. It does not constitute clinical, regulatory, or legal advice. Consult with qualified behavioral scientists, clinicians, and regulatory professionals before implementing behavioral interventions. Behavior change evidence and best practices evolve; verify current guidelines and literature before application.
