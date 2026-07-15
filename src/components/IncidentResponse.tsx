import React from "react";
import { Ban, ShieldOff, Loader2, Check, UserCheck, HelpCircle } from "lucide-react";
import { SourceIP, NetworkType } from "../types";

interface IncidentResponseProps {
  sourceIps: SourceIP[];
  activeNetwork: NetworkType;
  onBlockIp: (ipAddress: string) => void;
  onTerminateSession: (ipAddress: string) => void;
  activeIncident: boolean;
}

export default function IncidentResponse({
  sourceIps,
  activeNetwork,
  onBlockIp,
  onTerminateSession,
  activeIncident,
}: IncidentResponseProps) {
  
  // Filter source IPs belonging to the current active network to display relevant threats
  const filteredIps = sourceIps.filter(ip => ip.network === activeNetwork);

  return (
    <div id="incident-response-panel" className="bg-[#0D0D11] border border-[#222222] rounded-md p-5 flex flex-col text-[#D1D1D1] h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white tracking-widest uppercase">[FR-3] 수동 대응 제어반 (Incident Response)</h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-tighter mt-0.5">보안 담당자의 실시간 강제 패킷 통제 및 기기 접속 제어</p>
          </div>
        </div>
        <span className="text-[10px] bg-[#14141A] text-gray-400 font-mono uppercase border border-[#222222] px-2.5 py-1 rounded">
          망 구분: <span className="text-blue-400 font-bold">{activeNetwork === 'WiFi' ? '사내 WiFi' : activeNetwork === '5G' ? '업무용 5G' : '4G LTE'}</span>
        </span>
      </div>

      {/* IP Source Analytics Table */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#222222] text-gray-500 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-2.5 px-3">가해 소스 IP / 접속 장치</th>
              <th className="py-2.5 px-2 text-right">대역폭 (Share)</th>
              <th className="py-2.5 px-2 text-right">패킷 전송량</th>
              <th className="py-2.5 px-3 text-center">보안 상태 및 대응 제어 (수동 조치)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222222]/60 font-mono">
            {filteredIps.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-10 text-center text-gray-500 text-xs font-sans uppercase">
                  조회된 활성 무선 접속 세션이 없습니다.
                </td>
              </tr>
            ) : (
              filteredIps.map((ip) => {
                const isMalicious = activeIncident && (ip.ip === '192.168.10.145' || ip.ip === '10.240.8.99');
                const isActionInProgress = ip.actionStatus === 'pending' || ip.actionStatus === 'in_progress';
                const isActionCompleted = ip.actionStatus === 'completed' || ip.blocked || ip.terminated;

                return (
                  <tr 
                    key={ip.ip} 
                    className={`transition-colors ${
                      isMalicious 
                        ? isActionCompleted 
                          ? 'bg-emerald-950/5 hover:bg-emerald-950/10' 
                          : 'bg-[#1A0B0B] hover:bg-[#1A0B0B]/80'
                        : 'hover:bg-[#14141A]/60'
                    }`}
                  >
                    {/* Source IP / Device Info */}
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-xs tracking-wide">
                          {ip.ip}
                          {isMalicious && !isActionCompleted && (
                            <span className="ml-1.5 inline-block text-[9px] bg-red-500/20 text-red-400 font-sans font-bold px-1 py-0.2 rounded animate-pulse uppercase">
                              공격 진원지
                            </span>
                          )}
                          {isActionCompleted && (
                            <span className="ml-1.5 inline-block text-[9px] bg-emerald-500/20 text-emerald-400 font-sans font-bold px-1 py-0.2 rounded uppercase">
                              제어 완료
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-gray-500 font-sans">
                          {ip.device} <span className="text-[9px] text-slate-600">({ip.mac})</span>
                        </span>
                      </div>
                    </td>

                    {/* Bandwidth (Mbps) */}
                    <td className="py-3 px-2 text-right">
                      <div className="flex flex-col items-end">
                        <span className={`font-bold ${isMalicious && !isActionCompleted ? 'text-red-500 font-mono' : 'text-gray-400 font-mono'}`}>
                          {ip.bps.toLocaleString()} Mbps
                        </span>
                        <span className="text-[9px] text-gray-500 font-sans">
                          공유율 {ip.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </td>

                    {/* Packets (PPS) */}
                    <td className="py-3 px-2 text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-medium text-gray-400 font-mono">
                          {(ip.pps / 1000).toLocaleString()}K PPS
                        </span>
                        <span className="text-[9px] text-gray-500 font-sans">
                          {ip.connectionCount} 세션 점유
                        </span>
                      </div>
                    </td>

                    {/* Actions and Status Button Controls */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5 font-sans">
                        {isActionCompleted ? (
                          <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold bg-emerald-950/20 border border-emerald-900/40 px-3 py-1.5 rounded uppercase w-full justify-center">
                            <Check className="w-3.5 h-3.5" />
                            <span>
                              {ip.blocked ? "방화벽 IP 차단 완료" : "세션 강제 종료 완료"}
                            </span>
                          </div>
                        ) : (
                          <>
                            {/* Block IP Button */}
                            <button
                              id={`block-ip-btn-${ip.ip.replace(/\./g, '-')}`}
                              onClick={() => onBlockIp(ip.ip)}
                              disabled={isActionInProgress}
                              className={`flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded text-[10px] uppercase font-bold tracking-wider transition-all border ${
                                isMalicious
                                  ? 'bg-red-900/40 border border-red-500/50 text-red-500 hover:bg-red-900/60'
                                  : 'bg-[#14141A] text-gray-400 border-[#222222] hover:bg-gray-800'
                              } disabled:opacity-50`}
                            >
                              {ip.actionStatus === 'pending' ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Ban className="w-3 h-3" />
                              )}
                              <span>IP 차단</span>
                            </button>

                            {/* Terminate Session Button */}
                            <button
                              id={`terminate-session-btn-${ip.ip.replace(/\./g, '-')}`}
                              onClick={() => onTerminateSession(ip.ip)}
                              disabled={isActionInProgress}
                              className={`flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded text-[10px] uppercase font-bold tracking-wider transition-all border ${
                                isMalicious
                                  ? 'bg-gray-800 border border-gray-600 text-gray-400 hover:bg-gray-700'
                                  : 'bg-[#14141A] text-gray-400 border-[#222222] hover:bg-gray-800'
                              } disabled:opacity-50`}
                            >
                              {ip.actionStatus === 'in_progress' ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <ShieldOff className="w-3 h-3" />
                              )}
                              <span>세션 종료</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Manual Controls Tip Area */}
      <div className="mt-4 pt-3 border-t border-[#222222] flex items-start gap-2.5 text-[10px] text-gray-500 uppercase tracking-tighter">
        <HelpCircle className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed font-sans normal-case">
          <strong>보안 행동 가이드:</strong> DDoS 임계선 돌파 시 **공격 진원지** 라벨이 표시된 IP를 신속하게 판단하여 `IP 차단` 혹은 `세션 종료` 버튼을 수동 실행하십시오. 조치가 완료되면 즉시 시계열 트래픽이 정상치로 하향 고정되어 복구되고, 결재용 공식 보고서 인쇄 세션이 생성됩니다.
        </p>
      </div>
    </div>
  );
}
