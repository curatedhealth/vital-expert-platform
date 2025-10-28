'use client';

import { format } from 'date-fns';
import { AlertTriangle, TrendingUp, Shield, Activity, Eye, Download, Bell } from 'lucide-react';
import { useState, useMemo } from 'react';
import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

import { SafetyEvent } from '../../types';

interface SafetyMonitorProps {
  events?: SafetyEvent[];
  onEventSelect?: (event: SafetyEvent) => void;
  onExport?: (format: 'pdf' | 'xml' | 'medwatch') => void;
  className?: string;
}

  mild: 'bg-green-100 text-green-800 border-green-200',
  moderate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  severe: 'bg-orange-100 text-orange-800 border-orange-200',
  life_threatening: 'bg-red-100 text-red-800 border-red-200',
  fatal: 'bg-purple-100 text-purple-800 border-purple-200'
};

  unrelated: 'bg-gray-100 text-gray-800',
  unlikely: 'bg-blue-100 text-blue-800',
  possible: 'bg-yellow-100 text-yellow-800',
  probable: 'bg-orange-100 text-orange-800',
  definite: 'bg-red-100 text-red-800'
};

  adverse_event: 'bg-yellow-100 text-yellow-800',
  serious_adverse_event: 'bg-red-100 text-red-800',
  unanticipated_problem: 'bg-purple-100 text-purple-800',
  device_malfunction: 'bg-blue-100 text-blue-800'
};

// Mock safety events data
const mockSafetyEvents: SafetyEvent[] = [
  {
    id: '1',
    reportId: 'SAE-2023-001',
    patientId: 'PT-001',
    eventDate: new Date('2023-09-15'),
    reportDate: new Date('2023-09-16'),
    eventType: 'serious_adverse_event',
    severity: 'severe',
    causality: 'probable',
    description: 'Patient experienced severe allergic reaction 30 minutes after device activation. Symptoms included urticaria, bronchospasm, and hypotension.',
    medicalCoding: {
      meddra: {
        pt: 'Anaphylactic reaction',
        llt: 'Allergic reaction',
        hlgt: 'Allergic conditions',
        hlt: 'Hypersensitivity',
        soc: 'Immune system disorders'
      }
    },
    relatedProducts: ['CardioFlow AI System v2.1'],
    outcome: 'recovered',
    actions: ['Device discontinued', 'Emergency treatment administered', 'Patient hospitalized'],
    reporter: {
      type: 'physician',
      name: 'Dr. Smith',
      qualification: 'Cardiologist'
    },
    regulatoryReporting: {
      required: true,
      submitted: true,
      submissionDate: new Date('2023-09-18'),
      agencies: ['FDA', 'Health Canada']
    }
  },
  {
    id: '2',
    reportId: 'AE-2023-045',
    eventDate: new Date('2023-09-20'),
    reportDate: new Date('2023-09-20'),
    eventType: 'adverse_event',
    severity: 'mild',
    causality: 'possible',
    description: 'Patient reported mild headache and dizziness following 2-hour session with neuro-stimulation device.',
    medicalCoding: {
      meddra: {
        pt: 'Headache',
        llt: 'Head pain',
        hlgt: 'Headaches',
        hlt: 'Headaches NEC',
        soc: 'Nervous system disorders'
      }
    },
    relatedProducts: ['NeuroStim Therapy Device'],
    outcome: 'recovered',
    actions: ['Session duration reduced', 'Patient monitoring increased'],
    reporter: {
      type: 'nurse',
      qualification: 'Clinical Research Nurse'
    },
    regulatoryReporting: {
      required: false,
      submitted: false,
      agencies: []
    }
  },
  {
    id: '3',
    reportId: 'DM-2023-012',
    eventDate: new Date('2023-09-22'),
    reportDate: new Date('2023-09-23'),
    eventType: 'device_malfunction',
    severity: 'moderate',
    causality: 'definite',
    description: 'Software error in AI algorithm caused incorrect diagnostic recommendation. No patient harm occurred.',
    medicalCoding: {
      meddra: {
        pt: 'Device malfunction',
        llt: 'Software error',
        hlgt: 'Device issues',
        hlt: 'Device malfunction',
        soc: 'Product issues'
      }
    },
    relatedProducts: ['DiagnosAI Pathology Assistant v1.2'],
    outcome: 'not_recovered',
    actions: ['Device recalled', 'Software update deployed', 'User training updated'],
    reporter: {
      type: 'physician',
      name: 'Dr. Johnson',
      qualification: 'Pathologist'
    },
    regulatoryReporting: {
      required: true,
      submitted: true,
      submissionDate: new Date('2023-09-25'),
      agencies: ['FDA']
    }
  }
];

