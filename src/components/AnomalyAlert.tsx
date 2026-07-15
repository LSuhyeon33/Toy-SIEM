import React, { useState } from "react";
import { ShieldAlert, Sparkles, Terminal, Loader2, CheckCircle2, AlertOctagon } from "lucide-react";
import { Incident } from "../types";

interface AnomalyAlertProps {
  activeIncident: Incident | null;
  onAnalyzeAi: () => Promise<void>;
  aiAnalysisText: string | null;
  isAiLoading: boolean;
}

export default function AnomalyAlert({
  activeIncident,
  onAnalyzeAi,
  aiAnalysisText,
  isAiLoading,
}: AnomalyAlertProps) {
  const [copied, setCopied] = useState(false);

  // Parse markdown bold and list elements into nice JSX
  const renderFormattedAnalysis = (text: string) => {
    return text.split("\n").map((line, idx) => {
      let trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-2"></div>;

      // Check header matches
      if (trimmed.startsWith("###")) {
        return (
          <h4 key={idx} className="text-sm font-bold text-blue-300 mt-4 mb-2 flex items-center gap-1.5 border-b border-slate-800 pb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            {trimmed.replace(/^###\s*/, "")}
          </h4>
        );
      }
      if (trimmed.startsWith("##") || trimmed.match(/^\d+\./)) {
        return (
          <h3 key={idx} className="text-base font-bold text-white mt-5 mb-2.5 flex items-center gap-2">
            <span className="text-blue-500 font-mono">#</span>
            {trimmed.replace(/^##\s*/, "")}
          </h3>
        );
      }

      // Check bullets
      let isBullet = false;
      if (trimmed.startsWith("-") || trimmed.startsWith("*") || trimmed.startsWith("•")) {
        trimmed = trimmed.replace(/^[-*•]\s*/, "");
        isBullet = true;
      }

      // Check inline bold **
      const parts = trimmed.split(/(\*\*.*?\*\*)/g);
      const renderedText = parts.map((part, pIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={pIdx} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (isBullet) {
        return (
          <li key={idx} className="ml-4 pl-1 list-disc text-xs text-slate-300 mb-1.5 leading-relaxed">
            {renderedText}
          </li>
        );
      }

      return (
        <p key={idx} className="text-xs text-slate-300 mb-2 leading-relaxed">
          {renderedText}
        </p>
      );
    });
  };

  const handleCopy = () => {
    if (aiAnalysisText) {
      navigator.clipboard.writeText(aiAnalysisText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div id="anomaly-alert-panel" className="bg-[#0D0D11] border border-[#222222] rounded-md p-5 flex flex-col text-[#D1D1D1] h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded ${activeIncident ? 'bg-red-500/15 text-red-400 animate-pulse' : 'bg-emerald-500/10 text-emerald-400'}`}>
          {activeIncident ? <ShieldAlert className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
        </div>
        <div>
          <h2 className="text-xs font-bold text-white tracking-widest uppercase">[FR-2] 이상 트래픽 및 위협 감지 (SIEM-IDS)</h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-tighter mt-0.5">네트워크 행위 기반 위협 탐지 및 AI 정밀 분석 엔진</p>
        </div>
      </div>

      {!activeIncident ? (
        /* Safe State Dashboard */
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-dashed border-[#222222] rounded bg-[#0D0D11]/50 text-center">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-beacon absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">네트워크 정상 운영 중</h3>
          <p className="text-[10px] text-gray-500 uppercase tracking-tighter max-w-[280px]">
            현재 임계치를 초과하는 비정상 대역폭 폭증이나 DDoS 공격 트래픽 패턴이 식별되지 않았습니다.
          </p>
        </div>
      ) : (
        /* Threat / Active Attack State Dashboard */
        <div className="flex-1 flex flex-col gap-4">
          
          {/* Main Alert Card */}
          <div className="bg-[#1A0B0B] border border-red-900/30 rounded p-4 animate-pulse-red">
            <div className="flex items-start gap-3">
              <AlertOctagon className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-bold text-red-500 tracking-wider uppercase">[CRITICAL] DDoS 위협 공격 포착</span>
                </div>
                <h3 className="text-xs font-bold text-white mb-2 uppercase tracking-wide">{activeIncident.type} 위협 발생</h3>
                
                {/* Radial / Ring style score rendering */}
                <div className="flex items-center gap-4 bg-[#14141A] p-3 rounded border border-[#222222]">
                  <div className="relative flex items-center justify-center">
                    {/* SVG Progress Circle */}
                    <svg className="w-12 h-12 transform -rotate-90">
                      <circle cx="24" cy="24" r="20" stroke="#331111" strokeWidth="4" fill="transparent" />
                      <circle 
                        cx="24" 
                        cy="24" 
                        r="20" 
                        stroke="#ef4444" 
                        strokeWidth="4" 
                        fill="transparent" 
                        strokeDasharray={2 * Math.PI * 20}
                        strokeDashoffset={2 * Math.PI * 20 * (1 - activeIncident.anomalyScore / 100)}
                      />
                    </svg>
                    <span className="absolute text-[10px] font-bold text-red-500 font-mono">
                      {activeIncident.anomalyScore.toFixed(0)}%
                    </span>
                  </div>
                  <div>
                    <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">DDoS 위협 의심도 (IDS Score)</div>
                    <div className="text-xs text-white font-bold">{activeIncident.anomalyScore >= 90 ? '대규모 공격 확실' : '이상 발생'}</div>
                    <div className="text-[9px] text-gray-500 font-mono uppercase">ID: {activeIncident.id.substring(0, 8)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reasoning Criteria Box */}
          <div className="bg-[#14141A] p-3 rounded border border-[#222222] text-xs">
            <div className="text-gray-400 font-bold mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-widest">
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
              <span>정적 룰(IDS) 탐지 이유 명시</span>
            </div>
            <p className="text-[#D1D1D1] leading-relaxed text-[11px] font-medium font-sans">
              {activeIncident.reason}
            </p>
          </div>

          {/* Interactive AI Deep Analysis Box */}
          <div className="flex-1 flex flex-col bg-[#0D0D11]/40 border border-[#222222] rounded p-3.5">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" style={{ animationDuration: '6s' }} />
                Gemini 3.5 AI 실시간 정밀 분석
              </span>
              {aiAnalysisText && !isAiLoading && (
                <button
                  id="copy-ai-analysis-btn"
                  onClick={handleCopy}
                  className="text-[9px] text-gray-400 hover:text-white bg-[#14141A] px-2 py-1 rounded border border-[#222222] uppercase font-bold transition-colors"
                >
                  {copied ? "복사 완료!" : "결과 복사"}
                </button>
              )}
            </div>

            {!aiAnalysisText && !isAiLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                <p className="text-[10px] text-gray-500 uppercase tracking-tighter mb-3 max-w-[280px]">
                  인공지능 보안 모델이 감지된 트래픽 패킷 정보, 이상 지표 및 과기부 표준 기준치를 종합 분석하여 즉시 보고서용 세부 원인을 분석합니다.
                </p>
                <button
                  id="start-ai-analysis-btn"
                  onClick={onAnalyzeAi}
                  className="flex items-center gap-2 px-3 py-2 bg-white text-black font-bold text-[10px] uppercase tracking-widest rounded hover:bg-gray-200 transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  AI 분석 엔진 가동
                </button>
              </div>
            ) : isAiLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400 font-mono text-xs">
                <Loader2 className="w-4 h-4 text-indigo-400 animate-spin mb-3" />
                <div className="text-[10px] text-indigo-300 animate-pulse uppercase tracking-wider">
                  &gt; Analyzing traffic vectors...
                </div>
                <div className="text-[9px] text-gray-500 mt-1 uppercase">
                  과기부 통계 기반 위협 소스 추적 중...
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto max-h-[190px] pr-1.5 bg-[#14141A] p-3 rounded border border-[#222222] scrollbar font-sans">
                {renderFormattedAnalysis(aiAnalysisText || "")}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
