import { Injectable } from '@angular/core';
import { MetricType, MetricCategory, MetricUIConfig, QualityLevel } from '../models/base-metric.model';

/**
 * Servicio para registrar y gestionar métricas disponibles
 * Facilita la adición de nuevas métricas sin modificar componentes existentes
 */
@Injectable({
  providedIn: 'root'
})
export class MetricRegistryService {
  
  private metrics: Map<string, MetricUIConfig> = new Map();
  
  constructor() {
    this.registerDefaultMetrics();
  }
  
  /**
   * Registra las métricas por defecto (FPC, PFP)
   */
  private registerDefaultMetrics(): void {
    // FPC - File Pipeline Cohesion
    this.registerMetric({
      id: 'FPC',
      name: 'File Pipeline Cohesion',
      shortName: 'FPC',
      icon: 'file',
      color: '#3b82f6', // blue-500
      description: 'Measures how focused a file is on a single pipeline stage',
      type: MetricType.FILE_LEVEL,
      category: MetricCategory.COHESION
    });
    
    // PFP - Package Functional Purity
    this.registerMetric({
      id: 'PFP',
      name: 'Package Functional Purity',
      shortName: 'PFP',
      icon: 'folder',
      color: '#a855f7', // purple-500
      description: 'Measures package focus on specific ML pipeline function',
      type: MetricType.PACKAGE_LEVEL,
      category: MetricCategory.PURITY
    });
  }
  
  /**
   * Registra una nueva métrica en el sistema
   */
  registerMetric(config: MetricUIConfig): void {
    this.metrics.set(config.id, config);
  }
  
  /**
   * Obtiene la configuración de una métrica por su ID
   */
  getMetric(id: string): MetricUIConfig | undefined {
    return this.metrics.get(id);
  }
  
  /**
   * Obtiene todas las métricas registradas
   */
  getAllMetrics(): MetricUIConfig[] {
    return Array.from(this.metrics.values());
  }
  
  /**
   * Obtiene métricas filtradas por tipo
   */
  getMetricsByType(type: MetricType): MetricUIConfig[] {
    return this.getAllMetrics().filter(m => m.type === type);
  }
  
  /**
   * Obtiene métricas filtradas por categoría
   */
  getMetricsByCategory(category: MetricCategory): MetricUIConfig[] {
    return this.getAllMetrics().filter(m => m.category === category);
  }
  
  /**
   * Determina el color según el nivel de calidad
   */
  getColorByQualityLevel(level: QualityLevel | string): string {
    const normalizedLevel = level.toLowerCase();
    
    switch(normalizedLevel) {
      case 'high':
        return 'green';
      case 'moderate':
      case 'medium':
        return 'yellow';
      case 'low':
      case 'very low':
        return 'red';
      default:
        return 'gray';
    }
  }
  
  /**
   * Obtiene las clases CSS de Tailwind para un color
   */
  getTailwindColorClasses(color: string): { bg: string; text: string; border: string } {
    const colorMap: { [key: string]: { bg: string; text: string; border: string } } = {
      'green': {
        bg: 'bg-green-500',
        text: 'text-white',
        border: 'border-green-500'
      },
      'yellow': {
        bg: 'bg-yellow-500',
        text: 'text-black',
        border: 'border-yellow-500'
      },
      'red': {
        bg: 'bg-red-500',
        text: 'text-white',
        border: 'border-red-500'
      },
      'blue': {
        bg: 'bg-blue-500',
        text: 'text-white',
        border: 'border-blue-500'
      },
      'purple': {
        bg: 'bg-purple-500',
        text: 'text-white',
        border: 'border-purple-500'
      },
      'gray': {
        bg: 'bg-gray-500',
        text: 'text-white',
        border: 'border-gray-500'
      }
    };
    
    return colorMap[color] || colorMap['gray'];
  }
}
