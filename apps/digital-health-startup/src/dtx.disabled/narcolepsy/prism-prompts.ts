// ===================================================================
// PRISM Prompt Library for Narcolepsy DTx
// Precision, Relevance, Integration, Safety, Measurement Framework
// ===================================================================

import { PRISMPrompt, ClinicalContext } from '../../shared/types/prism.types';

export interface NarcolepsyPRISMContext extends ClinicalContext {
  diagnosis: 'NT1' | 'NT2';
  essScore: number;
  cataplexyPresent: boolean;
  msltResults?: {
    meanSleepLatency: number;
    soremp: number;
  };
  currentMedications: string[];
  comorbidities: string[];
  demographics: {
    age: number;
    gender: string;
    occupation: string;
  };
}

export class NarcolepsyPRISMPrompts {
  private static readonly EVIDENCE_LEVELS = {
    A: 'High-quality RCT evidence',
    B: 'Moderate-quality evidence from controlled studies',
    C: 'Low-quality evidence from observational studies',
    D: 'Expert opinion or case series'
  };

  // ================================================================
  // SLEEP ASSESSMENT PROMPTS
  // ================================================================

  static generateSleepAssessmentPrompt(context: NarcolepsyPRISMContext): PRISMPrompt {
    return {
      id: 'narcolepsy-sleep-assessment-v2',
      category: 'clinical_assessment',

      precision: `
        CLINICAL SLEEP ASSESSMENT - NARCOLEPSY SPECIFIC

        Patient Profile:
        - Diagnosis: ${context.diagnosis} (${context.diagnosis === 'NT1' ? 'Type 1 - with cataplexy' : 'Type 2 - without cataplexy'})
        - Current ESS Score: ${context.essScore}/24 (${this.interpretESS(context.essScore)})
        - MSLT Results: ${context.msltResults ?
          `MSL: ${context.msltResults.meanSleepLatency} min, SOREMPs: ${context.msltResults.soremp}` :
          'Pending'}
        - Demographics: ${context.demographics.age}y ${context.demographics.gender}, ${context.demographics.occupation}

        ANALYSIS REQUIREMENTS:
        1. Apply ICSD-3 diagnostic criteria validation
        2. Calculate sleep debt and circadian misalignment
        3. Assess functional impairment severity (occupational, social, cognitive)
        4. Identify comorbid sleep disorders (sleep apnea, PLMD, RBD)

        PRECISION TARGETS:
        - Diagnostic accuracy: ≥95% confidence
        - Phenotype classification: NT1 vs NT2 distinction
        - Severity stratification: Mild/Moderate/Severe based on validated scales
      `,

      relevance: `
        CLINICAL RELEVANCE FILTERS:

        Priority Assessment Areas:
        1. PRIMARY: Excessive daytime sleepiness quantification
        2. SECONDARY: Cataplexy characterization (if ${context.cataplexyPresent ? 'present' : 'absent'})
        3. TERTIARY: REM sleep phenomena (sleep paralysis, hypnagogic hallucinations)
        4. QUATERNARY: Sleep quality and architecture analysis

        Evidence-Based Focus:
        - Prioritize interventions with Level A evidence (AAN/AASM guidelines)
        - Consider phenotype-specific treatments (NT1: anticataplectic focus, NT2: alerting agents)
        - Integrate occupational impact for ${context.demographics.occupation} profession

        Exclusion Criteria:
        - Filter out recommendations not applicable to ${context.diagnosis}
        - Exclude age-inappropriate interventions for ${context.demographics.age}-year-old
      `,

      integration: `
        MULTIMODAL DATA INTEGRATION:

        Objective Measures:
        - PSG/MSLT data correlation with symptom severity
        - Wearable sleep tracking integration (if available)
        - Biomarker correlation (hypocretin-1 levels for NT1)

        Subjective Measures:
        - ESS score: ${context.essScore} → Clinical correlation
        - Patient-reported outcomes (sleep diary, symptom journals)
        - Quality of life impact (work performance, social functioning)

        Treatment History Integration:
        - Current medications: ${context.currentMedications.join(', ')}
        - Previous treatment responses and tolerability
        - Adherence patterns and barriers

        Comorbidity Considerations:
        - Medical comorbidities: ${context.comorbidities.join(', ')}
        - Psychiatric comorbidities (depression, anxiety - common in narcolepsy)
        - Sleep comorbidities requiring concurrent management
      `,

      safety: `
        CRITICAL SAFETY ASSESSMENTS:

        IMMEDIATE SAFETY CONCERNS:

        1. DRIVING SAFETY EVALUATION:
        Risk Level: ${this.assessDrivingRisk(context.essScore, context.cataplexyPresent)}
        - ESS ${context.essScore}: ${context.essScore > 15 ? 'PROHIBITED' :
                                    context.essScore > 10 ? 'HIGH RISK' : 'MODERATE RISK'}
        - Cataplexy Status: ${context.cataplexyPresent ? 'ADDITIONAL RISK FACTOR' : 'No additional risk'}

        Required Actions:
        ${context.essScore > 15 ?
          '- MANDATORY driving restriction counseling\n        - DMV notification consideration\n        - Alternative transportation planning' :
          '- Driving safety education\n        - Regular reassessment schedule'}

        2. OCCUPATIONAL SAFETY:
        - Workplace hazard assessment for ${context.demographics.occupation}
        - Shift work tolerance evaluation
        - Safety-sensitive position considerations

        3. MEDICATION SAFETY:
        - CNS stimulant contraindications screening
        - Cardiac assessment for stimulant therapy
        - Psychiatric monitoring for mood/behavioral changes
        - Pregnancy/breastfeeding considerations (if applicable)

        4. CATAPLEXY SAFETY (if applicable):
        ${context.cataplexyPresent ? `
        - Fall injury prevention strategies
        - Trigger identification and avoidance
        - Emergency response planning
        - Activity modification recommendations` : 'N/A - No cataplexy reported'}

        SAFETY MONITORING PROTOCOL:
        - Adverse event reporting system
        - Regular safety assessments (monthly initially)
        - Emergency contact procedures
        - Suicidal ideation screening (higher risk in narcolepsy)
      `,

      measurement: `
        VALIDATED OUTCOME MEASURES:

        PRIMARY ENDPOINTS:
        1. Epworth Sleepiness Scale (ESS):
           - Baseline: ${context.essScore}/24
           - Target: Reduction ≥3 points or score ≤10
           - Assessment frequency: Every 4 weeks

        2. Multiple Sleep Latency Test (MSLT):
           - Baseline MSL: ${context.msltResults?.meanSleepLatency || 'TBD'} minutes
           - Target: MSL >8 minutes for functional improvement
           - Reassessment: Every 3-6 months

        SECONDARY ENDPOINTS:
        3. Cataplexy Assessment:
           ${context.cataplexyPresent ? `
           - Cataplexy Diary: Episode frequency and severity
           - Target: ≥50% reduction in episode frequency
           - Weekly patient-reported tracking` : 'N/A'}

        4. Quality of Life Measures:
           - SF-36 Health Survey (generic QoL)
           - Functional Outcomes of Sleep Questionnaire (FOSQ)
           - Work Productivity and Activity Impairment (WPAI)
           - Target: ≥20% improvement in composite scores

        5. Sleep Quality Assessment:
           - Pittsburgh Sleep Quality Index (PSQI)
           - Sleep diary metrics (sleep efficiency, total sleep time)
           - Target: PSQI ≤5 (good sleep quality)

        BIOMARKERS (when applicable):
        - Hypocretin-1 CSF levels (NT1 diagnosis confirmation)
        - HLA-DQB1*06:02 typing (genetic susceptibility marker)

        REAL-WORLD EVIDENCE:
        - Medication adherence rates (target ≥80%)
        - Healthcare utilization (ED visits, hospitalizations)
        - Work/school absenteeism rates
        - Driving incident reports

        DIGITAL BIOMARKERS:
        - Wearable sleep metrics (if available)
        - Smartphone-based reaction time testing
        - Voice pattern analysis for sleepiness detection

        MEASUREMENT SCHEDULE:
        - Daily: Sleep diary, symptom tracking
        - Weekly: Cataplexy diary (if applicable)
        - Monthly: ESS, adverse events, safety assessment
        - Quarterly: Comprehensive QoL assessment, treatment optimization
        - Annually: MSLT reassessment, comprehensive review
      `,

      validation: {
        pharma: {
          purpose: 'Improve narcolepsy symptom management and quality of life',
          hypothesis: 'Personalized treatment reduces ESS and improves functional outcomes',
          audience: `Adult ${context.diagnosis} patients`,
          requirements: 'FDA DiGA compliance, clinical guideline adherence',
          metrics: 'ESS reduction, cataplexy control, QoL improvement',
          actionable: 'Specific, measurable treatment recommendations'
        },
        verify: {
          sources: ['ICSD-3', 'AAN Practice Guidelines', 'AASM Clinical Guidelines'],
          evidence: 'Level A recommendations prioritized',
          confidence: 0.92,
          gaps: ['Long-term safety data', 'Pediatric efficacy'],
          factChecked: true,
          expertReview: context.essScore > 18 || context.comorbidities.length > 2
        }
      }
    };
  }

