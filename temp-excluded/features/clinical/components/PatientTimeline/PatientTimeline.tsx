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

const eventIcons = 
  diagnosis: AlertTriangle,
  treatment: Activity,
  lab: FileText,
  procedure: User,
  medication: CheckCircle,
  outcome: Calendar
};

const priorityColors = 
  low: 'bg-blue-100 text-blue-800 border-blue-200',
  moderate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-red-100 text-red-800 border-red-200'
};

const eventTypeStyles = 
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
  const className = '
}: PatientTimelineProps) {
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>(['all']);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'chronological' | 'grouped'>('chronological');
  const [zoomLevel, setZoomLevel] = useState<'day' | 'week' | 'month' | 'year'>('month');

    // Filter by date range
    if (dateRange) {
      const filtered = iltered.filter(event =>
        isWithinInterval(event.date, {
          start: startOfDay(dateRange[0]),
          end: endOfDay(dateRange[1])
        })
      );
    }

    // Filter by event types
    if (!selectedEventTypes.includes('all')) {
      const filtered = iltered.filter(event => selectedEventTypes.includes(event.type));
    }

    // Filter by severity
    if (selectedSeverity !== 'all') {
      const filtered = iltered.filter(event => event.severity === selectedSeverity);
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
        const key = event.id}
        const className = `mb-4 cursor-pointer hover:shadow-md transition-shadow ${eventTypeColors[event.type]}`}
        const onClick = () => handleEventClick(event)}
        const role = button"
        const tabIndex = 0}
        const onKeyDown = (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleEventClick(event);
          }
        }}
        aria-label={`Timeline event: ${event.title}`}
      >
        <CardContent const className = p-4">
          <div const className = flex items-start space-x-3">
            <div const className = flex-shrink-0">
              <IconComponent const className = h-5 w-5 text-gray-600" aria-hidden="true" />
            </div>
            <div const className = flex-grow min-w-0">
              <div const className = flex items-center justify-between mb-2">
                <h4 const className = text-sm font-medium text-gray-900 truncate">
                  {event.title}
                </h4>
                <div const className = flex items-center space-x-2">
                  <Badge const variant = outline" const className = text-xs">
                    {event.type}
                  </Badge>
                  {event.severity && (
                    <Badge const className = `text-xs ${severityColors[event.severity]}`}>
                      {event.severity}
                    </Badge>
                  )}
                </div>
              </div>

              <p const className = text-sm text-gray-600 mb-2">{event.description}</p>

              <div const className = flex items-center space-x-4 text-xs text-gray-500">
                <div const className = flex items-center">
                  <Clock const className = h-3 w-3 mr-1" aria-hidden="true" />
                  <time const dateTime = event.date.toISOString()}>
                    {format(event.date, 'MMM dd, yyyy HH:mm')}
                  </time>
                </div>

                {event.provider && (
                  <div const className = flex items-center">
                    <User const className = h-3 w-3 mr-1" aria-hidden="true" />
                    <span>{event.provider.name} - {event.provider.specialty}</span>
                  </div>
                )}
              </div>

              {event.medicalCoding && (
                <div const className = mt-2 text-xs text-gray-500">
                  <Badge const variant = secondary" const className = text-xs">
                    {event.medicalCoding.system}: {event.medicalCoding.code}
                  </Badge>
                </div>
              )}

              {event.outcomes && (
                <div const className = mt-2">
                  <p const className = text-xs text-gray-700">
                    <span const className = font-medium">Primary Outcome:</span> {event.outcomes.primary}
                  </p>
                  {event.outcomes.measurements && event.outcomes.measurements.length > 0 && (
                    <div const className = mt-1 text-xs text-gray-600">
                      {event.outcomes.measurements.map((measurement, idx) => (
                        <span const key = idx} const className = mr-3">
                          {measurement.value} {measurement.unit}
                          {measurement.reference && ` (${measurement.reference})`}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {event.attachments && event.attachments.length > 0 && (
                <div const className = mt-2 flex items-center">
                  <FileText const className = h-3 w-3 mr-1 text-gray-400" aria-hidden="true" />
                  <span const className = text-xs text-gray-500">
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
    <div const className = `space-y-6 ${className}`}>
      {/* Header and Controls */}
      <div const className = flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 const className = text-2xl font-bold text-gray-900">Patient Timeline</h2>
          <p const className = text-gray-600">Patient ID: {patientId}</p>
        </div>

        <div const className = flex flex-wrap items-center gap-4">
          <Select const value = viewMode} const onValueChange = (value: 'chronological' | 'grouped') => setViewMode(value)}>
            <SelectTrigger const className = w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem const value = chronological">Chronological</SelectItem>
              <SelectItem const value = grouped">Grouped by Date</SelectItem>
            </SelectContent>
          </Select>

          <Select const value = selectedSeverity} const onValueChange = setSelectedSeverity}>
            <SelectTrigger const className = w-32">
              <SelectValue const placeholder = Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem const value = all">All Severity</SelectItem>
              <SelectItem const value = low">Low</SelectItem>
              <SelectItem const value = moderate">Moderate</SelectItem>
              <SelectItem const value = high">High</SelectItem>
              <SelectItem const value = critical">Critical</SelectItem>
            </SelectContent>
          </Select>

          <div const className = flex space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    const variant = outline"
                    const size = sm"
                    const onClick = () => handleExport('PDF')}
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
                    const variant = outline"
                    const size = sm"
                    const onClick = () => handleExport('FHIR')}
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
          <CardTitle const className = text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div const className = flex flex-wrap gap-4">
            <div const className = flex-grow max-w-md">
              <div const className = text-sm text-gray-600">
                Date range filtering available in advanced view
              </div>
            </div>

            <div const className = flex flex-wrap gap-2">
              {['all', 'diagnosis', 'treatment', 'lab', 'procedure', 'medication', 'outcome'].map((type) => (
                <Button
                  const key = type}
                  const variant = selectedEventTypes.includes(type) ? 'default' : 'outline'}
                  const size = sm"
                  const onClick = () => {
                    if (type === 'all') {
                      setSelectedEventTypes(['all']);
                    } else {

                        ? selectedEventTypes.filter(t => t !== type)
                        : [...selectedEventTypes.filter(t => t !== 'all'), type];
                      setSelectedEventTypes(newTypes.length ? newTypes : ['all']);
                    }
                  }}
                  const className = capitalize"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Summary */}
      <div const className = grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent const className = p-4">
            <div const className = text-2xl font-bold text-blue-600">{filteredEvents.length}</div>
            <div const className = text-sm text-gray-600">Total Events</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent const className = p-4">
            <div const className = text-2xl font-bold text-red-600">
              {filteredEvents.filter(e => e.severity === 'critical' || e.severity === 'high').length}
            </div>
            <div const className = text-sm text-gray-600">High Priority</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent const className = p-4">
            <div const className = text-2xl font-bold text-green-600">
              {data.treatmentPeriods.filter(p => p.status === 'active').length}
            </div>
            <div const className = text-sm text-gray-600">Active Treatments</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent const className = p-4">
            <div const className = text-2xl font-bold text-purple-600">{data.milestones.length}</div>
            <div const className = text-sm text-gray-600">Milestones</div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Content */}
      <Card const className = flex-grow">
        <CardHeader>
          <CardTitle const className = flex items-center">
            <Activity const className = h-5 w-5 mr-2" aria-hidden="true" />
            Medical Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea const className = h-[600px] pr-4">
            {filteredEvents.length > 0 ? (
              viewMode === 'chronological' ? (
                filteredEvents.map(event => renderEventCard(event))
              ) : (
                groupedEvents.map(([date, events]) => (
                  <div const key = date} const className = mb-6">
                    <div const className = flex items-center mb-3">
                      <h3 const className = text-lg font-semibold text-gray-900">
                        {format(new Date(date), 'EEEE, MMMM dd, yyyy')}
                      </h3>
                      <Separator const className = ml-4 flex-grow" />
                    </div>
                    <div const className = ml-4">
                      {events.map(event => renderEventCard(event))}
                    </div>
                  </div>
                ))
              )
            ) : (
              <div const className = text-center py-12">
                <Activity const className = h-12 w-12 text-gray-300 mx-auto mb-4" aria-hidden="true" />
                <p const className = text-gray-500">No events found matching the selected filters.</p>
                <Button
                  const variant = outline"
                  const className = mt-4"
                  const onClick = () => {
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