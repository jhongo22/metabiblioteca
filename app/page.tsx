"use client";

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { PDFUploader } from '@/components/PDFUploader';
import { ChatInterface } from '@/components/ChatInterface';
import { useChat } from '@/hooks/useChat';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

export default function Home() {
  const { messages, pdfStatus, loadingStep, isThinking, uploadPDF, sendMessage, activeFile, resetChat } = useChat();
  const [activeTab, setActiveTab] = useState<'upload' | 'chat'>('upload');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auto-switch to chat when PDF is ready
  useEffect(() => {
    if (pdfStatus === 'ready') {
      setActiveTab('chat');
    }
  }, [pdfStatus]);

  return (
    <div className="flex h-[100dvh] bg-background overflow-hidden text-foreground selection:bg-primary/20 flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 glass border-b border-white/5 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white font-bold text-xs">RAG</span>
          </div>
          <span className="font-bold text-lg tracking-tight text-white">Prueba IA</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-white hover:bg-white/5 rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <Sidebar 
        className={cn(
          "fixed top-0 bottom-0 left-0 w-[280px] z-[60] md:relative md:flex transition-transform duration-300 md:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )} 
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setIsMobileMenuOpen(false); // Close menu on tab change
        }}
        chatDisabled={pdfStatus !== 'ready'}
        activeFile={activeFile}
      />

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[55] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-0 relative">
        {/* Background Gradients/Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-background to-background pointer-events-none" />
        
        <div className="relative z-10 flex-1 flex flex-col max-w-5xl mx-auto w-full p-3 md:p-6 min-h-0">
          
          <AnimatePresence mode="wait">
            {activeTab === 'upload' ? (
              <motion.div 
                key="upload"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex-1 min-h-0 flex flex-col items-center justify-center space-y-8 overflow-y-auto custom-scrollbar px-4"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold tracking-tight text-white">Ingresar conocimiento</h2>
                  <p className="text-muted-foreground text-lg">Conecta un documento PDF para entrenar a tu Agente.</p>
                </div>

                <PDFUploader 
                  onUpload={uploadPDF} 
                  status={pdfStatus}
                  loadingStep={loadingStep} 
                  activeFileName={activeFile?.filename}
                />
              </motion.div>
            ) : (
              <motion.div 
                key="chat"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex-1 min-h-0 bg-background/40 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden shadow-2xl"
              >
                <ChatInterface 
                  messages={messages}
                  onSendMessage={sendMessage}
                  onResetChat={resetChat}
                  isThinking={isThinking}
                  disabled={pdfStatus !== 'ready'}
                />
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>
    </div>
  );
}
