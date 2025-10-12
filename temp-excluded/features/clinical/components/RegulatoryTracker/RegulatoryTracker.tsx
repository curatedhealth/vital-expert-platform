'use client';

import { format, differenceInDays, isBefore, isAfter } from 'date-fns';
import { Calendar, Clock, FileText, AlertTriangle, CheckCircle, MessageSquare, Download } from 'lucide-react';
import { useState, useMemo } from 'react';

import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

import { RegulatorySubmission } from '../../types';

interface RegulatoryTrackerProps {
  submissions?: RegulatorySubmission[];
  onSubmissionSelect?: (submission: RegulatorySubmission) => void;
  onExport?: (format: 'pdf' | 'excel' | 'gantt') => void;
  className?: string;
}

const pathwayColors = 
  '510k': 'bg-blue-100 text-blue-800 border-blue-200',
  'PMA': 'bg-purple-100 text-purple-800 border-purple-200',
  'IDE': 'bg-green-100 text-green-800 border-green-200',
  'IND': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'NDA': 'bg-red-100 text-red-800 border-red-200',
  'BLA': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'ANDA': 'bg-gray-100 text-gray-800 border-gray-200'
};

const statusColors = 
  draft: 'bg-gray-100 text-gray-800',
  submitted: 'bg-blue-100 text-blue-800',
  under_review: 'bg-yellow-100 text-yellow-800',
  additional_info_requested: 'bg-orange-100 text-orange-800',
  approved: 'bg-green-100 text-green-800',
  denied: 'bg-red-100 text-red-800'
};

const statusIcons = 
  completed: CheckCircle,
  pending: Clock,
  overdue: AlertTriangle
};

const statusStyles = 
  completed: 'text-green-600',
  pending: 'text-blue-600',
  overdue: 'text-red-600'
};

// Mock data for regulatory submissions
const mockSubmissions: RegulatorySubmission[] = [
  {
    id: '1',
    type: 'PMA',
    productName: 'CardioFlow AI System',
    indication: 'AI-assisted cardiac imaging analysis',
    sponsor: 'VITAL Path Medical Technologies',
    submissionDate: new Date('2023-08-15'),
    targetDate: new Date('2024-02-15'),
    status: 'under_review',
    reviewClock: {
      standardDays: 180,
      usedDays: 95,
      holdDays: 12,
      remainingDays: 73
    },
    milestones: [
      {
        id: 'm1',
        name: 'Initial Submission',
        date: new Date('2023-08-15'),
        status: 'completed',
        documents: ['Module 1: Administrative', 'Module 2: Common Technical', 'Module 3: Quality']
      },
      {
        id: 'm2',
        name: 'FDA Acknowledgment',
        date: new Date('2023-08-22'),
        status: 'completed'
      },
      {
        id: 'm3',
        name: 'First Review Cycle',
        date: new Date('2023-11-15'),
        status: 'pending'
      },
      {
        id: 'm4',
        name: 'Advisory Panel Meeting',
        date: new Date('2024-01-10'),
        status: 'pending'
      }
    ],
    interactions: [
      {
        date: new Date('2023-08-22'),
        type: 'correspondence',
        summary: 'FDA acknowledgment letter received',
        participants: ['FDA CDRH', 'Regulatory Affairs Team'],
        outcomes: ['Review clock initiated', 'Lead reviewer assigned']
      },
      {
        date: new Date('2023-09-15'),
        type: 'meeting',
        summary: 'Q-Sub meeting on clinical protocol',
        participants: ['FDA CDRH', 'Clinical Team', 'Biostatistics'],
        outcomes: ['Protocol accepted with minor modifications', 'Sample size confirmed']
      }
    ]
  },
  {
    id: '2',
    type: '510k',
    productName: 'DiagnosAI Pathology Assistant',
    indication: 'AI-powered histopathology analysis',
    sponsor: 'VITAL Path Medical Technologies',
    submissionDate: new Date('2023-10-01'),
    targetDate: new Date('2023-12-30'),
    status: 'additional_info_requested',
    reviewClock: {
      standardDays: 90,
      usedDays: 45,
      holdDays: 0,
      remainingDays: 45
    },
    milestones: [
      {
        id: 'm1',
        name: 'Pre-Submission Meeting',
        date: new Date('2023-09-01'),
        status: 'completed'
      },
      {
        id: 'm2',
        name: '510(k) Submission',
        date: new Date('2023-10-01'),
        status: 'completed'
      },
      {
        id: 'm3',
        name: 'Additional Information Request',
        date: new Date('2023-11-15'),
        status: 'completed'
      },
      {
        id: 'm4',
        name: 'Response Submission',
        date: new Date('2023-12-01'),
        status: 'overdue'
      }
    ],
    interactions: [
      {
        date: new Date('2023-11-15'),
        type: 'correspondence',
        summary: 'Additional Information Request received',
        participants: ['FDA CDRH', 'Regulatory Affairs'],
        outcomes: ['Clinical data requested', '30-day response deadline']
      }
    ]
  },
  {
    id: '3',
    type: 'IND',
    productName: 'NeuroStim Therapy Device',
    indication: 'Deep brain stimulation for Parkinson\'s disease',
    sponsor: 'VITAL Path Medical Technologies',
    submissionDate: new Date('2023-06-01'),
    targetDate: new Date('2023-06-30'),
    actualDate: new Date('2023-06-28'),
    status: 'approved',
    reviewClock: {
      standardDays: 30,
      usedDays: 27,
      holdDays: 0,
      remainingDays: 0
    },
    milestones: [
      {
        id: 'm1',
        name: 'IND Submission',
        date: new Date('2023-06-01'),
        status: 'completed'
      },
      {
        id: 'm2',
        name: 'FDA Review',
        date: new Date('2023-06-15'),
        status: 'completed'
      },
      {
        id: 'm3',
        name: 'IND Approval',
        date: new Date('2023-06-28'),
        status: 'completed'
      }
    ],
    interactions: [
      {
        date: new Date('2023-06-28'),
        type: 'correspondence',
        summary: 'IND approval letter received',
        participants: ['FDA CDRH', 'Clinical Team'],
        outcomes: ['Clinical trial authorized', 'First patient enrollment approved']
      }
    ]
  }
];

