'use client';

import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { Calendar, Clock, User, FileText, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { useState, useMemo } from 'react';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Separator } from '@/shared/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/ui/tooltip';

import { TimelineEvent, PatientTimelineData } from '../../types';

interface PatientTimelineProps {
  patientId: string;
  data: PatientTimelineData;
  dateRange?: [Date, Date];
  onEventClick?: (event: TimelineEvent) => void;
  onExport?: (format: 'FHIR' | 'PDF' | 'CSV') => void;
  className?: string;
}

  diagnosis: AlertTriangle,
  treatment: Activity,
  lab: FileText,
  procedure: User,
  medication: CheckCircle,
  outcome: Calendar
};

  low: 'bg-blue-100 text-blue-800 border-blue-200',
  moderate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-red-100 text-red-800 border-red-200'
};

  diagnosis: 'bg-red-50 border-red-200',
  treatment: 'bg-green-50 border-green-200',
  lab: 'bg-blue-50 border-blue-200',
  procedure: 'bg-purple-50 border-purple-200',
  medication: 'bg-orange-50 border-orange-200',
  outcome: 'bg-teal-50 border-teal-200'
};

export function PatientTimeline({
  patientId,
  data,
  dateRange,
  onEventClick,
  onExport,
  className = ''
}: PatientTimelineProps) {
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>(['all']);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'chronological' | 'grouped'>('chronological');
  const [zoomLevel, setZoomLevel] = useState<'day' | 'week' | 'month' | 'year'>('month');

    // Filter by date range
    if (dateRange) {
      filtered = filtered.filter(event =>
        isWithinInterval(event.date, {
          start: startOfDay(dateRange[0]),
          end: endOfDay(dateRange[1])
        })
      );
    }

    // Filter by event types
    if (!selectedEventTypes.includes('all')) {
      filtered = filtered.filter(event => selectedEventTypes.includes(event.type));
    }

    // Filter by severity
    if (selectedSeverity !== 'all') {
      filtered = filtered.filter(event => event.severity === selectedSeverity);
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [data.events, dateRange, selectedEventTypes, selectedSeverity]);

      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(event);
      return acc;
    }, { /* TODO: implement */ } as Record<string, TimelineEvent[]>);

    return Object.entries(groups).sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime());
  }, [filteredEvents]);

    if (onEventClick) {
      onEventClick(event);
    }
  };

    if (onExport) {
      onExport(format);
    }
  };

    return (
      <Card
        key={event.id}
        className={`mb-4 cursor-pointer hover:shadow-md transition-shadow ${eventTypeColors[event.type]}`}
        onClick={() => handleEventClick(event)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleEventClick(event);
          }
        }}
        aria-label={`Timeline event: ${event.title}`}
      >
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <IconComponent className="h-5 w-5 text-gray-600" aria-hidden="true" />
            </div>
            <div className="flex-grow min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {event.title}
                </h4>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {event.type}
                  </Badge>
                  {event.severity && (
                    <Badge className={`text-xs ${severityColors[event.severity]}`}>
                      {event.severity}
                    </Badge>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-2">{event.description}</p>

              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" aria-hidden="true" />
                  <time dateTime={event.date.toISOString()}>
                    {format(event.date, 'MMM dd, yyyy HH:mm')}
                  </time>
                </div>

                {event.provider && (
                  <div className="flex items-center">
                    <User className="h-3 w-3 mr-1" aria-hidden="true" />
                    <span>{event.provider.name} - {event.provider.specialty}</span>
                  </div>
                )}
              </div>

              {event.medicalCoding && (
                <div className="mt-2 text-xs text-gray-500">
                  <Badge variant="secondary" className="text-xs">
                    {event.medicalCoding.system}: {event.medicalCoding.code}
                  </Badge>
                </div>
              )}

              {event.outcomes && (
                <div className="mt-2">
                  <p className="text-xs text-gray-700">
                    <span className="font-medium">Primary Outcome:</span> {event.outcomes.primary}
                  </p>
                  {event.outcomes.measurements && event.outcomes.measurements.length > 0 && (
                    <div className="mt-1 text-xs text-gray-600">
                      {event.outcomes.measurements.map((measurement, idx) => (
                        <span key={idx} className="mr-3">
                          {measurement.value} {measurement.unit}
                          {measurement.reference && ` (${measurement.reference})`}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {event.attachments && event.attachments.length > 0 && (
                <div className="mt-2 flex items-center">
                  <FileText className="h-3 w-3 mr-1 text-gray-400" aria-hidden="true" />
                  <span className="text-xs text-gray-500">
                    {event.attachments.length} attachment{event.attachments.length > 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Patient Timeline</h2>
          <p className="text-gray-600">Patient ID: {patientId}</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Select value={viewMode} onValueChange={(value: 'chronological' | 'grouped') => setViewMode(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="chronological">Chronological</SelectItem>
              <SelectItem value="grouped">Grouped by Date</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('PDF')}
                    aria-label="Export as PDF"
                  >
                    PDF
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Export timeline as PDF</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('FHIR')}
                    aria-label="Export as FHIR"
                  >
                    FHIR
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Export as FHIR bundle</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-grow max-w-md">
              <div className="text-sm text-gray-600">
                Date range filtering available in advanced view
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {['all', 'diagnosis', 'treatment', 'lab', 'procedure', 'medication', 'outcome'].map((type) => (
                <Button
                  key={type}
                  variant={selectedEventTypes.includes(type) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    if (type === 'all') {
                      setSelectedEventTypes(['all']);
                    } else {

                        ? selectedEventTypes.filter(t => t !== type)
                        : [...selectedEventTypes.filter(t => t !== 'all'), type];
                      setSelectedEventTypes(newTypes.length ? newTypes : ['all']);
                    }
                  }}
                  className="capitalize"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{filteredEvents.length}</div>
            <div className="text-sm text-gray-600">Total Events</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {filteredEvents.filter(e => e.severity === 'critical' || e.severity === 'high').length}
            </div>
            <div className="text-sm text-gray-600">High Priority</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {data.treatmentPeriods.filter(p => p.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">Active Treatments</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{data.milestones.length}</div>
            <div className="text-sm text-gray-600">Milestones</div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Content */}
      <Card className="flex-grow">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" aria-hidden="true" />
            Medical Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            {filteredEvents.length > 0 ? (
              viewMode === 'chronological' ? (
                filteredEvents.map(event => renderEventCard(event))
              ) : (
                groupedEvents.map(([date, events]) => (
                  <div key={date} className="mb-6">
                    <div className="flex items-center mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {format(new Date(date), 'EEEE, MMMM dd, yyyy')}
                      </h3>
                      <Separator className="ml-4 flex-grow" />
                    </div>
                    <div className="ml-4">
                      {events.map(event => renderEventCard(event))}
                    </div>
                  </div>
                ))
              )
            ) : (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" aria-hidden="true" />
                <p className="text-gray-500">No events found matching the selected filters.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSelectedEventTypes(['all']);
                    setSelectedSeverity('all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}