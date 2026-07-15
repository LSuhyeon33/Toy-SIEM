import React, { useState, useEffect, useRef } from "react";
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  RefreshCw, 
  Play, 
  Sparkles, 
  Terminal, 
  Layers, 
  Activity,
  CheckCircle2
} from "lucide-react";
import { TrafficMetric, SourceIP, Incident, NetworkType, ActionLog } from "./types";
import SiemViewer from "./components/SiemViewer";
import AnomalyAlert from "./components/AnomalyAlert";
import IncidentResponse from "./components/IncidentResponse";
import ReportGenerator from "./components/ReportGenerator";

// In AI Studio, the Gemini API is queried server-side.
// We make requests to our Express backend route /api/analyze

const WIFI_THRESHOLD = 1000;  // 1 Gbps (1000 Mbps)
const FIVE_G_THRESHOLD = 1200; // 1.2 Gbps (1200 Mbps)

// Helper to generate a current time string
const getTimeString = (offsetSeconds = 0) => {
  const d = new Date(Date.now() + offsetSeconds * 1000);
  return d.toTimeString().split(" ")[0];
};

// Pre-seeded normal data points for initial chart look
const generateInitialMetrics = (): TrafficMetric[] => {
  const data: TrafficMetric[] = [];
  for (let i = 29; i >= 0; i--) {
    const time = getTimeString(-i * 3);
    data.push({
      time,
      wifiBps: 140 + Math.random() * 70,
      wifiPps: 22000 + Math.random() * 6000,
      fiveGBps: 210 + Math.random() * 80,
      fiveGPps: 34000 + Math.random() * 9000,
      fourGBps: 65 + Math.random() * 20,
      fourGPps: 9000 + Math.random() * 3000,
      isMitigated: false,
      mitigationLabel: null
    });
  }
  return data;
};

// Initial Legitimate and potential threat devices
const initialSourceIps: SourceIP[] = [
  // WiFi Zone Devices
  { ip: "192.168.10.145", device: "WiFi IoT 가습 단말 #3", mac: "00:1A:2B:3C:4D:5E", network: "WiFi", bps: 12.5, pps: 2100, percentage: 6.2, connectionCount: 3, blocked: false, terminated: false, actionStatus: 'idle' },
  { ip: "192.168.10.22", device: "사내 노트북 - 마케팅팀A", mac: "F4:5C:89:A2:11:90", network: "WiFi", bps: 45.2, pps: 6800, percentage: 22.5, connectionCount: 12, blocked: false, terminated: false, actionStatus: 'idle' },
  { ip: "192.168.10.61", device: "사내 공용 패드 - 회의실B", mac: "3E:A1:C8:D2:77:B4", network: "WiFi", bps: 18.1, pps: 2400, percentage: 9.0, connectionCount: 4, blocked: false, terminated: false, actionStatus: 'idle' },
  { ip: "192.168.10.103", device: "네트워크 빔프로젝터 #1", mac: "D0:2F:B3:9E:0C:48", network: "WiFi", bps: 5.4, pps: 720, percentage: 2.7, connectionCount: 2, blocked: false, terminated: false, actionStatus: 'idle' },
  { ip: "192.168.10.19", device: "사내 공용 스마트 가전", mac: "7C:4B:F6:11:E3:FA", network: "WiFi", bps: 2.1, pps: 250, percentage: 1.0, connectionCount: 1, blocked: false, terminated: false, actionStatus: 'idle' },
  { ip: "192.168.10.47", device: "고속 네트워크 복합기 #2", mac: "AC:4E:91:38:52:DF", network: "WiFi", bps: 1.2, pps: 150, percentage: 0.6, connectionCount: 1, blocked: false, terminated: false, actionStatus: 'idle' },

  // 5G Network Devices
  { ip: "10.240.8.99", device: "5G 원격 스마트 밸브 단말", mac: "88:2E:CD:45:90:AB", network: "5G", bps: 22.4, pps: 3400, percentage: 7.5, connectionCount: 5, blocked: false, terminated: false, actionStatus: 'idle' },
  { ip: "10.240.8.12", device: "C-Level 전용 스마트 기기", mac: "BC:D1:F2:E3:54:11", network: "5G", bps: 52.8, pps: 7900, percentage: 17.6, connectionCount: 15, blocked: false, terminated: false, actionStatus: 'idle' },
  { ip: "10.240.8.44", device: "인프라 공조 제어 장치", mac: "22:8A:F4:9E:CC:BB", network: "5G", bps: 14.2, pps: 1800, percentage: 4.7, connectionCount: 2, blocked: false, terminated: false, actionStatus: 'idle' },
  { ip: "10.240.8.204", device: "무선 보안 스마트 CCTV #4", mac: "E4:F2:D1:0B:44:99", network: "5G", bps: 68.5, pps: 9400, percentage: 22.8, connectionCount: 8, blocked: false, terminated: false, actionStatus: 'idle' },
  { ip: "10.240.8.151", device: "서버룸 정밀 온습도 센서", mac: "55:AA:33:99:EE:44", network: "5G", bps: 8.1, pps: 1100, percentage: 2.7, connectionCount: 2, blocked: false, terminated: false, actionStatus: 'idle' },

  // 4G Network Devices
  { ip: "172.16.50.41", device: "4G 관제용 계측 기기 A", mac: "00:11:22:33:44:55", network: "4G", bps: 18.2, pps: 2200, percentage: 22.1, connectionCount: 3, blocked: false, terminated: false, actionStatus: 'idle' },
  { ip: "172.16.50.11", device: "4G 비상용 IoT 수신기 #2", mac: "66:77:88:99:AA:BB", network: "4G", bps: 11.5, pps: 1400, percentage: 14.0, connectionCount: 2, blocked: false, terminated: false, actionStatus: 'idle' }
];

