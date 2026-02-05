
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  UploadCloud, 
  ShieldCheck, 
  TrendingUp,
  User, 
  LogOut,
  Globe,
  Moon,
  Sun,
  FileText
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Disclaimer from './Disclaimer';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [isGlobalDragging, setIsGlobalDragging] = useState(false);
  
  const dragCounter = useRef(0);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files')) {
      dragCounter.current++;
      if (dragCounter.current > 0) setIsGlobalDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current <= 0) setIsGlobalDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsGlobalDragging(false);
    dragCounter.current = 0;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      navigate('/upload', { state: { file } });
    }
  };

  const toggleLanguage = () => {
    const langs = ['en', 'ar', 'fr'];
    const currentIdx = langs.indexOf(i18n.language);
    const nextLang = langs[(currentIdx + 1) % langs.length];
    i18n.changeLanguage(nextLang);
    document.body.dir = nextLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = nextLang;
  };

  const menuItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: t('dashboard'), path: '/' },
    { icon: <TrendingUp className="w-5 h-5" />, label: t('trends'), path: '/trends' },
    { icon: <UploadCloud className="w-5 h-5" />, label: t('upload_report'), path: '/upload' },
    { icon: <User className="w-5 h-5" />, label: t('profile'), path: '/profile' },
  ];

  return (
    <div 
      className="h-screen w-full flex flex-col md:flex-row font-sans relative overflow-hidden bg-slate-50 dark:bg-slate-950"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Disclaimer />
      
      <AnimatePresence>
        {isGlobalDragging && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-blue-600/90 backdrop-blur-sm flex flex-col items-center justify-center text-white p-8"
          >
            <motion.div initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} className="flex flex-col items-center text-center">
              <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mb-8 animate-pulse">
                <FileText className="w-16 h-16" />
              </div>
              <h2 className="text-4xl font-black mb-4">{t('drop_files')}</h2>
              <p className="text-xl opacity-80 max-w-md">Drop any medical report to start instant AI analysis.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Mobile Header */}
      <header className="md:hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b dark:border-slate-800 px-4 py-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-blue-900 dark:text-white tracking-tight">{t('app_title')}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Sidebar - Fixed Position for Desktop */}
      <aside className={`
        fixed inset-y-0 z-40 w-72 bg-white dark:bg-slate-900 border-r dark:border-slate-800 transform transition-all duration-300 
        md:relative md:translate-x-0 h-full flex-shrink-0
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
        ${i18n.language === 'ar' ? 'right-0 left-auto border-l border-r-0 md:translate-x-0' : 'left-0 right-auto'}
      `}>
        <div className="p-8 h-full flex flex-col overflow-y-auto">
          <div className="hidden md:flex items-center gap-3 mb-12">
             <div className="bg-blue-600 p-2 rounded-2xl shadow-xl shadow-blue-200">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-black text-xl leading-tight text-blue-900 dark:text-white tracking-tighter">{t('app_title')}</h1>
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' 
                    : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}
                `}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="pt-8 border-t dark:border-slate-800 mt-8 space-y-3">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span>Toggle Dark Mode</span>
            </button>
            <button onClick={toggleLanguage} className="w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold transition-all border dark:border-slate-700">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-blue-500" />
                <span>{t('language')}</span>
              </div>
            </button>
            <button className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold transition-all">
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-10 relative">
        {children}
      </main>
    </div>
  );
};

export default Layout;
