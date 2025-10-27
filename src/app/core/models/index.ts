/**
 * Barrel file para exportar todos los modelos
 * Permite importar desde un solo lugar: import { Model } from '@app/core/models'
 */

// Base metric models (foundation for all metrics)
export * from './base-metric.models';

// Analysis models
export * from './analysis.models';

// FPC metrics models
export * from './fpc-metrics.models';

// PFP metrics models
export * from './pfp-metrics.models';

// Project analysis models
export * from './project-analysis.models';
