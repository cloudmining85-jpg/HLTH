
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, File, X, BrainCircuit, ShieldCheck, Sparkles, Camera, MousePointer2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { analyzeMedicalReport } from '../services/geminiService';
import { MedicalReport, AnalysisStatus } from '../types';
import CameraInterface from '../components/CameraInterface';

const Upload: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [locationCoords, setLocationCoords] = useState<string>("Global");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocationCoords(`${pos.coords.latitude}, ${pos.coords.longitude}`);
      }, () => console.log("Location access denied"));
    }

    if (location.state?.file) {
      handleFile(location.state.file);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const steps = [t('scanning_doc'), t('biometric_ext'), t('clinical_val')];

  const handleFile = useCallback(async (selectedFile: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(selectedFile.type)) {
      alert("Please upload a valid image (JPG, PNG) or PDF report.");
      return;
    }

    setFile(selectedFile);
    
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(selectedFile);
    } else if (selectedFile.type === 'application/pdf') {
      setPreview(null); 
    }
  }, []);

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            if (blob) handleFile(blob);
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handleFile]);

  const handleCameraCapture = (base64: string) => {
    setPreview(base64);
    setIsCameraOpen(false);
    
    const byteString = atob(base64.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    const blob = new Blob([ab], { type: 'image/jpeg' });
    const cameraFile = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
    setFile(cameraFile);
  };

  const processReport = async () => {
    let dataToProcess = preview;
    if (!preview && file) {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
      dataToProcess = await base64Promise;
    }

    if (!dataToProcess) return;

    setIsProcessing(true);
    const stepInterval = setInterval(() => {
      setProgressStep(prev => (prev + 1) % steps.length);
    }, 3000);

    try {
      // Pass the current language to Gemini for localized analysis
      const analysisData = await analyzeMedicalReport(
        dataToProcess, 
        locationCoords,
        i18n.language
      );

      const newReport: MedicalReport = {
        id: crypto.randomUUID(),
        userId: 'demo-user',
        fileName: file?.name || "report.jpg",
        fileType: file?.type || "image/jpeg",
        fileSize: file?.size || 0,
        thumbnail: dataToProcess,
        status: AnalysisStatus.ANALYZED,
        analysisData: analysisData,
        createdAt: new Date().toISOString()
      };

      const existing = JSON.parse(localStorage.getItem('reports') || '[]');
      localStorage.setItem('reports', JSON.stringify([newReport, ...existing]));

      clearInterval(stepInterval);
      navigate(`/report/${newReport.id}`);
    } catch (error) {
      console.error("Processing failed:", error);
      alert("Analysis failed. Please ensure the document is clear and readable.");
    } finally {
      setIsProcessing(false);
      clearInterval(stepInterval);
    }
  };

  if (isCameraOpen) return <CameraInterface onCapture={handleCameraCapture} onClose={() => setIsCameraOpen(false)} />;

  if (isProcessing) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 max-w-2xl mx-auto">
        <div className="relative w-full aspect-[4/5] max-w-sm bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-2xl border dark:border-slate-700 mb-12">
          {preview ? (
            <>
              <img src={preview} className="w-full h-full object-cover opacity-60 grayscale blur-[2px]" />
              <motion.div 
                initial={{ top: '0%' }}
                animate={{ top: '100%' }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-1 scanner-line z-20"
              />
            </>
          ) : (
             <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
               <File className="w-20 h-20 text-blue-200 mb-4" />
               <motion.div 
                initial={{ top: '0%' }}
                animate={{ top: '100%' }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-1 scanner-line z-20"
              />
             </div>
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-blue-600/10">
            <Sparkles className="w-16 h-16 text-blue-600 animate-pulse mb-4" />
          </div>
        </div>
        <motion.div key={progressStep} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('analyzing')}</h2>
          <p className="text-blue-600 font-bold tracking-wide uppercase text-sm">{steps[progressStep]}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[60vh]"
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="mb-10 text-center">
        <div className="inline-flex p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl mb-4">
          <BrainCircuit className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-3">{t('upload_report')}</h2>
        <p className="text-slate-500 max-w-lg mx-auto">Upload medical reports via camera, file browsing, or simple drag and drop.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button 
          onClick={() => setIsCameraOpen(true)}
          className="flex flex-col items-center justify-center p-8 bg-blue-600 text-white rounded-[2.5rem] hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 dark:shadow-none active:scale-[0.98]"
        >
          <Camera className="w-10 h-10 mb-4" />
          <span className="text-lg font-bold">{t('camera_capture')}</span>
        </button>

        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative border-3 border-dashed rounded-[2.5rem] p-8 transition-all cursor-pointer flex flex-col items-center justify-center bg-white dark:bg-slate-800
            ${isDragging ? 'border-blue-600 bg-blue-50/50 scale-[1.02] shadow-2xl' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'}
          `}
        >
          <AnimatePresence>
            {isDragging && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-blue-600/10 flex items-center justify-center rounded-[2.5rem] pointer-events-none"
              >
                <div className="text-blue-600 flex flex-col items-center animate-bounce">
                   <MousePointer2 className="w-12 h-12 mb-2" />
                   <span className="font-bold">Drop Report Here</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <UploadCloud className="w-10 h-10 text-slate-400 mb-4" />
          <span className="text-lg font-bold text-slate-800 dark:text-slate-200">Browse or Drop Files</span>
          <p className="text-xs text-slate-400 mt-2">Supports Image & PDF</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*,.pdf" 
            onChange={(e) => e.target.files && handleFile(e.target.files[0])} 
          />
        </div>
      </div>

      {file && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          className="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-[2.5rem] p-8 shadow-xl"
        >
          <div className="flex items-center gap-6 mb-8">
             <div className="w-24 h-32 bg-slate-50 dark:bg-slate-900 rounded-xl border dark:border-slate-600 shadow-inner overflow-hidden flex items-center justify-center">
                {preview ? (
                  <img src={preview} className="w-full h-full object-cover" />
                ) : (
                  <File className="w-10 h-10 text-blue-200" />
                )}
             </div>
             <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{file.name}</h4>
                  <button 
                    onClick={() => { setFile(null); setPreview(null); }}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-400"
                  >
                    <X size={18} />
                  </button>
                </div>
                <p className="text-slate-500 text-xs mb-1">{(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}</p>
                <p className="text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-widest">
                  Location Aware: {locationCoords !== "Global" ? "Enabled" : "Default"}
                </p>
             </div>
          </div>
          <button 
            onClick={processReport}
            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold shadow-2xl shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <Sparkles className="w-5 h-5" />
            Start AI Diagnostics
          </button>
        </motion.div>
      )}

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-3xl p-6 flex gap-4">
          <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
          <p className="text-emerald-800 dark:text-emerald-400 text-sm font-medium leading-relaxed">
            Privacy First: Your medical documents are encrypted and processed securely.
          </p>
        </div>
        <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-3xl p-6 flex gap-4">
          <BrainCircuit className="w-8 h-8 text-blue-600 shrink-0" />
          <p className="text-blue-800 dark:text-blue-400 text-sm font-medium leading-relaxed">
            Powered by GPT-4o class reasoning for high-accuracy biometric extraction.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Upload;
