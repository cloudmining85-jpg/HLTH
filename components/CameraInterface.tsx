import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, Zap, Scan, Maximize, RefreshCw, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

interface CameraInterfaceProps {
  onCapture: (base64: string) => void;
  onClose: () => void;
}

const CameraInterface: React.FC<CameraInterfaceProps> = ({ onCapture, onClose }) => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', 
          width: { ideal: 4032 },
          height: { ideal: 3024 } 
        },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsActive(true);
      }
    } catch (err) {
      setError("Camera access denied or device busy.");
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Capture at full native resolution
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(video, 0, 0);
        
        // High quality JPEG for Gemini Vision
        const data = canvas.toDataURL('image/jpeg', 0.95);
        onCapture(data);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-0 md:p-6">
      <div className="relative w-full h-full max-w-2xl bg-slate-900 md:rounded-[3rem] overflow-hidden shadow-2xl border-white/10 border">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-white p-10 text-center">
            <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mb-6">
              <ShieldCheck className="w-10 h-10 text-rose-500" />
            </div>
            <h3 className="text-xl font-black mb-4">{error}</h3>
            <p className="text-slate-400 mb-8 max-w-xs">Please ensure you have granted camera permissions in your browser settings.</p>
            <button onClick={onClose} className="px-10 py-4 bg-white text-slate-900 rounded-2xl font-black transition-all active:scale-95">
              Return to Dashboard
            </button>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
            
            {/* Clinical Scanning Overlay */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-8">
              <div className="w-full h-[65%] max-h-[500px] relative">
                {/* Visual Frame Corners */}
                <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-blue-500 rounded-tl-[2.5rem] shadow-[0_0_20px_rgba(59,130,246,0.5)]" />
                <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-blue-500 rounded-tr-[2.5rem] shadow-[0_0_20px_rgba(59,130,246,0.5)]" />
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-blue-500 rounded-bl-[2.5rem] shadow-[0_0_20px_rgba(59,130,246,0.5)]" />
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-blue-500 rounded-br-[2.5rem] shadow-[0_0_20px_rgba(59,130,246,0.5)]" />
                
                {/* Dynamic Scanning Line */}
                <motion.div 
                  initial={{ top: '10%' }}
                  animate={{ top: '90%' }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute left-4 right-4 h-1 bg-blue-400/30 blur-sm shadow-[0_0_15px_rgba(59,130,246,0.6)]"
                />
                
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <Scan className="w-32 h-32 text-white" />
                </div>
              </div>

              <div className="mt-12 text-center max-w-xs">
                <p className="text-white/80 font-black uppercase tracking-[0.3em] text-[10px] mb-2">{t('camera_tip')}</p>
                <div className="h-1 w-12 bg-blue-500 mx-auto rounded-full" />
              </div>
            </div>

            {/* Header Controls */}
            <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
              <button onClick={onClose} className="w-12 h-12 bg-white/10 backdrop-blur-xl text-white rounded-2xl flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all">
                <X size={20} />
              </button>
              <div className="flex gap-3">
                <button onClick={() => setFlash(!flash)} className={`w-12 h-12 backdrop-blur-xl rounded-2xl flex items-center justify-center border transition-all ${flash ? 'bg-amber-400 border-amber-500 text-black' : 'bg-white/10 border-white/20 text-white'}`}>
                  <Zap size={20} />
                </button>
              </div>
            </div>
            
            {/* Capture Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-12 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent">
              <div className="w-14 h-14" /> {/* Spacer */}
              
              <button 
                onClick={capture} 
                className="group relative w-24 h-24 flex items-center justify-center transition-all active:scale-90"
              >
                <div className="absolute inset-0 bg-white/20 rounded-full scale-110 group-hover:scale-125 transition-transform" />
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center p-1.5 shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                  <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center border-[6px] border-white">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </div>
              </button>
              
              <button onClick={startCamera} className="w-14 h-14 bg-white/10 backdrop-blur-xl text-white rounded-2xl flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all">
                <RefreshCw size={20} />
              </button>
            </div>
          </>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraInterface;