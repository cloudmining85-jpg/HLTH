
import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, Zap, Scan, Maximize } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
      setError("Camera access denied.");
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
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const data = canvas.toDataURL('image/jpeg', 0.95);
        onCapture(data);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
      <div className="relative w-full h-full max-w-2xl bg-slate-900 overflow-hidden">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-white p-6 text-center">
            <X className="w-12 h-12 text-rose-500 mb-4" />
            <p className="font-bold">{error}</p>
            <button onClick={onClose} className="mt-8 px-8 py-3 bg-blue-600 rounded-2xl font-bold">Close</button>
          </div>
        ) : (
          <>
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            
            {/* Visual Overlay Frame */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
              <div className="w-full h-[70%] border-2 border-white/50 border-dashed rounded-[2rem] relative">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-xl" />
                
                {/* Scanner Animation Beam */}
                <div className="absolute left-0 right-0 h-1 bg-blue-500/30 blur-sm animate-pulse top-1/2" />
              </div>
            </div>

            <div className="absolute top-10 flex justify-center w-full">
              <span className="bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold border border-white/20">
                {t('camera_tip')}
              </span>
            </div>
            
            <div className="absolute bottom-12 left-0 right-0 flex items-center justify-center gap-10 px-6">
              <button onClick={onClose} className="w-12 h-12 bg-white/10 backdrop-blur-md text-white rounded-full flex items-center justify-center border border-white/20">
                <X size={24} />
              </button>
              
              <button onClick={capture} className="w-20 h-20 bg-white rounded-full flex items-center justify-center p-1 border-[5px] border-slate-900 active:scale-95 transition-all">
                <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </button>
              
              <button className="w-12 h-12 bg-white/10 backdrop-blur-md text-white rounded-full flex items-center justify-center border border-white/20">
                <Zap size={24} />
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
