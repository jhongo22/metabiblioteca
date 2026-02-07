import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type PDFStatus = 'idle' | 'uploading' | 'processing' | 'ready' | 'error';

interface ActiveFile {
  id: number;
  filename: string;
  file_url: string;
  processed_at: string;
}

interface ConversationState {
  messages: Message[];
  conversationId: string;
}

interface UseChatReturn {
  messages: Message[];
  pdfStatus: PDFStatus;
  loadingStep: string;
  isThinking: boolean;
  activeFile: ActiveFile | null;
  files: ActiveFile[];
  suggestedQuestions: string[];
  uploadPDF: (url: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  setActiveFileById: (id: number) => void;
  deleteFile: (id: number) => Promise<void>;
  resetChat: () => void;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [pdfStatus, setPdfStatus] = useState<PDFStatus>('idle');
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [isThinking, setIsThinking] = useState(false);
  const [activeFile, setActiveFile] = useState<ActiveFile | null>(null);
  const [files, setFiles] = useState<ActiveFile[]>([]);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [conversations, setConversations] = useState<Record<number, ConversationState>>({});
  const [conversationId, setConversationId] = useState(() => crypto.randomUUID());

  const UPLOAD_WEBHOOK = 'https://n8n-prueba3.metadatos.org/webhook/e473eba2-30bf-4f2a-afc5-d3cd1d1a028c';
  const CHAT_WEBHOOK = 'https://n8n-prueba3.metadatos.org/webhook/26163646-5372-4ca2-bc83-3648a6e0eaa8';

  const fetchFiles = async () => {
    const { data, error } = await supabase
      .from('active_session_files')
      .select('*')
      .order('processed_at', { ascending: false });
    
    if (data && !error) {
      setFiles(data);
    }
    return data;
  };

  useEffect(() => {
    fetchFiles().then(data => {
      if (data && data.length > 0 && !activeFile) {
        setActiveFile(data[0]);
        setPdfStatus('ready');
      }
    });

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'active_session_files' },
        () => {
          fetchFiles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (activeFile) {
      setConversations(prev => ({
        ...prev,
        [activeFile.id]: { messages, conversationId }
      }));
    }
  }, [messages, conversationId, activeFile?.id]);

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
      const newConvId = crypto.randomUUID();
      setMessages([]);
      setConversationId(newConvId);
      setPdfStatus('processing'); 
      const stepInterval = simulateLoadingSteps();
      
      const response = await fetch(UPLOAD_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfLink: url }), 
      });

      clearInterval(stepInterval);

      if (!response.ok) throw new Error('Failed to upload PDF');

      const data = await response.json();
      
      if (data.status === 'success') {
        const freshFiles = await fetchFiles();
        if (freshFiles && freshFiles.length > 0) {
          const latestFile = freshFiles[0];
          setActiveFile(latestFile);
          setConversations(prev => ({
            ...prev,
            [latestFile.id]: { messages: [], conversationId: newConvId }
          }));
        }
        if (data.suggestions && Array.isArray(data.suggestions)) {
          setSuggestedQuestions(data.suggestions);
        }
        setPdfStatus('ready');
      } else {
        throw new Error('Processing failed');
      }
    } catch (error) {
      console.error('Upload Error:', error);
      setPdfStatus('error');
      setTimeout(() => setPdfStatus('idle'), 8000);
    }
  };

  const sendMessage = async (content: string) => {
    const userMessage: Message = { role: 'user', content };
    setMessages((prev) => [...prev, userMessage]);
    setIsThinking(true);

    try {
      const payload = {
        conversationId,
        messageId: crypto.randomUUID(),
        message: content,
        filename: activeFile?.filename,
        createdAt: new Date().toISOString()
      };

      const response = await fetch(CHAT_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), 
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
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

  const setActiveFileById = (id: number) => {
    const file = files.find(f => f.id === id);
    if (file) {
      setActiveFile(file);
      setPdfStatus('ready');
      const savedState = conversations[id];
      if (savedState) {
        setMessages(savedState.messages);
        setConversationId(savedState.conversationId);
      } else {
        setMessages([]);
        setConversationId(crypto.randomUUID());
      }
    }
  };

  const deleteFile = async (id: number) => {
    const fileToDelete = files.find(f => f.id === id);
    if (!fileToDelete) return;

    try {
      // 1. Delete from library table
      const { error: libError } = await supabase
        .from('active_session_files')
        .delete()
        .eq('id', id);

      if (libError) throw libError;

      // 2. Clear memory for this file
      setConversations(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });

      // 3. Clear active file if it was the one deleted
      if (activeFile?.id === id) {
        setActiveFile(null);
        setMessages([]);
        setPdfStatus('idle');
      }

      // 4. Important: Attempt to clean up vectors in documents_pg
      // This assumes the user has permissions to delete from this table
      await supabase
        .from('documents_pg')
        .delete()
        .filter('metadata->>archivo', 'eq', fileToDelete.filename);

      // 5. Refresh local list
      await fetchFiles();

    } catch (error) {
      console.error('Delete Error:', error);
      alert('Error al eliminar el documento. Verifica los permisos de la base de datos.');
    }
  };

  const resetChat = () => {
    setMessages([]);
    const newConvId = crypto.randomUUID();
    setConversationId(newConvId);
    if (activeFile) {
        setConversations(prev => ({
            ...prev,
            [activeFile.id]: { messages: [], conversationId: newConvId }
        }));
    }
  };

  return {
    messages,
    pdfStatus,
    loadingStep,
    isThinking,
    activeFile,
    files,
    suggestedQuestions,
    uploadPDF,
    sendMessage,
    setActiveFileById,
    deleteFile,
    resetChat
  };
}