export function SafetyMonitor({
  events = mockSafetyEvents,
  onEventSelect,
  onExport,
  className = ''
}: SafetyMonitorProps) {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('30');
  const [selectedEvent, setSelectedEvent] = useState<SafetyEvent | null>(null);

    if (selectedSeverity !== 'all') {
      filtered = filtered.filter(event => event.severity === selectedSeverity);
    }

    if (selectedEventType !== 'all') {
      filtered = filtered.filter(event => event.eventType === selectedEventType);
    }

    // Filter by timeframe (days)
    if (selectedTimeframe !== 'all') {

      cutoffDate.setDate(cutoffDate.getDate() - days);
      filtered = filtered.filter(event => event.eventDate >= cutoffDate);
    }

    return filtered.sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
  }, [events, selectedSeverity, selectedEventType, selectedTimeframe]);

  // Analytics data preparation

      acc[event.severity] = (acc[event.severity] || 0) + 1;
      return acc;
    }, { /* TODO: implement */ } as Record<string, number>);

    return Object.entries(counts).map(([severity, count]) => ({
      name: severity.replace('_', ' '),
      value: count
    }));
  }, [events]);

      if (!acc[month]) {
        acc[month] = { month, total: 0, serious: 0 };
      }
      acc[month].total++;
      if (event.eventType === 'serious_adverse_event') {
        acc[month].serious++;
      }
      return acc;
    }, { /* TODO: implement */ } as Record<string, unknown>);

    return Object.values(monthlyData).slice(-6);
  }, [events]);

    // Mock signal detection alerts
    return [
      {
        id: '1',
        type: 'frequency',
        product: 'CardioFlow AI System',
        alert: 'Increased frequency of allergic reactions',
        risk: 'high',
        recommendation: 'Immediate review required'
      },
      {
        id: '2',
        type: 'severity',
        product: 'NeuroStim Therapy Device',
        alert: 'Potential neurological side effects',
        risk: 'medium',
        recommendation: 'Enhanced monitoring recommended'
      }
    ];
  };

    setSelectedEvent(event);
    if (onEventSelect) {
      onEventSelect(event);
    }
  };

    return (
      <Card
        key={event.id}
        className={`mb-4 cursor-pointer transition-all hover:shadow-md ${
          selectedEvent?.id === event.id ? 'ring-2 ring-blue-500' : ''
        }`}
        onClick={() => handleEventClick(event)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Badge className={severityColors[event.severity]}>{event.severity}</Badge>
                <Badge className={eventTypeColors[event.eventType]}>
                  {event.eventType.replace('_', ' ')}
                </Badge>
                <Badge className={causalityColors[event.causality]}>{event.causality}</Badge>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">
                Report ID: {event.reportId}
              </h4>
              <p className="text-sm text-gray-600 mb-2">{event.description}</p>
            </div>

            <div className="text-right text-sm text-gray-500">
              <div>{format(event.eventDate, 'MMM dd, yyyy')}</div>
              <div>Reported: {format(event.reportDate, 'MMM dd')}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
            <div>
              <div className="text-xs text-gray-500">MedDRA PT</div>
              <div className="text-sm font-medium">{event.medicalCoding.meddra.pt}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Related Product</div>
              <div className="text-sm">{event.relatedProducts[0]}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Outcome</div>
              <div className="text-sm capitalize">{event.outcome.replace('_', ' ')}</div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Eye className="h-3 w-3 mr-1" />
                Reporter: {event.reporter.type}
              </div>
              {event.regulatoryReporting.required && (
                <div className="flex items-center">
                  <Bell className="h-3 w-3 mr-1" />
                  Regulatory: {event.regulatoryReporting.submitted ? 'Submitted' : 'Pending'}
                </div>
              )}
            </div>

            <Button variant="outline" size="sm">
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Safety Monitor</h2>
          <p className="text-gray-600">Real-time adverse event monitoring and signal detection</p>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline">
            <Bell className="h-4 w-4 mr-2" />
            Alerts ({getSignalAlerts().length})
          </Button>
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
                <SelectItem value="xml">XML (E2B)</SelectItem>
                <SelectItem value="medwatch">MedWatch Form</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{events.length}</div>
                <div className="text-sm text-gray-600">Total Events</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {events.filter((e: any) => e.eventType === 'serious_adverse_event').length}
                </div>
                <div className="text-sm text-gray-600">Serious AEs</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-orange-500 mr-3" />
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {events.filter((e: any) => e.regulatoryReporting.required && !e.regulatoryReporting.submitted).length}
                </div>
                <div className="text-sm text-gray-600">Pending Reports</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {getSignalAlerts().filter((a: any) => a.risk === 'high').length}
                </div>
                <div className="text-sm text-gray-600">High Risk Signals</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Signal Detection Alerts */}
      {getSignalAlerts().length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Signal Detection Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getSignalAlerts().map((alert) => (
                <Alert key={alert.id} className={`${
                  alert.risk === 'high' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'
                }`}>
                  <AlertTriangle className={`h-4 w-4 ${
                    alert.risk === 'high' ? 'text-red-600' : 'text-yellow-600'
                  }`} />
                  <AlertDescription>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{alert.alert}</div>
                        <div className="text-sm text-gray-600">
                          Product: {alert.product} • Risk: <span className="capitalize">{alert.risk}</span>
                        </div>
                        <div className="text-sm text-blue-600 mt-1">{alert.recommendation}</div>
                      </div>
                      <Button variant="outline" size="sm">
                        Investigate
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex gap-4">
              <Select value={selectedEventType} onValueChange={setSelectedEventType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="adverse_event">Adverse Event</SelectItem>
                  <SelectItem value="serious_adverse_event">Serious AE</SelectItem>
                  <SelectItem value="unanticipated_problem">Unanticipated Problem</SelectItem>
                  <SelectItem value="device_malfunction">Device Malfunction</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="mild">Mild</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                  <SelectItem value="life_threatening">Life Threatening</SelectItem>
                  <SelectItem value="fatal">Fatal</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Events List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Safety Events ({filteredEvents.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map(event => renderEventCard(event))
                ) : (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No safety events found</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Analytics and Details */}
        <div className="space-y-6">
          {/* Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Safety Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="severity">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="severity">Severity</TabsTrigger>
                  <TabsTrigger value="trends">Trends</TabsTrigger>
                </TabsList>

                <TabsContent value="severity">
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={severityDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {severityDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 space-y-1">
                    {severityDistribution.map((entry, index) => (
                      <div key={entry.name} className="flex items-center text-sm">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="capitalize">{entry.name}: {entry.value}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="trends">
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Line type="monotone" dataKey="total" stroke="#8884d8" strokeWidth={2} />
                        <Line type="monotone" dataKey="serious" stroke="#ff4444" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 flex justify-center space-x-4 text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded mr-1" />
                      Total Events
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded mr-1" />
                      Serious Events
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Event Details */}
          {selectedEvent && (
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">MedDRA Coding</h4>
                  <div className="text-sm space-y-1">
                    <div>PT: {selectedEvent.medicalCoding.meddra.pt}</div>
                    <div>SOC: {selectedEvent.medicalCoding.meddra.soc}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Actions Taken</h4>
                  <ul className="text-sm space-y-1">
                    {selectedEvent.actions.map((action, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Reporter Information</h4>
                  <div className="text-sm">
                    <div>Type: {selectedEvent.reporter.type}</div>
                    {selectedEvent.reporter.name && (
                      <div>Name: {selectedEvent.reporter.name}</div>
                    )}
                    {selectedEvent.reporter.qualification && (
                      <div>Qualification: {selectedEvent.reporter.qualification}</div>
                    )}
                  </div>
                </div>

                {selectedEvent.regulatoryReporting.required && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Regulatory Reporting</h4>
                    <div className="text-sm">
                      <div>Status: {selectedEvent.regulatoryReporting.submitted ? 'Submitted' : 'Pending'}</div>
                      {selectedEvent.regulatoryReporting.submissionDate && (
                        <div>
                          Submitted: {format(selectedEvent.regulatoryReporting.submissionDate, 'MMM dd, yyyy')}
                        </div>
                      )}
                      <div>Agencies: {selectedEvent.regulatoryReporting.agencies.join(', ')}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}