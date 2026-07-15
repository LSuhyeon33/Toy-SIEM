import React from "react";
import { Download, FileText, Clock, ShieldCheck, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Incident } from "../types";
import { generateIncidentReportDocx } from "../utils/reportGenerator";

interface ReportGeneratorProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  selectedIncidentId: string | null;
}

export default function ReportGenerator({
  incidents,
  onSelectIncident,
  selectedIncidentId,
}: ReportGeneratorProps) {
  
  const handleDownload = (e: React.MouseEvent, incident: Incident) => {
    e.stopPropagation();
    generateIncidentReportDocx(incident);
  };

  return (
    <div id="report-generator-container" className="bg-[#0D0D11] border border-[#222222] rounded-md p-5 flex flex-col text-[#D1D1D1] h-full">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white tracking-widest uppercase">[FR-4] 이상 조치 완료 이력 및 공문 보고서 출력</h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-tighter mt-0.5">보안 위협 조치 결과 로그북 관리 및 사내 표준 기안지(Word .docx) 자동 생성</p>
          </div>
        </div>
      </div>

      {/* Incident List */}
      <div className="flex-1 overflow-y-auto max-h-[300px] scrollbar border border-[#222222] rounded bg-[#14141A]/40">
        {incidents.length === 0 ? (
          <div className="py-14 text-center text-gray-500 text-[10px] uppercase tracking-wider">
            기록된 위협 이상 및 대응 이력이 존재하지 않습니다.
          </div>
        ) : (
          <div className="divide-y divide-[#222222]/60">
            {incidents.map((inc) => {
              const isSelected = selectedIncidentId === inc.id;
              const isMitigated = inc.status === 'mitigated';

              return (
                <div
                  id={`incident-item-${inc.id}`}
                  key={inc.id}
                  onClick={() => onSelectIncident(inc)}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-[#14141A]/90 border-l-2 border-blue-500' 
                      : 'hover:bg-[#14141A]/50 border-l-2 border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {isMitigated ? (
                        <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" title="조치 완료">
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="p-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse" title="위협 진행중">
                          <ShieldAlert className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-xs font-bold text-white tracking-wide">{inc.type}</span>
                        <span className={`text-[8px] px-1 rounded font-bold uppercase ${
                          inc.severity === 'Critical' 
                            ? 'bg-red-500/20 text-red-400' 
                            : inc.severity === 'High' 
                              ? 'bg-orange-500/20 text-orange-400' 
                              : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {inc.severity}
                        </span>
                        <span className="text-[9px] text-gray-500 font-mono uppercase">ID: {inc.id.substring(0, 8)}</span>
                      </div>
                      
                      {/* Sub details */}
                      <div className="flex items-center gap-3 text-[9px] text-gray-500 mt-1 flex-wrap font-sans uppercase">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-gray-600" />
                          감지: {inc.detectedAt}
                        </span>
                        <span>•</span>
                        <span>유입처: <strong className="text-[#D1D1D1]">{inc.targetNetwork}</strong></span>
                        <span>•</span>
                        <span className="font-mono">IP: {inc.sourceIp}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions (Download / Progress indication) */}
                  <div className="flex items-center gap-2 sm:self-center font-sans">
                    {isMitigated ? (
                      <button
                        id={`download-report-btn-${inc.id}`}
                        onClick={(e) => handleDownload(e, inc)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[10px] uppercase tracking-wider font-bold text-emerald-400 bg-[#14141A] border border-emerald-500/40 hover:bg-emerald-500 hover:text-white transition-all shrink-0"
                        title="결과 보고서 다운로드 (.docx)"
                      >
                        <Download className="w-3 h-3" />
                        <span>결과 보고서 (.docx)</span>
                      </button>
                    ) : (
                      <span className="text-[9px] text-red-500 font-bold bg-[#1A0B0B] border border-red-900/40 px-2.5 py-1.5 rounded flex items-center gap-1.5 uppercase tracking-wide">
                        <span className="w-1 h-1 rounded-full bg-red-500 animate-ping"></span>
                        수동 조치 대기 중
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Incident Live Audit Trail Log */}
      {selectedIncidentId && (
        <div className="mt-4 bg-[#14141A]/60 rounded p-3.5 border border-[#222222] font-mono text-[10px] text-gray-400">
          <div className="text-[9px] text-gray-500 font-bold mb-2 uppercase tracking-wide flex items-center gap-1.5 font-sans">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            <span>선택한 사고 분석 정보 및 감사 로그 추적</span>
          </div>
          
          {(() => {
            const currentInc = incidents.find(i => i.id === selectedIncidentId);
            if (!currentInc) return null;

            return (
              <div className="flex flex-col gap-1 text-[11px] text-slate-300">
                <div>[SYSTEM] <span className="text-gray-600">{currentInc.detectedAt}</span> - 무선 세션 패킷 속도 이상 탐지 임계선 돌파 감지.</div>
                <div>[IDS] <span className="text-gray-600">{currentInc.detectedAt}</span> - {currentInc.type} 분류 완료 (위협도 스코어: {currentInc.anomalyScore.toFixed(1)}%).</div>
                
                {currentInc.actions.map((act) => (
                  <div key={act.id} className="mt-1">
                    <span className="text-blue-400 font-semibold">[SEC_OPERATOR]</span> <span className="text-gray-600">{act.timestamp}</span> - 담당자({act.operator}) 수동 {act.actionType === 'IP_BLOCK' ? '방화벽 IP 차단 정책' : 'RADIUS 접속 세션 종료'} 명령 발송. 
                    <div className="pl-4 text-emerald-400">└ 상태: {act.status === 'COMPLETED' ? 'SUCCESS (정상 완결)' : 'PROCESSING...'}</div>
                  </div>
                ))}

                {currentInc.status === 'mitigated' && (
                  <div className="text-emerald-400 mt-1 font-bold">
                    [SYSTEM] {currentInc.mitigatedAt} - 대응 조치 적용 완료 후 트래픽 하향 안정화 확인 (정상 복구 환원).
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
