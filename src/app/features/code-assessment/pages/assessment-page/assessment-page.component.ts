import { Component } from '@angular/core';
import { Step } from '../../components/progress-steps/progress-steps.component';
import { Metric } from '../../components/metric-card/metric-card.component';
import { MetricResult } from '../../components/result-card/result-card.component';

type ViewStep = 'upload' | 'metrics' | 'results';

@Component({
  selector: 'app-assessment-page',
  templateUrl: './assessment-page.component.html',
  standalone: false
})
export class AssessmentPageComponent {
  currentView: ViewStep = 'upload';
  uploadedFile: File | null = null;
  selectedMetrics = new Set<string>();

  // Steps configuration
  steps: Step[] = [
    { number: 1, label: 'Upload Code', status: 'active' },
    { number: 2, label: 'Choose Metrics', status: 'pending' },
    { number: 3, label: 'Analysis', status: 'pending' },
    { number: 4, label: 'Results', status: 'pending' }
  ];

  // Available metrics
  availableMetrics: Metric[] = [
    {
      id: 'cohesion',
      name: 'Cohesion',
      description: 'Measures how well-grouped the responsibilities of a module are',
      icon: '🎯'
    },
    {
      id: 'coupling',
      name: 'Coupling',
      description: 'Evaluates dependencies between modules',
      icon: '🔗'
    },
    {
      id: 'solid',
      name: 'SOLID Principles',
      description: 'Validates compliance with SOLID design principles',
      icon: '⚡'
    },
    {
      id: 'complexity',
      name: 'Complexity',
      description: 'Analyzes cyclomatic complexity of your code',
      icon: '📊'
    },
    {
      id: 'duplication',
      name: 'Code Duplication',
      description: 'Detects duplicate code blocks across your project',
      icon: '📋'
    },
    {
      id: 'naming',
      name: 'Naming Conventions',
      description: 'Verifies that naming follows best practices',
      icon: '✍️'
    }
  ];

  // Mock results
  results: MetricResult[] = [];

  // Project info for results
  projectInfo = {
    name: 'my-ml-project.zip',
    size: '2.4 MB',
    files: 45,
    date: new Date().toLocaleDateString()
  };

  onFileSelected(file: File): void {
    this.uploadedFile = file;
    this.projectInfo.name = file.name;
    this.projectInfo.size = this.formatFileSize(file.size);
    setTimeout(() => this.goToMetrics(), 500);
  }

  onMetricToggle(metricId: string): void {
    if (this.selectedMetrics.has(metricId)) {
      this.selectedMetrics.delete(metricId);
    } else {
      this.selectedMetrics.add(metricId);
    }
  }

  isMetricSelected(metricId: string): boolean {
    return this.selectedMetrics.has(metricId);
  }

  selectAllMetrics(): void {
    this.availableMetrics.forEach(metric => this.selectedMetrics.add(metric.id));
  }

  canRunAnalysis(): boolean {
    return this.selectedMetrics.size > 0;
  }

  goToMetrics(): void {
    this.currentView = 'metrics';
    this.updateSteps(1);
  }

  runAnalysis(): void {
    if (!this.canRunAnalysis()) return;
    
    // Simulate analysis
    this.currentView = 'results';
    this.updateSteps(3);
    this.generateMockResults();
  }

  goBack(): void {
    if (this.currentView === 'metrics') {
      this.currentView = 'upload';
      this.updateSteps(0);
    } else if (this.currentView === 'results') {
      this.currentView = 'metrics';
      this.updateSteps(1);
    }
  }

  private updateSteps(activeIndex: number): void {
    this.steps = this.steps.map((step, index) => ({
      ...step,
      status: index < activeIndex ? 'completed' : index === activeIndex ? 'active' : 'pending'
    }));
  }

  private generateMockResults(): void {
    const mockData: Record<string, Omit<MetricResult, 'id' | 'name'>> = {
      cohesion: { score: 85, status: 'Excellent', message: 'Your modules are well-organized with high internal cohesion', color: 'green' },
      coupling: { score: 72, status: 'Good', message: 'Some unnecessary dependencies between modules that could be simplified', color: 'yellow' },
      solid: { score: 68, status: 'Needs Improvement', message: 'Several classes violate the single responsibility principle', color: 'orange' },
      complexity: { score: 80, status: 'Very Good', message: 'Most functions are simple and easy to understand', color: 'green' },
      duplication: { score: 65, status: 'Attention', message: 'Found duplicated code in 3 files, can be refactored', color: 'orange' },
      naming: { score: 90, status: 'Excellent', message: 'Variable and function names are clear and descriptive', color: 'green' }
    };

    this.results = Array.from(this.selectedMetrics).map(metricId => {
      const metric = this.availableMetrics.find(m => m.id === metricId)!;
      const data = mockData[metricId];
      return {
        id: metricId,
        name: metric.name,
        ...data
      };
    });
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  get overallScore(): number {
    if (this.results.length === 0) return 0;
    return Math.round(this.results.reduce((sum, r) => sum + r.score, 0) / this.results.length);
  }

  get analyzedMetricsList(): { icon: string; label: string; value: string }[] {
    return Array.from(this.selectedMetrics).map(metricId => {
      const metric = this.availableMetrics.find(m => m.id === metricId)!;
      return {
        icon: '✓',
        label: metric.name,
        value: ''
      };
    });
  }
}
