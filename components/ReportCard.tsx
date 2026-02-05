
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, ChevronRight, Calendar, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { MedicalReport, AnalysisStatus } from '../types';
import { Link } from 'react-router-dom';

interface ReportCardProps {
  report: MedicalReport;
}

const ReportCard: React.FC<ReportCardProps> = ({ report }) => {
  const { t, i18n } = useTranslation();
  
  const statusConfig = {
    [AnalysisStatus.PENDING]: { icon: <Clock className="w-4 h-4" />, label: t('status_pending'), color: 'bg-amber-100 text-amber-700' },
    [AnalysisStatus.ANALYZED]: { icon: <CheckCircle2 className="w-4 h-4" />, label: t('status_analyzed'), color: 'bg-emerald-100 text-emerald-700' },
    [AnalysisStatus.FAILED]: { icon: <AlertCircle className="w-4 h-4" />, label: t('status_failed'), color: 'bg-rose-100 text-rose-700' },
  };

  const config = statusConfig[report.status];

  return (
    <Link 
      to={`/report/${report.id}`}
      className="bg-white border rounded-2xl p-5 hover:shadow-xl hover:border-blue-200 transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-blue-50 rounded-xl">
          <FileText className="w-6 h-6 text-blue-600" />
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
          {config.icon}
          {config.label}
        </div>
      </div>
      
      <h3 className="font-bold text-slate-800 mb-1 truncate">{report.fileName}</h3>
      
      <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
        <Calendar className="w-4 h-4" />
        <span>{new Date(report.createdAt).toLocaleDateString(i18n.language)}</span>
      </div>

      <div className="flex items-center justify-between text-blue-600 font-medium text-sm">
        <span>{t('view_details')}</span>
        <ChevronRight className={`w-4 h-4 transform group-hover:translate-x-1 transition-transform ${i18n.language === 'ar' ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
      </div>
    </Link>
  );
};

export default ReportCard;
