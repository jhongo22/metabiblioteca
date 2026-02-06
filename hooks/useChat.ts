import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type PDFStatus = 'idle' | 'uploading' | 'processing' | 'ready' | 'error';

interface ActiveFile {
  filename: string;
  file_url: string;
  processed_at: string;
}

interface UseChatReturn {
  messages: Message[];
  pdfStatus: PDFStatus;
  loadingStep: string;
  isThinking: boolean;
  activeFile: ActiveFile | null;
  uploadPDF: (url: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  resetChat: () => void;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [pdfStatus, setPdfStatus] = useState<PDFStatus>('idle');
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [isThinking, setIsThinking] = useState(false);
  const [activeFile, setActiveFile] = useState<ActiveFile | null>(null);
  const [conversationId, setConversationId] = useState(() => crypto.randomUUID());

  const UPLOAD_WEBHOOK = 'https://n8n-prueba3.metadatos.org/webhook/e473eba2-30bf-4f2a-afc5-d3cd1d1a028c';
  const CHAT_WEBHOOK = 'https://n8n-prueba3.metadatos.org/webhook/26163646-5372-4ca2-bc83-3648a6e0eaa8';

  // 1. Initial Fetch & Realtime Subscription
  useEffect(() => {
    const fetchActiveFile = async () => {
      const { data, error } = await supabase
        .from('active_session_files')
        .select('*')
        .eq('id', 1)
        .single();
      
      if (data && !error) {
        setActiveFile(data);
        setPdfStatus('ready');
      }
    };

    fetchActiveFile();

    const channel = supabase
      .channel('active_session_files_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'active_session_files' },
        (payload) => {
          console.log('Change received!', payload);
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setActiveFile(payload.new as ActiveFile);
            setPdfStatus('ready');
            // If a new file is loaded externally, specifically clear chat for new context
            // Optionally check if filename changed to avoid clearing on minor updates
            setMessages([]); 
          } else if (payload.eventType === 'DELETE') {
            setActiveFile(null);
            setPdfStatus('idle');
            setMessages([]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Simulates RAG steps for better UX
  const simulateLoadingSteps = () => {
    const steps = [
      "Analizando estructura del documento...",
      "Dividiendo en chunks de texto...",
      "Generando embeddings vectoriales...",
      "Guardando en base de datos vectorial...",
      "Configurando memoria del agente..."
    ];
    let stepIndex = 0;
    setLoadingStep(steps[0]);
    
    return setInterval(() => {
      stepIndex = (stepIndex + 1) % steps.length;
      setLoadingStep(steps[stepIndex]);
    }, 2500);
  };

  const uploadPDF = async (url: string) => {
    try {
      // Clear previous context before starting new upload
      setMessages([]);
      setConversationId(crypto.randomUUID());
      
      setPdfStatus('processing'); 
      const stepInterval = simulateLoadingSteps();
      
      const response = await fetch(UPLOAD_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfLink: url }), 
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        throw new Error('Failed to upload PDF');
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        // 1. Fetch the latest file record directly from Supabase
        const { data: fileData, error: fileError } = await supabase
          .from('active_session_files')
          .select('*')
          .eq('id', 1)
          .single();
        
        if (fileData && !fileError) {
          setActiveFile(fileData);
        }
        
        setPdfStatus('ready');
      } else {
        throw new Error('Processing failed');
      }
    } catch (error) {
      console.error('Upload Error:', error);
      setPdfStatus('error');
      setTimeout(() => setPdfStatus('idle'), 8000); // Increased to 8s for visibility
    }
  };

  const sendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = { role: 'user', content };
    setMessages((prev) => [...prev, userMessage]);
    setIsThinking(true);

    try {
      const payload = {
        conversationId,
        messageId: crypto.randomUUID(),
        message: content,
        createdAt: new Date().toISOString()
      };

      const response = await fetch(CHAT_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), 
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      // Handle n8n response format: [ { output: "..." } ] or { output: "..." } or simple string
      let botContent = "Lo siento, no pude procesar la respuesta.";
      
      const responseData = Array.isArray(data) ? data[0] : data;
      
      if (typeof responseData === 'string') {
        botContent = responseData.replace(/\\n/g, '\n');
      } else if (responseData && typeof responseData === 'object') {
        const raw = responseData.output || responseData.text || responseData.response || JSON.stringify(responseData);
        botContent = typeof raw === 'string' ? raw.replace(/\\n/g, '\n') : JSON.stringify(raw);
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: botContent }]);
    } catch (error) {
      console.error('Chat Error:', error);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Lo siento, hubo un error al procesar tu pregunta.' }]);
    } finally {
      setIsThinking(false);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setConversationId(crypto.randomUUID());
    // Note: We do NOT reset pdfStatus or activeFile here.
    // The user just wants to clear the chat history/context, not the document.
  };

  return {
    messages,
    pdfStatus,
    loadingStep,
    isThinking,
    activeFile,
    uploadPDF,
    sendMessage,
    resetChat
  };
}
