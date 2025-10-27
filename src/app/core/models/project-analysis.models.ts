

import { FPCResult } from './fpc-metrics.models';
import { PFPResult } from './pfp-metrics.models';

// Tipos de analizadores disponibles
export type AnalyzerType = 'fpc' | 'pfp';


export interface ProjectAnalysisRequest {
  analyzers: AnalyzerType[];
}


export interface ProjectAnalysisResponse {
  success: boolean;
  data: {
    session_id: string;
    results: {
      fpc?: FPCResult;
      pfp?: PFPResult;
    };
    timestamp: string;
  };
  message?: string;
}
