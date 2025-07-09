import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  TestTube,
  Zap,
  Shield,
  BarChart3,
  FileCheck,
  Loader
} from 'lucide-react';

interface TestResult {
  test_category: string;
  test_name: string;
  status: 'passed' | 'failed' | 'error';
  execution_time_ms: string;
  details: any;
}

interface TestScenario {
  id: string;
  test_name: string;
  test_type: string;
  description: string;
  expected_outcome: any;
  test_data: any;
  is_enabled: boolean;
  created_at: string;
}

const NotificationTesting: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testScenarios, setTestScenarios] = useState<TestScenario[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRunTime, setLastRunTime] = useState<Date | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const fetchTestScenarios = async () => {
    try {
      const { data } = await supabase
        .from('notification_test_scenarios')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) {
        setTestScenarios(data);
      }
    } catch (error) {
      console.error('Error fetching test scenarios:', error);
    }
  };

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      const { data, error } = await supabase.rpc('run_notification_system_tests');
      
      if (error) {
        console.error('Test execution error:', error);
        return;
      }
      
      if (data) {
        setTestResults(data);
        setLastRunTime(new Date());
      }
    } catch (error) {
      console.error('Error running tests:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runPerformanceTest = async () => {
    setIsRunning(true);
    
    try {
      const { data, error } = await supabase.rpc('test_notification_performance', { test_iterations: 100 });
      
      if (error) {
        console.error('Performance test error:', error);
        return;
      }
      
      if (data) {
        const performanceResults: TestResult[] = data.map((result: any) => ({
          test_category: 'Performance',
          test_name: result.metric_name,
          status: result.success_rate >= 95 ? 'passed' : 'failed',
          execution_time_ms: result.avg_time_ms,
          details: result
        }));
        
        setTestResults(performanceResults);
        setLastRunTime(new Date());
      }
    } catch (error) {
      console.error('Error running performance test:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runAuditValidation = async () => {
    setIsRunning(true);
    
    try {
      const { data, error } = await supabase.rpc('validate_notification_audit_integrity');
      
      if (error) {
        console.error('Audit validation error:', error);
        return;
      }
      
      if (data) {
        const auditResults: TestResult[] = data.map((result: any) => ({
          test_category: 'Audit Validation',
          test_name: result.validation_name,
          status: result.status,
          execution_time_ms: '0',
          details: result
        }));
        
        setTestResults(auditResults);
        setLastRunTime(new Date());
      }
    } catch (error) {
      console.error('Error running audit validation:', error);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    fetchTestScenarios();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'error': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'error': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Trigger Tests': return <Zap className="h-4 w-4" />;
      case 'Performance Tests': case 'Performance': return <BarChart3 className="h-4 w-4" />;
      case 'Audit Validation': return <Shield className="h-4 w-4" />;
      default: return <TestTube className="h-4 w-4" />;
    }
  };

  const filteredResults = selectedCategory === 'all' 
    ? testResults 
    : testResults.filter(result => result.test_category === selectedCategory);

  const categories = Array.from(new Set(testResults.map(result => result.test_category)));

  const getOverallStatus = () => {
    if (testResults.length === 0) return 'No tests run';
    const passed = testResults.filter(r => r.status === 'passed').length;
    const total = testResults.length;
    return `${passed}/${total} tests passed`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Notification System Testing</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            {lastRunTime 
              ? `Last run: ${lastRunTime.toLocaleString()}`
              : 'No tests run yet'
            }
          </p>
        </div>
        <div className="flex items-center">
          <span className="text-xs sm:text-sm font-medium text-gray-700">
            {getOverallStatus()}
          </span>
        </div>
      </div>

      {/* Test Controls */}
      <div className="bg-white rounded-lg shadow border p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4 flex items-center">
          <TestTube className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          Test Controls
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <button
            onClick={runTests}
            disabled={isRunning}
            className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isRunning ? <Loader className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            <span>Run All Tests</span>
          </button>
          
          <button
            onClick={runPerformanceTest}
            disabled={isRunning}
            className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Performance Test</span>
          </button>
          
          <button
            onClick={runAuditValidation}
            disabled={isRunning}
            className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <Shield className="h-4 w-4" />
            <span>Audit Validation</span>
          </button>
          
          <button
            onClick={fetchTestScenarios}
            disabled={isRunning}
            className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="bg-white rounded-lg shadow border">
          <div className="px-4 sm:px-6 py-4 border-b">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 flex items-center">
                <FileCheck className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Test Results
              </h3>
              <div className="flex items-center">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="rounded border-gray-300 text-xs sm:text-sm w-full sm:w-auto"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-4">
              {filteredResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-2">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      {getCategoryIcon(result.test_category)}
                      <span className="text-xs sm:text-sm text-gray-500 truncate">{result.test_category}</span>
                      <span className="font-medium text-gray-900 text-sm sm:text-base truncate">{result.test_name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs sm:text-sm text-gray-500">
                        {parseFloat(result.execution_time_ms).toFixed(2)}ms
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(result.status)}`}>
                        {result.status.toUpperCase()}
                      </span>
                      {getStatusIcon(result.status)}
                    </div>
                  </div>
                  
                  {result.details && (
                    <div className="mt-3">
                      <details className="group">
                        <summary className="cursor-pointer text-xs sm:text-sm text-blue-600 hover:text-blue-800">
                          View Details
                        </summary>
                        <div className="mt-2 p-3 bg-gray-50 rounded text-xs sm:text-sm">
                          <pre className="whitespace-pre-wrap text-xs overflow-x-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Test Scenarios */}
      {testScenarios.length > 0 && (
        <div className="bg-white rounded-lg shadow border">
          <div className="px-4 sm:px-6 py-4 border-b">
            <h3 className="text-base sm:text-lg font-medium text-gray-900">Predefined Test Scenarios</h3>
          </div>
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {testScenarios.map((scenario) => (
                <div key={scenario.id} className="border rounded-lg p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{scenario.test_name}</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
                      scenario.is_enabled ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
                    }`}>
                      {scenario.is_enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2">{scenario.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 capitalize">{scenario.test_type}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(scenario.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isRunning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 flex items-center space-x-4">
            <Loader className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-blue-600" />
            <span className="text-gray-900 text-sm sm:text-base">Running tests...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationTesting; 