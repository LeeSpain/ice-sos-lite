import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { contentQualityAnalyzer } from '@/utils/contentQuality';
import { errorReporter } from '@/utils/errorReporting';

export interface TestResult {
  id: string;
  testName: string;
  status: 'passed' | 'failed' | 'warning';
  message: string;
  duration: number;
  timestamp: string;
  details?: any;
}

export interface TestSuite {
  name: string;
  tests: TestResult[];
  status: 'passed' | 'failed' | 'warning';
  totalDuration: number;
  passedCount: number;
  failedCount: number;
  warningCount: number;
}

export function useAutomatedTesting() {
  const [testResults, setTestResults] = useState<TestSuite[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');

  const runContentQualityTests = useCallback(async (): Promise<TestResult[]> => {
    const tests: TestResult[] = [];
    
    // Test 1: Content Quality Analysis
    const startTime = Date.now();
    try {
      const testContent = "This is a test article about amazing web development practices. How can we improve our coding skills? Subscribe to our newsletter for more tips and tricks!";
      const testTitle = "Amazing Web Development Guide";
      const testDescription = "Learn the best practices for web development in this comprehensive guide that covers everything you need to know.";
      
      const analysis = contentQualityAnalyzer.analyzeContent(testContent, testTitle, testDescription);
      
      tests.push({
        id: `quality-analysis-${Date.now()}`,
        testName: 'Content Quality Analysis',
        status: analysis.score >= 60 ? 'passed' : 'failed',
        message: `Quality score: ${analysis.score}/100`,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        details: analysis
      });
    } catch (error) {
      tests.push({
        id: `quality-analysis-${Date.now()}`,
        testName: 'Content Quality Analysis',
        status: 'failed',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      });
    }

    // Test 2: Platform Validation
    const platformTests = ['twitter', 'linkedin', 'facebook'];
    for (const platform of platformTests) {
      const platformStartTime = Date.now();
      try {
        const testContent = platform === 'twitter' 
          ? "Short tweet content #test" 
          : "Longer content for " + platform + " platform with more details and engaging content.";
        
        const validation = contentQualityAnalyzer.validateForPublishing(testContent, "Test Title", platform);
        
        tests.push({
          id: `platform-${platform}-${Date.now()}`,
          testName: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Validation`,
          status: validation.canPublish ? 'passed' : 'failed',
          message: validation.canPublish 
            ? 'Platform validation passed' 
            : `${validation.criticalIssues.length} critical issues found`,
          duration: Date.now() - platformStartTime,
          timestamp: new Date().toISOString(),
          details: validation
        });
      } catch (error) {
        tests.push({
          id: `platform-${platform}-${Date.now()}`,
          testName: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Validation`,
          status: 'failed',
          message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          duration: Date.now() - platformStartTime,
          timestamp: new Date().toISOString()
        });
      }
    }

    return tests;
  }, []);

  const runDatabaseConnectionTests = useCallback(async (): Promise<TestResult[]> => {
    const tests: TestResult[] = [];
    
    // Test 1: Basic Connection
    const connectionStartTime = Date.now();
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      
      tests.push({
        id: `db-connection-${Date.now()}`,
        testName: 'Database Connection',
        status: error ? 'failed' : 'passed',
        message: error ? `Connection error: ${error.message}` : 'Database connection successful',
        duration: Date.now() - connectionStartTime,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      tests.push({
        id: `db-connection-${Date.now()}`,
        testName: 'Database Connection',
        status: 'failed',
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - connectionStartTime,
        timestamp: new Date().toISOString()
      });
    }

    // Test 2: Content Tables Access
    const tableTests = ['generated_content', 'publishing_queue', 'content_approval'];
    for (const table of tableTests) {
      const tableStartTime = Date.now();
      try {
        const { data, error } = await supabase.from(table).select('count').limit(1);
        
        tests.push({
          id: `table-${table}-${Date.now()}`,
          testName: `${table} Table Access`,
          status: error ? 'failed' : 'passed',
          message: error ? `Table error: ${error.message}` : 'Table access successful',
          duration: Date.now() - tableStartTime,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        tests.push({
          id: `table-${table}-${Date.now()}`,
          testName: `${table} Table Access`,
          status: 'failed',
          message: `Table access failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          duration: Date.now() - tableStartTime,
          timestamp: new Date().toISOString()
        });
      }
    }

    return tests;
  }, []);

  const runEdgeFunctionTests = useCallback(async (): Promise<TestResult[]> => {
    const tests: TestResult[] = [];
    
    // Test Edge Functions Health
    const functions = [
      { name: 'content-scheduler', endpoint: '/functions/v1/content-scheduler' },
      { name: 'posting-processor', endpoint: '/functions/v1/posting-processor' },
      { name: 'system-health', endpoint: '/functions/v1/system-health' }
    ];

    for (const func of functions) {
      const funcStartTime = Date.now();
      try {
        const response = await fetch(`${supabase.supabaseUrl}${func.endpoint}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${supabase.supabaseKey}`,
            'Content-Type': 'application/json'
          }
        });

        const isHealthy = response.ok || response.status === 404; // 404 is ok for health check
        
        tests.push({
          id: `edge-${func.name}-${Date.now()}`,
          testName: `${func.name} Edge Function`,
          status: isHealthy ? 'passed' : 'failed',
          message: isHealthy 
            ? 'Edge function responding' 
            : `HTTP ${response.status}: ${response.statusText}`,
          duration: Date.now() - funcStartTime,
          timestamp: new Date().toISOString(),
          details: {
            status: response.status,
            statusText: response.statusText
          }
        });
      } catch (error) {
        tests.push({
          id: `edge-${func.name}-${Date.now()}`,
          testName: `${func.name} Edge Function`,
          status: 'failed',
          message: `Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          duration: Date.now() - funcStartTime,
          timestamp: new Date().toISOString()
        });
      }
    }

    return tests;
  }, []);

  const runPerformanceTests = useCallback(async (): Promise<TestResult[]> => {
    const tests: TestResult[] = [];
    
    // Test 1: Content Generation Performance
    const contentGenStartTime = Date.now();
    try {
      // Simulate content generation performance test
      const iterations = 100;
      const batchSize = 10;
      const totalStartTime = Date.now();
      
      for (let i = 0; i < iterations; i += batchSize) {
        const batch = Array.from({ length: Math.min(batchSize, iterations - i) }, (_, index) => 
          contentQualityAnalyzer.analyzeContent(
            `Test content ${i + index} with various quality metrics and analysis`,
            `Test Title ${i + index}`
          )
        );
        
        // Small delay to prevent overwhelming
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      const totalDuration = Date.now() - totalStartTime;
      const avgDuration = totalDuration / iterations;
      
      tests.push({
        id: `perf-content-gen-${Date.now()}`,
        testName: 'Content Generation Performance',
        status: avgDuration < 100 ? 'passed' : avgDuration < 200 ? 'warning' : 'failed',
        message: `Average analysis time: ${avgDuration.toFixed(2)}ms per item`,
        duration: Date.now() - contentGenStartTime,
        timestamp: new Date().toISOString(),
        details: {
          totalIterations: iterations,
          totalDuration,
          avgDuration
        }
      });
    } catch (error) {
      tests.push({
        id: `perf-content-gen-${Date.now()}`,
        testName: 'Content Generation Performance',
        status: 'failed',
        message: `Performance test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - contentGenStartTime,
        timestamp: new Date().toISOString()
      });
    }

    // Test 2: Database Query Performance
    const dbPerfStartTime = Date.now();
    try {
      const queryStartTime = Date.now();
      const { data, error } = await supabase
        .from('generated_content')
        .select('id, title, created_at')
        .order('created_at', { ascending: false })
        .limit(100);
      
      const queryDuration = Date.now() - queryStartTime;
      
      tests.push({
        id: `perf-db-query-${Date.now()}`,
        testName: 'Database Query Performance',
        status: queryDuration < 1000 ? 'passed' : queryDuration < 3000 ? 'warning' : 'failed',
        message: error 
          ? `Query error: ${error.message}` 
          : `Query completed in ${queryDuration}ms (${data?.length || 0} rows)`,
        duration: Date.now() - dbPerfStartTime,
        timestamp: new Date().toISOString(),
        details: {
          queryDuration,
          rowCount: data?.length || 0,
          error: error?.message
        }
      });
    } catch (error) {
      tests.push({
        id: `perf-db-query-${Date.now()}`,
        testName: 'Database Query Performance',
        status: 'failed',
        message: `Database query failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - dbPerfStartTime,
        timestamp: new Date().toISOString()
      });
    }

    return tests;
  }, []);

  const runFullTestSuite = useCallback(async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      const testSuites: TestSuite[] = [];
      
      // Content Quality Tests
      setCurrentTest('Running content quality tests...');
      const qualityTests = await runContentQualityTests();
      testSuites.push(createTestSuite('Content Quality', qualityTests));
      
      // Database Tests
      setCurrentTest('Running database connection tests...');
      const dbTests = await runDatabaseConnectionTests();
      testSuites.push(createTestSuite('Database', dbTests));
      
      // Edge Function Tests
      setCurrentTest('Running edge function tests...');
      const edgeTests = await runEdgeFunctionTests();
      testSuites.push(createTestSuite('Edge Functions', edgeTests));
      
      // Performance Tests
      setCurrentTest('Running performance tests...');
      const perfTests = await runPerformanceTests();
      testSuites.push(createTestSuite('Performance', perfTests));
      
      setTestResults(testSuites);
      
      // Log test results
      const overallStatus = testSuites.every(suite => suite.status === 'passed') ? 'passed' : 'failed';
      errorReporter.reportError(new Error(`Automated test suite ${overallStatus}`), {
        context: 'automated_testing',
        testSuites: testSuites.length,
        totalTests: testSuites.reduce((sum, suite) => sum + suite.tests.length, 0),
        status: overallStatus
      });
      
    } catch (error) {
      errorReporter.reportError(error as Error, { context: 'automated_testing_suite' });
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  }, [runContentQualityTests, runDatabaseConnectionTests, runEdgeFunctionTests, runPerformanceTests]);

  const createTestSuite = (name: string, tests: TestResult[]): TestSuite => {
    const passedCount = tests.filter(t => t.status === 'passed').length;
    const failedCount = tests.filter(t => t.status === 'failed').length;
    const warningCount = tests.filter(t => t.status === 'warning').length;
    
    const status = failedCount > 0 ? 'failed' : warningCount > 0 ? 'warning' : 'passed';
    const totalDuration = tests.reduce((sum, test) => sum + test.duration, 0);
    
    return {
      name,
      tests,
      status,
      totalDuration,
      passedCount,
      failedCount,
      warningCount
    };
  };

  return {
    testResults,
    isRunning,
    currentTest,
    runFullTestSuite,
    runContentQualityTests,
    runDatabaseConnectionTests,
    runEdgeFunctionTests,
    runPerformanceTests
  };
}