// Seeding standard historic resolved logs
const initialIncidents: Incident[] = [
  {
    id: "INC-WIFI-20260714-A",
    type: "TCP SYN Flood (DDoS)",
    severity: "Critical",
    targetNetwork: "사내 WiFi 존 #3 (무선 AP-12)",
    detectedAt: "2026-07-14 18:10:22",
    sourceIp: "192.168.10.145",
    anomalyScore: 98.4,
    peakBps: 1550,
    peakPps: 520000,
    reason: "과학기술정보통신부 무선데이터 트래픽 평균 통계(250 Mbps) 대비 6.2배 폭증한 1.55 Gbps 감지. 특정 가해 외부 IP(192.168.10.145)로부터 다량의 무의미한 TCP SYN 패킷 유입 확인.",
    actions: [
      {
        id: "ACT-01",
        timestamp: "2026-07-14 18:12:05",
        targetIp: "192.168.10.145",
        actionType: "IP_BLOCK",
        status: "COMPLETED",
        operator: "보안인프라실 기관리자"
      }
    ],
    status: 'mitigated',
    mitigatedAt: "2026-07-14 18:12:10"
  },
  {
    id: "INC-5G-20260714-B",
    type: "UDP Flood (DDoS)",
    severity: "High",
    targetNetwork: "5G Corporate Access AP (무선 5G-Zone-B)",
    detectedAt: "2026-07-14 20:05:40",
    sourceIp: "10.240.8.99",
    anomalyScore: 91.2,
    peakBps: 1210,
    peakPps: 380000,
    reason: "5G 사내 AP의 트래픽 대역폭 정상 가이드(450 Mbps)를 초과하는 1.21 Gbps 유입. 가해 IP(10.240.8.99)에서 다량의 UDP 데이터 패킷을 급증시켜 대역폭 점유 공격 진행 중.",
    actions: [
      {
        id: "ACT-02",
        timestamp: "2026-07-14 20:07:15",
        targetIp: "10.240.8.99",
        actionType: "SESSION_TERMINATE",
        status: "COMPLETED",
        operator: "보안인프라실 기관리자"
      }
    ],
    status: 'mitigated',
    mitigatedAt: "2026-07-14 20:07:20"
  }
];

