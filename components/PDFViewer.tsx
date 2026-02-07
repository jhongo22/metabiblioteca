"use client";

import { ExternalLink, Maximize2 } from 'lucide-react';

interface PDFViewerProps {
  url: string;
  filename: string;
}

export function PDFViewer({ url, filename }: PDFViewerProps) {
  return (
    <div className="flex flex-col h-full bg-[#1c1c1f]/40 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-black/20">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-white/50 uppercase tracking-widest truncate max-w-[200px]">
            {filename}
          </span>
        </div>
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-white transition-colors flex items-center gap-2 text-xs"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Ver Original</span>
        </a>
      </div>
      
      <div className="flex-1 bg-zinc-900 flex items-center justify-center">
        <iframe
          src={`${url}#toolbar=0&navpanes=0&view=FitH`}
          className="w-full h-full border-none"
          title={filename}
        />
      </div>
    </div>
  );
}
