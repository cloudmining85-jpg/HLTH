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
      <header className="md:hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b dark:border-slate-800 px-6 py-5 flex items-center justify-between z-50">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-blue-900 dark:text-white tracking-tight">{t('app_title')}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Sidebar - Fixed Position for Desktop */}
      <aside className={`
        fixed inset-y-0 z-40 w-80 bg-white dark:bg-slate-900 border-r dark:border-slate-800 transform transition-all duration-500 ease-in-out
        md:relative md:translate-x-0 h-full flex-shrink-0
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
        ${i18n.language === 'ar' ? 'right-0 left-auto border-l border-r-0 md:translate-x-0' : 'left-0 right-auto'}
      `}>
        <div className="p-10 h-full flex flex-col">
          <div className="hidden md:flex items-center gap-4 mb-14">
             <div className="bg-blue-600 p-3 rounded-[1.25rem] shadow-2xl shadow-blue-200">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <h1 className="font-black text-2xl leading-tight text-blue-900 dark:text-white tracking-tighter">{t('app_title')}</h1>
          </div>

          <nav className="flex-1 space-y-3">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-5 px-6 py-5 rounded-[1.5rem] font-black transition-all group
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-2xl shadow-blue-200' 
                    : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'}
                `}
              >
                <span className="transition-transform group-hover:scale-110">{item.icon}</span>
                <span className="text-sm tracking-wide">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="pt-10 border-t dark:border-slate-800 mt-10 space-y-4">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-full flex items-center gap-5 px-6 py-5 rounded-[1.5rem] text-slate-400 font-black hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span className="text-sm">Appearance</span>
            </button>
            <button onClick={toggleLanguage} className="w-full flex items-center justify-between px-6 py-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-black transition-all border dark:border-slate-800">
              <div className="flex items-center gap-4">
                <Globe className="w-5 h-5 text-blue-600" />
                <span className="text-sm">{t('language')}</span>
              </div>
            </button>
            <button className="w-full flex items-center gap-5 px-6 py-5 rounded-[1.5rem] text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 font-black transition-all">
              <LogOut className="w-5 h-5" />
              <span className="text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area - Correct scrolling behavior */}
      <main className="flex-1 overflow-y-auto relative h-full">
        <div className="p-6 md:p-12 lg:p-16">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;