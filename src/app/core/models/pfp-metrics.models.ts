/**
 * Modelos para métricas PFP (Package Functional Purity)
 * Análisis a nivel de paquete/directorio
 */

export type PurityLevel = 'High' | 'Moderate' | 'Low' | 'Very Low';

export interface PFPPackageDetails {
  metrics: {
    ml_modules: number;
    ml_ratio: number;
    pfp_score: number;
    purity_level: PurityLevel;
    total_modules: number;
  };
  pipeline_stages: {
    detected_stages: string[];
    is_focused: boolean;
    stage_count: number;
  };
  quality_indicators: {
    has_ml_content: boolean;
    is_pure_package: boolean;
    needs_refactoring: boolean;
  };
  recommendations: string[];
}

export interface PFPResult {
  analyzer_id: string;
  details: {
    packages: { [packagePath: string]: PFPPackageDetails };
    summary: {
      average_pfp_score: number;
      overall_quality: string;
      packages_by_purity: { [key: string]: number };
      packages_needing_attention: number;
      packages_with_good_purity: number;
      total_packages_analyzed: number;
    };
  };
  documentation: any;
  message_count: { [key: string]: number };
  module_count: number;
  score: number;
  timestamp: string;
}
