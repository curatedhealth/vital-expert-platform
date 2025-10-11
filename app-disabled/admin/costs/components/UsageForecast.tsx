'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react';
import { costAnalyticsService, UsageForecast as UsageForecastType } from '@/services/cost-analytics.service';
import { toast } from 'sonner';

export function UsageForecast() {
  const [forecast, setForecast] = useState<UsageForecastType | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'hourly' | 'daily' | 'weekly' | 'monthly'>('daily');

  const fetchForecast = async () => {
    try {
      const data = await costAnalyticsService.forecastUsage(period);
      setForecast(data);
    } catch (error) {
      console.error('Error fetching forecast:', error);
      toast.error('Failed to load usage forecast');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, [period]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-red-600" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-green-600" />;
      case 'stable':
        return <Minus className="h-4 w-4 text-gray-600" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!forecast) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Failed to load forecast data</p>
        <Button onClick={fetchForecast} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Usage Forecast</h3>
          <p className="text-sm text-gray-600">
            AI-powered predictions based on historical usage patterns
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hourly">Hourly</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchForecast} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {/* Risk Level Alert */}
      <Card className={`border-2 ${
        forecast.riskLevel === 'high' ? 'border-red-200 bg-red-50' :
        forecast.riskLevel === 'medium' ? 'border-yellow-200 bg-yellow-50' :
        'border-green-200 bg-green-50'
      }`}>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            {forecast.riskLevel === 'high' ? (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            ) : forecast.riskLevel === 'medium' ? (
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-600" />
            )}
            <div>
              <p className={`font-medium ${
                forecast.riskLevel === 'high' ? 'text-red-800' :
                forecast.riskLevel === 'medium' ? 'text-yellow-800' :
                'text-green-800'
              }`}>
                Risk Level: {forecast.riskLevel.toUpperCase()}
              </p>
              <p className={`text-sm ${
                forecast.riskLevel === 'high' ? 'text-red-700' :
                forecast.riskLevel === 'medium' ? 'text-yellow-700' :
                'text-green-700'
              }`}>
                {forecast.riskLevel === 'high' ? 'High risk of budget overrun detected' :
                 forecast.riskLevel === 'medium' ? 'Moderate risk - monitor closely' :
                 'Low risk - usage patterns are stable'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Predictions Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Predictions</CardTitle>
          <CardDescription>
            Forecasted costs for the next 7 {period} periods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {forecast.predictions.map((prediction, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(prediction.trend)}
                    <span className="font-medium">
                      {new Date(prediction.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {prediction.trend}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">
                    ${prediction.predictedCost.toFixed(2)}
                  </div>
                  <div className={`text-sm ${getConfidenceColor(prediction.confidence)}`}>
                    {(prediction.confidence * 100).toFixed(0)}% confidence
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>AI Recommendations</CardTitle>
          <CardDescription>
            Actionable insights based on forecast analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {forecast.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
                <p className="text-sm text-gray-700">{recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Forecast Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Prediction</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${forecast.predictions.reduce((sum, p) => sum + p.predictedCost, 0) / forecast.predictions.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Per {period} period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Max Predicted</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${Math.max(...forecast.predictions.map(p => p.predictedCost)).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Peak cost forecast
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confidence</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(forecast.predictions.reduce((sum, p) => sum + p.confidence, 0) / forecast.predictions.length * 100).toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average confidence
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
