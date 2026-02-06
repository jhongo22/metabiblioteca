"use client";

import { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, Trash2, StopCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChat } from '@/hooks/useChat';

interface ChatInterfaceProps {
  messages: ReturnType<typeof useChat>['messages'];
  onSendMessage: (msg: string) => void;
  onResetChat: () => void;
  isThinking: boolean;
  disabled: boolean;
}

export function ChatInterface({ messages, onSendMessage, onResetChat, isThinking, disabled }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;
    onSendMessage(input);
    setInput('');
  };

  if (disabled && messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground/50 gap-4">
        <Bot className="w-16 h-16 opacity-20" />
        <p className="text-lg font-light">Sube un PDF para activar el agente</p>
      </div>
    );
  }

  const suggestions = [
    "¿De qué trata este documento?",
    "Resumen de los puntos clave",
    "¿Cuáles son las conclusiones?",
    "Explica la metodología"
  ];

  if (!disabled && messages.length === 0) {
    return (
      <div className="flex flex-col h-full relative">
        <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-white/5 bg-black/20 backdrop-blur-md">
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             <span className="text-xs font-medium text-white/70">Sesión Activa</span>
          </div>
          <button 
            onClick={onResetChat}
            title="Reiniciar Sesión de Chat"
            className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-start md:justify-center p-4 md:p-8 gap-4 md:gap-8 overflow-y-auto custom-scrollbar">
           <div className="text-center space-y-2 mt-4 md:mt-0">
             <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
               <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-primary" />
             </div>
             <h3 className="text-lg md:text-xl font-semibold text-white">¿En qué puedo ayudarte hoy?</h3>
             <p className="text-muted-foreground text-xs md:text-sm max-w-xs md:max-w-sm mx-auto">
               El documento está procesado y listo. Puedes hacer una pregunta específica o elegir una de abajo.
             </p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 w-full max-w-2xl pb-4">
              {suggestions.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(question)}
                  className="p-3 md:p-4 bg-secondary/30 hover:bg-secondary/60 border border-white/5 hover:border-primary/30 rounded-xl text-left transition-all group"
                >
                  <span className="text-sm font-medium text-zinc-300 group-hover:text-white block mb-1">{question}</span>
                  <span className="text-xs text-muted-foreground group-hover:text-primary/80">Click para preguntar</span>
                </button>
              ))}
           </div>
        </div>

        <div className="p-3 md:p-4 border-t border-slate-800/50 bg-background/80 backdrop-blur-md">
         {/* Input form remains same */}
         <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto w-full">
           <input
             type="text"
             value={input}
             onChange={(e) => setInput(e.target.value)}
             disabled={disabled || isThinking}
             placeholder="Envía un mensaje al agente..."
             className="w-full bg-secondary/50 border border-slate-700/50 text-foreground rounded-xl py-3 md:py-4 pl-4 md:pl-5 pr-12 md:pr-14 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50 text-sm md:text-base"
           />
           <button
             type="submit"
             disabled={!input.trim() || disabled || isThinking}
             className="absolute right-1.5 top-1.5 bottom-1.5 p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 disabled:bg-transparent disabled:text-muted-foreground transition-all"
           >
             <Send className="w-4 h-4 md:w-5 h-5" />
           </button>
         </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Header with Reset Action */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
           <span className="text-xs font-medium text-white/70">Sesión Activa</span>
        </div>
        <button 
          onClick={onResetChat}
          title="Reiniciar Sesión de Chat"
          className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-red-400 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 custom-scrollbar">
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "flex gap-3 md:gap-4 max-w-3xl mx-auto w-full",
              msg.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
            )}
            
            <div className={cn(
              "p-4 rounded-2xl max-w-[80%] shadow-sm leading-relaxed text-sm md:text-base",
              msg.role === 'user' 
                ? "bg-primary text-primary-foreground rounded-tr-sm" 
                : "bg-secondary/80 text-secondary-foreground backdrop-blur-sm rounded-tl-sm border border-slate-700/50"
            )}>
              <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-li:my-2 prose-ul:my-4 prose-hr:my-6 prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800">
                <ReactMarkdown>
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 border border-slate-700">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
          </motion.div>
        ))}

        {isThinking && (
           <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4 max-w-3xl mx-auto w-full justify-start"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-secondary/40 p-4 rounded-2xl rounded-tl-sm border border-slate-800/50 flex items-center gap-2">
              <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 md:p-4 border-t border-slate-800/50 bg-background/80 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto w-full">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={disabled || isThinking}
            placeholder={disabled ? "Espera a que el agente esté listo..." : "Envía un mensaje al agente..."}
            className="w-full bg-secondary/50 border border-slate-700/50 text-foreground rounded-xl py-3 md:py-4 pl-4 md:pl-5 pr-12 md:pr-14 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50 text-sm md:text-base"
          />
          <button
            type="submit"
            disabled={!input.trim() || disabled || isThinking}
            className="absolute right-1.5 top-1.5 bottom-1.5 p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 disabled:bg-transparent disabled:text-muted-foreground transition-all"
          >
            <Send className="w-4 h-4 md:w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
