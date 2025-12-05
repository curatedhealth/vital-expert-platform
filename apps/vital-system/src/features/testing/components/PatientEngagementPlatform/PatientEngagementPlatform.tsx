'use client';

import { motion } from 'framer-motion';
import {
  Users,
  Heart,
  MessageCircle,
  Bell,
  Smartphone,
  Activity,
  Award,
  TrendingUp,
  CheckCircle,
  Target,
  Zap,
  Star,
  BookOpen,
  Video,
  Phone,
  Mail,
  Settings,
  Plus,
  Eye,
  PlayCircle,
  Headphones,
  Monitor
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

interface PatientEngagementPlatformProps {
  className?: string;
}

interface EngagementMetrics {
  totalPatients: number;
  activeUsers: number;
  averageEngagement: number;
  completionRate: number;
  satisfactionScore: number;
  retentionRate: number;
  interventionsDelivered: number;
  adherenceImprovement: number;
}

interface PatientCohort {
  id: string;
  name: string;
  condition: string;
  size: number;
  engagement: number;
  adherence: number;
  satisfaction: number;
  interventions: EngagementIntervention[];
  demographics: Demographics;
  outcomes: OutcomeMetric[];
  status: 'active' | 'completed' | 'paused';
}

interface EngagementIntervention {
  id: string;
  name: string;
  type: 'educational' | 'motivational' | 'reminder' | 'social' | 'gamification' | 'personalized';
  channel: 'app' | 'sms' | 'email' | 'voice' | 'video' | 'push' | 'wearable';
  frequency: string;
  effectiveness: number;
  usage: number;
  cost: number;
}

interface Demographics {
  ageGroups: { range: string; percentage: number }[];
  gender: { male: number; female: number; other: number };
  geography: { region: string; percentage: number }[];
  socioeconomic: { category: string; percentage: number }[];
  digitalLiteracy: { level: string; percentage: number }[];
}

interface OutcomeMetric {
  id: string;
  name: string;
  baseline: number;
  current: number;
  target: number;
  improvement: number;
  significance: 'low' | 'medium' | 'high';
}

interface EngagementContent {
  id: string;
  title: string;
  type: 'article' | 'video' | 'interactive' | 'quiz' | 'audio' | 'infographic';
  category: 'education' | 'motivation' | 'lifestyle' | 'medication' | 'symptoms' | 'support';
  views: number;
  rating: number;
  engagement: number;
  completion: number;
  language: string[];
  accessibility: string[];
}

const PatientEngagementPlatform: React.FC<PatientEngagementPlatformProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'cohorts' | 'interventions' | 'content' | 'analytics'>('overview');
  const [cohorts, setCohorts] = useState<PatientCohort[]>([]);
  const [content, setContent] = useState<EngagementContent[]>([]);
  const [metrics, setMetrics] = useState<EngagementMetrics>({
    totalPatients: 0,
    activeUsers: 0,
    averageEngagement: 0,
    completionRate: 0,
    satisfactionScore: 0,
    retentionRate: 0,
    interventionsDelivered: 0,
    adherenceImprovement: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEngagementData();
  }, []);

    try {
      setLoading(true);

      setTimeout(() => {
        const mockCohorts: PatientCohort[] = [
          {
            id: 'cohort-001',
            name: 'Diabetes Self-Management Program',
            condition: 'Type 2 Diabetes',
            size: 2456,
            engagement: 84.2,
            adherence: 78.5,
            satisfaction: 4.3,
            status: 'active',
            demographics: {
              ageGroups: [
                { range: '18-35', percentage: 15 },
                { range: '36-50', percentage: 35 },
                { range: '51-65', percentage: 32 },
                { range: '65+', percentage: 18 }
              ],
              gender: { male: 48, female: 51, other: 1 },
              geography: [
                { region: 'Urban', percentage: 65 },
                { region: 'Suburban', percentage: 25 },
                { region: 'Rural', percentage: 10 }
              ],
              socioeconomic: [
                { category: 'High', percentage: 25 },
                { category: 'Middle', percentage: 55 },
                { category: 'Low', percentage: 20 }
              ],
              digitalLiteracy: [
                { level: 'High', percentage: 40 },
                { level: 'Medium', percentage: 45 },
                { level: 'Low', percentage: 15 }
              ]
            },
            interventions: [
              {
                id: 'int-001',
                name: 'Daily Glucose Check Reminders',
                type: 'reminder',
                channel: 'push',
                frequency: 'Daily at 9 AM',
                effectiveness: 89.2,
                usage: 76.8,
                cost: 0.15
              },
              {
                id: 'int-002',
                name: 'Personalized Nutrition Tips',
                type: 'educational',
                channel: 'app',
                frequency: 'Weekly',
                effectiveness: 72.5,
                usage: 68.3,
                cost: 2.50
              },
              {
                id: 'int-003',
                name: 'Achievement Badges System',
                type: 'gamification',
                channel: 'app',
                frequency: 'Continuous',
                effectiveness: 65.8,
                usage: 82.4,
                cost: 1.20
              },
              {
                id: 'int-004',
                name: 'Peer Support Groups',
                type: 'social',
                channel: 'video',
                frequency: 'Bi-weekly',
                effectiveness: 81.3,
                usage: 43.7,
                cost: 15.00
              }
            ],
            outcomes: [
              {
                id: 'outcome-001',
                name: 'HbA1c Level',
                baseline: 8.2,
                current: 7.1,
                target: 7.0,
                improvement: 13.4,
                significance: 'high'
              },
              {
                id: 'outcome-002',
                name: 'Medication Adherence',
                baseline: 65.8,
                current: 78.5,
                target: 80.0,
                improvement: 19.3,
                significance: 'high'
              },
              {
                id: 'outcome-003',
                name: 'Quality of Life Score',
                baseline: 6.2,
                current: 7.8,
                target: 8.0,
                improvement: 25.8,
                significance: 'medium'
              }
            ]
          },
          {
            id: 'cohort-002',
            name: 'Heart Health Optimization',
            condition: 'Cardiovascular Disease',
            size: 1872,
            engagement: 91.7,
            adherence: 85.3,
            satisfaction: 4.6,
            status: 'active',
            demographics: {
              ageGroups: [
                { range: '18-35', percentage: 8 },
                { range: '36-50', percentage: 22 },
                { range: '51-65', percentage: 45 },
                { range: '65+', percentage: 25 }
              ],
              gender: { male: 62, female: 37, other: 1 },
              geography: [
                { region: 'Urban', percentage: 72 },
                { region: 'Suburban', percentage: 22 },
                { region: 'Rural', percentage: 6 }
              ],
              socioeconomic: [
                { category: 'High', percentage: 35 },
                { category: 'Middle', percentage: 50 },
                { category: 'Low', percentage: 15 }
              ],
              digitalLiteracy: [
                { level: 'High', percentage: 50 },
                { level: 'Medium', percentage: 40 },
                { level: 'Low', percentage: 10 }
              ]
            },
            interventions: [
              {
                id: 'int-005',
                name: 'Heart Rate Monitoring Alerts',
                type: 'reminder',
                channel: 'wearable',
                frequency: 'Continuous',
                effectiveness: 94.1,
                usage: 88.7,
                cost: 0.05
              },
              {
                id: 'int-006',
                name: 'Cardiac Rehabilitation Videos',
                type: 'educational',
                channel: 'app',
                frequency: '3x per week',
                effectiveness: 87.2,
                usage: 72.1,
                cost: 5.75
              },
              {
                id: 'int-007',
                name: 'Medication Timing Optimizer',
                type: 'personalized',
                channel: 'app',
                frequency: 'Dynamic',
                effectiveness: 91.8,
                usage: 79.3,
                cost: 3.20
              }
            ],
            outcomes: [
              {
                id: 'outcome-004',
                name: 'Blood Pressure Control',
                baseline: 142.5,
                current: 128.3,
                target: 130.0,
                improvement: 10.0,
                significance: 'high'
              },
              {
                id: 'outcome-005',
                name: 'Exercise Adherence',
                baseline: 42.1,
                current: 67.8,
                target: 70.0,
                improvement: 61.0,
                significance: 'high'
              },
              {
                id: 'outcome-006',
                name: 'Cardiovascular Events',
                baseline: 12.3,
                current: 6.7,
                target: 5.0,
                improvement: 45.5,
                significance: 'high'
              }
            ]
          }
        ];

        const mockContent: EngagementContent[] = [
          {
            id: 'content-001',
            title: 'Understanding Your Diabetes Numbers',
            type: 'interactive',
            category: 'education',
            views: 45623,
            rating: 4.7,
            engagement: 87.3,
            completion: 73.2,
            language: ['en', 'es', 'fr'],
            accessibility: ['subtitles', 'audio-description', 'large-text']
          },
          {
            id: 'content-002',
            title: '10-Minute Heart-Healthy Workouts',
            type: 'video',
            category: 'lifestyle',
            views: 32187,
            rating: 4.5,
            engagement: 82.1,
            completion: 68.9,
            language: ['en', 'es'],
            accessibility: ['subtitles', 'sign-language']
          },
          {
            id: 'content-003',
            title: 'Medication Reminder Success Stories',
            type: 'audio',
            category: 'motivation',
            views: 28945,
            rating: 4.8,
            engagement: 75.6,
            completion: 89.2,
            language: ['en', 'es', 'fr', 'de'],
            accessibility: ['transcript', 'slow-speed']
          },
          {
            id: 'content-004',
            title: 'Symptom Tracker Quiz',
            type: 'quiz',
            category: 'symptoms',
            views: 52341,
            rating: 4.4,
            engagement: 91.7,
            completion: 85.3,
            language: ['en'],
            accessibility: ['voice-input', 'large-buttons']
          }
        ];

        setCohorts(mockCohorts);
        setContent(mockContent);
        setMetrics({
          totalPatients: mockCohorts.reduce((sum, cohort) => sum + cohort.size, 0),
          activeUsers: 3847,
          averageEngagement: 87.8,
          completionRate: 76.4,
          satisfactionScore: 4.4,
          retentionRate: 89.2,
          interventionsDelivered: 156247,
          adherenceImprovement: 23.7
        });
        setLoading(false);
      }, 1500);
    } catch (error) {
//       console.error('Error loading engagement data:', error);
      setLoading(false);
    }
  };

    switch (type) {
      case 'educational': return <BookOpen className="h-4 w-4 text-blue-600" />;
      case 'motivational': return <Zap className="h-4 w-4 text-yellow-600" />;
      case 'reminder': return <Bell className="h-4 w-4 text-green-600" />;
      case 'social': return <Users className="h-4 w-4 text-purple-600" />;
      case 'gamification': return <Award className="h-4 w-4 text-orange-600" />;
      case 'personalized': return <Target className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-neutral-600" />;
    }
  };

    switch (channel) {
      case 'app': return <Smartphone className="h-4 w-4" />;
      case 'sms': return <MessageCircle className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'voice': return <Phone className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'push': return <Bell className="h-4 w-4" />;
      case 'wearable': return <Heart className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

    switch (type) {
      case 'video': return <PlayCircle className="h-5 w-5 text-red-600" />;
      case 'audio': return <Headphones className="h-5 w-5 text-purple-600" />;
      case 'interactive': return <Monitor className="h-5 w-5 text-blue-600" />;
      case 'quiz': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'article': return <BookOpen className="h-5 w-5 text-orange-600" />;
      case 'infographic': return <Eye className="h-5 w-5 text-teal-600" />;
      default: return <Activity className="h-5 w-5 text-neutral-600" />;
    }
  };

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Patient Engagement Platform</h1>
          <p className="text-neutral-600 mt-2">Personalized interventions and patient-centric experiences</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            New Cohort
          </button>
          <button className="flex items-center px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-canvas-surface rounded-lg border border-neutral-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Total Patients</p>
              <p className="text-2xl font-bold text-blue-600">{(metrics.totalPatients / 1000).toFixed(1)}K</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-canvas-surface rounded-lg border border-neutral-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Active Users</p>
              <p className="text-2xl font-bold text-green-600">{(metrics.activeUsers / 1000).toFixed(1)}K</p>
            </div>
            <Activity className="h-8 w-8 text-green-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-canvas-surface rounded-lg border border-neutral-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Avg Engagement</p>
              <p className="text-2xl font-bold text-purple-600">{metrics.averageEngagement}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-canvas-surface rounded-lg border border-neutral-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Completion</p>
              <p className="text-2xl font-bold text-teal-600">{metrics.completionRate}%</p>
            </div>
            <CheckCircle className="h-8 w-8 text-teal-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-canvas-surface rounded-lg border border-neutral-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Satisfaction</p>
              <p className="text-2xl font-bold text-orange-600">{metrics.satisfactionScore}/5</p>
            </div>
            <Star className="h-8 w-8 text-orange-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-canvas-surface rounded-lg border border-neutral-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Retention</p>
              <p className="text-2xl font-bold text-indigo-600">{metrics.retentionRate}%</p>
            </div>
            <Heart className="h-8 w-8 text-indigo-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-canvas-surface rounded-lg border border-neutral-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Interventions</p>
              <p className="text-2xl font-bold text-pink-600">{(metrics.interventionsDelivered / 1000).toFixed(0)}K</p>
            </div>
            <Zap className="h-8 w-8 text-pink-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-canvas-surface rounded-lg border border-neutral-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Adherence ↗</p>
              <p className="text-2xl font-bold text-red-600">+{metrics.adherenceImprovement}%</p>
            </div>
            <Target className="h-8 w-8 text-red-600" />
          </div>
        </motion.div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-neutral-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Engagement Overview', icon: Activity },
            { key: 'cohorts', label: 'Patient Cohorts', icon: Users },
            { key: 'interventions', label: 'Smart Interventions', icon: Zap },
            { key: 'content', label: 'Engagement Content', icon: BookOpen },
            { key: 'analytics', label: 'Behavioral Analytics', icon: TrendingUp }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as unknown)}
              className={`flex items-center px-3 py-2 border-b-2 font-medium text-sm ${
                activeTab === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Engagement Highlights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-canvas-surface rounded-lg border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Platform Capabilities</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Smartphone className="h-5 w-5 text-blue-600" />
                  <span className="text-neutral-700">Multi-channel intervention delivery</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Target className="h-5 w-5 text-green-600" />
                  <span className="text-neutral-700">AI-powered personalization engine</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Award className="h-5 w-5 text-purple-600" />
                  <span className="text-neutral-700">Gamification and behavioral nudges</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-orange-600" />
                  <span className="text-neutral-700">Peer support and social features</span>
                </div>
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-5 w-5 text-red-600" />
                  <span className="text-neutral-700">Real-time engagement analytics</span>
                </div>
              </div>
            </div>

            <div className="bg-canvas-surface rounded-lg border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Engagement Performance</h3>
              <div className="space-y-4">
                {[
                  { label: 'User Activation Rate', value: 94.2, color: 'bg-green-600' },
                  { label: 'Content Engagement', value: 87.8, color: 'bg-blue-600' },
                  { label: 'Intervention Acceptance', value: 79.3, color: 'bg-purple-600' },
                  { label: 'Social Participation', value: 65.7, color: 'bg-orange-600' },
                  { label: 'Long-term Retention', value: 89.2, color: 'bg-teal-600' }
                ].map((metric, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-neutral-600">{metric.label}</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-neutral-200 rounded-full h-2 mr-3">
                        <div
                          className={`h-2 rounded-full ${metric.color}`}
                          style={{width: `${metric.value}%`}}
                        ></div>
                      </div>
                      <span className="font-medium">{metric.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Engagement Activities */}
          <div className="bg-canvas-surface rounded-lg border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Recent High-Impact Interventions</h3>
            <div className="space-y-3">
              {[
                {
                  intervention: 'Personalized Medication Reminders for Diabetes Cohort',
                  impact: '15% improvement in adherence',
                  patients: 847,
                  time: '2 hours ago',
                  type: 'reminder'
                },
                {
                  intervention: 'Heart Health Exercise Challenge Launch',
                  impact: '32% increase in activity tracking',
                  patients: 623,
                  time: '4 hours ago',
                  type: 'gamification'
                },
                {
                  intervention: 'Peer Support Group Matching Algorithm Update',
                  impact: '28% boost in social engagement',
                  patients: 1205,
                  time: '1 day ago',
                  type: 'social'
                },
                {
                  intervention: 'Educational Content Personalization Enhancement',
                  impact: '41% increase in content completion',
                  patients: 2134,
                  time: '2 days ago',
                  type: 'educational'
                }
              ].map((activity, index) => (
                <div key={index} className="flex items-start justify-between p-4 bg-neutral-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    {getInterventionIcon(activity.type)}
                    <div>
                      <p className="font-medium text-neutral-900">{activity.intervention}</p>
                      <p className="text-sm text-green-600 font-medium">{activity.impact}</p>
                      <p className="text-xs text-neutral-500 mt-1">
                        {activity.patients} patients affected • {activity.time}
                      </p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'cohorts' && (
        <div className="space-y-6">
          {cohorts.map((cohort) => (
            <div key={cohort.id} className="bg-canvas-surface rounded-lg border border-neutral-200 p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">{cohort.name}</h3>
                  <p className="text-neutral-600 mt-1">
                    {cohort.condition} • {cohort.size.toLocaleString()} patients
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  cohort.status === 'active' ? 'bg-green-100 text-green-800' :
                  cohort.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {cohort.status}
                </span>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-blue-600 font-medium">Engagement Rate</p>
                  <p className="text-2xl font-bold text-blue-900">{cohort.engagement}%</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-green-600 font-medium">Adherence Rate</p>
                  <p className="text-2xl font-bold text-green-900">{cohort.adherence}%</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-purple-600 font-medium">Satisfaction</p>
                  <p className="text-2xl font-bold text-purple-900">{cohort.satisfaction}/5</p>
                </div>
              </div>

              {/* Interventions and Outcomes */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-neutral-900 mb-3">Active Interventions</h4>
                  <div className="space-y-2">
                    {cohort.interventions.slice(0, 3).map((intervention) => (
                      <div key={intervention.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getInterventionIcon(intervention.type)}
                          <div>
                            <p className="text-sm font-medium text-neutral-900">{intervention.name}</p>
                            <div className="flex items-center space-x-2 text-xs text-neutral-500">
                              {getChannelIcon(intervention.channel)}
                              <span>{intervention.frequency}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-600">{intervention.effectiveness}%</p>
                          <p className="text-xs text-neutral-500">effectiveness</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-neutral-900 mb-3">Key Outcomes</h4>
                  <div className="space-y-2">
                    {cohort.outcomes.map((outcome) => (
                      <div key={outcome.id} className="p-3 bg-neutral-50 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm font-medium text-neutral-900">{outcome.name}</p>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            outcome.significance === 'high' ? 'bg-green-100 text-green-800' :
                            outcome.significance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-neutral-100 text-neutral-800'
                          }`}>
                            {outcome.significance}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-neutral-600">
                          <span>Baseline: {outcome.baseline}</span>
                          <span>Current: {outcome.current}</span>
                          <span className="text-green-600 font-medium">↗ {outcome.improvement}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button className="px-4 py-2 text-sm border border-neutral-300 text-neutral-700 rounded hover:bg-neutral-50">
                  View Analytics
                </button>
                <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                  Optimize Interventions
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Additional tabs would be implemented similarly */}
    </div>
  );
};

export default PatientEngagementPlatform;