import React from "react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceLine 
} from "recharts";
import { Wifi, Activity, Zap, Play, Pause } from "lucide-react";
import { TrafficMetric, NetworkType } from "../types";

interface SiemViewerProps {
  metrics: TrafficMetric[];
  activeNetwork: NetworkType;
  setActiveNetwork: (network: NetworkType) => void;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
  wifiThreshold: number;
  fiveGThreshold: number;
}

export default function SiemViewer({
  metrics,
  activeNetwork,
  setActiveNetwork,
  isPaused,
  setIsPaused,
  wifiThreshold,
  fiveGThreshold,
}: SiemViewerProps) {
  
  // Format data specifically for Recharts based on selected network
  const chartData = metrics.map(m => {
    let bps = 0;
    let pps = 0;
    if (activeNetwork === 'WiFi') {
      bps = m.wifiBps;
      pps = m.wifiPps;
    } else if (activeNetwork === '5G') {
      bps = m.fiveGBps;
      pps = m.fiveGPps;
    } else {
      bps = m.fourGBps;
      pps = m.fourGPps;
    }

    return {
      time: m.time,
      "대역폭 (Mbps)": Number(bps.toFixed(1)),
      "패킷 속도 (K PPS)": Number((pps / 1000).toFixed(1)),
      label: m.mitigationLabel,
      isMitigated: m.isMitigated
    };
  });

  const currentThreshold = activeNetwork === 'WiFi' ? wifiThreshold : activeNetwork === '5G' ? fiveGThreshold : 350;

  // Find index/time where mitigation happened for reference lines
  const mitigationPoints = chartData.filter(d => d.label !== null);

  const currentBps = chartData[chartData.length - 1]?.["대역폭 (Mbps)"] || 0;
  const currentPps = chartData[chartData.length - 1]?.["패킷 속도 (K PPS)"] || 0;

  const isCritical = currentBps > currentThreshold;

  return (
    <div id="siem-viewer-container" className="bg-[#0D0D11] border border-[#222222] rounded-md p-5 flex flex-col h-full text-[#D1D1D1]">
      {/* Title & Network Selection */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded ${isCritical ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
            <Activity className={`w-4 h-4 ${isCritical && !isPaused ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <h2 className="text-xs font-bold tracking-widest text-white uppercase">
              [FR-1] 무선망 실시간 TCP/IP 트래픽 모니터링 (SIEM)
            </h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-tighter mt-0.5">사내 무선망으로 유입되는 실시간 대역폭 및 패킷 전송 속도 시계열 데이터</p>
          </div>
        </div>

        {/* Play/Pause Control & Network Selectors */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Pause Button */}
          <button
            id="pause-simulation-btn"
            onClick={() => setIsPaused(!isPaused)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[10px] font-mono uppercase border transition-colors ${
              isPaused 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
                : 'bg-[#14141A] text-[#D1D1D1] border-[#222222] hover:bg-gray-800'
            }`}
            title={isPaused ? "모니터링 시작" : "모니터링 일시정지"}
          >
            {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            <span>{isPaused ? "시뮬레이션 재개" : "일시정지"}</span>
          </button>

          {/* Network Options */}
          <div className="bg-[#14141A] p-1 rounded border border-[#222222] flex items-center gap-1">
            {(['WiFi', '5G', '4G'] as NetworkType[]).map((net) => (
              <button
                id={`network-tab-${net.toLowerCase()}`}
                key={net}
                onClick={() => setActiveNetwork(net)}
                className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wide transition-all ${
                  activeNetwork === net
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-500 hover:text-white'
                }`}
              >
                {net === 'WiFi' ? '사내 WiFi' : net === '5G' ? '업무용 5G' : '4G LTE'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Counter Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className={`p-4 border flex flex-col justify-center rounded-md ${isCritical ? 'bg-[#1A0B0B] border-red-900/40' : 'bg-[#14141A] border-[#222222]'}`}>
          <div className="flex items-center justify-between text-[10px] text-gray-500 uppercase mb-1">
            <span>실시간 대역폭 (Bandwidth)</span>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${isCritical ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-blue-500/20 text-blue-400'}`}>
              {isCritical ? 'CRITICAL LIMIT' : 'NORMAL'}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-xl font-bold tracking-tight font-mono ${isCritical ? 'text-red-500' : 'text-white'}`}>
              {currentBps.toLocaleString()}
            </span>
            <span className="text-[10px] text-gray-500 uppercase">Mbps</span>
          </div>
        </div>

        <div className={`p-4 border flex flex-col justify-center rounded-md ${isCritical ? 'bg-[#1A0B0B] border-red-900/40' : 'bg-[#14141A] border-[#222222]'}`}>
          <div className="flex items-center justify-between text-[10px] text-gray-500 uppercase mb-1">
            <span>초당 패킷량 (PPS)</span>
            <Zap className={`w-3 h-3 ${isCritical ? 'text-red-400 animate-bounce' : 'text-amber-500'}`} />
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-xl font-bold tracking-tight font-mono ${isCritical ? 'text-red-500' : 'text-white'}`}>
              {currentPps.toLocaleString()}
            </span>
            <span className="text-[10px] text-gray-500 uppercase">K PPS</span>
          </div>
        </div>
      </div>

      {/* Main Recharts Graphic Container */}
      <div className="flex-1 min-h-[280px] w-full bg-[#0D0D11] p-3 rounded-md border border-[#222222] relative">
        {isPaused && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-md flex items-center justify-center z-10">
            <div className="text-center p-4">
              <p className="text-white font-mono font-bold text-xs uppercase tracking-widest mb-1">&gt; MONITOR FEED PAUSED &lt;</p>
              <p className="text-gray-500 text-[10px] uppercase">Click '일시정지' to restart real-time session tracking</p>
            </div>
          </div>
        )}

        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 15, right: 10, left: -15, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
            <XAxis 
              dataKey="time" 
              stroke="#64748b" 
              fontSize={10} 
              tickLine={false}
              dy={5}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={10} 
              tickLine={false}
              domain={[0, (dataMin: number) => Math.max(500, Math.ceil(dataMin * 1.3))]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0E0E12",
                borderColor: "#222222",
                borderRadius: "4px",
                color: "#D1D1D1",
                fontSize: "11px",
              }}
              labelStyle={{ color: "#64748b", fontWeight: "bold" }}
            />
            <Legend 
              wrapperStyle={{ fontSize: "10px", paddingTop: "8px" }}
              verticalAlign="bottom"
              height={36}
            />

            {/* Threshold line representation */}
            <ReferenceLine 
              y={currentThreshold} 
              stroke="#ef4444" 
              strokeDasharray="4 4" 
              label={{ 
                value: `DDoS THRESHOLD (${currentThreshold} Mbps)`, 
                fill: '#ef4444', 
                fontSize: 9,
                position: 'top' 
              }} 
            />

            {/* Manual Response Actions Reference Lines */}
            {mitigationPoints.map((pt, idx) => (
              <ReferenceLine
                key={idx}
                x={pt.time}
                stroke="#10b981"
                strokeWidth={2}
                label={{
                  value: pt.label || '조치',
                  fill: '#34d399',
                  fontSize: 9,
                  position: 'insideTopLeft',
                  backgroundColor: '#064e3b',
                }}
              />
            ))}

            <Line 
              type="monotone" 
              dataKey="대역폭 (Mbps)" 
              stroke={isCritical ? "#ef4444" : "#3b82f6"} 
              strokeWidth={2}
              activeDot={{ r: 5 }}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="패킷 속도 (K PPS)" 
              stroke="#fbbf24" 
              strokeWidth={1.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Guide Details Footer */}
      <div className="mt-3 pt-3 border-t border-[#222222] flex items-center justify-between text-[10px] text-gray-500 uppercase tracking-tighter">
        <span className="flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          대역폭 상한치: {currentThreshold} Mbps (WiFi 300, 5G 450)
        </span>
        <span>
          과기부 무선데이터 트래픽 표준 통계 기준
        </span>
      </div>
    </div>
  );
}
