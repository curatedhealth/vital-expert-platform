'use client';

import {
  Users,
  Crown,
  MessageSquare,
  Vote,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  UserCheck,
  Building,
  Calendar,
  Target
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

interface BoardMember {
  id: string;
  agent_id: string;
  name: string;
  title: string;
  organization: string;
  avatar: string;
  role: 'chair' | 'member' | 'advisor' | 'observer';
  voting_weight: number;
  expertise_areas: string[];
  years_experience: number;
  credentials: string[];
  timezone: string;
  availability: string;
  joined_at: string;
}

interface VirtualBoard {
  id: string;
  name: string;
  board_type: string;
  focus_areas: string[];
  description: string;
  lead_agent_id: string;
  consensus_method: 'voting' | 'delphi' | 'weighted' | 'unanimous';
  quorum_requirement: number;
  created_at: string;
  is_active: boolean;
  members: BoardMember[];
  recent_decisions: BoardDecision[];
  upcoming_meetings: BoardMeeting[];
}

interface BoardDecision {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  votes_for: number;
  votes_against: number;
  abstentions: number;
  consensus_level: number;
  created_at: string;
  decision_date?: string;
  impact_level: 'low' | 'medium' | 'high' | 'critical';
}

interface BoardMeeting {
  id: string;
  title: string;
  agenda: string[];
  scheduled_at: string;
  duration_minutes: number;
  attendees_count: number;
  meeting_type: 'review' | 'decision' | 'advisory' | 'emergency';
}

interface VirtualAdvisoryBoardsProps {
  initialBoards?: VirtualBoard[];
}

export default function VirtualAdvisoryBoards({
  initialBoards = []
}: VirtualAdvisoryBoardsProps) {
  const [boards, setBoards] = useState<VirtualBoard[]>(initialBoards);
  const [selectedBoard, setSelectedBoard] = useState<VirtualBoard | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Mock data for demonstration
  useEffect(() => {
    const mockBoards: VirtualBoard[] = [
      {
        id: '1',
        name: 'AI Safety & Ethics Board',
        board_type: 'Safety & Ethics',
        focus_areas: ['AI Safety', 'Medical Ethics', 'Patient Privacy', 'Algorithmic Bias'],
        description: 'Overseeing the ethical development and deployment of AI systems in healthcare',
        lead_agent_id: 'dr-priya-sharma-ai-researcher',
        consensus_method: 'weighted',
        quorum_requirement: 5,
        created_at: '2024-01-15',
        is_active: true,
        members: [
          {
            id: '1',
            agent_id: 'dr-priya-sharma-ai-researcher',
            name: 'Dr. Priya Sharma',
            title: 'Principal AI Research Scientist',
            organization: 'Google Health AI',
            avatar: '👩‍🔬',
            role: 'chair',
            voting_weight: 1.5,
            expertise_areas: ['Medical AI', 'ML Ethics', 'Computer Vision'],
            years_experience: 12,
            credentials: ['PhD Computer Science', 'MS Biomedical Engineering'],
            timezone: 'America/Los_Angeles',
            availability: 'weekly',
            joined_at: '2024-01-15'
          },
          {
            id: '2',
            agent_id: 'dr-robert-kim-clinical-ai',
            name: 'Dr. Robert Kim',
            title: 'Chief Medical Informatics Officer',
            organization: 'Johns Hopkins Medicine',
            avatar: '👨‍⚕️',
            role: 'member',
            voting_weight: 1.0,
            expertise_areas: ['Clinical AI', 'Medical Safety', 'Evidence-Based Medicine'],
            years_experience: 20,
            credentials: ['MD', 'MS Biomedical Informatics'],
            timezone: 'America/New_York',
            availability: 'weekly',
            joined_at: '2024-01-20'
          },
          {
            id: '3',
            agent_id: 'maria-gonzalez-patient-advocate',
            name: 'Maria Gonzalez',
            title: 'Chief Patient Officer',
            organization: 'Patient Advocate Foundation',
            avatar: '🤝',
            role: 'advisor',
            voting_weight: 1.2,
            expertise_areas: ['Patient Rights', 'Health Equity', 'Digital Literacy'],
            years_experience: 15,
            credentials: ['MSW', 'Certified Patient Advocate'],
            timezone: 'America/New_York',
            availability: 'weekly',
            joined_at: '2024-01-25'
          }
        ],
        recent_decisions: [
          {
            id: '1',
            title: 'AI Bias Detection Framework',
            description: 'Approve implementation of comprehensive bias detection framework for all AI models',
            status: 'approved',
            votes_for: 8,
            votes_against: 1,
            abstentions: 1,
            consensus_level: 89,
            created_at: '2024-03-15',
            decision_date: '2024-03-20',
            impact_level: 'high'
          },
          {
            id: '2',
            title: 'Patient Consent Protocol Update',
            description: 'Review and update patient consent protocols for AI-driven diagnostics',
            status: 'in_review',
            votes_for: 6,
            votes_against: 2,
            abstentions: 2,
            consensus_level: 72,
            created_at: '2024-03-25',
            impact_level: 'medium'
          }
        ],
        upcoming_meetings: [
          {
            id: '1',
            title: 'Monthly AI Safety Review',
            agenda: ['Model Performance Review', 'Bias Detection Updates', 'New Safety Protocols'],
            scheduled_at: '2024-04-15T14:00:00Z',
            duration_minutes: 90,
            attendees_count: 8,
            meeting_type: 'review'
          }
        ]
      },
      {
        id: '2',
        name: 'Regulatory Compliance Board',
        board_type: 'Regulatory',
        focus_areas: ['FDA Compliance', 'EU MDR', 'Clinical Validation', 'Post-Market Surveillance'],
        description: 'Ensuring all digital health solutions meet regulatory requirements across global markets',
        lead_agent_id: 'dr-thomas-anderson-fda-regulatory',
        consensus_method: 'unanimous',
        quorum_requirement: 4,
        created_at: '2024-02-01',
        is_active: true,
        members: [
          {
            id: '4',
            agent_id: 'dr-thomas-anderson-fda-regulatory',
            name: 'Dr. Thomas Anderson',
            title: 'Deputy Director, Digital Health',
            organization: 'FDA Center for Devices',
            avatar: '⚖️',
            role: 'chair',
            voting_weight: 2.0,
            expertise_areas: ['FDA Regulation', 'Medical Device Law', 'AI/ML Guidance'],
            years_experience: 25,
            credentials: ['MD', 'JD', 'MPH'],
            timezone: 'America/New_York',
            availability: 'monthly',
            joined_at: '2024-02-01'
          }
        ],
        recent_decisions: [
          {
            id: '3',
            title: '510(k) Pathway Assessment',
            description: 'Evaluate new AI diagnostic tool for 510(k) pathway eligibility',
            status: 'pending',
            votes_for: 0,
            votes_against: 0,
            abstentions: 0,
            consensus_level: 0,
            created_at: '2024-03-28',
            impact_level: 'critical'
          }
        ],
        upcoming_meetings: [
          {
            id: '2',
            title: 'Regulatory Strategy Session',
            agenda: ['FDA Pre-Submission Review', 'EU MDR Updates', 'Clinical Trial Planning'],
            scheduled_at: '2024-04-10T16:00:00Z',
            duration_minutes: 120,
            attendees_count: 6,
            meeting_type: 'decision'
          }
        ]
      }
    ];

    if (initialBoards.length === 0) {
      setBoards(mockBoards);
    }
  }, [initialBoards]);

    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'in_review':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'pending':
        return <Eye className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

    switch (impact) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

    switch (role) {
      case 'chair':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'member':
        return <UserCheck className="h-4 w-4 text-blue-500" />;
      case 'advisor':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'observer':
        return <Eye className="h-4 w-4 text-gray-500" />;
      default:
        return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

    return (
      <Card
        className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-indigo-500"
        onClick={() => setSelectedBoard(board)}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl font-bold">{board.name}</CardTitle>
              <CardDescription className="mt-2">
                {board.description}
              </CardDescription>
            </div>
            <Badge
              variant={board.is_active ? "default" : "secondary"}
              className="flex items-center space-x-1"
            >
              <div className={`w-2 h-2 rounded-full ${board.is_active ? 'bg-green-400' : 'bg-gray-400'}`} />
              <span>{board.is_active ? 'Active' : 'Inactive'}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Board Type & Focus Areas */}
            <div>
              <Badge variant="outline" className="mb-2">
                {board.board_type}
              </Badge>
              <div className="flex flex-wrap gap-1">
                {board.focus_areas.slice(0, 3).map((area, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {area}
                  </Badge>
                ))}
                {board.focus_areas.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{board.focus_areas.length - 3} more
                  </Badge>
                )}
              </div>
            </div>

            {/* Chair & Members */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Crown className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">
                  {chairMember ? chairMember.name : 'No Chair Assigned'}
                </span>
              </div>
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>{totalMembers} members</span>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-blue-600">{activeDecisions}</div>
                <div className="text-xs text-gray-600">Active Decisions</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-green-600">{board.upcoming_meetings.length}</div>
                <div className="text-xs text-gray-600">Upcoming Meetings</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-purple-600">{board.quorum_requirement}</div>
                <div className="text-xs text-gray-600">Quorum Required</div>
              </div>
            </div>

            {/* Consensus Method */}
            <div className="flex items-center space-x-2">
              <Vote className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Consensus: {board.consensus_method.charAt(0).toUpperCase() + board.consensus_method.slice(1)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold">{board.name}</h2>
                <p className="text-gray-600 mt-2">{board.description}</p>
                <div className="flex items-center space-x-4 mt-4">
                  <Badge variant="outline">{board.board_type}</Badge>
                  <Badge variant={board.is_active ? "default" : "secondary"}>
                    {board.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Created {new Date(board.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={() => setSelectedBoard(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="decisions">Decisions</TabsTrigger>
                <TabsTrigger value="meetings">Meetings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Board Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <span className="font-medium">Consensus Method:</span>
                        <Badge className="ml-2" variant="outline">
                          {board.consensus_method.charAt(0).toUpperCase() + board.consensus_method.slice(1)}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">Quorum Requirement:</span>
                        <span className="ml-2">{board.quorum_requirement} members</span>
                      </div>
                      <div>
                        <span className="font-medium">Total Members:</span>
                        <span className="ml-2">{board.members.length}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Focus Areas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {board.focus_areas.map((area, index) => (
                          <Badge key={index} variant="secondary">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {board.recent_decisions.slice(0, 3).map((decision) => (
                          <div key={decision.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              {getStatusIcon(decision.status)}
                              <div>
                                <div className="font-medium">{decision.title}</div>
                                <div className="text-sm text-gray-600">{decision.description}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className={getImpactColor(decision.impact_level)}>
                                {decision.impact_level}
                              </Badge>
                              <div className="text-xs text-gray-500 mt-1">
                                {new Date(decision.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="members" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {board.members.map((member) => (
                    <Card key={member.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="text-2xl">{member.avatar}</div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold">{member.name}</h3>
                              {getRoleIcon(member.role)}
                            </div>
                            <p className="text-sm text-gray-600">{member.title}</p>
                            <p className="text-xs text-gray-500">{member.organization}</p>

                            <div className="mt-3 space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span>Voting Weight:</span>
                                <Badge variant="outline">{member.voting_weight}</Badge>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span>Experience:</span>
                                <span>{member.years_experience} years</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span>Availability:</span>
                                <Badge variant="secondary">{member.availability}</Badge>
                              </div>
                            </div>

                            <div className="mt-3">
                              <p className="text-xs font-medium text-gray-700 mb-1">Expertise:</p>
                              <div className="flex flex-wrap gap-1">
                                {member.expertise_areas.slice(0, 2).map((area, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {area}
                                  </Badge>
                                ))}
                                {member.expertise_areas.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{member.expertise_areas.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="decisions" className="mt-6">
                <div className="space-y-4">
                  {board.recent_decisions.map((decision) => (
                    <Card key={decision.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            {getStatusIcon(decision.status)}
                            <div>
                              <h3 className="font-semibold">{decision.title}</h3>
                              <p className="text-sm text-gray-600 mt-1">{decision.description}</p>
                              <div className="flex items-center space-x-4 mt-3 text-sm">
                                <span className="text-green-600">👍 {decision.votes_for}</span>
                                <span className="text-red-600">👎 {decision.votes_against}</span>
                                <span className="text-gray-600">⚖️ {decision.abstentions}</span>
                                <span className="text-blue-600">📊 {decision.consensus_level}% consensus</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getImpactColor(decision.impact_level)}>
                              {decision.impact_level}
                            </Badge>
                            <Badge variant="outline" className="ml-2">
                              {decision.status}
                            </Badge>
                            <div className="text-xs text-gray-500 mt-2">
                              Created: {new Date(decision.created_at).toLocaleDateString()}
                            </div>
                            {decision.decision_date && (
                              <div className="text-xs text-gray-500">
                                Decided: {new Date(decision.decision_date).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="meetings" className="mt-6">
                <div className="space-y-4">
                  {board.upcoming_meetings.map((meeting) => (
                    <Card key={meeting.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{meeting.title}</h3>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(meeting.scheduled_at).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{meeting.duration_minutes} min</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Users className="h-4 w-4" />
                                <span>{meeting.attendees_count} attendees</span>
                              </div>
                            </div>
                            <div className="mt-3">
                              <p className="text-sm font-medium text-gray-700 mb-1">Agenda:</p>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {meeting.agenda.map((item, index) => (
                                  <li key={index} className="flex items-center space-x-2">
                                    <Target className="h-3 w-3" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline">
                              {meeting.meeting_type}
                            </Badge>
                            <div className="text-xs text-gray-500 mt-2">
                              {new Date(meeting.scheduled_at).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Virtual Advisory Boards</h1>
          <p className="text-gray-600 mt-2">
            Expert governance and decision-making for digital health capabilities
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Boards</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {boards.filter(b => b.is_active).length}
                  </p>
                </div>
                <Building className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Expert Members</p>
                  <p className="text-2xl font-bold text-green-600">
                    {boards.reduce((total, board) => total + board.members.length, 0)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Decisions</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {boards.reduce((total, board) =>
                      total + board.recent_decisions.filter(d => d.status === 'pending' || d.status === 'in_review').length, 0
                    )}
                  </p>
                </div>
                <Vote className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Upcoming Meetings</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {boards.reduce((total, board) => total + board.upcoming_meetings.length, 0)}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Boards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {boards.map((board) => (
            <BoardCard key={board.id} board={board} />
          ))}
        </div>

        {/* Board Detail Modal */}
        {selectedBoard && (
          <BoardDetailModal board={selectedBoard} />
        )}
      </div>
    </div>
  );
}