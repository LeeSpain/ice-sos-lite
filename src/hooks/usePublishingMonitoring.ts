import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { errorReporter } from '@/utils/errorReporting';

export interface PublishingMetrics {
  totalPublished: number;
  successRate: number;
  avgProcessingTime: number;
  failureRate: number;
  platformBreakdown: Record<string, { success: number; failed: number; avgTime: number }>;
  recentActivity: PublishingActivity[];
  systemHealth: 'healthy' | 'degraded' | 'critical';
}

export interface PublishingActivity {
  id: string;
  content_id: string;
  platform: string;
  status: 'pending' | 'processing' | 'published' | 'failed' | 'retrying';
  created_at: string;
  processed_at?: string;
  error_message?: string;
  processing_time_ms?: number;
  retry_count: number;
}

export interface QualityTrend {
  date: string;
  avgScore: number;
  totalContent: number;
  passedValidation: number;
  topIssues: Array<{ issue: string; count: number }>;
}

export function usePublishingMonitoring() {
  const [metrics, setMetrics] = useState<PublishingMetrics | null>(null);
  const [qualityTrends, setQualityTrends] = useState<QualityTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      // Fetch publishing metrics from the last 7 days
      const { data: activities, error: activitiesError } = await supabase
        .from('publishing_queue')
        .select('*')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (activitiesError) throw activitiesError;

      // Calculate metrics
      const totalPublished = activities?.length || 0;
      const successful = activities?.filter(a => a.status === 'published') || [];
      const failed = activities?.filter(a => a.status === 'failed') || [];
      
      const successRate = totalPublished > 0 ? (successful.length / totalPublished) * 100 : 0;
      const failureRate = totalPublished > 0 ? (failed.length / totalPublished) * 100 : 0;

      // Calculate average processing time
      const processingTimes = successful
        .filter(a => a.processing_time_ms)
        .map(a => a.processing_time_ms);
      const avgProcessingTime = processingTimes.length > 0 
        ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length 
        : 0;

      // Platform breakdown
      const platformBreakdown: Record<string, { success: number; failed: number; avgTime: number }> = {};
      
      activities?.forEach(activity => {
        if (!platformBreakdown[activity.platform]) {
          platformBreakdown[activity.platform] = { success: 0, failed: 0, avgTime: 0 };
        }
        
        if (activity.status === 'published') {
          platformBreakdown[activity.platform].success++;
          if (activity.processing_time_ms) {
            platformBreakdown[activity.platform].avgTime += activity.processing_time_ms;
          }
        } else if (activity.status === 'failed') {
          platformBreakdown[activity.platform].failed++;
        }
      });

      // Calculate average times for each platform
      Object.keys(platformBreakdown).forEach(platform => {
        const successCount = platformBreakdown[platform].success;
        if (successCount > 0) {
          platformBreakdown[platform].avgTime /= successCount;
        }
      });

      // Determine system health
      let systemHealth: 'healthy' | 'degraded' | 'critical' = 'healthy';
      if (successRate < 50) {
        systemHealth = 'critical';
      } else if (successRate < 80 || avgProcessingTime > 30000) {
        systemHealth = 'degraded';
      }

      // Recent activity (last 20 items)
      const recentActivity = activities?.slice(0, 20) || [];

      setMetrics({
        totalPublished,
        successRate,
        avgProcessingTime,
        failureRate,
        platformBreakdown,
        recentActivity,
        systemHealth
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch metrics';
      setError(errorMessage);
      errorReporter.reportError(err as Error, { context: 'publishing_monitoring' });
    }
  }, []);

  const fetchQualityTrends = useCallback(async () => {
    try {
      // Fetch content quality data for the last 30 days
      const { data: contentData, error: contentError } = await supabase
        .from('generated_content')
        .select('created_at, quality_score, validation_passed, quality_issues')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true });

      if (contentError) throw contentError;

      // Group by date and calculate trends
      const trendMap = new Map<string, {
        scores: number[];
        total: number;
        passed: number;
        issues: string[];
      }>();

      contentData?.forEach(item => {
        const date = new Date(item.created_at).toISOString().split('T')[0];
        
        if (!trendMap.has(date)) {
          trendMap.set(date, { scores: [], total: 0, passed: 0, issues: [] });
        }
        
        const dayData = trendMap.get(date)!;
        dayData.total++;
        
        if (item.quality_score) {
          dayData.scores.push(item.quality_score);
        }
        
        if (item.validation_passed) {
          dayData.passed++;
        }
        
        if (item.quality_issues) {
          try {
            const issues = JSON.parse(item.quality_issues);
            issues.forEach((issue: any) => dayData.issues.push(issue.message));
          } catch (e) {
            // Handle parsing errors silently
          }
        }
      });

      // Convert to array format
      const trends: QualityTrend[] = Array.from(trendMap.entries()).map(([date, data]) => {
        const avgScore = data.scores.length > 0 
          ? data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length 
          : 0;

        // Count issue frequency
        const issueCount = new Map<string, number>();
        data.issues.forEach(issue => {
          issueCount.set(issue, (issueCount.get(issue) || 0) + 1);
        });

        const topIssues = Array.from(issueCount.entries())
          .map(([issue, count]) => ({ issue, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        return {
          date,
          avgScore,
          totalContent: data.total,
          passedValidation: data.passed,
          topIssues
        };
      });

      setQualityTrends(trends);

    } catch (err) {
      errorReporter.reportError(err as Error, { context: 'quality_trends' });
    }
  }, []);

  const retryFailedPublishing = useCallback(async (activityId: string) => {
    try {
      const { error } = await supabase
        .from('publishing_queue')
        .update({ 
          status: 'pending',
          retry_count: supabase.sql`retry_count + 1`,
          error_message: null
        })
        .eq('id', activityId);

      if (error) throw error;

      // Refresh metrics
      await fetchMetrics();
      
      return { success: true };
    } catch (err) {
      errorReporter.reportError(err as Error, { context: 'retry_publishing', activityId });
      return { success: false, error: err instanceof Error ? err.message : 'Retry failed' };
    }
  }, [fetchMetrics]);

  const clearFailedItems = useCallback(async () => {
    try {
      const { error } = await supabase
        .from('publishing_queue')
        .delete()
        .eq('status', 'failed')
        .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Older than 24 hours

      if (error) throw error;

      await fetchMetrics();
      return { success: true };
    } catch (err) {
      errorReporter.reportError(err as Error, { context: 'clear_failed_items' });
      return { success: false, error: err instanceof Error ? err.message : 'Clear failed' };
    }
  }, [fetchMetrics]);

  const getHealthRecommendations = useCallback(() => {
    if (!metrics) return [];

    const recommendations: string[] = [];

    if (metrics.successRate < 80) {
      recommendations.push('Success rate is below 80%. Check API credentials and network connectivity.');
    }

    if (metrics.avgProcessingTime > 20000) {
      recommendations.push('Average processing time is high. Consider optimizing content processing.');
    }

    if (metrics.failureRate > 20) {
      recommendations.push('High failure rate detected. Review error logs and retry mechanisms.');
    }

    Object.entries(metrics.platformBreakdown).forEach(([platform, data]) => {
      const platformSuccessRate = data.success / (data.success + data.failed) * 100;
      if (platformSuccessRate < 70) {
        recommendations.push(`${platform} has low success rate (${platformSuccessRate.toFixed(1)}%). Check platform-specific issues.`);
      }
    });

    if (recommendations.length === 0) {
      recommendations.push('System is operating within normal parameters.');
    }

    return recommendations;
  }, [metrics]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchMetrics(), fetchQualityTrends()]);
      setIsLoading(false);
    };

    loadData();

    // Set up real-time updates
    const metricsInterval = setInterval(fetchMetrics, 60000); // Every minute
    const trendsInterval = setInterval(fetchQualityTrends, 300000); // Every 5 minutes

    return () => {
      clearInterval(metricsInterval);
      clearInterval(trendsInterval);
    };
  }, [fetchMetrics, fetchQualityTrends]);

  return {
    metrics,
    qualityTrends,
    isLoading,
    error,
    retryFailedPublishing,
    clearFailedItems,
    getHealthRecommendations,
    refreshMetrics: fetchMetrics,
    refreshTrends: fetchQualityTrends
  };
}