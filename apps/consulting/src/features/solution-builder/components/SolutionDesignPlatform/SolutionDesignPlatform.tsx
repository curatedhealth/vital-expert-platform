'use client';

import React, { useState, useEffect } from 'react';

import {
  SolutionProject,
  SolutionType,
  ProjectStatus
} from '../../types';

interface SolutionDesignPlatformProps {
  userId: string;
}

const SolutionDesignPlatform: React.FC<SolutionDesignPlatformProps> = ({ userId }) => {
  const [projects, setProjects] = useState<SolutionProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<SolutionProject | null>(null);
  const [activeTab, setActiveTab] = useState<'projects' | 'templates' | 'marketplace' | 'vital'>('projects');
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  useEffect(() => {
    // Load user's projects
    const mockProjects: SolutionProject[] = [
      {
        id: 'proj-1',
        name: 'Diabetes Management DTx',
        description: 'AI-powered digital therapeutic for Type 2 diabetes management',
        type: 'digital_therapeutic',
        status: 'development',
        owner: userId,
        team: [
          {
            id: 'user-1',
            name: 'Dr. Sarah Chen',
            role: 'clinical_expert',
            permissions: [{ resource: 'design', actions: ['read', 'write'] }]
          },
          {
            id: 'user-2',
            name: 'Mike Rodriguez',
            role: 'developer',
            permissions: [{ resource: 'code', actions: ['read', 'write', 'deploy'] }]
          }
        ],
        createdDate: new Date('2024-01-15'),
        lastModified: new Date('2024-01-20'),
        version: '1.2.0',
        deployments: [],
        testResults: []
      },
      {
        id: 'proj-2',
        name: 'Remote Cardiac Monitor',
        description: 'Real-time cardiac monitoring solution with AI anomaly detection',
        type: 'remote_monitoring',
        status: 'testing',
        owner: userId,
        team: [
          {
            id: 'user-3',
            name: 'Dr. James Wilson',
            role: 'clinical_expert',
            permissions: [{ resource: 'design', actions: ['read', 'write'] }]
          }
        ],
        createdDate: new Date('2024-02-01'),
        lastModified: new Date('2024-02-10'),
        version: '2.0.0-beta',
        deployments: [],
        testResults: []
      }
    ];

    setProjects(mockProjects);
  }, [userId]);

  const solutionTypes: { value: SolutionType; label: string; description: string }[] = [
    {
      value: 'digital_therapeutic',
      label: 'Digital Therapeutic',
      description: 'Evidence-based software interventions for medical conditions'
    },
    {
      value: 'remote_monitoring',
      label: 'Remote Monitoring',
      description: 'Patient monitoring systems with real-time data collection'
    },
    {
      value: 'telemedicine_platform',
      label: 'Telemedicine Platform',
      description: 'Virtual care delivery and consultation platforms'
    },
    {
      value: 'clinical_trial_platform',
      label: 'Clinical Trial Platform',
      description: 'Digital tools for clinical research and trial management'
    },
    {
      value: 'patient_engagement',
      label: 'Patient Engagement',
      description: 'Tools to improve patient participation and adherence'
    },
    {
      value: 'decision_support',
      label: 'Decision Support',
      description: 'AI-powered clinical decision support systems'
    },
    {
      value: 'biomarker_analytics',
      label: 'Biomarker Analytics',
      description: 'Digital biomarker collection and analysis platforms'
    },
    {
      value: 'disease_management',
      label: 'Disease Management',
      description: 'Comprehensive disease management and care coordination'
    }
  ];

    switch (status) {
      case 'design': return 'bg-blue-100 text-blue-800';
      case 'development': return 'bg-yellow-100 text-yellow-800';
      case 'testing': return 'bg-purple-100 text-purple-800';
      case 'deployment': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

    const newProject: SolutionProject = {
      id: `proj-${Date.now()}`,
      name: projectData.name || 'Untitled Project',
      description: projectData.description || '',
      type: projectData.type || 'digital_therapeutic',
      status: 'design',
      owner: userId,
      team: [{
        id: userId,
        name: 'Project Owner',
        role: 'developer',
        permissions: [{ resource: '*', actions: ['read', 'write', 'deploy', 'test'] }]
      }],
      createdDate: new Date(),
      lastModified: new Date(),
      version: '1.0.0',
      deployments: [],
      testResults: []
    };

    setProjects([...projects, newProject]);
    setShowNewProjectModal(false);
    setSelectedProject(newProject);
  };

    const [formData, setFormData] = useState({
      name: '',
      description: '',
      type: 'digital_therapeutic' as SolutionType
    });

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Solution</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="project-name" className="block text-sm font-medium text-gray-700 mb-1">
                Project Name
              </label>
              <input
                id="project-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter project name"
              />
            </div>

            <div>
              <label htmlFor="solution-type" className="block text-sm font-medium text-gray-700 mb-1">
                Solution Type
              </label>
              <select
                id="solution-type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as SolutionType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {solutionTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="project-description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="project-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Describe your solution"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowNewProjectModal(false)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => handleCreateProject(formData)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={!formData.name}
            >
              Create Project
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Digital Health Solution Builder</h1>
          <p className="text-gray-600 mt-1">
            Design, build, deploy, and test digital health solutions
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="max-w-7xl mx-auto">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('projects')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'projects'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Projects
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'templates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Solution Templates
            </button>
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'marketplace'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Component Marketplace
            </button>
            <button
              onClick={() => setActiveTab('vital')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'vital'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              VITAL Framework™
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === 'projects' && (
          <div>
            {/* Project Actions */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Your Solutions</h2>
              <button
                onClick={() => setShowNewProjectModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <span className="mr-2">+</span> New Solution
              </button>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(project => (
                <div
                  key={project.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
                  onClick=() => setSelectedProject(project) onKeyDown=() => setSelectedProject(project) role="button" tabIndex={0}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>

                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{solutionTypes.find(t => t.value === project.type)?.label}</span>
                    <span>v{project.version}</span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{project.team.length} team members</span>
                      <span>Modified {project.lastModified.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Solution Templates</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {solutionTypes.map(type => (
                <div
                  key={type.value}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{type.label}</h3>
                  <p className="text-gray-600 text-sm mb-4">{type.description}</p>

                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs text-gray-500">Pre-built components</span>
                    <span className="text-xs text-green-600 font-medium">FDA Ready</span>
                  </div>

                  <button
                    onClick={() => {

                        name: `${type.label} Solution`,
                        description: type.description,
                        type: type.value
                      };
                      handleCreateProject(newProjectData);
                    }}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    Use Template
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'marketplace' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Component Marketplace</h2>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <div className="text-4xl mb-4">🏪</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Component Marketplace</h3>
              <p className="text-gray-600 mb-4">
                Browse and purchase pre-built, compliant components for your digital health solutions
              </p>
              <div className="text-sm text-gray-500">
                Coming soon - HIPAA-compliant, FDA-ready components
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vital' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">VITAL Framework™ - B2B Intelligence Platform</h2>

            {/* VITAL Framework Modules */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Value Discovery Module */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Value Discovery</h3>
                    <p className="text-sm text-gray-600">Market analysis & opportunity assessment</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Market Intelligence</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• TAM/SAM/SOM Analysis</li>
                      <li>• Competitive Landscape Mapping</li>
                      <li>• Regulatory Environment Assessment</li>
                      <li>• Technology Trend Analysis</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Opportunity Scoring</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Market Size & Growth Potential</li>
                      <li>• Competitive Advantage Analysis</li>
                      <li>• Regulatory Pathway Complexity</li>
                      <li>• ROI & Risk Assessment</li>
                    </ul>
                  </div>
                </div>

                <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Launch Value Discovery
                </button>
              </div>

              {/* Intelligence Engine Module */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">🧠</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Intelligence Engine</h3>
                    <p className="text-sm text-gray-600">AI-powered market insights & predictions</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Predictive Analytics</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Market Trend Forecasting</li>
                      <li>• Competitive Move Prediction</li>
                      <li>• Regulatory Timeline Estimation</li>
                      <li>• Success Probability Modeling</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Real-Time Monitoring</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Patent Filing Alerts</li>
                      <li>• FDA Submission Tracking</li>
                      <li>• Clinical Trial Updates</li>
                      <li>• Market Signal Detection</li>
                    </ul>
                  </div>
                </div>

                <button className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                  Access Intelligence Engine
                </button>
              </div>
            </div>

            {/* Transform & Accelerate Modules */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Transform Module */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Transform</h3>
                    <p className="text-sm text-gray-600">Strategy development & execution planning</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Strategic Planning</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Go-to-Market Strategy</li>
                      <li>• Product Roadmap Development</li>
                      <li>• Resource Allocation Planning</li>
                      <li>• Risk Mitigation Strategies</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Business Model Innovation</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Revenue Model Optimization</li>
                      <li>• Value Proposition Design</li>
                      <li>• Partnership Strategy</li>
                      <li>• Scaling Pathway Planning</li>
                    </ul>
                  </div>
                </div>

                <button className="w-full mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                  Begin Transformation
                </button>
              </div>

              {/* Accelerate Module */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Accelerate</h3>
                    <p className="text-sm text-gray-600">Market entry & growth acceleration</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Market Entry</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Customer Acquisition Strategy</li>
                      <li>• Sales Channel Development</li>
                      <li>• Marketing Campaign Optimization</li>
                      <li>• KOL Engagement Programs</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Growth Optimization</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Performance Analytics</li>
                      <li>• Market Expansion Planning</li>
                      <li>• Product Enhancement Roadmap</li>
                      <li>• Competitive Response Strategy</li>
                    </ul>
                  </div>
                </div>

                <button className="w-full mt-4 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700">
                  Launch Acceleration
                </button>
              </div>
            </div>

            {/* Lead Module */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">👑</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Lead</h3>
                  <p className="text-sm text-gray-600">Market leadership & competitive advantage</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Thought Leadership</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Industry Report Generation</li>
                    <li>• Expert Network Building</li>
                    <li>• Conference Speaking Strategy</li>
                    <li>• Publication & Media Outreach</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Innovation Pipeline</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• R&D Portfolio Management</li>
                    <li>• Technology Scouting</li>
                    <li>• IP Strategy Development</li>
                    <li>• Innovation Partnerships</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Market Defense</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Competitive Intelligence</li>
                    <li>• Defensive Patent Strategy</li>
                    <li>• Market Barrier Creation</li>
                    <li>• Customer Retention Programs</li>
                  </ul>
                </div>
              </div>

              <button className="w-full mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                Establish Market Leadership
              </button>
            </div>

            {/* VITAL Intelligence Dashboard */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🎯 VITAL Intelligence Dashboard</h3>
              <p className="text-gray-700 mb-6">
                Real-time B2B digital health intelligence powered by AI and comprehensive market data
              </p>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">$847B</div>
                  <div className="text-sm text-gray-600">Global Digital Health TAM</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">2,847</div>
                  <div className="text-sm text-gray-600">Active Opportunities</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">156</div>
                  <div className="text-sm text-gray-600">FDA Submissions YTD</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600 mb-1">92%</div>
                  <div className="text-sm text-gray-600">Success Rate with VITAL</div>
                </div>
              </div>

              <div className="flex justify-center mb-6">
                <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-semibold mr-4">
                  Access Full Intelligence Platform →
                </button>
                <button className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold">
                  Generate AI Forecast
                </button>
              </div>
            </div>

            {/* AI-Powered Predictive Analytics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🤖 AI-Powered Predictive Analytics & Market Forecasting</h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Market Trend Predictions</h4>
                  <div className="space-y-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-sm font-medium text-gray-900">Digital Therapeutics Growth</div>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">↗ 34% CAGR</span>
                      </div>
                      <div className="text-xs text-gray-600">Predicted market size: $18.6B by 2028</div>
                      <div className="text-xs text-green-600 mt-1">Confidence: 94% | Data points: 15,847</div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-sm font-medium text-gray-900">AI/ML Medical Devices</div>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">↗ 28% CAGR</span>
                      </div>
                      <div className="text-xs text-gray-600">FDA approvals expected to double by 2026</div>
                      <div className="text-xs text-blue-600 mt-1">Confidence: 89% | Data points: 8,234</div>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-sm font-medium text-gray-900">Remote Monitoring</div>
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">↗ 31% CAGR</span>
                      </div>
                      <div className="text-xs text-gray-600">Post-pandemic adoption acceleration continues</div>
                      <div className="text-xs text-purple-600 mt-1">Confidence: 96% | Data points: 22,156</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Regulatory Timeline Predictions</h4>
                  <div className="space-y-3">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-sm font-medium text-gray-900">Your Product Pathway</div>
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">14-16 months</span>
                      </div>
                      <div className="text-xs text-gray-600">De Novo classification recommended</div>
                      <div className="text-xs text-orange-600 mt-1">Success probability: 87% | Similar products: 23</div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-sm font-medium text-gray-900">FDA Policy Changes</div>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Q2 2024</span>
                      </div>
                      <div className="text-xs text-gray-600">AI/ML guidance update expected</div>
                      <div className="text-xs text-yellow-600 mt-1">Impact assessment: Medium | Monitoring: Active</div>
                    </div>

                    <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-sm font-medium text-gray-900">Reimbursement Timeline</div>
                        <span className="text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded">18-22 months</span>
                      </div>
                      <div className="text-xs text-gray-600">Post-FDA clearance coverage decisions</div>
                      <div className="text-xs text-teal-600 mt-1">CMS precedent: Favorable | Private: Mixed</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Competitive Intelligence Forecasting */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">🎯 Competitive Intelligence & Strategic Forecasting</h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-lg font-bold text-red-600 mb-1">7</div>
                    <div className="text-sm text-gray-600 mb-2">Direct Competitors Detected</div>
                    <div className="text-xs text-red-600">3 in clinical trials, 2 seeking funding</div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-lg font-bold text-blue-600 mb-1">$847M</div>
                    <div className="text-sm text-gray-600 mb-2">Competitive Funding Raised</div>
                    <div className="text-xs text-blue-600">Last 12 months in your space</div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-lg font-bold text-green-600 mb-1">12</div>
                    <div className="text-sm text-gray-600 mb-2">Market Entry Opportunities</div>
                    <div className="text-xs text-green-600">Underserved therapeutic areas</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Strategic Recommendations</h5>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        <span className="text-gray-700">Accelerate FDA submission by 3 months</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        <span className="text-gray-700">Target European markets simultaneously</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                        <span className="text-gray-700">Develop IP portfolio in adjacent areas</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Risk Mitigation</h5>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                        <span className="text-gray-700">Monitor CompetitorX's Phase III results</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                        <span className="text-gray-700">Prepare for potential patent challenges</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                        <span className="text-gray-700">Diversify reimbursement strategy</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Market Access Automation Engine */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">⚡ Market Access Strategy Automation</h3>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-xl">🏥</span>
                    </div>
                    <h4 className="font-semibold text-gray-900">HEOR Automation</h4>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>• Automated budget impact modeling</div>
                    <div>• Real-world evidence data synthesis</div>
                    <div>• Cost-effectiveness analysis generation</div>
                    <div>• Payer-specific value propositions</div>
                  </div>
                  <button className="w-full mt-3 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">
                    Generate HEOR Package
                  </button>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-xl">💰</span>
                    </div>
                    <h4 className="font-semibold text-gray-900">Payer Intelligence</h4>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>• Coverage policy analysis</div>
                    <div>• Reimbursement pathway mapping</div>
                    <div>• Payer decision timeline prediction</div>
                    <div>• Formulary positioning strategy</div>
                  </div>
                  <button className="w-full mt-3 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                    Analyze Payer Landscape
                  </button>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-xl">📊</span>
                    </div>
                    <h4 className="font-semibold text-gray-900">Evidence Generation</h4>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>• Clinical endpoint optimization</div>
                    <div>• Real-world study design</div>
                    <div>• Health economics endpoint integration</div>
                    <div>• Publication strategy planning</div>
                  </div>
                  <button className="w-full mt-3 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm">
                    Optimize Evidence Plan
                  </button>
                </div>
              </div>

              {/* Automated Market Access Timeline */}
              <div className="bg-gray-50 rounded-lg p-6 mt-6">
                <h4 className="font-semibold text-gray-900 mb-4">🚀 Automated Market Access Timeline</h4>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 text-sm font-bold">1</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Phase II Data Package</div>
                        <div className="text-sm text-gray-600">Health economic endpoints integration</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-blue-600">Month 18</div>
                      <div className="text-xs text-gray-500">Auto-generated</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-green-600 text-sm font-bold">2</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Payer Advisory Boards</div>
                        <div className="text-sm text-gray-600">CMS, Anthem, Aetna engagement strategy</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">Month 24</div>
                      <div className="text-xs text-gray-500">AI-optimized</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-purple-600 text-sm font-bold">3</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Coverage Submissions</div>
                        <div className="text-sm text-gray-600">Automated dossier generation & submission</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-purple-600">Month 42</div>
                      <div className="text-xs text-gray-500">Platform-driven</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedProject.name}</h2>
                <p className="text-gray-600">{selectedProject.description}</p>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className="text-sm text-gray-500">Status</div>
                <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedProject.status)}`}>
                  {selectedProject.status}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Version</div>
                <div className="font-medium">{selectedProject.version}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Type</div>
                <div className="font-medium">
                  {solutionTypes.find(t => t.value === selectedProject.type)?.label}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Team Size</div>
                <div className="font-medium">{selectedProject.team.length} members</div>
              </div>
            </div>

            <div className="space-y-4">
              <button
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                onClick={() => {
                  // Navigate to design canvas
                  // setSelectedProject(null);
                }}
              >
                🎨 Open Design Canvas
              </button>

              <button
                className="w-full px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                onClick={() => {
                  // Navigate to development environment
                  // setSelectedProject(null);
                }}
              >
                💻 Open Development Environment
              </button>

              <button
                className="w-full px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 font-medium"
                onClick={() => {
                  // Navigate to testing suite
                  // setSelectedProject(null);
                }}
              >
                🧪 Open Testing Suite
              </button>

              <button
                className="w-full px-4 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 font-medium"
                onClick={() => {
                  // Navigate to deployment dashboard
                  // setSelectedProject(null);
                }}
              >
                🚀 Open Deployment Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewProjectModal && <NewProjectModal />}
    </div>
  );
};

export default SolutionDesignPlatform;