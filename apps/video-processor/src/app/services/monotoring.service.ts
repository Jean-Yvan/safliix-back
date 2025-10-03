// services/monitoring.service.ts
import { Injectable } from '@nestjs/common';
import { FileLogger } from '../utils/logger';

export interface JobMetrics {
  jobId: string;
  segmentIndex: number;
  totalSegments: number;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  resolutions: string[];
  success: boolean;
  error?: string;
  fileSizes: { [resolution: string]: number };
  encodingTimes: { [resolution: string]: number };
}

@Injectable()
export class MonitoringService {
  private readonly logger = new FileLogger('MonitoringService');
  private readonly metrics: Map<string, JobMetrics> = new Map();

  startJobTracking(jobData: {
    jobId: string;
    segmentIndex: number;
    totalSegments: number;
    resolutions: string[];
    userId: string;
    originalFile: string;
  }): void {
    const metrics: JobMetrics = {
      ...jobData,
      startTime: new Date(),
      success: false,
      fileSizes: {},
      encodingTimes: {},
    };

    this.metrics.set(jobData.jobId, metrics);

    this.logger.log('Job started', {
      jobId: jobData.jobId,
      segment: `${jobData.segmentIndex + 1}/${jobData.totalSegments}`,
      resolutions: jobData.resolutions,
      user: jobData.userId,
      file: jobData.originalFile,
    });
  }

  updateJobProgress(jobId: string, progress: {
    stage: string;
    progress: number;
    currentResolution?: string;
  }): void {
    this.logger.debug('Job progress', {
      jobId,
      stage: progress.stage,
      progress: progress.progress,
      currentResolution: progress.currentResolution,
    });
  }

  recordJobSuccess(jobId: string, result: {
    outputFiles: Array<{ resolution: string; fileSize: number; encodingTime: number }>;
    totalEncodingTime: number;
  }): void {
    const metrics = this.metrics.get(jobId);
    if (!metrics) return;

    metrics.endTime = new Date();
    metrics.duration = result.totalEncodingTime;
    metrics.success = true;

    result.outputFiles.forEach(file => {
      metrics.fileSizes[file.resolution] = file.fileSize;
      metrics.encodingTimes[file.resolution] = file.encodingTime;
    });

    this.logger.log('Job completed successfully', {
      jobId,
      segment: `${metrics.segmentIndex + 1}/${metrics.totalSegments}`,
      totalTime: metrics.duration,
      fileSizes: metrics.fileSizes,
      encodingTimes: metrics.encodingTimes,
    });

    this.emitMetrics(metrics);
  }

  recordJobFailure(jobId: string, error: Error): void {
    const metrics = this.metrics.get(jobId);
    if (!metrics) return;

    metrics.endTime = new Date();
    metrics.duration = metrics.endTime.getTime() - metrics.startTime.getTime();
    metrics.success = false;
    metrics.error = error.message;

    this.logger.error('Job failed', error, {
      jobId,
      segment: `${metrics.segmentIndex + 1}/${metrics.totalSegments}`,
      duration: metrics.duration,
    });

    this.emitMetrics(metrics);
  }

  private emitMetrics(metrics: JobMetrics): void {
    this.logger.log('Job metrics', {
      jobId: metrics.jobId,
      success: metrics.success,
      totalDuration: metrics.duration,
      segmentIndex: metrics.segmentIndex,
      fileSizes: metrics.fileSizes,
      encodingTimes: metrics.encodingTimes,
    });
  }

  getGlobalStats() {
    const allMetrics = Array.from(this.metrics.values());
    const completed = allMetrics.filter(m => m.endTime);
    const successful = completed.filter(m => m.success);
    const failed = completed.filter(m => !m.success);

    this.logger.log('Global stats', {
      totalJobs: allMetrics.length,
      completedJobs: completed.length,
      successfulJobs: successful.length,
      failedJobs: failed.length,
      successRate: completed.length > 0 ? (successful.length / completed.length) * 100 : 0,
    });

    return {
      totalJobs: allMetrics.length,
      completedJobs: completed.length,
      successfulJobs: successful.length,
      failedJobs: failed.length,
      successRate: completed.length > 0 ? (successful.length / completed.length) * 100 : 0,
    };
  }
}