'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { messageThreads, messages as allMessages, users } from '@/lib/data';
import type { User } from '@/lib/data';
import { SendHorizonal } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function ChatInterface() {
  const { user: currentUser } = useAuth();
  const [selectedThreadId, setSelectedThreadId] = useState(messageThreads[0].id);
  const selectedThread = messageThreads.find(t => t.id === selectedThreadId);
  const messages = selectedThread ? allMessages[selectedThread.id as keyof typeof allMessages] : [];

  if (!currentUser) return null;

  return (
    <div className="flex h-full border-t">
      <aside className="w-1/3 border-r bg-card">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold font-headline">Conversations</h2>
        </div>
        <ScrollArea className="h-[calc(100%-65px)]">
          {messageThreads.map(thread => {
            const otherParticipant = thread.otherParticipant as User;
            return (
              <div
                key={thread.id}
                className={cn(
                  'p-4 flex items-center gap-4 cursor-pointer hover:bg-accent',
                  selectedThreadId === thread.id && 'bg-accent'
                )}
                onClick={() => setSelectedThreadId(thread.id)}
              >
                <Avatar>
                  <AvatarImage src={otherParticipant.avatarUrl} />
                  <AvatarFallback>{otherParticipant.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="font-semibold truncate">{otherParticipant.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{thread.subject}</p>
                  <p className="text-sm text-muted-foreground truncate">{thread.lastMessage}</p>
                </div>
              </div>
            );
          })}
        </ScrollArea>
      </aside>
      <section className="w-2/3 flex flex-col">
        {selectedThread && (
          <>
            <header className="p-4 border-b flex items-center gap-4 bg-card">
              <Avatar>
                <AvatarImage src={(selectedThread.otherParticipant as User).avatarUrl} />
                <AvatarFallback>{(selectedThread.otherParticipant as User).name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{(selectedThread.otherParticipant as User).name}</p>
                <p className="text-sm text-muted-foreground">{selectedThread.subject}</p>
              </div>
            </header>
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                {messages.map(message => {
                  const sender = users.find(u => u.id === message.senderId);
                  const isCurrentUser = message.senderId === currentUser.id;
                  return (
                    <div
                      key={message.id}
                      className={cn('flex items-end gap-2', isCurrentUser ? 'justify-end' : 'justify-start')}
                    >
                      {!isCurrentUser && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={sender?.avatarUrl} />
                          <AvatarFallback>{sender?.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn(
                          'p-3 rounded-lg max-w-xs md:max-w-md',
                          isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-card border'
                        )}
                      >
                        <p>{message.text}</p>
                         <p className={cn("text-xs mt-1", isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground")}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                       {isCurrentUser && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={sender?.avatarUrl} />
                          <AvatarFallback>{sender?.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  );
                })}
                </div>
            </ScrollArea>
            <footer className="p-4 border-t bg-card">
              <form className="flex items-center gap-2">
                <Input placeholder="Type a message..." className="flex-1" />
                <Button type="submit">
                  <SendHorizonal className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </form>
            </footer>
          </>
        )}
      </section>
    </div>
  );
}
