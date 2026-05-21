import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Calendar, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { subDays, subWeeks, subMonths, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns';

interface ComparisonViewProps {
  suggestions: any[];
  grievances: any[];
  volunteers: any[];
}

type ComparisonPeriod = 'week' | 'month' | 'quarter';

const ComparisonView: React.FC<ComparisonViewProps> = ({ suggestions, grievances, volunteers }) => {
  const [period, setPeriod] = useState<ComparisonPeriod>('week');

  const comparisonData = useMemo(() => {
    const now = new Date();
    
    let currentStart: Date, currentEnd: Date, previousStart: Date, previousEnd: Date;
    
    switch (period) {
      case 'week':
        currentEnd = endOfDay(now);
        currentStart = startOfDay(subDays(now, 6));
        previousEnd = startOfDay(subDays(now, 7));
        previousStart = startOfDay(subDays(now, 13));
        break;
      case 'month':
        currentEnd = endOfDay(now);
        currentStart = startOfDay(subDays(now, 29));
        previousEnd = startOfDay(subDays(now, 30));
        previousStart = startOfDay(subDays(now, 59));
        break;
      case 'quarter':
        currentEnd = endOfDay(now);
        currentStart = startOfDay(subDays(now, 89));
        previousEnd = startOfDay(subDays(now, 90));
        previousStart = startOfDay(subDays(now, 179));
        break;
    }

    const filterByPeriod = (items: any[], start: Date, end: Date) => {
      return items.filter(item => {
        const date = new Date(item.created_at);
        return date >= start && date <= end;
      });
    };

    const currentSuggestions = filterByPeriod(suggestions, currentStart, currentEnd);
    const previousSuggestions = filterByPeriod(suggestions, previousStart, previousEnd);
    
    const currentGrievances = filterByPeriod(grievances, currentStart, currentEnd);
    const previousGrievances = filterByPeriod(grievances, previousStart, previousEnd);
    
    const currentVolunteers = filterByPeriod(volunteers, currentStart, currentEnd);
    const previousVolunteers = filterByPeriod(volunteers, previousStart, previousEnd);

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    // Category comparison
    const categoryMap = new Map<string, { current: number; previous: number }>();
    [...currentSuggestions, ...currentGrievances].forEach(item => {
      item.categories?.forEach((cat: string) => {
        const existing = categoryMap.get(cat) || { current: 0, previous: 0 };
        existing.current++;
        categoryMap.set(cat, existing);
      });
    });
    [...previousSuggestions, ...previousGrievances].forEach(item => {
      item.categories?.forEach((cat: string) => {
        const existing = categoryMap.get(cat) || { current: 0, previous: 0 };
        existing.previous++;
        categoryMap.set(cat, existing);
      });
    });

    const categoryComparison = Array.from(categoryMap.entries())
      .map(([name, data]) => ({
        name: name.split(' / ')[0],
        current: data.current,
        previous: data.previous,
        change: calculateChange(data.current, data.previous),
      }))
      .sort((a, b) => b.current - a.current)
      .slice(0, 8);

    // Sentiment comparison
    const sentiments = ['positive', 'neutral', 'negative', 'angry', 'demanding'];
    const sentimentComparison = sentiments.map(sentiment => ({
      name: sentiment.charAt(0).toUpperCase() + sentiment.slice(1),
      current: [...currentSuggestions, ...currentGrievances].filter(s => s.sentiment === sentiment).length,
      previous: [...previousSuggestions, ...previousGrievances].filter(s => s.sentiment === sentiment).length,
    })).map(s => ({
      ...s,
      change: calculateChange(s.current, s.previous),
    }));

    // Resolution rate comparison
    const currentResolved = currentGrievances.filter(g => g.status === 'resolved' || g.status === 'closed').length;
    const previousResolved = previousGrievances.filter(g => g.status === 'resolved' || g.status === 'closed').length;
    const currentResolutionRate = currentGrievances.length > 0 ? Math.round((currentResolved / currentGrievances.length) * 100) : 0;
    const previousResolutionRate = previousGrievances.length > 0 ? Math.round((previousResolved / previousGrievances.length) * 100) : 0;

    // Daily trend for current period
    const getDailyData = () => {
      const days = [];
      const dayCount = period === 'week' ? 7 : period === 'month' ? 30 : 90;
      
      for (let i = dayCount - 1; i >= 0; i--) {
        const date = subDays(now, i);
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);
        
        days.push({
          date: format(date, period === 'quarter' ? 'MMM dd' : 'dd'),
          suggestions: suggestions.filter(s => {
            const created = new Date(s.created_at);
            return created >= dayStart && created <= dayEnd;
          }).length,
          grievances: grievances.filter(g => {
            const created = new Date(g.created_at);
            return created >= dayStart && created <= dayEnd;
          }).length,
        });
      }
      return days;
    };

    return {
      metrics: {
        suggestions: {
          current: currentSuggestions.length,
          previous: previousSuggestions.length,
          change: calculateChange(currentSuggestions.length, previousSuggestions.length),
        },
        grievances: {
          current: currentGrievances.length,
          previous: previousGrievances.length,
          change: calculateChange(currentGrievances.length, previousGrievances.length),
        },
        volunteers: {
          current: currentVolunteers.length,
          previous: previousVolunteers.length,
          change: calculateChange(currentVolunteers.length, previousVolunteers.length),
        },
        resolutionRate: {
          current: currentResolutionRate,
          previous: previousResolutionRate,
          change: currentResolutionRate - previousResolutionRate,
        },
      },
      categoryComparison,
      sentimentComparison,
      dailyTrend: getDailyData(),
      periodLabel: {
        current: `${format(currentStart, 'MMM d')} - ${format(currentEnd, 'MMM d')}`,
        previous: `${format(previousStart, 'MMM d')} - ${format(previousEnd, 'MMM d')}`,
      },
    };
  }, [suggestions, grievances, volunteers, period]);

  const renderChangeIndicator = (change: number, suffix = '%') => {
    if (change > 0) {
      return (
        <span className="flex items-center text-green-600 text-sm">
          <ArrowUpRight className="w-4 h-4" />
          +{change}{suffix}
        </span>
      );
    } else if (change < 0) {
      return (
        <span className="flex items-center text-red-600 text-sm">
          <ArrowDownRight className="w-4 h-4" />
          {change}{suffix}
        </span>
      );
    }
    return (
      <span className="flex items-center text-muted-foreground text-sm">
        <Minus className="w-4 h-4" />
        0{suffix}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Period Comparison
              </CardTitle>
              <CardDescription>Compare metrics between different time periods</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <Select value={period} onValueChange={(v) => setPeriod(v as ComparisonPeriod)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Week over Week</SelectItem>
                  <SelectItem value="month">Month over Month</SelectItem>
                  <SelectItem value="quarter">Quarter over Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <Badge variant="outline" className="bg-tvk-maroon/10">
              Current: {comparisonData.periodLabel.current}
            </Badge>
            <Badge variant="outline">
              Previous: {comparisonData.periodLabel.previous}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Comparison */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Suggestions</p>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold">{comparisonData.metrics.suggestions.current}</p>
                <p className="text-xs text-muted-foreground">vs {comparisonData.metrics.suggestions.previous}</p>
              </div>
              {renderChangeIndicator(comparisonData.metrics.suggestions.change)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Grievances</p>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold">{comparisonData.metrics.grievances.current}</p>
                <p className="text-xs text-muted-foreground">vs {comparisonData.metrics.grievances.previous}</p>
              </div>
              {renderChangeIndicator(comparisonData.metrics.grievances.change)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Volunteers</p>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold">{comparisonData.metrics.volunteers.current}</p>
                <p className="text-xs text-muted-foreground">vs {comparisonData.metrics.volunteers.previous}</p>
              </div>
              {renderChangeIndicator(comparisonData.metrics.volunteers.change)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Resolution Rate</p>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold">{comparisonData.metrics.resolutionRate.current}%</p>
                <p className="text-xs text-muted-foreground">vs {comparisonData.metrics.resolutionRate.previous}%</p>
              </div>
              {renderChangeIndicator(comparisonData.metrics.resolutionRate.change, 'pts')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={comparisonData.dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="suggestions" stackId="1" stroke="#4CAF50" fill="#4CAF50" fillOpacity={0.6} name="Suggestions" />
                <Area type="monotone" dataKey="grievances" stackId="1" stroke="#FF9800" fill="#FF9800" fillOpacity={0.6} name="Grievances" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Category Comparison */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Category Comparison</CardTitle>
            <CardDescription>Current vs Previous Period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData.categoryComparison} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="current" fill="#8B0000" name="Current" />
                  <Bar dataKey="previous" fill="#FFD700" name="Previous" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sentiment Comparison</CardTitle>
            <CardDescription>Sentiment distribution changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {comparisonData.sentimentComparison.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <span className="text-sm font-medium w-24">{item.name}</span>
                  <div className="flex-1 mx-4">
                    <div className="flex gap-1 h-6">
                      <div 
                        className="bg-tvk-maroon rounded-l"
                        style={{ width: `${(item.current / Math.max(item.current, item.previous, 1)) * 50}%` }}
                      />
                      <div 
                        className="bg-tvk-yellow rounded-r"
                        style={{ width: `${(item.previous / Math.max(item.current, item.previous, 1)) * 50}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right w-24">
                    <span className="text-sm">{item.current} vs {item.previous}</span>
                    <div className="text-xs">
                      {renderChangeIndicator(item.change)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComparisonView;