  // ================================================================
  // MEDICATION OPTIMIZATION PROMPTS
  // ================================================================

  static generateMedicationOptimizationPrompt(context: Omit<NarcolepsyPRISMContext, 'currentMedications'> & {
    currentMedications: Array<{
      name: string;
      dose: string;
      frequency: string;
      duration: string;
      adherence: number;
      sideEffects: string[];
      efficacy: number; // 0-1 scale
    }>;
    treatmentHistory: string[];
  }): PRISMPrompt {
    return {
      id: 'narcolepsy-medication-optimization-v2',
      category: 'treatment_optimization',

      precision: `
        PHARMACOLOGICAL OPTIMIZATION - NARCOLEPSY ${context.diagnosis}

        Current Regimen Analysis:
        ${context.currentMedications.map(med => `
        - ${med.name} ${med.dose} ${med.frequency}
          Duration: ${med.duration}
          Adherence: ${(med.adherence * 100).toFixed(0)}%
          Efficacy: ${(med.efficacy * 100).toFixed(0)}%
          Side Effects: ${med.sideEffects?.join(', ') || 'None reported'}
        `).join('')}

        EVIDENCE-BASED OPTIMIZATION ALGORITHM:

        For NT1 (with cataplexy):
        1. First-line: Sodium oxybate (FDA-approved for EDS + cataplexy)
        2. Alternative: Modafinil/Armodafinil + anticataplectic (venlafaxine, clomipramine)
        3. Emerging: Pitolisant (dual mechanism - approved 2019)

        For NT2 (EDS only):
        1. First-line: Modafinil 200-400mg daily
        2. Alternative: Armodafinil 150-250mg daily
        3. Third-line: Traditional stimulants (methylphenidate, amphetamines)

        PERSONALIZATION FACTORS:
        - Age: ${context.demographics.age} (dosing adjustments if >65 or <18)
        - Occupation: ${context.demographics.occupation} (timing considerations)
        - Comorbidities: ${context.comorbidities.join(', ')} (drug interactions)
        - Previous failures: ${context.treatmentHistory.join(', ')}
      `,

      relevance: `
        TREATMENT PRIORITIZATION MATRIX:

        Priority 1 - Symptom Control:
        - Target ESS reduction from ${context.essScore} to ≤10
        ${context.cataplexyPresent ? '- Cataplexy frequency reduction ≥50%' : ''}
        - Functional improvement (work, driving, social)

        Priority 2 - Safety Optimization:
        - Minimize driving/occupational hazards
        - Optimize side effect profile
        - Drug interaction management

        Priority 3 - Adherence Enhancement:
        - Simplify dosing regimen when possible
        - Address adherence barriers
        - Patient education and engagement

        EVIDENCE HIERARCHY:
        Level A Evidence (Strong Recommendation):
        - Modafinil for EDS (multiple RCTs)
        - Sodium oxybate for NT1 (FDA-approved, RCT evidence)

        Level B Evidence (Moderate Recommendation):
        - Armodafinil for EDS
        - Pitolisant for NT1

        CONTRAINDICATION SCREENING:
        ${this.generateContraindicationCheck({
          ...context,
          currentMedications: context.currentMedications.map(med => med.name)
        })}
      `,

      integration: `
        COMPREHENSIVE TREATMENT INTEGRATION:

        Pharmacokinetic Considerations:
        - CYP450 enzyme interactions
        - Renal/hepatic function adjustments
        - Age-related metabolism changes

        Circadian Timing Optimization:
        - Stimulant dosing: Peak effect during desired alertness periods
        - Sodium oxybate: Bedtime dosing for sleep consolidation
        - Meal timing interactions (modafinil can be taken with/without food)

        Combination Therapy Rationale:
        ${context.diagnosis === 'NT1' ? `
        NT1 Combination Strategy:
        - Sodium oxybate (nighttime) + stimulant (daytime) for comprehensive coverage
        - Anticataplectic + alerting agent if sodium oxybate insufficient
        ` : `
        NT2 Monotherapy Preferred:
        - Single agent optimization before combination
        - Add second agent only if partial response to optimized first-line
        `}

        Non-Pharmacological Integration:
        - Scheduled napping (15-20 minutes, 1-3 times daily)
        - Sleep hygiene optimization
        - Cognitive behavioral therapy for hypersomnia (CBT-H)
        - Light therapy for circadian alignment

        Monitoring Integration:
        - Digital pill dispensers for adherence tracking
        - Smartphone apps for symptom monitoring
        - Wearable devices for sleep/wake pattern analysis
      `,

      safety: `
        MEDICATION SAFETY PROTOCOL:

        PRE-TREATMENT SAFETY ASSESSMENT:

        Cardiovascular Screening:
        - ECG baseline (especially for stimulants)
        - Blood pressure monitoring setup
        - Cardiac history evaluation
        - Risk stratification: ${this.assessCardiacRisk({
          ...context,
          currentMedications: context.currentMedications.map(med => med.name)
        })}

        Psychiatric Screening:
        - Depression/anxiety assessment (PHQ-9, GAD-7)
        - Substance abuse history
        - Suicide risk evaluation
        - Psychiatric medication interactions

        Drug-Specific Safety Considerations:

        MODAFINIL/ARMODAFINIL:
        ⚠️  Contraindications: Severe hepatic impairment, hypersensitivity
        ⚠️  Warnings: Stevens-Johnson syndrome (rare), psychiatric effects
        ⚠️  Monitoring: LFTs at baseline, mood changes

        SODIUM OXYBATE:
        ⚠️  BLACK BOX WARNING: CNS depression, respiratory depression
        ⚠️  Contraindications: Concurrent sedative use, compromised respiratory function
        ⚠️  Special precautions: Secure storage (GHB abuse potential)

        TRADITIONAL STIMULANTS:
        ⚠️  Contraindications: Cardiac abnormalities, hyperthyroidism, glaucoma
        ⚠️  Abuse potential: Schedule II controlled substances
        ⚠️  Monitoring: Growth (pediatric), blood pressure, psychiatric effects

        ONGOING SAFETY MONITORING:
        - Monthly safety assessments first 3 months
        - Quarterly thereafter
        - Immediate reporting of serious adverse events
        - Annual comprehensive safety review

        EMERGENCY PROTOCOLS:
        - Severe allergic reaction: Discontinue, seek immediate medical attention
        - Cardiac events: Emergency services, cardiology consultation
        - Psychiatric emergency: Mental health crisis intervention
        - Overdose: Poison control, emergency services
      `,

      measurement: `
        TREATMENT RESPONSE MEASUREMENT FRAMEWORK:

        PRIMARY EFFICACY ENDPOINTS:

        1. Epworth Sleepiness Scale (ESS):
        Baseline: ${context.essScore}/24
        Target Response: ≥3-point reduction OR final score ≤10
        Measurement Schedule:
        - Week 2: Early response assessment
        - Week 4: Primary endpoint evaluation
        - Week 8: Dose optimization checkpoint
        - Monthly thereafter: Maintenance monitoring

        2. Clinical Global Impression (CGI):
        - CGI-Severity (baseline severity rating)
        - CGI-Improvement (treatment response rating)
        - Target: CGI-I ≤2 (much improved or very much improved)

        ${context.cataplexyPresent ? `
        3. Cataplexy-Specific Measures:
        - Weekly cataplexy diary (frequency, severity, triggers)
        - Target: ≥50% reduction in episode frequency
        - Cataplexy Severity Index (if validated scale available)
        ` : ''}

        SAFETY ENDPOINTS:

        1. Adverse Event Monitoring:
        - Daily patient reporting (first 2 weeks)
        - Weekly safety check-ins (weeks 3-8)
        - Monthly safety assessments (ongoing)
        - Standardized AE severity grading (CTCAE v5.0)

        2. Vital Sign Monitoring:
        - Blood pressure (weekly x 4, then monthly)
        - Heart rate (weekly x 4, then monthly)
        - Weight (monthly)
        - Temperature (if infection risk)

        3. Laboratory Monitoring:
        - Baseline: CBC, CMP, LFTs, thyroid function
        - Follow-up: LFTs at 3 months (if hepatically metabolized drugs)
        - Annual: Comprehensive metabolic panel

        ADHERENCE MEASUREMENT:

        1. Objective Measures:
        - Pill counts at visits
        - Electronic monitoring caps (if available)
        - Pharmacy refill records
        - Digital adherence platforms

        2. Self-Report Measures:
        - Morisky Medication Adherence Scale (MMAS-8)
        - Brief Medication Questionnaire (BMQ)
        - Target adherence: ≥80%

        FUNCTIONAL OUTCOMES:

        1. Work/Academic Performance:
        - Work Productivity and Activity Impairment (WPAI)
        - Absenteeism and presenteeism rates
        - Academic performance metrics (if student)

        2. Quality of Life:
        - Narcolepsy-specific: Narcolepsy Severity Scale (NSS)
        - Generic: SF-36 Health Survey
        - Sleep-specific: Functional Outcomes of Sleep Questionnaire (FOSQ)

        3. Driving Safety:
        - Driving simulator testing (if available)
        - Self-reported driving incidents
        - Driving restriction compliance

        DIGITAL BIOMARKERS:
        - Smartphone reaction time testing
        - Wearable sleep/activity monitoring
        - Voice analysis for sleepiness detection
        - Ecological momentary assessment (EMA)

        MEASUREMENT INTEGRATION:
        - Electronic data capture (EDC) systems
        - Patient-reported outcome platforms
        - Real-time safety signal detection
        - Automated alert systems for critical values

        RESPONSE CRITERIA DEFINITIONS:
        - Complete Response: ESS ≤10 AND functional improvement
        - Partial Response: ESS reduction ≥3 points but >10
        - No Response: ESS reduction <3 points
        - Treatment Failure: No response after optimal dose/duration
      `,

      validation: {
        pharma: {
          purpose: 'Evidence-based medication optimization for narcolepsy patients to improve excessive daytime sleepiness and cataplexy symptoms',
          hypothesis: 'Personalized pharmacological interventions based on diagnosis subtype, current regimen analysis, and individual patient factors will result in measurable symptom improvement',
          audience: 'Sleep medicine physicians, neurologists, and healthcare providers managing narcolepsy patients',
          requirements: 'Current medication history, ESS scores, comorbidity assessment, and safety screening required for optimization',
          metrics: 'Primary: ESS score reduction ≥3 points; Secondary: Functional improvement, adherence ≥80%, safety profile',
          actionable: 'Specific medication recommendations with dosing, timing, monitoring, and safety protocols'
        },
        verify: {
          sources: ['AASM Practice Guidelines', 'FDA-approved prescribing information', 'Cochrane systematic reviews', 'Journal of Clinical Sleep Medicine'],
          evidence: 'Level A evidence for modafinil and sodium oxybate, Level B for armodafinil and pitolisant',
          confidence: 0.92,
          gaps: ['Limited long-term safety data for newer agents', 'Personalized dosing algorithms under development'],
          factChecked: true,
          expertReview: false
        }
      }
    };
  }