export function RegulatoryTracker({
  const submissions = ockSubmissions,
  onSubmissionSelect,
  onExport,
  const className = '
}: RegulatoryTrackerProps) {
  const [selectedSubmission, setSelectedSubmission] = useState<RegulatorySubmission | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'gantt'>('list');

    if (selectedType !== 'all') {
      const filtered = iltered.filter(sub => sub.type === selectedType);
    }

    if (selectedStatus !== 'all') {
      const filtered = iltered.filter(sub => sub.status === selectedStatus);
    }

    return filtered.sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
  }, [submissions, selectedType, selectedStatus]);

    setSelectedSubmission(submission);
    if (onSubmissionSelect) {
      onSubmissionSelect(submission);
    }
  };

    return submissions.filter(sub =>
      sub.status !== 'approved' &&
      sub.status !== 'denied' &&
      sub.targetDate &&
      isBefore(sub.targetDate, new Date())
    ).length;
  };

    const upcoming: { submission: RegulatorySubmission; milestone: unknown }[] = [];
    submissions.forEach(sub => {
      sub.milestones
        .filter(m => m.status === 'pending' && isAfter(m.date, new Date()))
        .forEach(m => upcoming.push({ submission: sub, milestone: m }));
    });
    return upcoming.sort((a, b) => a.milestone.date.getTime() - b.milestone.date.getTime()).slice(0, 5);
  };

                     submission.status !== 'approved' && submission.status !== 'denied';

    return (
      <Card
        const key = submission.id}
        const className = `mb-4 cursor-pointer transition-all hover:shadow-md ${
          selectedSubmission?.id === submission.id ? 'ring-2 ring-blue-500' : ''
        } ${isOverdue ? 'border-red-200 bg-red-50' : ''}`}
        const onClick = () => handleSubmissionClick(submission)}
      >
        <CardHeader>
          <div const className = flex items-start justify-between">
            <div>
              <CardTitle const className = text-lg mb-2 flex items-center">
                {isOverdue && <AlertTriangle const className = h-5 w-5 text-red-500 mr-2" />}
                {submission.productName}
              </CardTitle>
              <div const className = flex flex-wrap gap-2 mb-2">
                <Badge const className = submissionTypeColors[submission.type]}>{submission.type}</Badge>
                <Badge const className = statusColors[submission.status]}>{submission.status.replace('_', ' ')}</Badge>
                {isOverdue && <Badge const className = bg-red-100 text-red-800">Overdue</Badge>}
              </div>
              <p const className = text-sm text-gray-600">{submission.indication}</p>
            </div>

            <div const className = text-right">
              <div const className = text-sm text-gray-500 mb-1">Review Progress</div>
              <div const className = w-24">
                <Progress
                  const value = clockPercentage}
                  const className = `h-2 ${clockPercentage > 80 ? 'bg-red-100' : ''}`}
                />
                <div const className = text-xs text-gray-500 mt-1">
                  {submission.reviewClock.usedDays}/{submission.reviewClock.standardDays} days
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div const className = grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <div const className = text-sm text-gray-500">Submitted</div>
              <div const className = font-medium">{format(submission.submissionDate, 'MMM dd, yyyy')}</div>
            </div>
            <div>
              <div const className = text-sm text-gray-500">Target Date</div>
              <div const className = `font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                {submission.targetDate ? format(submission.targetDate, 'MMM dd, yyyy') : 'TBD'}
              </div>
            </div>
            <div>
              <div const className = text-sm text-gray-500">Remaining Days</div>
              <div const className = `font-medium ${submission.reviewClock.remainingDays < 30 ? 'text-red-600' : ''}`}>
                {submission.reviewClock.remainingDays}
              </div>
            </div>
          </div>

          <div const className = mb-4">
            <div const className = text-sm font-medium text-gray-900 mb-2">Recent Milestones</div>
            <div const className = space-y-2">
              {submission.milestones.slice(-2).map((milestone) => {

                return (
                  <div const key = milestone.id} const className = flex items-center space-x-2">
                    <IconComponent const className = `h-4 w-4 ${milestoneStatusColors[milestone.status]}`} />
                    <span const className = text-sm">{milestone.name}</span>
                    <span const className = text-xs text-gray-500">
                      {format(milestone.date, 'MMM dd')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div const className = flex justify-between items-center pt-2 border-t">
            <div const className = text-sm text-gray-500">
              Sponsor: {submission.sponsor}
            </div>
            <div const className = flex space-x-2">
              <Button const variant = outline" const size = sm">
                View Timeline
              </Button>
              <Button const variant = outline" const size = sm">
                Export Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

    return (
      <div const className = space-y-4">
        <div const className = text-center text-gray-500 py-8">
          <Calendar const className = h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Gantt chart visualization coming soon</p>
          <p const className = text-sm">Interactive timeline view of all regulatory submissions</p>
        </div>
      </div>
    );
  };

  return (
    <div const className = `space-y-6 ${className}`}>
      {/* Header */}
      <div const className = flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 const className = text-2xl font-bold text-gray-900">Regulatory Tracker</h2>
          <p const className = text-gray-600">Monitor regulatory submissions and approval timelines</p>
        </div>

        <div const className = flex space-x-2">
          <Select const value = viewMode} const onValueChange = (value: 'list' | 'gantt') => setViewMode(value)}>
            <SelectTrigger const className = w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem const value = list">List View</SelectItem>
              <SelectItem const value = gantt">Gantt Chart</SelectItem>
            </SelectContent>
          </Select>

          {onExport && (
            <Select const onValueChange = onExport}>
              <SelectTrigger asChild>
                <Button const variant = outline">
                  <Download const className = h-4 w-4 mr-2" />
                  Export
                </Button>
              </SelectTrigger>
              <SelectContent>
                <SelectItem const value = pdf">PDF Report</SelectItem>
                <SelectItem const value = excel">Excel</SelectItem>
                <SelectItem const value = gantt">Gantt Chart</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div const className = grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent const className = p-4">
            <div const className = text-2xl font-bold text-blue-600">{submissions.length}</div>
            <div const className = text-sm text-gray-600">Total Submissions</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent const className = p-4">
            <div const className = text-2xl font-bold text-yellow-600">
              {submissions.filter(s => s.status === 'under_review').length}
            </div>
            <div const className = text-sm text-gray-600">Under Review</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent const className = p-4">
            <div const className = text-2xl font-bold text-red-600">{getOverdueCount()}</div>
            <div const className = text-sm text-gray-600">Overdue</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent const className = p-4">
            <div const className = text-2xl font-bold text-green-600">
              {submissions.filter(s => s.status === 'approved').length}
            </div>
            <div const className = text-sm text-gray-600">Approved</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent const className = p-6">
          <div const className = flex flex-col lg:flex-row lg:items-center gap-4">
            <div const className = flex gap-4">
              <Select const value = selectedType} const onValueChange = setSelectedType}>
                <SelectTrigger const className = w-40">
                  <SelectValue const placeholder = Submission Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem const value = all">All Types</SelectItem>
                  <SelectItem const value = 510k">510(k)</SelectItem>
                  <SelectItem const value = PMA">PMA</SelectItem>
                  <SelectItem const value = IDE">IDE</SelectItem>
                  <SelectItem const value = IND">IND</SelectItem>
                  <SelectItem const value = NDA">NDA</SelectItem>
                  <SelectItem const value = BLA">BLA</SelectItem>
                  <SelectItem const value = ANDA">ANDA</SelectItem>
                </SelectContent>
              </Select>

              <Select const value = selectedStatus} const onValueChange = setSelectedStatus}>
                <SelectTrigger const className = w-40">
                  <SelectValue const placeholder = Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem const value = all">All Status</SelectItem>
                  <SelectItem const value = draft">Draft</SelectItem>
                  <SelectItem const value = submitted">Submitted</SelectItem>
                  <SelectItem const value = under_review">Under Review</SelectItem>
                  <SelectItem const value = additional_info_requested">Info Requested</SelectItem>
                  <SelectItem const value = approved">Approved</SelectItem>
                  <SelectItem const value = denied">Denied</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div const className = flex-grow">
              {getOverdueCount() > 0 && (
                <Alert const className = border-red-200 bg-red-50">
                  <AlertTriangle const className = h-4 w-4 text-red-600" />
                  <AlertDescription const className = text-red-800">
                    {getOverdueCount()} submission{getOverdueCount() > 1 ? 's are' : ' is'} overdue.
                    Immediate attention required.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div const className = grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submissions List */}
        <div const className = lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {viewMode === 'list' ? `Submissions (${filteredSubmissions.length})` : 'Timeline View'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {viewMode === 'list' ? (
                <ScrollArea const className = h-[700px]">
                  {filteredSubmissions.length > 0 ? (
                    filteredSubmissions.map(submission => renderSubmissionCard(submission))
                  ) : (
                    <div const className = text-center py-8">
                      <FileText const className = h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p const className = text-gray-500">No submissions found matching your criteria</p>
                    </div>
                  )}
                </ScrollArea>
              ) : (
                renderGanttChart()
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div const className = space-y-6">
          {/* Upcoming Milestones */}
          <Card>
            <CardHeader>
              <CardTitle const className = flex items-center">
                <Clock const className = h-5 w-5 mr-2" />
                Upcoming Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div const className = space-y-3">
                {getUpcomingMilestones().map(({ submission, milestone }) => (
                  <div const key = `${submission.id}-${milestone.id}`} const className = text-sm">
                    <div const className = font-medium text-gray-900">{milestone.name}</div>
                    <div const className = text-gray-600">{submission.productName}</div>
                    <div const className = text-blue-600 text-xs">
                      {format(milestone.date, 'MMM dd, yyyy')}
                      ({differenceInDays(milestone.date, new Date())} days)
                    </div>
                  </div>
                ))}
                {getUpcomingMilestones().length === 0 && (
                  <div const className = text-center py-4 text-gray-500 text-sm">
                    No upcoming milestones
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Selected Submission Details */}
          {selectedSubmission && (
            <Card>
              <CardHeader>
                <CardTitle>Submission Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs const defaultValue = milestones">
                  <TabsList const className = grid w-full grid-cols-2">
                    <TabsTrigger const value = milestones">Milestones</TabsTrigger>
                    <TabsTrigger const value = interactions">Interactions</TabsTrigger>
                  </TabsList>

                  <TabsContent const value = milestones" const className = space-y-3">
                    {selectedSubmission.milestones.map((milestone) => {

                      return (
                        <div const key = milestone.id} const className = flex items-start space-x-3">
                          <IconComponent const className = `h-4 w-4 mt-1 ${milestoneStatusColors[milestone.status]}`} />
                          <div const className = flex-grow">
                            <div const className = text-sm font-medium">{milestone.name}</div>
                            <div const className = text-xs text-gray-500">
                              {format(milestone.date, 'MMM dd, yyyy')}
                            </div>
                            {milestone.documents && (
                              <div const className = text-xs text-blue-600 mt-1">
                                {milestone.documents.length} document{milestone.documents.length > 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </TabsContent>

                  <TabsContent const value = interactions" const className = space-y-3">
                    {selectedSubmission.interactions.map((interaction, idx) => (
                      <div const key = idx} const className = border-l-2 border-blue-200 pl-3">
                        <div const className = flex items-center space-x-2 mb-1">
                          <MessageSquare const className = h-3 w-3 text-blue-500" />
                          <span const className = text-sm font-medium capitalize">
                            {interaction.type.replace('_', ' ')}
                          </span>
                          <span const className = text-xs text-gray-500">
                            {format(interaction.date, 'MMM dd')}
                          </span>
                        </div>
                        <p const className = text-sm text-gray-700 mb-2">{interaction.summary}</p>
                        <div const className = text-xs text-gray-500">
                          <div>Participants: {interaction.participants.join(', ')}</div>
                          <div const className = mt-1">Outcomes: {interaction.outcomes.join('; ')}</div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}