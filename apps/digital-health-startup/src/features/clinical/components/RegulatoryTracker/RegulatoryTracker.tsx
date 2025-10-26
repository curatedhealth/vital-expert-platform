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

  '510k': 'bg-blue-100 text-blue-800 border-blue-200',
  'PMA': 'bg-purple-100 text-purple-800 border-purple-200',
  'IDE': 'bg-green-100 text-green-800 border-green-200',
  'IND': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'NDA': 'bg-red-100 text-red-800 border-red-200',
  'BLA': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'ANDA': 'bg-gray-100 text-gray-800 border-gray-200'
};

  draft: 'bg-gray-100 text-gray-800',
  submitted: 'bg-blue-100 text-blue-800',
  under_review: 'bg-yellow-100 text-yellow-800',
  additional_info_requested: 'bg-orange-100 text-orange-800',
  approved: 'bg-green-100 text-green-800',
  denied: 'bg-red-100 text-red-800'
};

  completed: CheckCircle,
  pending: Clock,
  overdue: AlertTriangle
};

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
  submissions = mockSubmissions,
  onSubmissionSelect,
  onExport,
  className = ''
}: RegulatoryTrackerProps) {
  const [selectedSubmission, setSelectedSubmission] = useState<RegulatorySubmission | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'gantt'>('list');

    if (selectedType !== 'all') {
      filtered = filtered.filter(sub => sub.type === selectedType);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(sub => sub.status === selectedStatus);
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
        .filter((m: any) => m.status === 'pending' && isAfter(m.date, new Date()))
        .forEach((m: any) => upcoming.push({ submission: sub, milestone: m }));
    });
    return upcoming.sort((a, b) => a.milestone.date.getTime() - b.milestone.date.getTime()).slice(0, 5);
  };

                     submission.status !== 'approved' && submission.status !== 'denied';

    return (
      <Card
        key={submission.id}
        className={`mb-4 cursor-pointer transition-all hover:shadow-md ${
          selectedSubmission?.id === submission.id ? 'ring-2 ring-blue-500' : ''
        } ${isOverdue ? 'border-red-200 bg-red-50' : ''}`}
        onClick={() => handleSubmissionClick(submission)}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg mb-2 flex items-center">
                {isOverdue && <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />}
                {submission.productName}
              </CardTitle>
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge className={submissionTypeColors[submission.type]}>{submission.type}</Badge>
                <Badge className={statusColors[submission.status]}>{submission.status.replace('_', ' ')}</Badge>
                {isOverdue && <Badge className="bg-red-100 text-red-800">Overdue</Badge>}
              </div>
              <p className="text-sm text-gray-600">{submission.indication}</p>
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Review Progress</div>
              <div className="w-24">
                <Progress
                  value={clockPercentage}
                  className={`h-2 ${clockPercentage > 80 ? 'bg-red-100' : ''}`}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {submission.reviewClock.usedDays}/{submission.reviewClock.standardDays} days
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <div className="text-sm text-gray-500">Submitted</div>
              <div className="font-medium">{format(submission.submissionDate, 'MMM dd, yyyy')}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Target Date</div>
              <div className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                {submission.targetDate ? format(submission.targetDate, 'MMM dd, yyyy') : 'TBD'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Remaining Days</div>
              <div className={`font-medium ${submission.reviewClock.remainingDays < 30 ? 'text-red-600' : ''}`}>
                {submission.reviewClock.remainingDays}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="text-sm font-medium text-gray-900 mb-2">Recent Milestones</div>
            <div className="space-y-2">
              {submission.milestones.slice(-2).map((milestone) => {

                return (
                  <div key={milestone.id} className="flex items-center space-x-2">
                    <IconComponent className={`h-4 w-4 ${milestoneStatusColors[milestone.status]}`} />
                    <span className="text-sm">{milestone.name}</span>
                    <span className="text-xs text-gray-500">
                      {format(milestone.date, 'MMM dd')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t">
            <div className="text-sm text-gray-500">
              Sponsor: {submission.sponsor}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                View Timeline
              </Button>
              <Button variant="outline" size="sm">
                Export Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

    return (
      <div className="space-y-4">
        <div className="text-center text-gray-500 py-8">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Gantt chart visualization coming soon</p>
          <p className="text-sm">Interactive timeline view of all regulatory submissions</p>
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Regulatory Tracker</h2>
          <p className="text-gray-600">Monitor regulatory submissions and approval timelines</p>
        </div>

        <div className="flex space-x-2">
          <Select value={viewMode} onValueChange={(value: 'list' | 'gantt') => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="list">List View</SelectItem>
              <SelectItem value="gantt">Gantt Chart</SelectItem>
            </SelectContent>
          </Select>

          {onExport && (
            <Select onValueChange={onExport}>
              <SelectTrigger asChild>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF Report</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="gantt">Gantt Chart</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{submissions.length}</div>
            <div className="text-sm text-gray-600">Total Submissions</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {submissions.filter((s: any) => s.status === 'under_review').length}
            </div>
            <div className="text-sm text-gray-600">Under Review</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{getOverdueCount()}</div>
            <div className="text-sm text-gray-600">Overdue</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {submissions.filter((s: any) => s.status === 'approved').length}
            </div>
            <div className="text-sm text-gray-600">Approved</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex gap-4">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Submission Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="510k">510(k)</SelectItem>
                  <SelectItem value="PMA">PMA</SelectItem>
                  <SelectItem value="IDE">IDE</SelectItem>
                  <SelectItem value="IND">IND</SelectItem>
                  <SelectItem value="NDA">NDA</SelectItem>
                  <SelectItem value="BLA">BLA</SelectItem>
                  <SelectItem value="ANDA">ANDA</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="additional_info_requested">Info Requested</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="denied">Denied</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-grow">
              {getOverdueCount() > 0 && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submissions List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {viewMode === 'list' ? `Submissions (${filteredSubmissions.length})` : 'Timeline View'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {viewMode === 'list' ? (
                <ScrollArea className="h-[700px]">
                  {filteredSubmissions.length > 0 ? (
                    filteredSubmissions.map(submission => renderSubmissionCard(submission))
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No submissions found matching your criteria</p>
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
        <div className="space-y-6">
          {/* Upcoming Milestones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Upcoming Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getUpcomingMilestones().map(({ submission, milestone }) => (
                  <div key={`${submission.id}-${milestone.id}`} className="text-sm">
                    <div className="font-medium text-gray-900">{milestone.name}</div>
                    <div className="text-gray-600">{submission.productName}</div>
                    <div className="text-blue-600 text-xs">
                      {format(milestone.date, 'MMM dd, yyyy')}
                      ({differenceInDays(milestone.date, new Date())} days)
                    </div>
                  </div>
                ))}
                {getUpcomingMilestones().length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
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
                <Tabs defaultValue="milestones">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="milestones">Milestones</TabsTrigger>
                    <TabsTrigger value="interactions">Interactions</TabsTrigger>
                  </TabsList>

                  <TabsContent value="milestones" className="space-y-3">
                    {selectedSubmission.milestones.map((milestone) => {

                      return (
                        <div key={milestone.id} className="flex items-start space-x-3">
                          <IconComponent className={`h-4 w-4 mt-1 ${milestoneStatusColors[milestone.status]}`} />
                          <div className="flex-grow">
                            <div className="text-sm font-medium">{milestone.name}</div>
                            <div className="text-xs text-gray-500">
                              {format(milestone.date, 'MMM dd, yyyy')}
                            </div>
                            {milestone.documents && (
                              <div className="text-xs text-blue-600 mt-1">
                                {milestone.documents.length} document{milestone.documents.length > 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </TabsContent>

                  <TabsContent value="interactions" className="space-y-3">
                    {selectedSubmission.interactions.map((interaction, idx) => (
                      <div key={idx} className="border-l-2 border-blue-200 pl-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <MessageSquare className="h-3 w-3 text-blue-500" />
                          <span className="text-sm font-medium capitalize">
                            {interaction.type.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-gray-500">
                            {format(interaction.date, 'MMM dd')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{interaction.summary}</p>
                        <div className="text-xs text-gray-500">
                          <div>Participants: {interaction.participants.join(', ')}</div>
                          <div className="mt-1">Outcomes: {interaction.outcomes.join('; ')}</div>
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