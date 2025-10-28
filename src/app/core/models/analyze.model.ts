import { Fpc } from "./fpc.model";

export interface AnalyzeResponse {
  results: Results;
  session_id: string;
  timestamp: Date;
}

interface Results {
  fpc?: Fpc;
}