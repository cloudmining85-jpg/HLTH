export enum AnalysisStatus {
  PENDING = 'pending',
  ANALYZED = 'analyzed',
  FAILED = 'failed'
}

export enum DoctorSpecialty {
  GENERAL = 'general',
  CARDIOLOGY = 'cardiology',
  LABORATORY = 'laboratory',
  RADIOLOGY = 'radiology',
  INTERNAL_MEDICINE = 'internal_medicine'
}

export interface HighlightItem {
  text: string;
  reason: string;
  color: 'red' | 'yellow' | 'green';
}

export interface VitalMarker {
  name: string;
  value: string | number;
  unit: string;
  range: string;
  status: 'normal' | 'low' | 'high' | 'critical';
}

export interface AnalysisData {
  document_type: string;
  summary: string; // Trilingual Ar, Fr, En
  clinical_report: string; // Professional technical report
  executive_summary: string; // Short for doctors
  vital_markers: VitalMarker[];
  recommendations: string[]; 
  treatment_plan: string[]; 
  differential_diagnosis?: string[];
  complementary_tests?: string[];
  highlight_map: HighlightItem[];
  urgency_level: 'low' | 'medium' | 'high' | 'emergency';
  geographic_tips?: string; 
  specialized_findings?: {
    qrs_complex?: string;
    ejection_fraction?: string;
    malignancy_risk?: string;
    drug_interactions?: string;
    calibration_notes?: string;
  };
}

export interface MedicalReport {
  id: string;
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  thumbnail: string;
  status: AnalysisStatus;
  analysisData?: AnalysisData;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  languagePreference: 'en' | 'ar' | 'fr';
  specialty?: DoctorSpecialty;
}