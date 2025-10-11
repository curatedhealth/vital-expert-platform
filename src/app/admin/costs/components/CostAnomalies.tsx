'use client';

import { AlertTriangle, TrendingUp, TrendingDown, Activity, CheckCircle, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { costAnalyticsService, CostAnomaly } from '@/services/cost-analytics.service';


export function CostAnomalies() {
  const [anomalies, setAnomalies] = useState<CostAnomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnomalies = async () => {
    try {
      const data = await costAnalyticsService.detectAnomalies();
      setAnomalies(data);
    } catch (error) {
      console.error('Error fetching anomalies:', error);
      toast.error('Failed to load cost anomalies');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnomalies();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnomalies();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'spike':
        return <TrendingUp className="h-4 w-4 text-red-600" />;
      case 'drop':
        return <TrendingDown className="h-4 w-4 text-green-600" />;
      case 'unusual_pattern':
        return <Activity className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusIcon = (isResolved: boolean) => {
    return isResolved ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <Clock className="h-4 w-4 text-yellow-600" />
    );
  };

  const formatDeviation = (deviation: number) => {
    const sign = deviation > 0 ? '+' : '';
    return `${sign}${deviation.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const unresolvedAnomalies = anomalies.filter(a => !a.isResolved);
  const criticalAnomalies = anomalies.filter(a => a.severity === 'critical' && !a.isResolved);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Anomalies</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{anomalies.length}</div>
            <p className="text-xs text-muted-foreground">
              All time detected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unresolved</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unresolvedAnomalies.length}</div>
            <p className="text-xs text-muted-foreground">
              Requiring attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalAnomalies.length}</div>
            <p className="text-xs text-muted-foreground">
              High priority alerts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {anomalies.length - unresolvedAnomalies.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully resolved
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Cost Anomalies</h3>
        <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
          {refreshing ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600" />
          ) : (
            'Refresh Detection'
          )}
        </Button>
      </div>

      {/* Anomalies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detected Anomalies</CardTitle>
          <CardDescription>
            Statistical anomalies in cost patterns detected by our ML algorithms
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Current Value</TableHead>
                <TableHead>Expected Value</TableHead>
                <TableHead>Deviation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Detected</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {anomalies.map((anomaly) => (
                <TableRow key={anomaly.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(anomaly.type)}
                      <span className="capitalize">{anomaly.type.replace('_', ' ')}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getSeverityColor(anomaly.severity)}>
                      {anomaly.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="text-sm font-medium truncate">{anomaly.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">${anomaly.currentValue.toFixed(2)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500">${anomaly.expectedValue.toFixed(2)}</div>
                  </TableCell>
                  <TableCell>
                    <div className={`font-medium ${
                      anomaly.deviation > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {formatDeviation(anomaly.deviation)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(anomaly.isResolved)}
                      <span className="text-sm">
                        {anomaly.isResolved ? 'Resolved' : 'Open'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500">
                      {new Date(anomaly.detectedAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {anomalies.length === 0 && (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No anomalies detected</p>
              <p className="text-sm text-gray-400 mt-2">
                Cost patterns appear normal. Anomalies will appear here when detected.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Critical Anomalies Alert */}
      {criticalAnomalies.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-800">
                  {criticalAnomalies.length} Critical Anomaly{criticalAnomalies.length > 1 ? 'ies' : ''} Detected
                </p>
                <p className="text-sm text-red-700">
                  Immediate attention required for cost spikes or unusual patterns.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
