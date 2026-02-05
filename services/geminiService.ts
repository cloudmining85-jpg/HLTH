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
        description: "Exact medical document type (e.g., Histopathology, CBC, MRI, ECG, Biopsy)." 
      },
      summary: {
        type: Type.STRING,
        description: "Trilingual explanation for the patient (Arabic, French, English sections). Use simple language.",
      },
      clinical_report: {
        type: Type.STRING,
        description: "Highly technical technical report for medical professionals. Use evidence-based medicine terminology.",
      },
      executive_summary: {
        type: Type.STRING,
        description: "Concise summary for doctors including local pharmacy generic medicine suggestions.",
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
            text: { type: Type.STRING, description: "The specific sensitive medical phrase from the original document text." },
            reason: { type: Type.STRING, description: "Clinical significance of this phrase." },
            color: { type: Type.STRING, enum: ['red', 'yellow', 'green'] }
          },
          required: ["text", "color", "reason"]
        }
      },
      recommendations: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Lifestyle and patient-oriented advice.",
      },
      treatment_plan: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Clinical protocols and evidence-based plan for the physician.",
      },
      differential_diagnosis: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
      complementary_tests: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
      urgency_level: {
        type: Type.STRING,
        enum: ['low', 'medium', 'high', 'emergency'],
      },
      geographic_tips: {
        type: Type.STRING,
        description: "Regional medicine context (generic names and protocols) for the specified location.",
      },
      specialized_findings: {
        type: Type.OBJECT,
        properties: {
          qrs_complex: { type: Type.STRING },
          ejection_fraction: { type: Type.STRING },
          malignancy_risk: { type: Type.STRING },
          drug_interactions: { type: Type.STRING },
          calibration_notes: { type: Type.STRING }
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