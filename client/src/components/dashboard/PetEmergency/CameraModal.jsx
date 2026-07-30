import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, X, RefreshCw, Check, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CameraModal = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  
  const [error, setError] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    // Prevent starting if already active or loading
    if (streamRef.current || isLoading) return;

    try {
      setIsLoading(true);
      setError(null);
      setIsVideoReady(false);
      
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: isMobile ? 'environment' : 'user', 
          width: { ideal: 1280 }, 
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        } 
      });
      
      streamRef.current = mediaStream;

      if (videoRef.current) {
        // Prevent assigning if it's already assigned
        if (videoRef.current.srcObject !== mediaStream) {
          videoRef.current.srcObject = mediaStream;
        }
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Camera access is required to capture emergency photos.');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  // Handle Video Metadata Loaded
  const handleVideoLoaded = () => {
    setIsVideoReady(true);
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setCapturedImage(null);
      setError(null);
      setIsVideoReady(false);
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]); // IMPORTANT: Remove startCamera/stopCamera from dependencies to prevent re-execution

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(imageUrl);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const confirmPhoto = () => {
    if (capturedImage && canvasRef.current) {
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
          onCapture(file);
          onClose();
        }
      }, 'image/jpeg', 0.9);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Camera size={20} className="text-red-500" />
              Take Emergency Photo
            </h3>
            <button onClick={onClose} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Content Area */}
          <div className="relative bg-black flex-1 flex flex-col items-center justify-center min-h-[400px]">
            
            {/* Error State */}
            {error && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 p-8 text-center">
                <AlertTriangle size={48} className="text-yellow-400 mb-4" />
                <p className="text-white font-medium mb-6">{error}</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button onClick={() => { setError(null); startCamera(); }} className="px-6 py-2 bg-white text-gray-900 rounded-full font-bold hover:bg-gray-100 transition-colors">
                    Try Again
                  </button>
                  <button onClick={onClose} className="px-6 py-2 bg-red-500 text-white rounded-full font-bold flex items-center gap-2 hover:bg-red-600 transition-colors">
                    <ImageIcon size={18} /> Choose From Gallery
                  </button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && !error && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/50">
                <RefreshCw size={32} className="text-white animate-spin mb-4" />
                <p className="text-white font-medium">Opening Camera...</p>
              </div>
            )}

            {/* Captured Preview */}
            {capturedImage ? (
              <img src={capturedImage} alt="Preview" className="w-full max-h-[60vh] object-contain z-10 relative bg-black" />
            ) : null}

            {/* Live Video Feed */}
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              onLoadedMetadata={handleVideoLoaded}
              className={`w-full max-h-[60vh] object-cover transition-opacity duration-300 ${isVideoReady && !capturedImage && !error ? 'opacity-100' : 'opacity-0 absolute'}`}
            />
            
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Controls */}
          {!error && (
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-center gap-4">
              {capturedImage ? (
                <>
                  <button onClick={retakePhoto} className="px-6 py-3 bg-white text-gray-700 border-2 border-gray-200 rounded-full font-bold hover:bg-gray-50 flex items-center gap-2 transition-all">
                    <RefreshCw size={18} /> Retake
                  </button>
                  <button onClick={confirmPhoto} className="px-8 py-3 bg-red-500 text-white rounded-full font-bold shadow-lg shadow-red-500/30 hover:bg-red-600 flex items-center gap-2 transition-all hover:scale-105">
                    <Check size={20} /> Use Photo
                  </button>
                </>
              ) : (
                <button 
                  onClick={capturePhoto} 
                  disabled={!isVideoReady}
                  className={`w-16 h-16 bg-white border-[4px] border-red-500 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-xl ${!isVideoReady ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title="Capture Photo"
                >
                  <div className="w-12 h-12 bg-red-500 rounded-full"></div>
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CameraModal;
