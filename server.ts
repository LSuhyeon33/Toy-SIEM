import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON middleware
  app.use(express.json());

  // API Endpoints
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  app.post("/api/analyze", async (req: express.Request, res: express.Response) => {
    try {
      const { incidentData } = req.body;
      if (!incidentData) {
        return res.status(400).json({ error: "No incident data provided." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      
      // If no valid key is configured, return an offline simulation response
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
        const simulatedText = `### 🚨 AI 위협 심층 분석 보고 (시뮬레이션)

1. **징후 및 현황 요약**
   - 현재 **${incidentData.targetNetwork}** 망에서 급격한 트래픽 유입이 포착되었습니다.
   - 감지된 최대 대역폭은 **${incidentData.peakBps} Mbps**로, 평시 정상 범주(150~300 Mbps)의 **약 ${ (incidentData.peakBps / 200).toFixed(1) }배**에 달하며, 초당 패킷 전송량(PPS)은 **${incidentData.peakPps.toLocaleString()} PPS**를 기록하여 극심한 과부하 상태입니다.

2. **이상 트래픽 판단 근거**
   - 과학기술정보통신부 무선데이터 트래픽 통계(평균 업무망 WiFi 접속량 기준) 대비 비정상적으로 치솟은 트래픽은 일반적인 사용자 동작 범위를 벗어납니다.
   - 가해 소스 IP인 \`${incidentData.sourceIp}\`로부터 동시다발적인 세션 개설 시도 및 TCP SYN 또는 대량의 무의미한 UDP 데이터가 지속 유입되고 있어, 명백한 **${incidentData.type}**로 진단됩니다.

3. **인프라 영향도 분석**
   - 무선 접속 세션 자원의 임계치가 고갈되고 있어, 동일 AP(접속 장치)를 공유하는 사내 임직원 및 공용 단말기들의 네트워크 연결 지연 및 패킷 손실이 90% 이상으로 확대되었습니다.
   - 적절한 조치가 취해지지 않을 경우 내부 백본망과 결재 시스템 연결까지 2차 장애 전파 위험이 존재합니다. (위협 등급: **Critical**)

4. **보안 담당자 수동 대응 지침**
   - **방화벽 IP 차단**: 가해 IP \`${incidentData.sourceIp}\`를 차단 블랙리스트에 즉시 반영하여 네트워크 인그레스 단에서 유입을 전면 차단해야 합니다.
   - **무선 세션 강제 종료**: 해당 단말의 무선 인증 서버(RADIUS/TACACS+) 세션을 무효화하고 접속을 해제하여 하드웨어 가용 세션을 즉각 회수해야 합니다.`;
        
        return res.json({
          analysis: simulatedText,
          isSimulated: true
        });
      }

      // Initialize Gemini AI SDK Lazily
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `
당신은 사내 네트워크 보안 및 무선 인프라를 총괄하는 전문 보안 관제 AI 시스템입니다.
현재 무선망에서 DDoS 등 이상 트래픽이 감지되어 보안 담당자에게 상세한 원인 분석 보고를 제공해야 합니다.

아래 트래픽 데이터와 위협 상황 정보를 바탕으로, 다음 목차에 맞춰 한국어로 고도로 전문적이고 정밀한 위협 분석 결과를 작성해주세요:

1. **징후 및 현황 요약**: 감지된 트래픽 수치와 공격 유형, 정상 범주 대비 증가율 분석
2. **이상 트래픽 판단 근거**: 특정 IP 및 패킷 흐름 측면에서 분석한 이상 패턴 근거 (과학기술정보통신부의 일반적인 무선데이터 트래픽 통계 범주와 비교하여 분석)
3. **인프라 영향도 분석**: 사내 업무 WiFi 존 및 5G 망 전체에 미칠 수 있는 장애 범위와 위협 수준
4. **보안 담당자 수동 대응 지침**: 방화벽 IP 차단 및 세션 강제 종료 조치 적용 가이드

데이터 정보:
- 공격 유형: ${incidentData.type}
- 감지된 망: ${incidentData.targetNetwork}
- 감지 시각: ${incidentData.detectedAt}
- 가해 소스 IP: ${incidentData.sourceIp}
- 이상 위험도 스코어: ${incidentData.anomalyScore}%
- 최대 대역폭: ${incidentData.peakBps} Mbps
- 최대 초당 패킷 전송량: ${incidentData.peakPps} PPS

답변은 마크다운 형식으로 공손하고 격식 있는 어조로 작성해 주세요. 불필요한 서문 없이 본론부터 한국어로 깔끔하게 작성해 주세요.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      res.json({
        analysis: response.text || "분석 결과를 생성하는 데 실패했습니다.",
        isSimulated: false
      });
    } catch (error: any) {
      console.error("Gemini analysis error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
