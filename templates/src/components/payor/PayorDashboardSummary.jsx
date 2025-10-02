import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  FileText, 
  Clock, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users
} from 'lucide-react';

/**
 * Enhanced Dashboard Summary Component for Payor Dashboard
 * Displays key metrics and insights
 */
const PayorDashboardSummary = ({ 
  metrics, 
  loading = false 
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2 mt-2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Metrics</CardTitle>
          <CardDescription>No metrics data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatPercentage = (value) => {
    return `${(value || 0).toFixed(1)}%`;
  };

  // Calculate trends (mock data - in real implementation, compare with previous period)
  const getTrendInfo = (current, previous = null) => {
    if (!previous) {
      return { trend: 'neutral', percentage: 0 };
    }
    
    const change = ((current - previous) / previous) * 100;
    return {
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
      percentage: Math.abs(change)
    };
  };

  const metricCards = [
    {
      title: 'Total Claims',
      value: metrics.total_claims || 0,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: getTrendInfo(metrics.total_claims, metrics.previous_total_claims)
    },
    {
      title: 'Pending Review',
      value: metrics.pending_claims || 0,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      urgent: (metrics.pending_claims || 0) > 10
    },
    {
      title: 'Approved Claims',
      value: metrics.approved_claims || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: getTrendInfo(metrics.approved_claims)
    },
    {
      title: 'Approval Rate',
      value: formatPercentage(metrics.approval_rate),
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      isPercentage: true
    },
    {
      title: 'Total Amount',
      value: formatCurrency(metrics.total_amount),
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      isCurrency: true
    },
    {
      title: 'Average Claim',
      value: formatCurrency(metrics.average_claim_amount),
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      isCurrency: true
    },
    {
      title: 'Pre-auth Pending',
      value: metrics.preauth_pending || 0,
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      urgent: (metrics.preauth_pending || 0) > 5
    },
    {
      title: 'Members Active',
      value: metrics.active_members || 0,
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((metric, index) => {
          const Icon = metric.icon;
          
          return (
            <Card key={index} className={`${metric.urgent ? 'border-orange-300 shadow-md' : ''}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${metric.bgColor}`}>
                  <Icon className={`h-4 w-4 ${metric.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    {metric.value}
                  </div>
                  {metric.trend && (
                    <div className={`flex items-center text-xs ${
                      metric.trend.trend === 'up' ? 'text-green-600' : 
                      metric.trend.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {metric.trend.trend === 'up' ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : metric.trend.trend === 'down' ? (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      ) : null}
                      {metric.trend.percentage > 0 && `${metric.trend.percentage.toFixed(1)}%`}
                    </div>
                  )}
                </div>
                {metric.urgent && (
                  <div className="mt-2">
                    <Badge variant="warning" className="text-xs">
                      Requires Attention
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Processing Efficiency */}
        <Card>
          <CardHeader>
            <CardTitle>Processing Efficiency</CardTitle>
            <CardDescription>Current processing statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Auto-approved</span>
                <span className="font-medium">
                  {metrics.auto_approved_count || 0} claims
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Manual review required</span>
                <span className="font-medium">
                  {metrics.manual_review_count || 0} claims
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Average processing time</span>
                <span className="font-medium">
                  {metrics.avg_processing_time || '2.3'} days
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Claim Status Distribution</CardTitle>
            <CardDescription>Current claim status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-sm">Pending</span>
                </div>
                <span className="font-medium">{metrics.pending_claims || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm">Approved</span>
                </div>
                <span className="font-medium">{metrics.approved_claims || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm">Rejected</span>
                </div>
                <span className="font-medium">{metrics.rejected_claims || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm">Partially Approved</span>
                </div>
                <span className="font-medium">{metrics.partially_approved_claims || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts & Notifications */}
      {(metrics.pending_claims > 10 || metrics.preauth_pending > 5) && (
        <Card className="border-orange-300 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-4 w-4" />
              Attention Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-orange-800">
              {metrics.pending_claims > 10 && (
                <p className="text-sm">
                  • {metrics.pending_claims} claims are pending review (above normal threshold)
                </p>
              )}
              {metrics.preauth_pending > 5 && (
                <p className="text-sm">
                  • {metrics.preauth_pending} pre-authorizations require manual review
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PayorDashboardSummary;