  // ================================================================
  // BEHAVIORAL INTERVENTION PROMPTS
  // ================================================================

  static generateBehavioralInterventionPrompt(context: NarcolepsyPRISMContext & {
    sleepHygiene: 'poor' | 'fair' | 'good' | 'excellent';
    lifestyle: {
      shiftWork: boolean;
      exercise: 'none' | 'light' | 'moderate' | 'vigorous';
      caffeine: number; // mg/day
      alcohol: number; // drinks/week
      stress: 1 | 2 | 3 | 4 | 5; // 1=low, 5=high
    };
  }): PRISMPrompt {
    return {
      id: 'narcolepsy-behavioral-interventions-v2',
      category: 'behavioral_therapy',

      precision: `
        BEHAVIORAL INTERVENTION PRESCRIPTION - NARCOLEPSY MANAGEMENT

        Current Behavioral Profile:
        - Sleep Hygiene: ${context.lifestyle.exercise} (assessment needed if poor/fair)
        - Exercise Level: ${context.lifestyle.exercise}
        - Caffeine Intake: ${context.lifestyle.caffeine}mg/day (${this.categorizeCaffeine(context.lifestyle.caffeine)})
        - Alcohol Use: ${context.lifestyle.alcohol} drinks/week
        - Stress Level: ${context.lifestyle.stress}/5
        - Shift Work: ${context.lifestyle.shiftWork ? 'Yes - additional considerations needed' : 'No'}

        EVIDENCE-BASED INTERVENTION HIERARCHY:

        Tier 1 - Essential (Strong Evidence):
        1. Strategic Napping Protocol:
           - Schedule: 1-3 naps daily, 15-20 minutes each
           - Timing: Peak sleepiness periods (typically 1-3 PM, 5-7 PM)
           - Environment: Dark, quiet, cool (65-68°F)
           - Consistency: Same times daily to optimize circadian rhythm

        2. Sleep Hygiene Optimization:
           - Fixed sleep schedule (±30 minutes variance)
           - Target: 7-9 hours nocturnal sleep
           - Pre-sleep routine: 1-hour wind-down protocol
           - Sleep environment: Dark, quiet, cool

        Tier 2 - Beneficial (Moderate Evidence):
        3. Cognitive Behavioral Therapy for Hypersomnia (CBT-H):
           - 6-8 session structured program
           - Sleep restriction therapy adaptation
           - Cognitive restructuring for sleepiness beliefs
           - Activity scheduling and pacing

        4. Light Therapy Protocol:
           - Morning bright light: 10,000 lux x 30 minutes
           - Timing: Within 1 hour of wake time
           - Seasonal adjustment for circadian rhythm

        Tier 3 - Supportive (Limited Evidence):
        5. Stress Management Techniques
        6. Exercise Programming
        7. Dietary Optimization
      `,

      relevance: `
        INTERVENTION PRIORITIZATION BASED ON PATIENT PROFILE:

        High Priority Interventions:
        ${this.generateBehavioralPriorities(context)}

        Occupation-Specific Considerations:
        ${this.generateOccupationalRecommendations(context.demographics.occupation)}

        Age-Specific Modifications:
        ${this.generateAgeSpecificRecommendations(context.demographics.age)}

        Contraindications and Cautions:
        ${context.comorbidities.length > 0 ? `
        Medical Comorbidities: ${context.comorbidities.join(', ')}
        - Adjust interventions based on medical limitations
        - Coordinate with treating physicians
        ` : 'No significant medical contraindications identified'}

        Cultural and Social Considerations:
        - Work schedule accommodation
        - Family/social support integration
        - Cultural sleep practices respect
        - Economic factors in implementation
      `,

      integration: `
        MULTIMODAL INTERVENTION INTEGRATION:

        Pharmacological Integration:
        - Nap timing coordination with medication peaks/troughs
        - Caffeine use optimization (avoid interference with medications)
        - Sleep hygiene enhancement of medication efficacy

        Technology Integration:
        - Sleep tracking apps for adherence monitoring
        - Smart alarm systems for optimal wake timing
        - Light therapy devices with automated scheduling
        - Meditation/relaxation apps for stress management

        Healthcare Team Coordination:
        - Primary care physician: Overall health optimization
        - Sleep specialist: Medication coordination
        - Psychologist/therapist: CBT-H implementation
        - Occupational therapist: Workplace accommodations

        Family/Support System Integration:
        - Partner/family education about narcolepsy
        - Support for maintaining sleep schedule
        - Emergency response planning for cataplexy (if applicable)
        - Social activity modification strategies

        Workplace Integration:
        - Accommodation requests (flexible scheduling, nap breaks)
        - Ergonomic workspace optimization
        - Stress reduction strategies
        - Performance expectation management
      `,

      safety: `
        BEHAVIORAL INTERVENTION SAFETY CONSIDERATIONS:

        NAPPING SAFETY PROTOCOLS:

        Safe Napping Guidelines:
        ✓ Duration: 15-20 minutes maximum (avoid sleep inertia)
        ✓ Timing: At least 6 hours before bedtime
        ✓ Environment: Safe location (not while driving/operating machinery)
        ✓ Alarm use: Mandatory to prevent oversleeping

        Napping Contraindications:
        ⚠️  Severe insomnia comorbidity
        ⚠️  Sleep phase disorders
        ⚠️  Safety-sensitive work environments (pilot, operator)

        DRIVING SAFETY INTEGRATION:

        Pre-Drive Safety Checklist:
        □ ESS score assessment (prohibit driving if >15)
        □ Recent nap completion (within 2 hours)
        □ Medication timing optimization
        □ Route planning with rest stops

        Emergency Driving Protocols:
        - Pull over immediately if sleepiness occurs
        - 15-minute nap minimum before resuming
        - Emergency contact notification
        - Alternative transportation planning

        EXERCISE SAFETY CONSIDERATIONS:

        Exercise Prescription Safety:
        - Cardiovascular clearance if >40 years or cardiac history
        - Avoid vigorous exercise within 4 hours of sleep
        - Hydration monitoring (some medications affect fluid balance)
        - Energy expenditure balance with sleep debt

        Cataplexy-Specific Exercise Modifications:
        ${context.cataplexyPresent ? `
        - Avoid high-emotion competitive activities
        - Partner/spotter for weight training
        - Pool exercise for fall safety
        - Trigger identification and avoidance
        ` : 'Standard exercise guidelines apply'}

        STRESS MANAGEMENT SAFETY:
        - Screen for underlying psychiatric conditions
        - Monitor for medication interactions (relaxation techniques)
        - Ensure stress reduction doesn't compromise alertness needs

        INTERVENTION MONITORING SAFETY:
        - Weekly safety check-ins during implementation
        - Immediate reporting of adverse effects
        - Modification protocols for safety concerns
        - Emergency discontinuation criteria
      `,

      measurement: `
        BEHAVIORAL INTERVENTION OUTCOME MEASUREMENT:

        PRIMARY BEHAVIORAL OUTCOMES:

        1. Sleep Architecture Improvement:
        Measures:
        - Actigraphy monitoring (2-week baseline, ongoing)
        - Sleep diary completion (daily)
        - Pittsburgh Sleep Quality Index (PSQI) monthly

        Targets:
        - Sleep efficiency ≥85%
        - Total sleep time: 7-9 hours
        - Sleep onset latency: <30 minutes
        - PSQI score: ≤5 (good sleep quality)

        2. Napping Protocol Adherence:
        Measures:
        - Nap diary with timing, duration, quality
        - Post-nap alertness ratings (1-10 scale)
        - Weekly nap effectiveness assessment

        Targets:
        - Nap adherence: ≥80% of scheduled naps
        - Optimal nap duration: 15-20 minutes
        - Post-nap alertness improvement: ≥2 points

        3. Lifestyle Modification Success:
        Measures:
        - Exercise tracking (frequency, duration, intensity)
        - Caffeine intake monitoring
        - Stress level assessment (weekly rating)
        - Sleep hygiene checklist compliance

        Targets:
        - Exercise: ≥150 minutes moderate activity/week
        - Caffeine optimization: <400mg/day, none after 2 PM
        - Stress reduction: ≥1 point improvement on 5-point scale

        FUNCTIONAL OUTCOME MEASURES:

        1. Cognitive Performance:
        - Psychomotor Vigilance Task (PVT) - weekly
        - Attention and working memory assessments
        - Subjective cognitive complaints questionnaire

        2. Workplace/Academic Performance:
        - Productivity metrics (if available)
        - Absenteeism/tardiness rates
        - Performance evaluations correlation
        - Accommodation effectiveness assessment

        3. Social and Emotional Functioning:
        - Social functioning assessment (monthly)
        - Mood monitoring (depression/anxiety screens)
        - Relationship quality indicators
        - Activity participation levels

        ADHERENCE MEASUREMENT:

        1. Intervention Fidelity:
        - Daily behavior tracking (sleep diary, nap log)
        - Weekly intervention checklist completion
        - Monthly comprehensive adherence review
        - Barriers to adherence identification and resolution

        2. Technology-Assisted Monitoring:
        - Smartphone app data (sleep, activity, mood)
        - Wearable device integration
        - Ecological momentary assessment (EMA)
        - Automated reminder and feedback systems

        SAFETY OUTCOME MEASURES:

        1. Driving Safety:
        - Self-reported driving incidents
        - Near-miss event reporting
        - Driving restriction compliance
        - Simulator testing results (if available)

        2. Occupational Safety:
        - Workplace incident reports
        - Safety violation rates
        - Accommodation effectiveness
        - Supervisor feedback on performance/safety

        LONG-TERM SUSTAINABILITY MEASURES:

        1. Behavior Maintenance:
        - 3-month post-intervention adherence rates
        - 6-month follow-up outcome sustainability
        - Long-term lifestyle integration success
        - Relapse prevention effectiveness

        2. Quality of Life Integration:
        - Life satisfaction ratings
        - Goal attainment scaling
        - Patient-reported benefit assessment
        - Healthcare utilization changes

        MEASUREMENT SCHEDULE SUMMARY:
        - Daily: Sleep diary, nap log, symptom tracking
        - Weekly: Adherence review, safety assessment
        - Monthly: Standardized questionnaires, outcome evaluation
        - Quarterly: Comprehensive review and modification
        - Annually: Long-term outcome assessment
      `,

      validation: {
        pharma: {
          purpose: 'Evidence-based behavioral interventions for narcolepsy patients to complement pharmacological treatment and improve quality of life',
          hypothesis: 'Structured behavioral interventions including strategic napping, sleep hygiene optimization, and lifestyle modifications will improve functional outcomes and treatment adherence',
          audience: 'Sleep medicine specialists, behavioral sleep medicine providers, and multidisciplinary care teams managing narcolepsy patients',
          requirements: 'Current sleep patterns assessment, lifestyle factors evaluation, and baseline functional status measurement required for intervention design',
          metrics: 'Primary: Sleep quality improvement, napping effectiveness; Secondary: ESS reduction, functional outcomes, adherence to behavioral protocols',
          actionable: 'Specific behavioral protocols with implementation timelines, monitoring schedules, and outcome measurement plans'
        },
        verify: {
          sources: ['Sleep Medicine Reviews', 'Behavioral Sleep Medicine journal', 'AASM Clinical Guidelines', 'Cochrane systematic reviews'],
          evidence: 'Level A evidence for strategic napping and sleep hygiene, Level B evidence for CBT-H and lifestyle interventions',
          confidence: 0.88,
          gaps: ['Long-term behavioral intervention sustainability', 'Personalized intervention algorithms for different patient phenotypes'],
          factChecked: true,
          expertReview: false
        }
      }
    };
  }

