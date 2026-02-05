
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisData } from "../types";

const MODEL_NAME = 'gemini-3-pro-preview';

export const analyzeMedicalReport = async (
  imageBase64: string, 
  locationContext: string = "Global",
  targetLanguage: string = "en"
): Promise<AnalysisData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      document_type: { 
        type: Type.STRING, 
        description: "Exact type of medical document (e.g. Histopathology, CBC, MRI, ECG, Prescription)." 
      },
      summary: {
        type: Type.STRING,
        description: "Patient explanation in simple language. Trilingual comparison: (Arabic, French, English).",
      },
      clinical_report: {
        type: Type.STRING,
        description: "Technical professional report for doctors with Differential Diagnosis and evidence-based plan.",
      },
      executive_summary: {
        type: Type.STRING,
        description: "Short executive summary for busy doctors with local pharmacy medicine suggestions.",
      },
      vital_markers: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            value: { type: Type.STRING },
            unit: { type: Type.STRING },
            range: { type: Type.STRING },
            status: { type: Type.STRING, enum: ['normal', 'low', 'high', 'critical'] },
          },
          required: ["name", "value", "status"],
        },
      },
      highlight_map: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING, description: "Exact phrase from the document." },
            reason: { type: Type.STRING, description: "Why this is highlighted." },
            color: { type: Type.STRING, enum: ['red', 'yellow', 'green'] }
          },
          required: ["text", "color"]
        }
      },
      recommendations: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Lifestyle suggestions for patients.",
      },
      treatment_plan: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Clinical next steps and tests for the doctor.",
      },
      urgency_level: {
        type: Type.STRING,
        enum: ['low', 'medium', 'high', 'emergency'],
      },
      geographic_tips: {
        type: Type.STRING,
        description: "Generic medicine names and local protocols for the user region.",
      },
      specialized_findings: {
        type: Type.OBJECT,
        properties: {
          qrs_complex: { type: Type.STRING },
          ejection_fraction: { type: Type.STRING },
          malignancy_risk: { type: Type.STRING },
          drug_interactions: { type: Type.STRING }
        }
      }
    },
    required: ["document_type", "summary", "clinical_report", "executive_summary", "vital_markers", "highlight_map", "urgency_level"],
  };

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: imageBase64.split(',')[1] || imageBase64,
          },
        },
        {
          text: `أنت الآن أستاذ استشاري في الطب الباطني والتشخيص الرقمي. مهمتك هي تحليل الوثائق الطبية المرفوعة بدقة علمية فائقة.
          
          الوثائق المدعومة تشمل 35 نوعاً (تحاليل مخبرية، أشعة، خزعات، تخطيط قلب، تقارير جراحية).
          
          المطلوب منك تطبيق المنطق الشرطي التالي:
          1. إذا كانت 'خزعة' (Biopsy): ركز على Malignancy vs Benign.
          2. إذا كانت 'أشعة' (Radiology): ركز على Impression و Findings.
          3. إذا كان 'تخطيط قلب' (ECG): حلل QRS complex و Ejection Fraction.
          4. إذا كانت 'وصفة طبية': تحقق من تضارب الأدوية (Drug-Drug Interaction).

          المخرجات الإلزامية:
          - التحليل اللغوي الثلاثي: شرح النتائج بـ (العربية، الفرنسية، الإنجليزية) في جداول مقارنة أو أقسام واضحة.
          - تضليل العبارات (Highlighting): حدد بدقة العبارات الحساسة في حقل highlight_map.
          - التقرير الذكي: صِغ تقريراً موجهاً للمريض بتبسيط، وتقريراً تقنياً للطبيب بـ Evidence-based medicine.
          - التخصيص الجغرافي: اقترح أسماء علمية للأدوية (Generic Names) وبروتوكولات المنطقة (${locationContext}).

          يجب أن تكون المخرجات بتنسيق JSON حصراً.`,
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
    },
  });

  const text = response.text;
  if (!text) throw new Error("Empty response from AI");

  return JSON.parse(text) as AnalysisData;
};
