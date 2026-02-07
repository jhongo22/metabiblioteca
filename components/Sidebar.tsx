"use client";

import { UploadCloud, MessageSquare, Database, FileText, Book, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ActiveFile {
  filename: string;
  file_url: string;
  processed_at: string;
}

interface SidebarProps {
  className?: string;
  activeTab: 'upload' | 'chat';
  onTabChange: (tab: 'upload' | 'chat') => void;
  chatDisabled: boolean;
  activeFile: ActiveFile | null;
  files: ActiveFile[];
  onSelectFile: (id: number) => void;
}

export function Sidebar({ className, activeTab, onTabChange, chatDisabled, activeFile, files, onSelectFile }: SidebarProps) {
  return (
    <div className={cn("w-[280px] bg-[#09090b] border-r border-white/5 flex flex-col h-screen", className)}>
      <div className="p-8 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-white">RAG</h1>
            <p className="text-xs text-muted-foreground font-medium">Prueba de Agente IA</p>
          </div>
        </div>
      </div>
      
      <div className="px-4 py-2 space-y-2">
        <label className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] px-4 mb-1 block">
          Navegación
        </label>

        <button 
          onClick={() => onTabChange('upload')}
          className={cn(
            "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group relative",
            activeTab === 'upload' 
              ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20" 
              : "hover:bg-white/5 text-zinc-400 hover:text-white border border-transparent"
          )}
        >
          <UploadCloud className="w-5 h-5" />
          <span className="font-medium text-sm">Ingresar Documento</span>
          {activeTab === 'upload' && (
            <motion.div layoutId="active-nav" className="absolute left-0 w-1 h-4 bg-indigo-500 rounded-full" />
          )}
        </button>

        <button 
          onClick={() => !chatDisabled && onTabChange('chat')}
          disabled={chatDisabled}
          className={cn(
            "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group relative",
            activeTab === 'chat' 
              ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20" 
              : "hover:bg-white/5 text-zinc-400 hover:text-white border border-transparent",
            chatDisabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="font-medium text-sm">Chat con Agente</span>
          {activeTab === 'chat' && (
            <motion.div layoutId="active-nav" className="absolute left-0 w-1 h-4 bg-indigo-500 rounded-full" />
          )}
        </button>
      </div>

      <div className="flex-1 flex flex-col min-h-0 mt-6">
        <div className="px-8 flex items-center justify-between gap-2 mb-4">
          <label className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] block">
            Documentos ({files.length})
          </label>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar">
          <AnimatePresence>
            {files.map((file) => {
              const isActive = activeFile && (activeFile as any).id === (file as any).id;
              return (
                <motion.button
                  key={(file as any).id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => onSelectFile((file as any).id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group text-left",
                    isActive 
                      ? "bg-white/5 text-white border border-white/10" 
                      : "hover:bg-white/[0.02] text-zinc-500 hover:text-zinc-300 border border-transparent"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg transition-colors",
                    isActive ? "bg-indigo-500/20 text-indigo-400" : "bg-zinc-800/50 text-zinc-600 group-hover:text-zinc-400"
                  )}>
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-medium truncate w-[160px]">
                      {file.filename}
                    </span>
                    <span className="text-[9px] opacity-50 truncate">
                      {new Date(file.processed_at).toLocaleDateString()}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>

          {files.length === 0 && (
            <div className="px-4 py-8 text-center space-y-2 opacity-20">
              <Book className="w-8 h-8 mx-auto" />
              <p className="text-[10px] uppercase tracking-tighter">Sin documentos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
