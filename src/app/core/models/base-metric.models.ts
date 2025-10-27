/**
 * Modelos base para el sistema de métricas
 * Define la estructura común para todas las métricas de análisis de código
 */

/**
 * Tipo de métrica según el nivel de análisis
 */
export enum MetricType {
  FILE_LEVEL = 'file',           // Métricas a nivel de archivo/módulo (ej: FPC)
  PACKAGE_LEVEL = 'pkg',         // Métricas a nivel de paquete/directorio (ej: PFP)
  PROJECT_LEVEL = 'project'      // Métricas a nivel de proyecto completo
}

/**
 * Categoría de la métrica según lo que mide
 */
export enum MetricCategory {
  COHESION = 'cohesion',           // Cohesión del código
  PURITY = 'purity',               // Pureza funcional
  COMPLEXITY = 'complexity',       // Complejidad ciclomática
  COUPLING = 'coupling',           // Acoplamiento entre módulos
  MAINTAINABILITY = 'maintainability', // Mantenibilidad
  QUALITY = 'quality',             // Calidad general
  PERFORMANCE = 'performance',     // Rendimiento
  SECURITY = 'security'            // Seguridad
}

/**
 * Nivel de calidad genérico para todas las métricas
 */
export type QualityLevel = 'High' | 'Moderate' | 'Low' | 'Very Low';

/**
 * Información de documentación de la métrica
 */
export interface MetricDocumentation {
  metric_id: string;
  name: string;
  description: string;
  category: string;
  formula?: string;
  interpretation?: { [key: string]: string };
  ideal_range?: {
    min: number;
    max: number;
    optimal?: string;
    acceptable?: string;
    warning?: string;
  };
  references?: string[];
}

/**
 * Interfaz base para todas las métricas
 * Todas las métricas específicas (FPC, PFP, etc) deben extender esta interfaz
 */
export interface BaseMetricResult {
  analyzer_id: string;
  metric_type: MetricType;
  metric_category: MetricCategory;
  score: number;
  timestamp: string;
  documentation: MetricDocumentation;
  module_count?: number;
  message_count?: { [key: string]: number };
}

/**
 * Detalle de métrica para un nodo específico (archivo o paquete)
 */
export interface MetricNodeDetails {
  path: string;
  quality_level: QualityLevel;
  score: number;
  [key: string]: any; // Propiedades específicas de cada métrica
}

/**
 * Configuración visual de una métrica (para el UI)
 */
export interface MetricUIConfig {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  description: string;
  type: MetricType;
  category: MetricCategory;
}
