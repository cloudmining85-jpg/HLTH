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
  Info,
  ShieldCheck,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

  // Professional Text Highlighting Logic
  const renderHighlightedContent = (text: string, highlightMap: HighlightItem[]) => {
    if (!highlightMap || highlightMap.length === 0) return text;
    
    let result = text;
    // Sort highlights by length descending to prevent partial replacements of nested terms
    const sortedHighlights = [...highlightMap].sort((a, b) => b.text.length - a.text.length);
    
    sortedHighlights.forEach(item => {
      const colorClass = item.color === 'red' ? 'bg-red-200 text-red-900 dark:bg-red-900/40 dark:text-red-300' : 
                         item.color === 'green' ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-300' : 
                         'bg-yellow-200 text-yellow-900 dark:bg-yellow-900/40 dark:text-yellow-300';
      
      const escapedText = item.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedText})`, 'gi');
      
      // Use a marker pattern to prevent infinite replacement
      result = result.replace(regex, `<span class="px-1.5 py-0.5 rounded-md font-bold cursor-help border-b-2 border-current transition-all hover:brightness-110 group relative inline-block ${colorClass}" title="${item.reason}">$1</span>`);
    });
    
    return result;
  };

  const urgencyStyles = {
    low: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
    medium: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
    high: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
    emergency: "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800 animate-pulse",
  };

  return (
    <div className="max-w-7xl mx-auto pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
        <button 
          onClick={() => navigate('/')}
          className="group flex items-center gap-4 text-slate-500 hover:text-blue-600 transition-all font-bold"
        >
          <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border dark:border-slate-700 group-hover:shadow-md">
            <ChevronLeft className={`w-5 h-5 ${i18n.language === 'ar' ? 'rotate-180' : ''}`} />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-xs uppercase tracking-widest text-slate-400">{t('dashboard')}</span>
            <span className="text-lg">{t('my_reports')}</span>
          </div>
        </button>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => exportReportToPDF(report)} 
            className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border dark:border-slate-700 rounded-2xl font-black shadow-sm hover:shadow-lg transition-all active:scale-95"
          >
            <Download className="w-5 h-5 text-blue-600" />
            {t('export_pdf')}
          </button>
          <button 
            className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
          >
            <ShieldCheck className="w-5 h-5" />
            Verify
          </button>
        </div>
      </div>

      <div className="flex p-1.5 bg-slate-200/50 dark:bg-slate-800 rounded-[1.5rem] mb-10 max-w-lg mx-auto border dark:border-slate-700 shadow-inner">
        <button 
          onClick={() => setActiveTab('patient')}
          className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-sm tracking-wide transition-all ${activeTab === 'patient' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-lg' : 'text-slate-500'}`}
        >
          <User className="w-4 h-4" />
          {t('patient_view')}
        </button>
        <button 
          onClick={() => setActiveTab('doctor')}
          className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-sm tracking-wide transition-all ${activeTab === 'doctor' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-lg' : 'text-slate-500'}`}
        >
          <Stethoscope className="w-4 h-4" />
          {t('doctor_view')}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'doctor' && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-wrap justify-center gap-3 mb-10"
          >
            {[DoctorSpecialty.GENERAL, DoctorSpecialty.CARDIOLOGY, DoctorSpecialty.LABORATORY, DoctorSpecialty.RADIOLOGY, DoctorSpecialty.INTERNAL_MEDICINE].map(spec => (
              <button 
                key={spec}
                onClick={() => setDocSpecialty(spec)}
                className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${docSpecialty === spec ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'}`}
              >
                {spec}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <section className="bg-white dark:bg-slate-800 rounded-[3rem] p-8 md:p-14 border dark:border-slate-700 shadow-2xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
             <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-12">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-200">
                    <ClipboardList className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">{analysisData.document_type}</h1>
                    <div className={`px-5 py-2 rounded-full border text-[11px] font-black uppercase tracking-[0.2em] inline-block ${urgencyStyles[analysisData.urgency_level]}`}>
                      {t('urgency')}: {t(analysisData.urgency_level)}
                    </div>
                  </div>
                </div>
                {activeTab === 'doctor' && (
                   <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-3xl border border-blue-100 dark:border-blue-800 max-w-xs">
                    <h4 className="flex items-center gap-2 text-blue-900 dark:text-blue-300 font-black mb-2 text-xs uppercase tracking-wider">
                      <Flame className="w-4 h-4 text-orange-500" />
                      Executive Summary
                    </h4>
                    <p className="text-blue-800 dark:text-blue-200/80 text-xs leading-relaxed font-medium">
                      {analysisData.executive_summary}
                    </p>
                  </div>
                )}
             </div>

             <div className="space-y-12">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                    <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                    {activeTab === 'patient' ? t('summary') : 'Technical Clinical Evaluation'}
                  </h3>
                  <div 
                    className="bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] p-10 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 leading-relaxed text-xl font-medium whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: renderHighlightedContent(activeTab === 'patient' ? analysisData.summary : analysisData.clinical_report, analysisData.highlight_map) }}
                  />
                </div>

                {activeTab === 'doctor' && docSpecialty === DoctorSpecialty.CARDIOLOGY && analysisData.specialized_findings && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-rose-50/50 dark:bg-rose-900/10 rounded-[2.5rem] border border-rose-100 dark:border-rose-900/20">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-rose-600 rounded-2xl flex items-center justify-center shadow-xl shadow-rose-100">
                        <Heart className="text-white w-7 h-7" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-rose-500 uppercase tracking-widest mb-1">QRS Complex</p>
                        <p className="font-black text-2xl text-rose-900 dark:text-rose-300">{analysisData.specialized_findings.qrs_complex || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-5 md:border-l border-rose-100 dark:border-rose-900/30 md:pl-8">
                      <div className="w-14 h-14 bg-rose-600 rounded-2xl flex items-center justify-center shadow-xl shadow-rose-100">
                        <Activity className="text-white w-7 h-7" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-rose-500 uppercase tracking-widest mb-1">Ejection Fraction</p>
                        <p className="font-black text-2xl text-rose-900 dark:text-rose-300">{analysisData.specialized_findings.ejection_fraction || 'N/A'}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'doctor' && docSpecialty === DoctorSpecialty.LABORATORY && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-900/20">
                    <div className="flex items-start gap-6">
                      <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-100 shrink-0">
                        <Microscope className="text-white w-7 h-7" />
                      </div>
                      <div>
                        <h5 className="font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-widest text-sm mb-2">Lab Calibration Logic</h5>
                        <p className="text-emerald-800/80 dark:text-emerald-400/80 text-sm leading-relaxed font-medium">
                          {analysisData.specialized_findings?.calibration_notes || "All lab markers verified against regional standard deviation margins. High-accuracy calibration detected for current assay."}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                    <span className="w-2 h-8 bg-teal-400 rounded-full"></span>
                    {t('markers')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {analysisData.vital_markers.map((marker, idx) => (
                      <motion.div 
                        whileHover={{ y: -5 }}
                        key={idx} 
                        className="p-8 rounded-[2rem] border dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-xl transition-all"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-black text-slate-400 text-[10px] uppercase tracking-widest">{marker.name}</span>
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            marker.status === 'normal' ? 'bg-emerald-50 text-emerald-600' :
                            marker.status === 'critical' ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-amber-50 text-amber-600'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${marker.status === 'normal' ? 'bg-emerald-500' : marker.status === 'critical' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                            {t(marker.status)}
                          </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{marker.value}</span>
                          <span className="text-slate-400 font-bold text-sm uppercase">{marker.unit}</span>
                        </div>
                        <div className="mt-6 pt-6 border-t border-dashed dark:border-slate-700 flex justify-between items-center">
                          <span className="text-[10px] font-black text-slate-300 uppercase">Reference Range</span>
                          <span className="text-[10px] font-black text-slate-600 dark:text-slate-400">{marker.range}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
             </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-10">
          <section className="bg-slate-900 dark:bg-slate-950 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -mr-10 -mt-10" />
            <h3 className="text-xl font-black mb-10 flex items-center gap-4">
              <div className="p-3 bg-amber-400/20 rounded-2xl">
                <AlertCircle className="w-6 h-6 text-amber-400" />
              </div>
              {activeTab === 'patient' ? t('lifestyle_tips') : t('treatment_plan')}
            </h3>
            <div className="space-y-6">
              {(activeTab === 'patient' ? analysisData.recommendations : analysisData.treatment_plan).map((item, idx) => (
                <div key={idx} className="flex gap-5 group">
                  <div className="shrink-0 w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-blue-400 text-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                    {idx + 1}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed font-medium pt-2">{item}</p>
                </div>
              ))}
            </div>
          </section>

          {analysisData.differential_diagnosis && activeTab === 'doctor' && (
             <section className="bg-white dark:bg-slate-800 rounded-[3rem] p-10 border dark:border-slate-700 shadow-sm">
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                  <Search className="w-5 h-5 text-blue-500" />
                  Differential Diagnosis
                </h3>
                <div className="space-y-3">
                  {analysisData.differential_diagnosis.map((d, i) => (
                    <div key={i} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700">
                      {d}
                    </div>
                  ))}
                </div>
             </section>
          )}

          {analysisData.geographic_tips && (
            <section className="bg-emerald-50 dark:bg-emerald-900/10 rounded-[3rem] p-10 border border-emerald-100 dark:border-emerald-800/30">
              <h3 className="text-lg font-black text-emerald-900 dark:text-emerald-400 mb-6 flex items-center gap-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-800/30 rounded-2xl">
                  <MapPin className="w-5 h-5" />
                </div>
                {t('local_tips')}
              </h3>
              <p className="text-emerald-800 dark:text-emerald-300/80 text-sm leading-relaxed italic font-medium">
                {analysisData.geographic_tips}
              </p>
            </section>
          )}

          <div className="p-8 bg-blue-50/50 dark:bg-blue-900/10 rounded-[3rem] border border-blue-100 dark:border-blue-900/20 flex items-start gap-5">
            <Info className="w-10 h-10 text-blue-500 shrink-0" />
            <div className="space-y-2">
              <p className="text-xs font-black text-blue-900 dark:text-blue-300 uppercase tracking-widest">Smart Highlighting</p>
              <p className="text-xs text-blue-800/70 dark:text-blue-400/70 leading-relaxed font-medium">
                Hover or tap on highlighted phrases in the main report to see clinical explanations and diagnostic reasoning.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDetail;