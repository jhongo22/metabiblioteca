"use client";

import { UploadCloud, MessageSquare, Database, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface SidebarProps {
  className?: string;
  activeTab: 'upload' | 'chat';
  onTabChange: (tab: 'upload' | 'chat') => void;
  chatDisabled: boolean;
  activeFile: { filename: string } | null;
}

export function Sidebar({ className, activeTab, onTabChange, chatDisabled, activeFile }: SidebarProps) {
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
      
      <div className="flex-1 px-4 py-6 space-y-2">
        <label className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider px-4 mb-2 block">
          Modo de Operación
        </label>

        <button 
          onClick={() => onTabChange('upload')}
          className={cn(
            "w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-200 group relative overflow-hidden",
            activeTab === 'upload' 
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25" 
              : "hover:bg-white/5 text-zinc-400 hover:text-white"
          )}
        >
          <UploadCloud className="w-5 h-5" />
          <div className="flex flex-col items-start truncate">
             <span className="font-medium truncate max-w-[180px]">
              {activeFile ? activeFile.filename : 'Ingestar Conocimiento'}
             </span>
             {activeFile && <span className="text-[10px] text-zinc-300 font-normal">Archivo Activo</span>}
          </div>
          {activeTab === 'upload' && (
            <motion.div layoutId="active-glow" className="absolute inset-0 bg-white/10 rounded-xl" />
          )}
        </button>

        <button 
          onClick={() => !chatDisabled && onTabChange('chat')}
          disabled={chatDisabled}
          className={cn(
            "w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-200 group relative overflow-hidden",
            activeTab === 'chat' 
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25" 
              : "hover:bg-white/5 text-zinc-400 hover:text-white",
            chatDisabled && "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-zinc-500"
          )}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="font-medium">Chat con Agente</span>
          {chatDisabled && <span className="text-[10px] ml-auto border border-white/10 px-1.5 py-0.5 rounded text-white/40">LOCK</span>}
        </button>
      </div>


    </div>
  );
}
