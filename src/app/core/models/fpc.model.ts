export interface Fpc {
  analyzer_id: string;
  details: Details;
  documentation: any;
  message_count: MessageCount;
  module_count: number;
  score: number;
  timestamp: Date;
}

interface MessageCount {
  messages: {
    messages: string[];
  };
}

interface Details {
  files: Files[];
  summary: Summary;
}

interface Files {
  cohesion_level: string;
  function_stages: any[];
  phases_detected: string[];
  source: string;
  stages_detected: string[];
  unique_phases: number;
  unique_stages: number;
}

interface Summary {
  high_cohesion: number;
  low_cohesion: number;
  medium_cohesion: number;
  scan_mode: string;
  total_files: number;
}
