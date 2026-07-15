import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  AlignmentType, 
  HeadingLevel, 
  BorderStyle,
  Header,
  Footer
} from "docx";
import { Incident } from "../types";

export function generateIncidentReportDocx(incident: Incident) {
  // Common styles & constants
  const COLOR_PRIMARY = "1E3A8A";  // Corporate Navy
  const COLOR_SECONDARY = "475569"; // Slate gray
  const COLOR_BG_LIGHT = "F8FAFC";  // Ice blue/gray
  const COLOR_BORDER = "CBD5E1";    // Slate light
  
  const borderThin = {
    style: BorderStyle.SINGLE,
    size: 4,
    color: COLOR_BORDER,
  };

  const bordersAllThin = {
    top: borderThin,
    bottom: borderThin,
    left: borderThin,
    right: borderThin,
  };

  // Header and Footer for standard enterprise layout
  const header = new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
          new TextRun({
            text: "사내 무선망 인프라 보안 관리처 | [대외비 / Confidential]",
            font: "맑은 고딕",
            size: 16,
            color: COLOR_SECONDARY,
          }),
        ],
      }),
    ],
  });

  const footer = new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: `본 보고서는 시스템에 의해 자동으로 생성되었으며 임의 수정은 금지됩니다. (사고 ID: ${incident.id})`,
            font: "맑은 고딕",
            size: 16,
            color: COLOR_SECONDARY,
          }),
        ],
      }),
    ],
  });

  // 1. Approval Line Table (결재선)
  const approvalTable = new Table({
    width: {
      size: 45,
      type: WidthType.PERCENTAGE,
    },
    alignment: AlignmentType.RIGHT,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 10, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: "구 분", font: "맑은 고딕", size: 18, bold: true })]
              })
            ],
            shading: { fill: COLOR_BG_LIGHT },
            borders: bordersAllThin,
          }),
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: "보안 담당자", font: "맑은 고딕", size: 18, bold: true })]
              })
            ],
            shading: { fill: COLOR_BG_LIGHT },
            borders: bordersAllThin,
          }),
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: "보안 부서장", font: "맑은 고딕", size: 18, bold: true })]
              })
            ],
            shading: { fill: COLOR_BG_LIGHT },
            borders: bordersAllThin,
          }),
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: "인프라 본부장", font: "맑은 고딕", size: 18, bold: true })]
              })
            ],
            shading: { fill: COLOR_BG_LIGHT },
            borders: bordersAllThin,
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: "서명/\n인장", font: "맑은 고딕", size: 16, bold: true })]
              })
            ],
            shading: { fill: COLOR_BG_LIGHT },
            borders: bordersAllThin,
          }),
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: "\n\n(서명)\n", font: "맑은 고딕", size: 18, color: "E2E8F0" }),
                  new TextRun({ text: "자동 승인", font: "맑은 고딕", size: 14, color: "10B981", bold: true }),
                  new TextRun({ text: `\n${incident.actions[0]?.timestamp.split(" ")[1] || ""}`, font: "맑은 고딕", size: 14, color: COLOR_SECONDARY })
                ]
              })
            ],
            borders: bordersAllThin,
          }),
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: "\n\n(서명)\n\n", font: "맑은 고딕", size: 18, color: "E2E8F0" })]
              })
            ],
            borders: bordersAllThin,
          }),
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: "\n\n(서명)\n\n", font: "맑은 고딕", size: 18, color: "E2E8F0" })]
              })
            ],
            borders: bordersAllThin,
          }),
        ],
      }),
    ],
  });

  // 2. Incident Information Table (사고 기본 정보)
  const infoTable = new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 20, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: "문서 번호", font: "맑은 고딕", size: 18, bold: true })] })],
            shading: { fill: COLOR_BG_LIGHT },
            borders: bordersAllThin,
          }),
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: `SEC-WIFI-${incident.id.substring(0, 8).toUpperCase()}`, font: "맑은 고딕", size: 18 })] })],
            borders: bordersAllThin,
          }),
          new TableCell({
            width: { size: 20, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: "보안 등급", font: "맑은 고딕", size: 18, bold: true })] })],
            shading: { fill: COLOR_BG_LIGHT },
            borders: bordersAllThin,
          }),
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({ 
                children: [
                  new TextRun({ 
                    text: incident.severity === 'Critical' || incident.severity === 'High' ? "● 대외비 (Level 3)" : "○ 사내용 (Level 2)", 
                    font: "맑은 고딕", 
                    size: 18, 
                    bold: true,
                    color: incident.severity === 'Critical' ? "EF4444" : COLOR_SECONDARY
                  })
                ] 
              })
            ],
            borders: bordersAllThin,
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: "탐지 일시", font: "맑은 고딕", size: 18, bold: true })] })],
            shading: { fill: COLOR_BG_LIGHT },
            borders: bordersAllThin,
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: incident.detectedAt, font: "맑은 고딕", size: 18 })] })],
            borders: bordersAllThin,
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: "대상 인프라", font: "맑은 고딕", size: 18, bold: true })] })],
            shading: { fill: COLOR_BG_LIGHT },
            borders: bordersAllThin,
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: incident.targetNetwork, font: "맑은 고딕", size: 18, bold: true })] })],
            borders: bordersAllThin,
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: "공격 유형", font: "맑은 고딕", size: 18, bold: true })] })],
            shading: { fill: COLOR_BG_LIGHT },
            borders: bordersAllThin,
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: incident.type, font: "맑은 고딕", size: 18, bold: true, color: "EF4444" })] })],
            borders: bordersAllThin,
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: "위협 소스 IP", font: "맑은 고딕", size: 18, bold: true })] })],
            shading: { fill: COLOR_BG_LIGHT },
            borders: bordersAllThin,
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: incident.sourceIp, font: "맑은 고딕", size: 18 })] })],
            borders: bordersAllThin,
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: "이상 위험도", font: "맑은 고딕", size: 18, bold: true })] })],
            shading: { fill: COLOR_BG_LIGHT },
            borders: bordersAllThin,
          }),
          new TableCell({
            children: [
              new Paragraph({ 
                children: [
                  new TextRun({ text: `${incident.anomalyScore.toFixed(1)}% `, font: "맑은 고딕", size: 18, bold: true, color: "EF4444" }),
                  new TextRun({ text: "(DDoS 위험 임계치 상회)", font: "맑은 고딕", size: 14, color: "94A3B8" })
                ] 
              })
            ],
            borders: bordersAllThin,
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: "최대 트래픽 수치", font: "맑은 고딕", size: 18, bold: true })] })],
            shading: { fill: COLOR_BG_LIGHT },
            borders: bordersAllThin,
          }),
          new TableCell({
            children: [
              new Paragraph({ 
                children: [
                  new TextRun({ text: `${incident.peakBps} Mbps`, font: "맑은 고딕", size: 18, bold: true }),
                  new TextRun({ text: ` / ${incident.peakPps.toLocaleString()} PPS`, font: "맑은 고딕", size: 14, color: COLOR_SECONDARY })
                ] 
              })
            ],
            borders: bordersAllThin,
          }),
        ],
      }),
    ],
  });

  // 3. Action History Table (대응 조치 이력)
  const actionHeaderRow = new TableRow({
    children: [
      new TableCell({
        width: { size: 10, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "순번", font: "맑은 고딕", size: 16, bold: true })] })],
        shading: { fill: COLOR_PRIMARY },
        borders: bordersAllThin,
      }),
      new TableCell({
        width: { size: 25, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "조치 일시", font: "맑은 고딕", size: 16, bold: true, color: "FFFFFF" })] })],
        shading: { fill: COLOR_PRIMARY },
        borders: bordersAllThin,
      }),
      new TableCell({
        width: { size: 20, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "대상 IP", font: "맑은 고딕", size: 16, bold: true, color: "FFFFFF" })] })],
        shading: { fill: COLOR_PRIMARY },
        borders: bordersAllThin,
      }),
      new TableCell({
        width: { size: 25, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "수행한 조치", font: "맑은 고딕", size: 16, bold: true, color: "FFFFFF" })] })],
        shading: { fill: COLOR_PRIMARY },
        borders: bordersAllThin,
      }),
      new TableCell({
        width: { size: 20, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "진행 상태", font: "맑은 고딕", size: 16, bold: true, color: "FFFFFF" })] })],
        shading: { fill: COLOR_PRIMARY },
        borders: bordersAllThin,
      }),
    ],
  });

  const actionRows = incident.actions.length > 0 
    ? incident.actions.map((act, index) => {
        return new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(index + 1), font: "맑은 고딕", size: 16 })] })],
              borders: bordersAllThin,
            }),
            new TableCell({
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: act.timestamp, font: "맑은 고딕", size: 16 })] })],
              borders: bordersAllThin,
            }),
            new TableCell({
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: act.targetIp, font: "맑은 고딕", size: 16 })] })],
              borders: bordersAllThin,
            }),
            new TableCell({
              children: [
                new Paragraph({ 
                  alignment: AlignmentType.CENTER, 
                  children: [
                    new TextRun({ 
                      text: act.actionType === 'IP_BLOCK' ? "방화벽 IP 차단" : "무선 세션 강제 종료", 
                      font: "맑은 고딕", 
                      size: 16, 
                      bold: true,
                      color: COLOR_PRIMARY
                    })
                  ] 
                })
              ],
              borders: bordersAllThin,
            }),
            new TableCell({
              children: [
                new Paragraph({ 
                  alignment: AlignmentType.CENTER, 
                  children: [
                    new TextRun({ 
                      text: act.status === 'COMPLETED' ? "조치 완료 (Success)" : "처리 중", 
                      font: "맑은 고딕", 
                      size: 16, 
                      bold: true,
                      color: act.status === 'COMPLETED' ? "10B981" : "F59E0B"
                    })
                  ] 
                })
              ],
              borders: bordersAllThin,
            }),
          ]
        });
      })
    : [
        new TableRow({
          children: [
            new TableCell({
              columnSpan: 5,
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "수행된 수동 대응 조치 내역이 없습니다.", font: "맑은 고딕", size: 16 })] })],
              borders: bordersAllThin,
            })
          ]
        })
      ];

  const actionHistoryTable = new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    rows: [actionHeaderRow, ...actionRows],
  });

  // Extract raw text paragraphs from the AI / Rule reasoning
  const reasoningParagraphs = (incident.aiExplanation || incident.reason)
    .split("\n")
    .filter(p => p.trim() !== "")
    .map(para => {
      // Clean markdown bold symbols and list stars
      const cleaned = para.replace(/\*\*/g, "").replace(/^\*\s*/, "• ").replace(/^-\s*/, "• ");
      const isHeader = para.startsWith("###") || para.startsWith("####") || !!para.match(/^\d+\./);
      return new Paragraph({
        spacing: { before: 120, after: 120, line: 360 },
        indent: isHeader ? undefined : { left: 240 },
        children: [
          new TextRun({
            text: cleaned,
            font: "맑은 고딕",
            size: isHeader ? 18 : 16,
            bold: isHeader,
            color: isHeader ? COLOR_PRIMARY : "334155",
          }),
        ],
      });
    });

  // Document Assembly
  const doc = new Document({
    sections: [
      {
        headers: { default: header },
        footers: { default: footer },
        children: [
          // 1. Report Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 240 },
            children: [
              new TextRun({
                text: "무선망 트래픽 이상 탐지 및 수동 조치 보고서",
                font: "맑은 고딕",
                size: 36,
                bold: true,
                color: COLOR_PRIMARY,
              }),
            ],
          }),
          
          // Subtitle
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 360 },
            children: [
              new TextRun({
                text: "TCP/IP 트래픽 위협 분석 및 인프라 보호 대응 이력 보고",
                font: "맑은 고딕",
                size: 18,
                color: COLOR_SECONDARY,
              }),
            ],
          }),

          // Approval Table Section
          approvalTable,
          
          new Paragraph({ text: "\n", spacing: { after: 120 } }),

          // Header 1: Basic Information
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({
                text: "1. 탐지 인프라 및 사고 기본 정보",
                font: "맑은 고딕",
                size: 20,
                bold: true,
                color: COLOR_PRIMARY,
              }),
            ],
          }),

          infoTable,

          new Paragraph({ text: "\n", spacing: { after: 120 } }),

          // Header 2: Technical Threat Analysis
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({
                text: "2. 기술적 위협 및 이상 징후 분석",
                font: "맑은 고딕",
                size: 20,
                bold: true,
                color: COLOR_PRIMARY,
              }),
            ],
          }),

          // Anomaly reasons & AI insights
          ...reasoningParagraphs,

          new Paragraph({ text: "\n", spacing: { after: 120 } }),

          // Header 3: Incident Response History
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({
                text: "3. 담당자 수동 보안 제어 및 조치 결과",
                font: "맑은 고딕",
                size: 20,
                bold: true,
                color: COLOR_PRIMARY,
              }),
            ],
          }),

          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: "보안 시스템의 경고 발생 후 인프라 담당자에 의해 아래 대응 조치가 신속하게 수동 적용되었습니다. 조치 완료 이후 해당 무선 대역폭 및 세션 점유 상태는 정상 범주(하향 안정화)로 환원되었습니다.",
                font: "맑은 고딕",
                size: 16,
                color: "334155",
              })
            ]
          }),

          actionHistoryTable,

          new Paragraph({ text: "\n\n", spacing: { after: 240 } }),

           // Regulatory Note
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 240 },
            children: [
              new TextRun({
                text: "본 보고서는 정보통신망 이용촉진 및 정보보호 등에 관한 법률 및 사내 내부 보안 제어 가이드에 의거하여 기밀 등급 문서로 취급되며 무단 배포를 엄격히 금지합니다.",
                font: "맑은 고딕",
                size: 14,
                color: "94A3B8",
                italics: true,
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 120 },
            children: [
              new TextRun({
                text: `보고서 생성 일시: ${new Date().toISOString().replace('T', ' ').substring(0, 19)} (UTC)`,
                font: "맑은 고딕",
                size: 14,
                color: "94A3B8",
              }),
            ],
          }),
        ],
      },
    ],
  });

  // Pack the document and trigger download
  Packer.toBlob(doc).then((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `WIFI_Security_Incident_Report_${incident.id.toUpperCase()}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }).catch((err) => {
    console.error("docx Packer Error:", err);
    alert("보고서 생성 중 오류가 발생했습니다: " + err.message);
  });
}
