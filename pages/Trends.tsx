
import React from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { MedicalReport } from '../types';

const Trends: React.FC = () => {
  const { t, i18n } = useTranslation();
  
  const reports: MedicalReport[] = React.useMemo(() => {
    const saved = localStorage.getItem('reports');
    return saved ? JSON.parse(saved) : [];
  }, []);

  // Simplified trend logic: extracting common markers
  const markerTrends = React.useMemo(() => {
    const trends: Record<string, { val: number; date: string }[]> = {};
    reports.forEach(r => {
      r.analysisData?.vital_markers.forEach(m => {
        const numericVal = parseFloat(String(m.value));
        if (!isNaN(numericVal)) {
          if (!trends[m.name]) trends[m.name] = [];
          trends[m.name].push({ val: numericVal, date: r.createdAt });
        }
      });
    });
    return trends;
  }, [reports]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Activity className="w-8 h-8 text-blue-600" />
          {t('trends')}
        </h2>
        <p className="text-slate-500 mt-2">{t('trend_graph')}</p>
      </div>

      {Object.keys(markerTrends).length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Explicitly cast Object.entries to fix 'unknown' type errors on points variable */}
          {(Object.entries(markerTrends) as [string, { val: number; date: string }[]][]).map(([name, points]) => (
            <div key={name} className="bg-white border rounded-3xl p-6 shadow-sm hover:border-blue-200 transition-all">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-slate-800">{name}</h3>
                  <span className="text-xs text-slate-400 font-medium">Historical Tracking</span>
                </div>
                {points.length > 1 && (
                  <div className={`p-2 rounded-lg ${points[0].val > points[1].val ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {points[0].val > points[1].val ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  </div>
                )}
              </div>

              {/* Simple CSS Visualization */}
              <div className="h-24 flex items-end gap-2 px-2 border-b border-slate-100 pb-2">
                {/* Use explicit typing for the point mapping to prevent property access errors */}
                {points.slice(0, 8).reverse().map((p: { val: number; date: string }, i: number) => {
                  const max = Math.max(...points.map(pt => pt.val));
                  const height = (p.val / max) * 100;
                  return (
                    <div 
                      key={i} 
                      className="flex-1 bg-blue-100 hover:bg-blue-600 rounded-t-lg transition-all relative group cursor-pointer" 
                      style={{ height: `${height}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {p.val}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-3 px-1 text-[9px] font-bold text-slate-300 uppercase tracking-tighter">
                <span>Oldest Record</span>
                <span>Recent</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border rounded-3xl p-16 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-slate-500 font-medium">Insufficient data for trend analysis. Upload at least two reports.</p>
        </div>
      )}
    </div>
  );
};

export default Trends;
