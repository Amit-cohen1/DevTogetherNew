import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Activity, 
  Bell, 
  Clock, 
  AlertCircle,
  RefreshCw,
  BarChart3,
  Shield
} from 'lucide-react';

interface NotificationDashboard {
  total_notifications: number;
  last_hour: number;
  last_24h: number;
  last_7d: number;
  notification_types: {
    application: number;
    moderation: number;
    project: number;
    team: number;
    system: number;
    achievement: number;
    chat: number;
    status_change: number;
  };
  success_rate_percentage: string;
  events_with_errors: number;
  recent_failures: number;
  avg_creation_time_seconds: string;
  system_status: 'HEALTHY' | 'WARNING' | 'ALERT';
  previous_24h: number;
  last_updated: string;
}

interface HealthCheck {
  status: string;
  severity: string;
  message: string;
  details: any;
}

interface NotificationRate {
  time_period: string;
  notification_count: string;
  rate_per_hour: string;
  primary_types: string[];
}

const NotificationMonitoring: React.FC = () => {
  const [dashboard, setDashboard] = useState<NotificationDashboard | null>(null);
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [rates, setRates] = useState<NotificationRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchMonitoringData = async () => {
    try {
      // Fetch dashboard data
      const { data: dashboardData } = await supabase
        .from('notification_dashboard')
        .select('*')
        .single();

      if (dashboardData) {
        setDashboard(dashboardData);
      }

      // Fetch health checks
      const { data: healthData } = await supabase.rpc('check_notification_system_health');
      if (healthData) {
        setHealthChecks(healthData);
      }

      // Fetch rates
      const { data: ratesData } = await supabase.rpc('get_notification_rates');
      if (ratesData) {
        setRates(ratesData);
      }

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
    }
  };

  useEffect(() => {
    fetchMonitoringData();
    setLoading(false);

    // Auto-refresh every 30 seconds if enabled
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchMonitoringData, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY': return 'text-green-600 bg-green-100';
      case 'WARNING': return 'text-yellow-600 bg-yellow-100';
      case 'ALERT': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'HIGH': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'MEDIUM': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'LOW': return <CheckCircle className="h-5 w-5 text-blue-500" />;
      default: return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const calculateTrend = () => {
    if (!dashboard) return 0;
    if (dashboard.previous_24h === 0) return 100;
    return ((dashboard.last_24h - dashboard.previous_24h) / dashboard.previous_24h * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading monitoring data...</span>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">Unable to load monitoring data</p>
      </div>
    );
  }

  const trend = calculateTrend();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notification System Monitoring</h2>
          <p className="text-sm text-gray-500">
            Last updated: {new Date(lastRefresh).toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-600">Auto-refresh</span>
          </label>
          <button
            onClick={fetchMonitoringData}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* System Status Banner */}
      <div className={`p-4 rounded-lg border-l-4 ${
        dashboard.system_status === 'HEALTHY' 
          ? 'border-green-500 bg-green-50' 
          : dashboard.system_status === 'WARNING'
          ? 'border-yellow-500 bg-yellow-50'
          : 'border-red-500 bg-red-50'
      }`}>
        <div className="flex items-center">
          <Shield className={`h-6 w-6 mr-3 ${
            dashboard.system_status === 'HEALTHY' ? 'text-green-500' :
            dashboard.system_status === 'WARNING' ? 'text-yellow-500' : 'text-red-500'
          }`} />
          <div>
            <h3 className="font-medium">System Status: {dashboard.system_status}</h3>
            <p className="text-sm opacity-75">
              {dashboard.system_status === 'HEALTHY' 
                ? 'All notification systems operating normally'
                : `${healthChecks.length} issue(s) detected - see health checks below`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Notifications</p>
              <p className="text-3xl font-bold text-gray-900">{dashboard.total_notifications}</p>
            </div>
            <Bell className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Last 24 Hours</p>
              <p className="text-3xl font-bold text-gray-900">{dashboard.last_24h}</p>
              <p className={`text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend >= 0 ? '+' : ''}{trend.toFixed(1)}% vs previous 24h
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-3xl font-bold text-gray-900">{dashboard.success_rate_percentage}%</p>
              <p className="text-sm text-gray-500">
                {dashboard.events_with_errors} errors
              </p>
            </div>
            <CheckCircle className={`h-8 w-8 ${
              parseFloat(dashboard.success_rate_percentage) >= 95 ? 'text-green-500' : 'text-yellow-500'
            }`} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
              <p className="text-3xl font-bold text-gray-900">
                {parseFloat(dashboard.avg_creation_time_seconds).toFixed(3)}s
              </p>
              <p className="text-sm text-gray-500">Database triggers</p>
            </div>
            <Clock className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Health Checks */}
      <div className="bg-white rounded-lg shadow border">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Health Checks
          </h3>
        </div>
        <div className="p-6">
          {healthChecks.length === 0 ? (
            <div className="text-center py-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-gray-600">No issues detected</p>
            </div>
          ) : (
            <div className="space-y-4">
              {healthChecks.map((check, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${getStatusColor(check.status)}`}>
                  <div className="flex items-start">
                    {getSeverityIcon(check.severity)}
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{check.message}</h4>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(check.status)}`}>
                          {check.severity}
                        </span>
                      </div>
                      {check.details && (
                        <pre className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded overflow-x-auto">
                          {JSON.stringify(check.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notification Types Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Notification Types (All Time)
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {Object.entries(dashboard.notification_types).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {type.replace('_', ' ')}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{
                          width: `${(count / dashboard.total_notifications) * 100}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-medium text-gray-900">Activity Rates</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {rates.map((rate, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{rate.time_period}</h4>
                      <p className="text-sm text-gray-600">
                        {rate.primary_types.join(', ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{rate.notification_count}</p>
                      <p className="text-sm text-gray-500">{rate.rate_per_hour}/hr</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationMonitoring; 