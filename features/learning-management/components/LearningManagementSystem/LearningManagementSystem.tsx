'use client';

import React, { useState } from 'react';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // minutes
  modules: Module[];
  progress?: number;
  completed?: boolean;
  certification?: boolean;
  instructor: string;
  rating: number;
  enrollments: number;
}

interface Module {
  id: string;
  title: string;
  type: 'video' | 'text' | 'quiz' | 'interactive' | 'assignment';
  duration: number;
  completed?: boolean;
  content?: string;
}

interface Props {
  organizationId: string;
}

const LearningManagementSystem: React.FC<Props> = ({ organizationId }) => {
  const [activeTab, setActiveTab] = useState<'courses' | 'my-learning' | 'certifications' | 'analytics'>('courses');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'platform' | 'healthcare' | 'compliance' | 'technical'>('all');

  // Mock courses data
  const courses: Course[] = [
    {
      id: 'course-001',
      title: 'VITAL Path Platform Fundamentals',
      description: 'Master the core features and capabilities of the VITAL Path digital health platform',
      category: 'platform',
      level: 'beginner',
      duration: 120,
      instructor: 'Dr. Sarah Chen',
      rating: 4.8,
      enrollments: 1247,
      certification: true,
      modules: [
        { id: 'mod-001', title: 'Platform Overview', type: 'video', duration: 15 },
        { id: 'mod-002', title: 'Navigation & Interface', type: 'interactive', duration: 20 },
        { id: 'mod-003', title: 'Solution Builder Basics', type: 'video', duration: 25 },
        { id: 'mod-004', title: 'Hands-on Practice', type: 'assignment', duration: 45 },
        { id: 'mod-005', title: 'Assessment', type: 'quiz', duration: 15 }
      ],
      progress: 65,
      completed: false
    },
    {
      id: 'course-002',
      title: 'Digital Therapeutics Development',
      description: 'Learn to design, build, and validate FDA-compliant digital therapeutics',
      category: 'healthcare',
      level: 'intermediate',
      duration: 240,
      instructor: 'Dr. Michael Rodriguez',
      rating: 4.9,
      enrollments: 892,
      certification: true,
      modules: [
        { id: 'mod-006', title: 'DTx Fundamentals', type: 'video', duration: 30 },
        { id: 'mod-007', title: 'FDA Regulatory Framework', type: 'text', duration: 45 },
        { id: 'mod-008', title: 'Clinical Evidence Requirements', type: 'video', duration: 35 },
        { id: 'mod-009', title: 'Development Workflow', type: 'interactive', duration: 60 },
        { id: 'mod-010', title: 'Case Study Analysis', type: 'assignment', duration: 70 }
      ],
      progress: 0,
      completed: false
    },
    {
      id: 'course-003',
      title: 'HIPAA Compliance for Digital Health',
      description: 'Essential HIPAA compliance training for digital health professionals',
      category: 'compliance',
      level: 'beginner',
      duration: 90,
      instructor: 'Jennifer Thompson, JD',
      rating: 4.7,
      enrollments: 2156,
      certification: true,
      modules: [
        { id: 'mod-011', title: 'HIPAA Overview', type: 'video', duration: 20 },
        { id: 'mod-012', title: 'Privacy Rule', type: 'text', duration: 25 },
        { id: 'mod-013', title: 'Security Rule', type: 'text', duration: 25 },
        { id: 'mod-014', title: 'Breach Notification', type: 'video', duration: 15 },
        { id: 'mod-015', title: 'Compliance Assessment', type: 'quiz', duration: 5 }
      ],
      progress: 100,
      completed: true
    },
    {
      id: 'course-004',
      title: 'Advanced Analytics & Reporting',
      description: 'Create powerful dashboards and reports for digital health insights',
      category: 'technical',
      level: 'advanced',
      duration: 180,
      instructor: 'David Kim',
      rating: 4.6,
      enrollments: 456,
      certification: false,
      modules: [
        { id: 'mod-016', title: 'Analytics Fundamentals', type: 'video', duration: 30 },
        { id: 'mod-017', title: 'Dashboard Design', type: 'interactive', duration: 45 },
        { id: 'mod-018', title: 'Custom Reports', type: 'video', duration: 40 },
        { id: 'mod-019', title: 'Data Visualization', type: 'assignment', duration: 50 },
        { id: 'mod-020', title: 'Performance Optimization', type: 'text', duration: 15 }
      ],
      progress: 0,
      completed: false
    }
  ];

    { key: 'all', label: 'All Courses', count: courses.length },
    { key: 'platform', label: 'Platform Training', count: courses.filter(c => c.category === 'platform').length },
    { key: 'healthcare', label: 'Healthcare', count: courses.filter(c => c.category === 'healthcare').length },
    { key: 'compliance', label: 'Compliance', count: courses.filter(c => c.category === 'compliance').length },
    { key: 'technical', label: 'Technical', count: courses.filter(c => c.category === 'technical').length }
  ];

    { key: 'courses', label: 'Courses', icon: '📚' },
    { key: 'my-learning', label: 'My Learning', icon: '🎓' },
    { key: 'certifications', label: 'Certifications', icon: '🏆' },
    { key: 'analytics', label: 'Analytics', icon: '📊' }
  ];

    ? courses
    : courses.filter(course => course.category === selectedCategory);

    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Learning Management System</h1>
              <p className="text-gray-600 mt-1">
                Master digital health platform capabilities with comprehensive training and certification
              </p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                Request Course
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                Browse Catalog
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as unknown)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'courses' && (
          <div className="flex gap-8">
            {/* Sidebar */}
            <div className="w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category.key}
                      onClick={() => setSelectedCategory(category.key as unknown)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                        selectedCategory === category.key
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{category.label}</span>
                        <span className="text-xs text-gray-400">{category.count}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Learning Stats */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Your Progress</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Enrolled Courses</span>
                    <span className="text-sm font-medium text-gray-900">{enrolledCourses.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Completed</span>
                    <span className="text-sm font-medium text-green-600">{completedCourses.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Certifications</span>
                    <span className="text-sm font-medium text-blue-600">{certificationsEarned.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Learning Hours</span>
                    <span className="text-sm font-medium text-gray-900">
                      {Math.floor(completedCourses.reduce((acc, course) => acc + course.duration, 0) / 60)}h
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Search and Filters */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search courses..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>All Levels</option>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                  <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>All Formats</option>
                    <option>Self-paced</option>
                    <option>Instructor-led</option>
                    <option>Interactive</option>
                  </select>
                </div>
              </div>

              {/* Course Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCourses.map(course => (
                  <div key={course.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                          <p className="text-sm text-gray-600 mb-3">{course.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center mb-4">
                        <span className="text-sm text-yellow-500 mr-2">
                          {formatRating(course.rating)}
                        </span>
                        <span className="text-sm text-gray-600">
                          ({course.enrollments.toLocaleString()} enrolled)
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
                          {course.level}
                        </span>
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="mr-4">⏱️ {formatDuration(course.duration)}</span>
                          {course.certification && <span>🏆 Certificate</span>}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-600">by {course.instructor}</span>
                        <span className="text-sm text-gray-600">{course.modules.length} modules</span>
                      </div>

                      {course.progress !== undefined && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">Progress</span>
                            <span className="text-sm font-medium text-gray-900">{course.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {course.progress !== undefined ? (
                          <button className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                            Continue
                          </button>
                        ) : (
                          <button className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                            Enroll
                          </button>
                        )}
                        <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                          Preview
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'my-learning' && (
          <div className="space-y-6">
            {/* Learning Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 text-sm">📚</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Enrolled</p>
                    <p className="text-2xl font-semibold text-gray-900">{enrolledCourses.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 text-sm">✅</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Completed</p>
                    <p className="text-2xl font-semibold text-gray-900">{completedCourses.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <span className="text-yellow-600 text-sm">🏆</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Certificates</p>
                    <p className="text-2xl font-semibold text-gray-900">{certificationsEarned.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 text-sm">⏱️</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Hours Learned</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {Math.floor(completedCourses.reduce((acc, course) => acc + course.duration, 0) / 60)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* In Progress Courses */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Continue Learning</h3>
              <div className="space-y-4">
                {enrolledCourses.filter(course => !course.completed).map(course => (
                  <div key={course.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center flex-1">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
                        <span className="text-white text-xl font-bold">
                          {course.title.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900">{course.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{course.instructor}</p>
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-4">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{course.progress}%</span>
                        </div>
                      </div>
                    </div>
                    <button className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 ml-6">
                      Continue
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Completed Courses */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Completed Courses</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedCourses.map(course => (
                  <div key={course.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">{course.title}</h4>
                      {course.certification && (
                        <span className="text-yellow-500">🏆</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{course.instructor}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-green-600 font-medium">✅ Completed</span>
                      <button className="text-xs text-blue-600 hover:text-blue-800">
                        View Certificate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'certifications' && (
          <div className="space-y-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Certifications</h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Earn industry-recognized certifications to validate your expertise in digital health platform development
              </p>

              {/* Earned Certifications */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-4xl mx-auto mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Certifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {certificationsEarned.map(course => (
                    <div key={course.id} className="border border-gray-200 rounded-lg p-6 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-white text-2xl">🏆</span>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">{course.title}</h4>
                      <p className="text-sm text-gray-600 mb-4">Completed Course</p>
                      <div className="flex gap-2">
                        <button className="flex-1 px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-300 rounded hover:bg-blue-50">
                          View Certificate
                        </button>
                        <button className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
                          Download PDF
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Available Certifications */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-4xl mx-auto">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Available Certifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      name: 'Platform Expert',
                      description: 'Master all core platform features and advanced capabilities',
                      requirements: ['Complete 5+ platform courses', 'Pass comprehensive exam', '6 months experience'],
                      badge: '🎯'
                    },
                    {
                      name: 'Digital Therapeutics Developer',
                      description: 'Certified to design and build FDA-compliant digital therapeutics',
                      requirements: ['Complete DTx development track', 'Submit portfolio project', 'Clinical knowledge assessment'],
                      badge: '💊'
                    },
                    {
                      name: 'Healthcare Compliance Specialist',
                      description: 'Expert in healthcare regulations and compliance requirements',
                      requirements: ['HIPAA certification', 'Complete compliance courses', 'Audit simulation'],
                      badge: '⚖️'
                    },
                    {
                      name: 'Integration Architect',
                      description: 'Design and implement complex healthcare system integrations',
                      requirements: ['Complete integration courses', 'Build 3+ integrations', 'Architecture review'],
                      badge: '🔧'
                    }
                  ].map(cert => (
                    <div key={cert.name} className="border border-gray-200 rounded-lg p-6">
                      <div className="text-center mb-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-3xl">{cert.badge}</span>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">{cert.name}</h4>
                        <p className="text-sm text-gray-600">{cert.description}</p>
                      </div>
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Requirements:</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {cert.requirements.map((req, index) => (
                            <li key={index} className="flex items-center">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <button className="w-full px-4 py-2 text-sm font-medium text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50">
                        Start Learning Path
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Learning Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 text-sm">📊</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Learning Score</p>
                    <p className="text-2xl font-semibold text-gray-900">85%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 text-sm">🎯</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                    <p className="text-2xl font-semibold text-gray-900">75%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 text-sm">⚡</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Streak</p>
                    <p className="text-2xl font-semibold text-gray-900">7 days</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-orange-600 text-sm">🏅</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Rank</p>
                    <p className="text-2xl font-semibold text-gray-900">15th</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Learning Progress Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Learning Progress</h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-4xl mb-2">📈</div>
                  <p className="text-gray-500">Learning analytics chart would be displayed here</p>
                  <p className="text-sm text-gray-400">Track your progress across all courses and modules</p>
                </div>
              </div>
            </div>

            {/* Learning Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Learning Insights</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 text-sm">💡</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Strong in Platform Features</h4>
                      <p className="text-sm text-gray-600">You excel at platform navigation and basic features. Consider advancing to intermediate courses.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-yellow-600 text-sm">⚠️</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Focus on Compliance</h4>
                      <p className="text-sm text-gray-600">Spend more time on compliance modules to strengthen your regulatory knowledge.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-green-600 text-sm">🎯</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">On Track for Certification</h4>
                      <p className="text-sm text-gray-600">Complete 2 more courses to qualify for Platform Expert certification.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recommended Next Steps</h3>
                <div className="space-y-3">
                  <div className="border border-gray-200 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Advanced Analytics Course</h4>
                    <p className="text-xs text-gray-600 mb-2">Build on your platform knowledge with advanced reporting</p>
                    <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                      Enroll Now →
                    </button>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Integration Fundamentals</h4>
                    <p className="text-xs text-gray-600 mb-2">Learn to connect external systems and APIs</p>
                    <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                      Enroll Now →
                    </button>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Clinical Trial Designer</h4>
                    <p className="text-xs text-gray-600 mb-2">Master clinical study design and management</p>
                    <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                      Enroll Now →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningManagementSystem;