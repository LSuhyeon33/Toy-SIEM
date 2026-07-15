export type NetworkType = 'WiFi' | '5G' | '4G';

export interface TrafficMetric {
  time: string;           // HH:MM:SS
  wifiBps: number;        // Mbps
  wifiPps: number;        // PPS (Packets per second)
  fiveGBps: number;       // Mbps
  fiveGPps: number;       // PPS
  fourGBps: number;       // Mbps
  fourGPps: number;       // PPS
  isMitigated: boolean;   // Whether mitigation was active at this point
  mitigationLabel: string | null; // Label if a mitigation happened here
}

export interface SourceIP {
  ip: string;
  device: string;
  mac: string;
  network: NetworkType;
  bps: number;            // Mbps
  pps: number;            // PPS
  percentage: number;     // Share of total traffic
  connectionCount: number;
  blocked: boolean;
  terminated: boolean;
  actionStatus: 'idle' | 'pending' | 'in_progress' | 'completed';
}

export interface ActionLog {
  id: string;
  timestamp: string;
  targetIp: string;
  actionType: 'IP_BLOCK' | 'SESSION_TERMINATE';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  operator: string;
}

export interface Incident {
  id: string;
  type: string;           // "TCP SYN Flood (DDoS)", "UDP Flood (DDoS)", "Normal"
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  targetNetwork: string;  // "사내 WiFi 존 #3", "5G Corporate Access AP", etc.
  detectedAt: string;     // YYYY-MM-DD HH:MM:SS
  sourceIp: string;
  anomalyScore: number;   // Anomaly score percentage (0-100)
  peakBps: number;        // Peak bandwidth in Mbps
  peakPps: number;        // Peak packets per second
  reason: string;
  aiExplanation?: string; // Analysis explanation from Gemini
  actions: ActionLog[];
  status: 'active' | 'mitigated';
  mitigatedAt: string | null;
}
