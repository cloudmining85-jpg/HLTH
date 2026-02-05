
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Filter } from 'lucide-react';
import ReportCard from '../components/ReportCard';
import { MedicalReport } from '../types';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();

  // Simulated data - in real app, fetch from Supabase
  const [reports, setReports] = React.useState<MedicalReport[]>(() => {
    const saved = localStorage.getItem('reports');
    return saved ? JSON.parse(saved) : [];
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">{t('dashboard')}</h2>
          <p className="text-slate-500">{t('my_reports')}</p>
        </div>
        <Link 
          to="/upload"
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all"
        >
          <Plus className="w-5 h-5" />
          {t('upload_report')}
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex-1 relative min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search reports..." 
            className="w-full pl-10 pr-4 py-3 rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-3 bg-white border rounded-xl text-slate-600 hover:bg-slate-50 font-medium">
          <Filter className="w-4 h-4" />
          <span>Filters</span>
        </button>
      </div>

      {reports.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map(report => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      ) : (
        <div className="bg-white border rounded-2xl p-12 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <Plus className="w-10 h-10 text-blue-200" />
          </div>
          <p className="text-slate-500 mb-6 max-w-sm">{t('no_reports')}</p>
          <Link 
            to="/upload"
            className="text-blue-600 font-bold hover:underline"
          >
            {t('upload_report')}
          </Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