  // ================================================================
  // UTILITY METHODS
  // ================================================================

  private static interpretESS(score: number): string {
    if (score <= 7) return 'Normal';
    if (score <= 10) return 'Mild sleepiness';
    if (score <= 15) return 'Moderate sleepiness';
    if (score <= 20) return 'Severe sleepiness';
    return 'Very severe sleepiness';
  }

  private static assessDrivingRisk(essScore: number, cataplexy: boolean): string {
    if (essScore > 15) return 'PROHIBITED - Severe sleepiness';
    if (essScore > 10 && cataplexy) return 'HIGH RISK - Sleepiness + Cataplexy';
    if (essScore > 10) return 'MODERATE-HIGH RISK - Moderate sleepiness';
    if (cataplexy) return 'MODERATE RISK - Cataplexy present';
    return 'LOW-MODERATE RISK';
  }

  private static generateContraindicationCheck(context: NarcolepsyPRISMContext): string {

    if (context.demographics.age > 65) {
      checks.push('- Elderly: Reduced drug clearance, increased sensitivity');
    }

    if (context.comorbidities.includes('cardiac')) {
      checks.push('- Cardiac: Contraindication to stimulants, ECG monitoring required');
    }

    if (context.comorbidities.includes('psychiatric')) {
      checks.push('- Psychiatric: Monitor for mood/behavioral changes');
    }

    if (context.comorbidities.includes('hepatic')) {
      checks.push('- Hepatic impairment: Dose adjustment/contraindication to hepatically metabolized drugs');
    }

    return checks.length > 0 ? checks.join('\n        ') : '- No major contraindications identified';
  }