export default function App() {
  const [metrics, setMetrics] = useState<TrafficMetric[]>(generateInitialMetrics());
  const [sourceIps, setSourceIps] = useState<SourceIP[]>(initialSourceIps);
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [activeNetwork, setActiveNetwork] = useState<NetworkType>("WiFi");
  const [isPaused, setIsPaused] = useState<boolean>(false);
  
  // Real-time attack states
  const [activeIncident, setActiveIncident] = useState<Incident | null>(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>("INC-WIFI-20260714-A");

  // Gemini AI state
  const [aiAnalysisText, setAiAnalysisText] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // References to communicate instant mitigation events down to the tick loop
  const mitigationTriggerRef = useRef<{ label: string } | null>(null);

  // Interval trigger for simulation ticks
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      tickTraffic();
    }, 1500);

    return () => clearInterval(timer);
  }, [isPaused, activeIncident]);

  const tickTraffic = () => {
    // Determine if we are currently undergoing an active, unmitigated attack
    const isAttacking = activeIncident && activeIncident.status === 'active';
    const attackNetwork = isAttacking ? activeIncident?.targetNetwork : null;

    setMetrics((prevMetrics) => {
      const lastPoint = prevMetrics[prevMetrics.length - 1];
      
      // Calculate next step time label
      const lastTimeStr = lastPoint?.time || "09:00:00";
      const parts = lastTimeStr.split(":").map(Number);
      let seconds = parts[0] * 3600 + parts[1] * 60 + parts[2] + 3;
      const hours = Math.floor(seconds / 3600) % 24;
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      const newTime = [hours, mins, secs].map(v => String(v).padStart(2, '0')).join(':');

      // Random normal baselines
      let wifiBps = 140 + Math.random() * 50;
      let wifiPps = 22000 + Math.random() * 4000;
      let fiveGBps = 210 + Math.random() * 60;
      let fiveGPps = 34000 + Math.random() * 6000;
      let fourGBps = 65 + Math.random() * 15;
      let fourGPps = 9000 + Math.random() * 2000;

      // Apply extreme DDoS numbers if attack is active and target matches
      if (isAttacking && attackNetwork) {
        if (attackNetwork.includes("WiFi")) {
          wifiBps = 1450 + Math.random() * 200;
          wifiPps = 480000 + Math.random() * 40000;
        } else if (attackNetwork.includes("5G")) {
          fiveGBps = 1750 + Math.random() * 220;
          fiveGPps = 390000 + Math.random() * 30000;
        }
      }

      // Check if a mitigation event happened during this interval
      let label: string | null = null;
      let isMit = false;
      if (mitigationTriggerRef.current) {
        label = mitigationTriggerRef.current.label;
        isMit = true;
        mitigationTriggerRef.current = null; // Consume
      }

      const newPoint: TrafficMetric = {
        time: newTime,
        wifiBps,
        wifiPps,
        fiveGBps,
        fiveGPps,
        fourGBps,
        fourGPps,
        isMitigated: isMit,
        mitigationLabel: label
      };

      return [...prevMetrics.slice(1), newPoint];
    });

    // Sync IP source shares
    setSourceIps((prevIps) => {
      // WiFi Attacker
      const wifiAttacker = prevIps.find(i => i.ip === '192.168.10.145')!;
      // 5G Attacker
      const fiveGAttacker = prevIps.find(i => i.ip === '10.240.8.99')!;

      return prevIps.map((ip) => {
        const isWifiAttack = isAttacking && attackNetwork?.includes("WiFi");
        const is5GAttack = isAttacking && attackNetwork?.includes("5G");

        if (ip.ip === '192.168.10.145') {
          if (ip.blocked || ip.terminated) {
            return { ...ip, bps: 0, pps: 0, percentage: 0, connectionCount: 0 };
          }
          if (isWifiAttack) {
            return {
              ...ip,
              bps: 1350 + Math.random() * 120,
              pps: 460000 + Math.random() * 15000,
              percentage: 88.5,
              connectionCount: 2200
            };
          }
          return {
            ...ip,
            bps: 12 + Math.random() * 4,
            pps: 2200 + Math.random() * 400,
            percentage: 6.2,
            connectionCount: 3
          };
        }

        if (ip.ip === '10.240.8.99') {
          if (ip.blocked || ip.terminated) {
            return { ...ip, bps: 0, pps: 0, percentage: 0, connectionCount: 0 };
          }
          if (is5GAttack) {
            return {
              ...ip,
              bps: 1510 + Math.random() * 140,
              pps: 375000 + Math.random() * 12000,
              percentage: 82.4,
              connectionCount: 1850
            };
          }
          return {
            ...ip,
            bps: 20 + Math.random() * 6,
            pps: 3100 + Math.random() * 500,
            percentage: 7.2,
            connectionCount: 5
          };
        }

        //Legitimate random variations
        const baseBps = ip.network === 'WiFi' 
          ? (ip.ip === '192.168.10.22' ? 45 : ip.ip === '192.168.10.61' ? 18 : 4) 
          : ip.network === '5G'
            ? (ip.ip === '10.240.8.12' ? 52 : ip.ip === '10.240.8.204' ? 68 : 9)
            : 15;
        const jitterBps = baseBps + (Math.random() - 0.5) * (baseBps * 0.15);
        const ratio = ip.network === 'WiFi' ? 145 : 170;

        return {
          ...ip,
          bps: Math.max(0.5, parseFloat(jitterBps.toFixed(1))),
          pps: Math.max(50, Math.round(jitterBps * ratio))
        };
      });
    });
  };

  // Launch Scenarios
  const triggerWiFiAttack = () => {
    // Reset specific attacker blocks
    setSourceIps(prev => prev.map(ip => ip.ip === '192.168.10.145' ? { ...ip, blocked: false, terminated: false, actionStatus: 'idle' } : ip));
    
    const newInc: Incident = {
      id: "INC-WIFI-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
      type: "TCP SYN Flood (DDoS)",
      severity: "Critical",
      targetNetwork: "사내 WiFi 존 #3 (무선 AP-12)",
      detectedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      sourceIp: "192.168.10.145",
      anomalyScore: 98.4,
      peakBps: 1550,
      peakPps: 520000,
      reason: "과기부 표준 무선 트래픽 평균 가이드(250 Mbps)를 약 6.2배 초과하는 1.55 Gbps 감지. 가해 IP(192.168.10.145)에서 초당 패킷 수가 50만 PPS를 상회하여 사내 WiFi 접속 장애 유발 중.",
      actions: [],
      status: 'active',
      mitigatedAt: null
    };

    setActiveIncident(newInc);
    setIncidents(prev => [newInc, ...prev]);
    setSelectedIncidentId(newInc.id);
    setActiveNetwork("WiFi");
    setAiAnalysisText(null);
  };

  const trigger5GAttack = () => {
    // Reset specific attacker blocks
    setSourceIps(prev => prev.map(ip => ip.ip === '10.240.8.99' ? { ...ip, blocked: false, terminated: false, actionStatus: 'idle' } : ip));
    
    const newInc: Incident = {
      id: "INC-5G-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
      type: "UDP Flood (DDoS)",
      severity: "Critical",
      targetNetwork: "5G Corporate Access AP (무선 5G-Zone-B)",
      detectedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      sourceIp: "10.240.8.99",
      anomalyScore: 94.2,
      peakBps: 1820,
      peakPps: 410000,
      reason: "5G 사내 인프라 대역폭 정상 가이드(450 Mbps)를 초과하는 1.82 Gbps 유입 확인. 기계실 단말로 위장한 가해 IP(10.240.8.99)로부터 무차별적인 UDP 패킷 대량 유출 정황.",
      actions: [],
      status: 'active',
      mitigatedAt: null
    };

    setActiveIncident(newInc);
    setIncidents(prev => [newInc, ...prev]);
    setSelectedIncidentId(newInc.id);
    setActiveNetwork("5G");
    setAiAnalysisText(null);
  };

  const resetToNormal = () => {
    setActiveIncident(null);
    setAiAnalysisText(null);
    // Reset all IP controls
    setSourceIps(initialSourceIps);
  };

  // Manual Intervention Execution (IP BLOCK & SESSION TERMINATE)
  const handleBlockIp = (ipAddress: string) => {
    executeManualControl(ipAddress, 'IP_BLOCK');
  };

  const handleTerminateSession = (ipAddress: string) => {
    executeManualControl(ipAddress, 'SESSION_TERMINATE');
  };

  const executeManualControl = (ipAddress: string, actionType: 'IP_BLOCK' | 'SESSION_TERMINATE') => {
    if (!activeIncident) return;

    // 1. Update IP status to 'pending'
    setSourceIps(prev => prev.map(ip => ip.ip === ipAddress ? { ...ip, actionStatus: 'pending' } : ip));

    const actionId = "ACT-" + Math.random().toString(36).substring(2, 6).toUpperCase();
    const newAction: ActionLog = {
      id: actionId,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      targetIp: ipAddress,
      actionType: actionType,
      status: 'PENDING',
      operator: "보안 담당자(인프라관제실)"
    };

    // Add pending action to current active incident
    setActiveIncident(prev => {
      if (!prev) return null;
      return {
        ...prev,
        actions: [...prev.actions, newAction]
      };
    });

    // Sync incidents list
    setIncidents(prev => prev.map(inc => inc.id === activeIncident.id ? { ...inc, actions: [...inc.actions, newAction] } : inc));

    // 2. Transition 'pending' -> 'in_progress' (1s timer)
    setTimeout(() => {
      setSourceIps(prev => prev.map(ip => ip.ip === ipAddress ? { ...ip, actionStatus: 'in_progress' } : ip));
      
      setActiveIncident(prev => {
        if (!prev) return null;
        return {
          ...prev,
          actions: prev.actions.map(act => act.id === actionId ? { ...act, status: 'IN_PROGRESS' } : act)
        };
      });

      setIncidents(prev => prev.map(inc => {
        if (inc.id !== activeIncident.id) return inc;
        return {
          ...inc,
          actions: inc.actions.map(act => act.id === actionId ? { ...act, status: 'IN_PROGRESS' } : act)
        };
      }));

      // 3. Transition 'in_progress' -> 'completed' (another 1s timer)
      setTimeout(() => {
        const completedTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
        
        setSourceIps(prev => prev.map(ip => {
          if (ip.ip === ipAddress) {
            return {
              ...ip,
              actionStatus: 'completed',
              blocked: actionType === 'IP_BLOCK' ? true : ip.blocked,
              terminated: actionType === 'SESSION_TERMINATE' ? true : ip.terminated,
            };
          }
          return ip;
        }));

        // Finalize incident mitigation
        mitigationTriggerRef.current = {
          label: actionType === 'IP_BLOCK' ? "수동 IP 차단 완료" : "RADIUS 세션 강제해제"
        };

        setActiveIncident(prev => {
          if (!prev) return null;
          return {
            ...prev,
            status: 'mitigated',
            mitigatedAt: completedTime,
            actions: prev.actions.map(act => act.id === actionId ? { ...act, status: 'COMPLETED' } : act)
          };
        });

        setIncidents(prev => prev.map(inc => {
          if (inc.id !== activeIncident.id) return inc;
          return {
            ...inc,
            status: 'mitigated',
            mitigatedAt: completedTime,
            actions: inc.actions.map(act => act.id === actionId ? { ...act, status: 'COMPLETED' } : act)
          };
        }));

        // Trigger simulation to drop back to normal traffic
        // (the tickTraffic loop reads 'activeIncident.status === active' to see if it should apply DDoS values)

      }, 1000);

    }, 1000);
  };

  // Query server-side Gemini 3.5 AI route for Deep Anomaly analysis
  const handleAnalyzeAi = async () => {
    if (!activeIncident) return;
    setIsAiLoading(true);
    setAiAnalysisText(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incidentData: activeIncident }),
      });

      if (!response.ok) {
        throw new Error("서버와의 통신에 실패했습니다.");
      }

      const data = await response.json();
      setAiAnalysisText(data.analysis);
      
      // Update in local incidents list as well
      setIncidents(prev => prev.map(inc => {
        if (inc.id === activeIncident.id) {
          return { ...inc, aiExplanation: data.analysis };
        }
        return inc;
      }));
      
      setActiveIncident(prev => {
        if (!prev) return null;
        return { ...prev, aiExplanation: data.analysis };
      });

    } catch (error: any) {
      console.error(error);
      setAiAnalysisText(`### ❌ 분석 실패 경고
Gemini AI 실시간 분석 처리 중 네트워크 오류가 발생했습니다: ${error.message}
로컬 보안 데이터셋 기반으로 기인쇄된 분석 수치를 보고서로 활용하십시오.`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSelectIncidentFromHistory = (incident: Incident) => {
    setSelectedIncidentId(incident.id);
  };

  return (
    <div id="dashboard-app-root" className="min-h-screen bg-[#0A0A0C] text-[#D1D1D1] flex flex-col font-sans select-none antialiased">
      
      {/* 1. Dashboard Top Header */}
      <header className="border-b border-[#222222] bg-[#0E0E12] px-6 py-4 sticky top-0 z-40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/10 rounded border border-blue-500/20 text-blue-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs font-bold tracking-widest text-white uppercase sm:text-sm">무선 TCP/IP 트래픽 이상 탐지 및 수동 대응 시스템</h1>
              <span className="text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-widest">SIEM-IR v2.4</span>
            </div>
            <p className="text-[10px] text-gray-500 uppercase tracking-tighter mt-0.5">사내 무선망(WiFi, 5G) DDoS 대응 모니터링 콘솔</p>
          </div>
        </div>

        {/* Global Security Status and Controls */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 bg-[#14141A] border border-[#222222] px-3 py-1.5 rounded text-[10px] uppercase font-bold">
            <span className="text-gray-500">시스템 전체 보안 상태:</span>
            {activeIncident && activeIncident.status === 'active' ? (
              <span className="flex items-center gap-1.5 text-red-500 font-bold animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                위협 감지됨
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                정상 보호 중
              </span>
            )}
          </div>

          {/* Incident Simulation Injector Panels */}
          <div className="flex items-center gap-1.5 bg-[#14141A] p-1 rounded border border-[#222222]">
            <button
              id="inject-wifi-attack-btn"
              onClick={triggerWiFiAttack}
              className="px-2.5 py-1.5 rounded text-[10px] font-mono font-bold uppercase bg-[#1A0B0B] border border-red-900/40 text-red-500 hover:bg-red-900/40 hover:text-white transition-colors flex items-center gap-1"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>WiFi DDoS 주입</span>
            </button>
            <button
              id="inject-5g-attack-btn"
              onClick={trigger5GAttack}
              className="px-2.5 py-1.5 rounded text-[10px] font-mono font-bold uppercase bg-[#1A0B0B] border border-orange-900/40 text-orange-500 hover:bg-orange-900/40 hover:text-white transition-colors flex items-center gap-1"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>5G DDoS 주입</span>
            </button>
            <button
              id="reset-normal-btn"
              onClick={resetToNormal}
              className="px-2.5 py-1.5 rounded text-[10px] font-mono font-bold uppercase bg-[#14141A] border border-[#222222] text-[#D1D1D1] hover:bg-gray-800 transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>정상 복구</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Bento Grid Layout */}
      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1600px] mx-auto w-full">
        
        {/* Left column - SIEM Monitor Graph (takes 8 cols on desktop) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex-1 min-h-[450px]">
            <SiemViewer 
              metrics={metrics}
              activeNetwork={activeNetwork}
              setActiveNetwork={setActiveNetwork}
              isPaused={isPaused}
              setIsPaused={setIsPaused}
              wifiThreshold={WIFI_THRESHOLD}
              fiveGThreshold={FIVE_G_THRESHOLD}
            />
          </div>
          
          {/* Incident Response Panel */}
          <div className="h-auto">
            <IncidentResponse 
              sourceIps={sourceIps}
              activeNetwork={activeNetwork}
              onBlockIp={handleBlockIp}
              onTerminateSession={handleTerminateSession}
              activeIncident={activeIncident !== null}
            />
          </div>
        </div>

        {/* Right column - Threat Anomaly Details & Exporter (takes 4 cols on desktop) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Anomaly Detection and AI engine */}
          <div className="flex-1 lg:max-h-[500px]">
            <AnomalyAlert 
              activeIncident={activeIncident}
              onAnalyzeAi={handleAnalyzeAi}
              aiAnalysisText={aiAnalysisText}
              isAiLoading={isAiLoading}
            />
          </div>

          {/* Word Exporter log history book */}
          <div className="h-auto">
            <ReportGenerator 
              incidents={incidents}
              onSelectIncident={handleSelectIncidentFromHistory}
              selectedIncidentId={selectedIncidentId}
            />
          </div>
        </div>

      </main>

      {/* 3. Footer Bar */}
      <footer className="border-t border-[#222222] bg-[#0E0E12] py-4 px-6 text-center text-[9px] text-gray-600 font-sans mt-auto uppercase tracking-wide">
        <p>© 2026 사내 무선인프라 보안관제센터. 본 시스템의 일체 감사 이력은 암호화 저장소에 소산 기록됩니다.</p>
      </footer>

    </div>
  );
}
