import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { AnalysisData } from "../types";

// استخدم موديل 1.5 برو لأنه الأفضل في تحليل الصور والبيانات الطبية المعقدة
const MODEL_NAME = 'gemini-1.5-pro';

export const analyzeMedicalReport = async (
  imageBase64: string, 
  locationContext: string = "Global",
  targetLanguage: string = "en"
): Promise<AnalysisData> => {
  
  // تصحيح قراءة المفتاح ليتوافق مع Vite و Cloudflare Pages
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("API Key is missing! Please set VITE_GEMINI_API_KEY in Cloudflare dashboard.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  // تعريف الهيكل التنظيمي للبيانات (Response Schema) لضمان الحصول على JSON سليم
  const responseSchema = {
    type: SchemaType.OBJECT,
    properties: {
      document_type: { type: SchemaType.STRING },
      summary: { type: SchemaType.STRING },
      clinical_report: { type: SchemaType.STRING },
      executive_summary: { type: SchemaType.STRING },
      vital_markers: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            name: { type: SchemaType.STRING },
            value: { type: SchemaType.STRING },
            unit: { type: SchemaType.STRING },
            range: { type: SchemaType.STRING },
            status: { type: SchemaType.STRING }, // 'normal', 'low', 'high', 'critical'
          },
          required: ["name", "value", "status"],
        },
      },
      highlight_map: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            text: { type: SchemaType.STRING },
            reason: { type: SchemaType.STRING },
            color: { type: SchemaType.STRING } // 'red', 'yellow', 'green'
          },
          required: ["text", "color", "reason"]
        }
      },
      recommendations: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
      treatment_plan: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
      differential_diagnosis: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
      complementary_tests: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
      urgency_level: { type: SchemaType.STRING },
      geographic_tips: { type: SchemaType.STRING },
      specialized_findings: {
        type: SchemaType.OBJECT,
        properties: {
          qrs_complex: { type: SchemaType.STRING },
          ejection_fraction: { type: SchemaType.STRING },
          malignancy_risk: { type: SchemaType.STRING },
          drug_interactions: { type: SchemaType.STRING },
          calibration_notes: { type: SchemaType.STRING }
        }
      }
    },
    required: ["document_type", "summary", "clinical_report", "executive_summary", "vital_markers", "highlight_map", "urgency_level"],
  };

  const model = genAI.getGenerativeModel({ 
    model: MODEL_NAME,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
    },
  });

  // تنظيف بيانات الصورة (إزالة Header الـ Base64 إذا وجد)
  const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

  const prompt = `أنت الآن أستاذ استشاري في الطب الباطني والتشخيص الرقمي. مهمتك هي تحليل الوثائق الطبية المرفوعة بدقة علمية فائقة.
          
          الوثائق المدعومة تشمل 35 نوعاً (تحاليل مخبرية، أشعة، خزعات، تخطيط قلب، تقارير جراحية).
          
          المطلوب منك تطبيق المنطق الشرطي التالي:
          1. إذا كانت 'خزعة' (Biopsy): ركز على Malignancy vs Benign.
          2. إذا كانت 'أشعة' (Radiology): ركز على Impression و Findings.
          3. إذا كان 'تخطيط قلب' (ECG): حلل QRS complex و Ejection Fraction.
          4. إذا كانت 'وصفة طبية': تحقق من تضارب الأدوية (Drug-Drug Interaction).

          المخرجات الإلزامية:
          - التحليل اللغوي الثلاثي: شرح النتائج بـ (العربية، الفرنسية، الإنجليزية) بوضوح.
          - تضليل العبارات (Highlighting): حدد بدقة العبارات الحساسة في حقل highlight_map مع ذكر السبب الطبي.
          - التقرير الذكي: صِغ تقريراً موجهاً للمريض بتبسيط، وتقريراً تقنياً للطبيب بـ Evidence-based medicine.
          - التخصيص الجغرافي: اقترح أسماء علمية للأدوية (Generic Names) وبروتوكولات المنطقة (${locationContext}).

          يجب أن تكون المخرجات بتنسيق JSON حصراً.`;

  try {
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data,
        },
      },
      { text: prompt },
    ]);

    const response = await result.response;
    const text = response.text();
    
    if (!text) {
      throw new Error("AI returned an empty response.");
    }

    return JSON.parse(text) as AnalysisData;

  } catch (error: any) {
    console.error("Detailed Analysis Error:", error);
    
    // توفير رسالة خطأ واضحة للمستخدم في واجهة التطبيق
    if (error.message?.includes("API key not valid")) {
      throw new Error("Invalid API Key. Please check your Cloudflare settings.");
    }
    
    throw new Error("Analysis failed. Please ensure the document is clear and readable.");
  }
};