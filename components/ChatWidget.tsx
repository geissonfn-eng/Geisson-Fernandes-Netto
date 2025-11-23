import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { GoogleGenAI, Chat } from "@google/genai";
import { FinancialData } from '../types';
import { formatCurrency } from '../utils';

interface ChatWidgetProps {
  data: FinancialData;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Construct context-aware system instruction
  const getSystemInstruction = () => {
    const totalPersonal = data.personal.reduce((acc, curr) => acc + curr.value, 0);
    const totalJoint = data.joint.reduce((acc, curr) => acc + curr.value, 0);
    const myShare = totalJoint / 2;
    const totalPay = totalPersonal + myShare;

    return `Você é um assistente financeiro inteligente e amigável para o aplicativo 'FinanceShare'.
    
    DADOS FINANCEIROS ATUAIS DO USUÁRIO:
    
    --- Contas Pessoais ---
    ${data.personal.length > 0 ? data.personal.map(b => `- ${b.name}: ${formatCurrency(b.value)}`).join('\n') : 'Nenhuma conta pessoal cadastrada.'}
    Total Pessoal: ${formatCurrency(totalPersonal)}

    --- Contas Conjuntas ---
    ${data.joint.length > 0 ? data.joint.map(b => `- ${b.name}: ${formatCurrency(b.value)}`).join('\n') : 'Nenhuma conta conjunta cadastrada.'}
    Total Conjunto: ${formatCurrency(totalJoint)}
    
    --- Resumo Geral ---
    - Parte do usuário nas contas conjuntas (50%): ${formatCurrency(myShare)}
    - Total final que o usuário deve pagar (Pessoal + 50% Conjunto): ${formatCurrency(totalPay)}

    INSTRUÇÕES:
    1. Responda perguntas sobre os gastos, totais e divisões baseando-se EXATAMENTE nos dados acima.
    2. Se o usuário perguntar "qual minha conta mais cara?", analise a lista e responda.
    3. Seja conciso, direto e use emojis ocasionalmente para ser simpático.
    4. Formate valores monetários sempre como R$ X,XX.
    5. O idioma de resposta é Português do Brasil.
    `;
  };

  const initChat = () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      chatSessionRef.current = ai.chats.create({
        model: 'gemini-3-pro-preview',
        config: {
          systemInstruction: getSystemInstruction(),
        }
      });
    } catch (error) {
      console.error("Failed to initialize chat", error);
    }
  };

  const handleOpen = () => {
    if (!isOpen && !chatSessionRef.current) {
      initChat();
      // Add initial greeting if empty
      if (messages.length === 0) {
        setMessages([{
          id: 'init',
          role: 'model',
          text: 'Olá! Sou seu assistente financeiro. Posso ajudar a analisar seus gastos ou calcular totais. O que deseja saber?'
        }]);
      }
    }
    setIsOpen(!isOpen);
  };

  const handleReset = () => {
    setMessages([]);
    chatSessionRef.current = null;
    initChat();
    setMessages([{
      id: 'init-reset',
      role: 'model',
      text: 'Chat reiniciado com os dados mais recentes! Como posso ajudar?'
    }]);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Re-init if missing (safety check)
      if (!chatSessionRef.current) initChat();

      const result = await chatSessionRef.current!.sendMessage({ message: userMsg.text });
      const responseText = result.text;

      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: responseText 
      };
      setMessages(prev => [...prev, aiMsg]);

    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'model', 
        text: "Desculpe, tive um problema ao processar sua mensagem. Verifique sua conexão ou tente reiniciar o chat." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-[340px] md:w-[380px] h-[500px] max-h-[80vh] flex flex-col mb-4 pointer-events-auto overflow-hidden animate-fade-in-up origin-bottom-right transition-all transform">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center justify-between text-white shrink-0">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-white/20 rounded-full">
                <Sparkles size={16} className="text-yellow-200" />
              </div>
              <h3 className="font-semibold text-sm">Assistente IA</h3>
            </div>
            <div className="flex items-center space-x-1">
               <button 
                onClick={handleReset} 
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                title="Reiniciar conversa e atualizar dados"
              >
                <RefreshCw size={14} />
              </button>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start w-full">
                 <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center space-x-2">
                    <Loader2 size={16} className="animate-spin text-blue-500" />
                    <span className="text-xs text-gray-400 font-medium">Pensando...</span>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 shrink-0">
            <div className="relative flex items-center">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Pergunte sobre seus gastos..."
                className="w-full pl-4 pr-12 py-3 bg-gray-100 border-transparent focus:bg-white border focus:border-blue-500 rounded-xl text-sm focus:outline-none transition-all"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="absolute right-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:bg-gray-400 transition-colors shadow-sm"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={handleOpen}
        className="pointer-events-auto bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center group"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        {!isOpen && (
            <span className="absolute right-full mr-3 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Falar com IA
            </span>
        )}
      </button>
    </div>
  );
};