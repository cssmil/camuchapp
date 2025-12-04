"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { aiService, Conversation, Message as ServiceMessage } from '@/services/ai.service';
import { Loader2, Send, Bot, User, Menu, ChevronDown, Activity } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatHistorySidebar } from '@/components/features/ai/chat-history-sidebar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'; // Opcional para móvil, usando layout flex por ahora

// Mapeamos el tipo del servicio al tipo local de UI si es necesario, o usamos el del servicio
type Message = ServiceMessage;

export default function AgenteIaPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarLoading, setIsSidebarLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Cargar lista de conversaciones al inicio
  useEffect(() => {
    loadConversations();
  }, []);

  // Scroll al fondo al recibir mensajes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const loadConversations = async () => {
    try {
      setIsSidebarLoading(true);
      const data = await aiService.getConversations();
      setConversations(data);
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setIsSidebarLoading(false);
    }
  };

  const handleSelectConversation = async (id: string) => {
    if (currentConversationId === id) return;
    setCurrentConversationId(id);
    setIsLoading(true);
    try {
      const chat = await aiService.getConversation(id);
      setMessages(chat.messages || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = async () => {
    setIsLoading(true);
    try {
      const newChat = await aiService.createConversation("Nueva consulta");
      setConversations([newChat, ...conversations]);
      setCurrentConversationId(newChat.id);
      setMessages([]); // Chat vacío
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteChat = async (id: string) => {
    if (!confirm("¿Estás seguro de borrar este chat?")) return;
    try {
      await aiService.deleteConversation(id);
      setConversations(conversations.filter(c => c.id !== id));
      if (currentConversationId === id) {
        setCurrentConversationId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    let activeId = currentConversationId;

    // Si no hay chat activo, crear uno primero
    if (!activeId) {
        try {
            // Usar las primeras palabras como título
            const title = input.slice(0, 30) + "...";
            const newChat = await aiService.createConversation(title);
            setConversations([newChat, ...conversations]);
            setCurrentConversationId(newChat.id);
            activeId = newChat.id;
        } catch (e) {
            console.error("Error creating initial chat", e);
            return;
        }
    }

    const tempUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      createdAt: new Date().toISOString()
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await aiService.sendMessage(activeId, tempUserMsg.content);
      
      const botMsg: Message = {
        id: response.messageId || Date.now().toString(),
        role: 'assistant',
        content: response.answer,
        sql: response.generatedSql,
        trace: response.trace,
        createdAt: new Date().toISOString()
      };

      setMessages((prev) => [...prev, botMsg]);
      
      // Actualizar la lista de conversaciones para que suba la reciente
      loadConversations(); 

    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Error al procesar la consulta. Inténtalo de nuevo.',
        createdAt: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex border rounded-lg overflow-hidden shadow-sm bg-white">
      
      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <CardHeader className="border-b px-6 py-4 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary" />
            <CardTitle className="text-lg">Agente IA Farmacéutico</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-0 overflow-hidden relative bg-gray-50/10">
          {!currentConversationId && messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
                  <Bot className="w-16 h-16 opacity-20" />
                  <p>Selecciona un chat o inicia una nueva conversación</p>
                  <Button onClick={handleNewChat}>Comenzar</Button>
              </div>
          ) : (
            <ScrollArea className="h-full p-4 md:p-6">
                <div className="flex flex-col gap-6 pb-4">
                {messages.map((message) => (
                    <div
                    key={message.id}
                    className={`flex gap-3 ${
                        message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                    >
                    <Avatar className="w-8 h-8 border mt-1">
                        {message.role === 'user' ? (
                        <AvatarFallback className="bg-primary text-primary-foreground"><User className="w-4 h-4" /></AvatarFallback>
                        ) : (
                        <AvatarFallback className="bg-blue-100 text-blue-700"><Bot className="w-4 h-4" /></AvatarFallback>
                        )}
                    </Avatar>

                    <div
                        className={`flex flex-col gap-1 max-w-[85%] md:max-w-[75%] ${
                        message.role === 'user' ? 'items-end' : 'items-start'
                        }`}
                    >
                        <div
                        className={`rounded-2xl px-4 py-3 text-sm shadow-sm ${
                            message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-white border text-gray-800'
                        }`}
                        >
                        <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                        </div>
                        
                        {message.role === 'assistant' && (
                          <div className="flex flex-col gap-1 mt-1 w-full max-w-full">
                            
                            {/* New Collapsible Trace UI */}
                            {message.trace && message.trace.length > 0 && (
                              <Collapsible>
                                <CollapsibleTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-6 p-0 text-xs text-gray-400 hover:text-primary w-full justify-start gap-1">
                                    <Activity className="w-3 h-3" />
                                    Ver proceso de pensamiento
                                    <ChevronDown className="w-3 h-3 ml-1" />
                                  </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="text-[10px] text-gray-500 font-mono bg-gray-50 rounded-md p-2 border mt-1 space-y-1">
                                  {message.trace.map((step, idx) => (
                                    <div key={idx} className="flex gap-2">
                                      <span className="text-gray-300 select-none">{idx + 1}.</span>
                                      <span className="whitespace-pre-wrap break-words">{step.replace(/^> /, '')}</span>
                                    </div>
                                  ))}
                                </CollapsibleContent>
                              </Collapsible>
                            )}
                          </div>
                        )}
                    </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex gap-3">
                    <Avatar className="w-8 h-8 border">
                        <AvatarFallback className="bg-blue-100 text-blue-700"><Bot className="w-4 h-4" /></AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-50 border rounded-2xl px-4 py-3 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                        <span className="text-xs text-gray-500">Pensando...</span>
                    </div>
                    </div>
                )}
                <div ref={scrollRef} />
                </div>
            </ScrollArea>
          )}
        </CardContent>

        <CardFooter className="border-t p-4 bg-white">
          <div className="flex w-full gap-2 items-center">
            <Input
              placeholder="Escribe tu pregunta..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim()} size="icon">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </CardFooter>
      </div>

      {/* History Sidebar (Hidden on mobile by default, logic simplified for now) */}
      <div className="hidden md:block h-full">
        <ChatHistorySidebar 
            conversations={conversations}
            activeId={currentConversationId}
            onSelect={handleSelectConversation}
            onDelete={handleDeleteChat}
            onNewChat={handleNewChat}
            isLoading={isSidebarLoading}
        />
      </div>
    </div>
  );
}