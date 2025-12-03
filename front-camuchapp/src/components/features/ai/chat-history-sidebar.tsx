"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Trash2, Plus, Loader2 } from 'lucide-react';
import { Conversation } from '@/services/ai.service';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ChatSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNewChat: () => void;
  isLoading: boolean;
}

export function ChatHistorySidebar({ 
  conversations, 
  activeId, 
  onSelect, 
  onDelete, 
  onNewChat,
  isLoading
}: ChatSidebarProps) {
  return (
    <div className="w-full md:w-72 border-l bg-gray-50/30 flex flex-col h-full">
      <div className="p-4 border-b">
        <Button 
            onClick={onNewChat} 
            className="w-full gap-2" 
            variant="default"
            disabled={isLoading}
        >
          <Plus className="w-4 h-4" /> Nueva Conversación
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-3 flex flex-col gap-2">
          {conversations.length === 0 ? (
             <p className="text-sm text-muted-foreground text-center py-8">No hay historial.</p>
          ) : (
            conversations.map((chat) => (
                <div
                key={chat.id}
                className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                    activeId === chat.id ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground'
                }`}
                onClick={() => onSelect(chat.id)}
                >
                <div className="flex items-center gap-3 overflow-hidden">
                    <MessageSquare className="w-4 h-4 flex-shrink-0" />
                    <div className="flex flex-col overflow-hidden">
                        <span className="truncate">{chat.title}</span>
                        <span className="text-[10px] opacity-70">
                            {formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true, locale: es })}
                        </span>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(chat.id);
                    }}
                >
                    <Trash2 className="w-3 h-3 text-destructive" />
                </Button>
                </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
