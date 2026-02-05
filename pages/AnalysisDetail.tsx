
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ChevronLeft, 
  Download, 
  AlertCircle,
  Stethoscope,
  User,
  Activity,
  MapPin,
  ClipboardList,
  Flame,
  Heart,
  Microscope,
  Info
} from 'lucide-react';
import { MedicalReport, DoctorSpecialty, HighlightItem } from '../types';
import { exportReportToPDF } from '../services/exportService';

const AnalysisDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'patient' | 'doctor'>('patient');
  const [docSpecialty, setDocSpecialty] = useState<DoctorSpecialty>(DoctorSpecialty.GENERAL);

  const report: MedicalReport | undefined = useMemo(() => {
    const saved = localStorage.getItem('reports');
    if (!saved) return undefined;
    const reports: MedicalReport[] = JSON.parse(saved);
    return reports.find(r => r.id === id);
  }, [id]);

  if (!report || !report.analysisData) return null;

  const { analysisData } = report;

  // نظام التضليل اللوني الذكي
  const highlightText = (text: string, highlightMap: HighlightItem[]) => {
    if (!highlightMap || highlightMap.length === 0) return text;
    
    let result = text;
    // ترتيب الكلمات من الأطول للأقصر لتجنب مشاكل التداخل
    const sortedMap = [...highlightMap].sort((a, b) => b.text.length - a.text.length);
    
    sortedMap.forEach(item => {
      const colorClass = item.color === 'red' ? 'bg-red-200 text-red-900 dark:bg-red-900/40 dark:text-red-300' : 
                         item.color === 'green' ? 'bg-green-200 text-green-900 dark:bg-green-900/40 dark:text-green-300' : 
                         'bg-yellow-200 text-yellow-900 dark:bg-yellow-900/40 dark:text-yellow-300';
      
      const regex = new RegExp(`(${item.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      result = result.replace(regex, `<span class="px-1 rounded-md font-bold cursor-help border-b-2 border-current ${colorClass}" title="${item.reason || ''}">$1</span>`);
    });
    
    return result;
  };

  const urgencyStyles = {
    low: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400",
    medium: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400",
    high: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400",
    emergency: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 animate-pulse",
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
        <button 
          onClick={() => navigate('/')}
          className="group flex items-center gap-3 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all font-bold"
        >
          <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border dark:border-slate-700">
            <ChevronLeft className={`w-5 h-5 ${i18n.language === 'ar' ? 'rotate-180' : ''}`} />
          </div>
          <span>{t('dashboard')}</span>
        </button>

        <button onClick={() => exportReportToPDF(report)} className="flex items-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 active:scale-95 transition-transform">
          <Download className="w-5 h-5" />
          {t('export_pdf')}
        </button>
      </div>

      <div className="flex p-1.5 bg-slate-200/50 dark:bg-slate-800 rounded-2xl mb-8 max-w-lg mx-auto">
        <button 
          onClick={() => setActiveTab('patient')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${activeTab === 'patient' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}
        >
          <User className="w-4 h-4" />
          {t('patient_view')}
        </button>
        <button 
          onClick={() => setActiveTab('doctor')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${activeTab === 'doctor' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}
        >
          <Stethoscope className="w-4 h-4" />
          {t('doctor_view')}
        </button>
      </div>

      {activeTab === 'doctor' && (
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[DoctorSpecialty.GENERAL, DoctorSpecialty.CARDIOLOGY, DoctorSpecialty.LABORATORY, DoctorSpecialty.INTERNAL_MEDICINE].map(spec => (
            <button 
              key={spec}
              onClick={() => setDocSpecialty(spec)}
              className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider border transition-all ${docSpecialty === spec ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'}`}
            >
              {spec}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <section className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 md:p-12 border dark:border-slate-700 shadow-sm relative overflow-hidden">
             <div className="flex items-center gap-5 mb-10">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200">
                  <ClipboardList className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-1">{analysisData.document_type}</h1>
                  <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest inline-block ${urgencyStyles[analysisData.urgency_level]}`}>
                    {t('urgency')}: {t(analysisData.urgency_level)}
                  </div>
                </div>
             </div>

             {activeTab === 'doctor' && (
               <div className="bg-blue-50 dark:bg-blue-900/20 rounded-3xl p-6 border border-blue-100 dark:border-blue-800 mb-8">
                 <h4 className="flex items-center gap-2 text-blue-900 dark:text-blue-300 font-bold mb-3 text-sm">
                   <Flame className="w-4 h-4" />
                   Executive Summary
                 </h4>
                 <p className="text-blue-800 dark:text-blue-200/80 text-sm leading-relaxed">
                   {analysisData.executive_summary}
                 </p>
               </div>
             )}

             <div className="space-y-10">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                    {activeTab === 'patient' ? t('summary') : 'Clinical Analysis'}
                  </h3>
                  <div 
                    className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 leading-relaxed text-lg font-medium whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: highlightText(activeTab === 'patient' ? analysisData.summary : analysisData.clinical_report, analysisData.highlight_map) }}
                  />
                </div>

                {activeTab === 'doctor' && docSpecialty === DoctorSpecialty.CARDIOLOGY && analysisData.specialized_findings && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-100 dark:border-red-900/20">
                    <div className="flex items-center gap-4">
                      <Heart className="text-red-600 w-10 h-10" />
                      <div>
                        <p className="text-xs font-bold text-red-500 uppercase">QRS Complex</p>
                        <p className="font-black text-xl text-red-900 dark:text-red-300">{analysisData.specialized_findings.qrs_complex || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 border-l border-red-100 dark:border-red-900/30 pl-4">
                      <Activity className="text-red-600 w-10 h-10" />
                      <div>
                        <p className="text-xs font-bold text-red-500 uppercase">Ejection Fraction</p>
                        <p className="font-black text-xl text-red-900 dark:text-red-300">{analysisData.specialized_findings.ejection_fraction || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-teal-400 rounded-full"></span>
                    {t('markers')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysisData.vital_markers.map((marker, idx) => (
                      <div key={idx} className="p-6 rounded-3xl border dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-lg transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-bold text-slate-500 text-sm">{marker.name}</span>
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                            marker.status === 'normal' ? 'bg-emerald-50 text-emerald-600' :
                            marker.status === 'critical' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {t(marker.status)}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-black text-slate-900 dark:text-white">{marker.value}</span>
                          <span className="text-slate-400 font-bold text-sm uppercase">{marker.unit}</span>
                        </div>
                        <div className="mt-4 pt-4 border-t border-dashed dark:border-slate-700 text-[10px] font-bold text-slate-400">
                          Range: {marker.range}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
             </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-amber-400" />
              {activeTab === 'patient' ? t('lifestyle_tips') : t('treatment_plan')}
            </h3>
            <div className="space-y-4">
              {(activeTab === 'patient' ? analysisData.recommendations : analysisData.treatment_plan).map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="shrink-0 w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center font-black text-blue-400 text-xs">
                    {idx + 1}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed font-medium">{item}</p>
                </div>
              ))}
            </div>
          </section>

          {analysisData.geographic_tips && (
            <section className="bg-emerald-50 dark:bg-emerald-900/20 rounded-[2.5rem] p-8 border border-emerald-100 dark:border-emerald-800">
              <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-400 mb-4 flex items-center gap-3">
                <MapPin className="w-5 h-5" />
                {t('local_tips')}
              </h3>
              <p className="text-emerald-800 dark:text-emerald-300/80 text-sm italic font-medium">
                {analysisData.geographic_tips}
              </p>
            </section>
          )}

          <div className="p-6 bg-white dark:bg-slate-800 rounded-[2.5rem] border dark:border-slate-700 shadow-sm flex items-center gap-4">
            <Info className="w-8 h-8 text-blue-500" />
            <p className="text-xs text-slate-500 leading-tight">
              Hover over highlighted terms in the report to see detailed clinical explanations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDetail;