  private static assessCardiacRisk(context: NarcolepsyPRISMContext): string {
    if (context.comorbidities.includes('cardiac') || context.demographics.age > 60) {
      return 'HIGH - Cardiology clearance recommended';
    }
    if (context.demographics.age > 40) {
      return 'MODERATE - ECG and vital sign monitoring';
    }
    return 'LOW - Standard monitoring sufficient';
  }

  private static categorizeCaffeine(mg: number): string {
    if (mg < 100) return 'Low intake';
    if (mg < 300) return 'Moderate intake';
    if (mg < 500) return 'High intake';
    return 'Excessive intake - reduction recommended';
  }

  private static generateBehavioralPriorities(context: NarcolepsyPRISMContext & any): string {

    if (context.lifestyle.sleepHygiene === 'poor') {
      priorities.push('1. URGENT: Sleep hygiene optimization');
    }

    if (context.lifestyle.caffeine > 400) {
      priorities.push('2. HIGH: Caffeine intake reduction and timing optimization');
    }

    if (context.lifestyle.stress >= 4) {
      priorities.push('3. HIGH: Stress management intervention');
    }

    if (context.essScore > 15) {
      priorities.push('4. CRITICAL: Strategic napping implementation');
    }

    return priorities.length > 0 ? priorities.join('\n        ') : 'Standard intervention hierarchy applies';
  }

  private static generateOccupationalRecommendations(occupation: string): string {

      ['healthcare', 'Shift work considerations, patient safety protocols, nap scheduling'],
      ['driver', 'Driving restrictions, alternative transportation, schedule modifications'],
      ['teacher', 'Classroom management strategies, break scheduling, student safety'],
      ['pilot', 'MANDATORY grounding until ESS <10, aviation medical certification'],
      ['office', 'Ergonomic optimization, break scheduling, productivity management'],
      ['student', 'Academic accommodations, exam scheduling, note-taking support']
    ]);

    return recommendations.get(occupation.toLowerCase()) || 'General workplace accommodations';
  }

  private static generateAgeSpecificRecommendations(age: number): string {
    if (age < 25) {
      return 'Young adult considerations: Academic/career impact, driving safety, social functioning';
    } else if (age > 65) {
      return 'Older adult considerations: Comorbidity management, medication interactions, fall risk';
    }
    return 'Standard adult recommendations apply';
  }
}

export default NarcolepsyPRISMPrompts;