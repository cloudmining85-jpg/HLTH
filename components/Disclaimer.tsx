
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Disclaimer: React.FC = () => {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('disclaimer_accepted');
    if (!accepted) setShow(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('disclaimer_accepted', 'true');
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100"
          >
            <div className="p-8">
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-6">
                <ShieldAlert className="w-8 h-8 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('disclaimer_title')}</h2>
              <p className="text-slate-600 leading-relaxed mb-8">
                {t('disclaimer_text')}
              </p>
              
              <button 
                onClick={handleAccept}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-100"
              >
                <CheckCircle2 className="w-5 h-5" />
                {t('accept_disclaimer')}
              </button>
            </div>
            <div className="bg-slate-50 px-8 py-4 text-center">
              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Professional Clinical Support</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Disclaimer;
