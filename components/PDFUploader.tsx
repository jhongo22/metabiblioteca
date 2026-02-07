"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PDFUploaderProps {
  onUpload: (url: string) => Promise<void>;
  status: 'idle' | 'uploading' | 'processing' | 'ready' | 'error';
  loadingStep?: string;
  activeFileName?: string;
}

export function PDFUploader({ onUpload, status, loadingStep, activeFileName }: PDFUploaderProps) {
  const [url, setUrl] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const validateUrl = (testUrl: string) => {
    try {
      new URL(testUrl);
      if (!testUrl.toLowerCase().endsWith('.pdf') && !testUrl.includes('google.com') && !testUrl.includes('drive.')) {
        // Basic check for .pdf or known providers, common in testing
        // But we'll allow generic URLs too as long as they are valid URLs
      }
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;

    if (!validateUrl(trimmedUrl)) {
      setLocalError('Por favor ingresa una URL válida que apunte a un archivo PDF.');
      return;
    }

    await onUpload(trimmedUrl);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-4 md:mb-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-4 md:p-6 shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-4 text-primary">
          <FileText className="w-5 h-5 md:w-6 h-6" />
          <h2 className="text-lg md:text-xl font-semibold tracking-wide">Base de Conocimiento</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="relative group">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={status === 'uploading' || status === 'processing'}
            placeholder="Ingresa la URL del PDF (ej. https://archivo.pdf)..."
            className="w-full bg-secondary/50 border border-slate-700/50 text-foreground rounded-xl py-4 pl-5 pr-40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          
          <button
            type="submit"
            disabled={(status === 'uploading' || status === 'processing') || !url.trim()}
            className={cn(
              "absolute right-2 top-2 bottom-2 px-6 rounded-lg font-medium text-sm transition-all",
              status === 'uploading' || status === 'processing'
                ? "bg-transparent text-muted-foreground cursor-default"
                : "bg-primary text-primary-foreground hover:opacity-90 active:scale-95"
            )}
          >
            {status === 'ready' ? 'Subir' : (status === 'uploading' || status === 'processing' ? 'Procesando' : 'Ingestar')}
          </button>
        </form>

        <AnimatePresence mode="wait">
          {status !== 'idle' && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-slate-700/30 flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm">
                  {(status === 'uploading' || status === 'processing') && (
                    <motion.div 
                      key={loadingStep} // Triggers animation on change
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3"
                    >
                      <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                      <span className="text-blue-100">{loadingStep || "Iniciando..."}</span>
                    </motion.div>
                  )}
                  {status === 'ready' && (
                    <div className="flex flex-col items-start gap-1">
                      <div className="flex items-center gap-3 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        <span className="text-green-100 font-medium">Agente entrenado exitosamente</span>
                      </div>
                      {activeFileName && (
                        <span className="text-xs text-green-400/70 ml-7 italic truncate max-w-[300px]">
                          Archivo: {activeFileName}
                        </span>
                      )}
                    </div>
                  )}
                  {(status === 'error' || localError) && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3"
                    >
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span className="text-red-100 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[300px]">
                        {localError || "Error al procesar el PDF. Verifica la URL."}
                      </span>
                    </motion.div>
                  )}
                </div>
                
                {/* Visual Progress Bar */}
                {(status === 'uploading' || status === 'processing') && (
                  <div className="h-1.5 w-32 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
