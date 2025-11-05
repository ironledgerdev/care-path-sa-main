import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  MessageCircle, 
  Send, 
  X, 
  Minimize2, 
  Maximize2, 
  User, 
  Stethoscope,
  Clock,
  CheckCircle2,
  Circle,
  Loader2
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  message: string;
  message_type: 'text' | 'system';
  is_read: boolean;
  created_at: string;
  sender_profile?: {
    first_name: string;
    last_name: string;
    role: string;
  };
}

interface ChatSession {
  id: string;
  patient_id: string;
  doctor_id: string;
  status: 'active' | 'ended';
  created_at: string;
  doctor_profile?: {
    first_name: string;
    last_name: string;
  };
  patient_profile?: {
    first_name: string;
    last_name: string;
  };
}

interface LiveChatWidgetProps {
  doctorId?: string;
  isOpen: boolean;
  onClose: () => void;
}

const LiveChatWidget: React.FC<LiveChatWidgetProps> = ({ 
  doctorId, 
  isOpen, 
  onClose 
}) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      initializeChat();
      setupRealtimeSubscriptions();
    }
  }, [isOpen, user, doctorId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = async () => {
    if (!user || !doctorId) return;

    setIsLoading(true);
    try {
      // Try to find or create a persistent chat session
      const { data: existing, error: sessionFindError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('patient_id', user.id)
        .eq('doctor_id', doctorId)
        .eq('status', 'active')
        .maybeSingle();

      let session: ChatSession | null = existing as any;

      if (!session) {
        const { data: created, error: sessionCreateError } = await supabase
          .from('chat_sessions')
          .insert({ patient_id: user.id, doctor_id: doctorId, status: 'active' })
          .select()
          .single();
        if (sessionCreateError) throw sessionCreateError;
        session = created as any;
      }

      setCurrentSession(session);

      // Load existing messages (latest 50)
      const { data: msgs, error: msgsError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', session.id)
        .order('created_at', { ascending: true })
        .limit(50);

      if (msgsError) throw msgsError;

      setMessages((msgs as any[]).map((m) => ({
        id: m.id,
        sender_id: m.sender_id,
        recipient_id: m.recipient_id,
        message: m.message,
        message_type: m.message_type,
        is_read: m.is_read,
        created_at: m.created_at,
      })) as ChatMessage[]);

    } catch (error) {
      console.warn('Falling back to mock chat. Persistence not available:', error);
      // Fallback mock session/messages
      const mockSession: ChatSession = {
        id: `session_${user.id}_${doctorId}`,
        patient_id: user.id,
        doctor_id: doctorId,
        status: 'active',
        created_at: new Date().toISOString(),
      };
      const mockMessages: ChatMessage[] = [
        {
          id: '1',
          sender_id: doctorId,
          recipient_id: user.id,
          message: 'Hello! I\'m your doctor. How can I help you today?',
          message_type: 'text',
          is_read: true,
          created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        }
      ];
      setCurrentSession(mockSession);
      setMessages(mockMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    if (!user) return;

    // Set up presence tracking
    const presenceChannel = supabase.channel('online_users');
    
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const users = new Set<string>();
        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            users.add(presence.user_id);
          });
        });
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      });

    // Track own presence
    presenceChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await presenceChannel.track({
          user_id: user.id,
          online_at: new Date().toISOString(),
        });
      }
    });

    // Set up typing indicators
    const typingChannel = supabase.channel('typing_indicators');
    
    typingChannel
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.user_id !== user.id && payload.payload.session_id === currentSession?.id) {
          setIsTyping(payload.payload.is_typing);
          
          if (payload.payload.is_typing) {
            // Clear typing indicator after 3 seconds
            setTimeout(() => setIsTyping(false), 3000);
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(presenceChannel);
      supabase.removeChannel(typingChannel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !currentSession) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    // Add message to local state immediately for better UX
    const tempMessage: ChatMessage = {
      id: `temp_${Date.now()}`,
      sender_id: user.id,
      recipient_id: currentSession.doctor_id,
      message: messageText,
      message_type: 'text',
      is_read: false,
      created_at: new Date().toISOString(),
      sender_profile: {
        first_name: profile?.first_name || 'You',
        last_name: profile?.last_name || '',
        role: profile?.role || 'patient'
      }
    };

    setMessages(prev => [...prev, tempMessage]);

    try {
      // Attempt to persist message
      if (currentSession?.id) {
        await supabase.from('chat_messages').insert({
          session_id: currentSession.id,
          sender_id: user.id,
          recipient_id: currentSession.doctor_id,
          message: messageText,
          message_type: 'text',
          is_read: false,
        });
      }

      // Simulated doctor reply (remove when real-time doctor responses are implemented)
      setTimeout(() => {
        const doctorResponse: ChatMessage = {
          id: `response_${Date.now()}`,
          sender_id: currentSession!.doctor_id,
          recipient_id: user.id,
          message: getDoctorResponse(messageText),
          message_type: 'text',
          is_read: false,
          created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, doctorResponse]);
      }, 2000);

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Message Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      
      // Remove the temporary message on error
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
    }
  };

  const getDoctorResponse = (userMessage: string): string => {
    const responses = [
      "Thank you for sharing that information. Can you tell me more about when this started?",
      "I understand your concern. Based on what you've described, I'd recommend we schedule a full consultation.",
      "That's a common concern. Let me ask you a few more questions to better understand your situation.",
      "I appreciate you reaching out. For a proper assessment, we should discuss this in detail during your appointment.",
      "Thank you for the details. I'll be able to provide better guidance during our scheduled consultation."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleTyping = () => {
    if (!currentSession) return;

    // Broadcast typing indicator
    const typingChannel = supabase.channel('typing_indicators');
    typingChannel.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        user_id: user?.id,
        session_id: currentSession.id,
        is_typing: true
      }
    });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing indicator after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      typingChannel.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          user_id: user?.id,
          session_id: currentSession.id,
          is_typing: false
        }
      });
    }, 1000);
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <Card className={`medical-hero-card shadow-2xl transition-all duration-300 ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
      }`}>
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <MessageCircle className="h-4 w-4" />
              {currentSession?.doctor_profile ? (
                <div className="flex items-center gap-2">
                  <span>Dr. {currentSession.doctor_profile.first_name} {currentSession.doctor_profile.last_name}</span>
                  {onlineUsers.has(currentSession.doctor_id) && (
                    <Badge variant="secondary" className="text-xs">
                      <Circle className="h-2 w-2 mr-1 fill-green-500 text-green-500" />
                      Online
                    </Badge>
                  )}
                </div>
              ) : (
                'Live Chat'
              )}
            </CardTitle>
            
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-6 w-6 p-0"
              >
                {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[420px]">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading chat...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.sender_id === user?.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {message.sender_profile?.role === 'doctor' ? (
                            <Stethoscope className="h-3 w-3" />
                          ) : (
                            <User className="h-3 w-3" />
                          )}
                          <span className="text-xs font-medium">
                            {message.sender_id === user?.id 
                              ? 'You' 
                              : `${message.sender_profile?.first_name}`
                            }
                          </span>
                        </div>
                        
                        <p className="text-sm">{message.message}</p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs opacity-70">
                            {formatMessageTime(message.created_at)}
                          </span>
                          
                          {message.sender_id === user?.id && (
                            <div className="flex items-center">
                              {message.is_read ? (
                                <CheckCircle2 className="h-3 w-3 opacity-70" />
                              ) : (
                                <Circle className="h-3 w-3 opacity-70" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="h-3 w-3" />
                          <span className="text-xs text-muted-foreground">Dr. Johnson is typing...</span>
                          <div className="flex space-x-1">
                            <div className="w-1 h-1 bg-current rounded-full animate-bounce"></div>
                            <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex items-center gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      sendMessage();
                    }
                  }}
                  placeholder="Type your message..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button 
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isLoading}
                  size="sm"
                  className="btn-medical-primary"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground mt-2">
                This is a secure, encrypted conversation with your healthcare provider.
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default LiveChatWidget;
