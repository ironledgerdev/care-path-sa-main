import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { RealtimeChat } from '@/utils/RealtimeAudio';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Phone, 
  PhoneOff, 
  MessageCircle,
  Loader2,
  Heart,
  Activity,
  X,
  Stethoscope
} from 'lucide-react';

interface VoiceInterfaceProps {
  onSpeakingChange?: (speaking: boolean) => void;
  onTranscriptChange?: (transcript: string) => void;
}

interface ChatMessage {
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ 
  onSpeakingChange,
  onTranscriptChange 
}) => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor'>('excellent');
  const [isExpanded, setIsExpanded] = useState(false);
  const chatRef = useRef<RealtimeChat | null>(null);

  const handleMessage = (event: any) => {
    console.log('Voice interface received event:', event.type);
    
    switch (event.type) {
      case 'session.created':
        console.log('Session created successfully');
        setIsConnected(true);
        toast({
          title: "Voice Assistant Ready",
          description: "You can now speak naturally. The assistant will respond with voice and empathy.",
        });
        break;
        
      case 'input_audio_buffer.speech_started':
        console.log('User started speaking');
        setIsListening(true);
        break;
        
      case 'input_audio_buffer.speech_stopped':
        console.log('User stopped speaking');
        setIsListening(false);
        break;
        
      case 'response.audio.delta':
        if (!isSpeaking) {
          setIsSpeaking(true);
          onSpeakingChange?.(true);
        }
        break;
        
      case 'response.audio.done':
        console.log('Assistant finished speaking');
        setIsSpeaking(false);
        onSpeakingChange?.(false);
        break;
        
      case 'response.audio_transcript.delta':
        if (event.delta) {
          setCurrentTranscript(prev => prev + event.delta);
        }
        break;
        
      case 'response.audio_transcript.done':
        if (currentTranscript.trim()) {
          setMessages(prev => [...prev, {
            type: 'assistant',
            content: currentTranscript,
            timestamp: new Date()
          }]);
          onTranscriptChange?.(currentTranscript);
          setCurrentTranscript('');
        }
        break;
        
      case 'conversation.item.input_audio_transcription.completed':
        if (event.transcript) {
          setMessages(prev => [...prev, {
            type: 'user',
            content: event.transcript,
            timestamp: new Date()
          }]);
        }
        break;
        
      case 'error':
        console.error('Voice interface error:', event);
        toast({
          title: "Voice Error",
          description: event.error?.message || "An error occurred with the voice interface",
          variant: "destructive",
        });
        break;
    }
  };

  const startConversation = async () => {
    if (isConnecting || isConnected) return;
    
    setIsConnecting(true);
    
    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      chatRef.current = new RealtimeChat(handleMessage);
      await chatRef.current.init();
      
      setMessages([{
        type: 'assistant',
        content: 'Hello! I\'m your healthcare assistant. I\'m here to provide support and information. How can I help you today?',
        timestamp: new Date()
      }]);
      
    } catch (error) {
      console.error('Error starting conversation:', error);
      setIsConnected(false);
      
      let errorMessage = 'Failed to start voice conversation';
      if (error instanceof Error) {
        if (error.message.includes('microphone')) {
          errorMessage = 'Microphone access is required for voice chat';
        } else if (error.message.includes('token')) {
          errorMessage = 'Unable to connect to voice service';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Connection Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const endConversation = () => {
    chatRef.current?.disconnect();
    setIsConnected(false);
    setIsSpeaking(false);
    setIsListening(false);
    setCurrentTranscript('');
    setIsExpanded(false);
    onSpeakingChange?.(false);
    
    toast({
      title: "Call Ended",
      description: "Voice conversation has been ended",
    });
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
    };
  }, []);

  // Simulate connection quality based on speaking activity
  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => {
        const qualities: Array<'excellent' | 'good' | 'poor'> = ['excellent', 'good'];
        setConnectionQuality(qualities[Math.floor(Math.random() * qualities.length)]);
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [isConnected]);

  // Show collapsed floating button when not expanded
  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <Button
          onClick={toggleExpanded}
          className={`w-14 h-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 ${
            isConnected 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
          }`}
          disabled={isConnecting}
        >
          {isConnecting ? (
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          ) : isConnected ? (
            <div className="relative">
              <Stethoscope className="h-5 w-5 text-white" />
              {(isSpeaking || isListening) && (
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Stethoscope className="h-5 w-5 text-white mb-0.5" />
              <Heart className="h-2.5 w-2.5 text-red-300" />
            </div>
          )}
        </Button>
        
        {/* Status tooltip */}
        {isConnected && (
          <div className="absolute bottom-16 left-0 bg-black/80 text-white text-xs px-2 py-1 rounded-lg animate-fade-in whitespace-nowrap">
            {isSpeaking ? 'Speaking...' : isListening ? 'Listening...' : 'Connected'}
          </div>
        )}
      </div>
    );
  }

  // Show expanded interface
  return (
    <div className="fixed bottom-4 left-4 z-50 animate-scale-in">
      <Card className="medical-hero-card w-80 shadow-2xl">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Stethoscope className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm">Health Assistant</span>
              </div>
              {isConnected && (
                <Badge variant="secondary" className="text-xs">
                  <Activity className="h-3 w-3 mr-1" />
                  {connectionQuality}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {isConnected && (
                <>
                  {isSpeaking && (
                    <div className="flex items-center gap-1 text-xs text-primary">
                      <Volume2 className="h-3 w-3" />
                      <span>Speaking...</span>
                    </div>
                  )}
                  {isListening && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <Mic className="h-3 w-3" />
                      <span>Listening...</span>
                    </div>
                  )}
                </>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleExpanded}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          {messages.length > 0 && (
            <div className="max-h-32 overflow-y-auto mb-4 space-y-2">
              {messages.slice(-3).map((message, index) => (
                <div
                  key={index}
                  className={`text-xs p-2 rounded-lg animate-fade-in ${
                    message.type === 'user'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <div className="font-medium mb-1">
                    {message.type === 'user' ? 'You' : 'Assistant'}
                  </div>
                  <div>{message.content}</div>
                </div>
              ))}
            </div>
          )}

          {/* Current transcript */}
          {currentTranscript && (
            <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-lg animate-fade-in">
              <div className="text-xs text-blue-600 font-medium mb-1">Assistant is saying:</div>
              <div className="text-xs text-blue-800">{currentTranscript}...</div>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-2">
            {!isConnected ? (
              <Button 
                onClick={startConversation}
                disabled={isConnecting}
                className="btn-medical-primary flex-1"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Phone className="h-4 w-4 mr-2" />
                    Start Voice Chat
                  </>
                )}
              </Button>
            ) : (
              <>
                <div className="flex items-center gap-2 flex-1">
                  <div className={`w-3 h-3 rounded-full ${
                    isSpeaking ? 'bg-blue-500 animate-pulse' : 
                    isListening ? 'bg-green-500 animate-pulse' : 
                    'bg-gray-300'
                  }`} />
                  <span className="text-xs text-muted-foreground">
                    {isSpeaking ? 'Assistant speaking' : 
                     isListening ? 'You\'re speaking' : 
                     'Ready to listen'}
                  </span>
                </div>
                
                <Button 
                  onClick={endConversation}
                  variant="destructive"
                  size="sm"
                >
                  <PhoneOff className="h-4 w-4 mr-1" />
                  End
                </Button>
              </>
            )}
          </div>

          {/* Help text */}
          {!isConnected && (
            <div className="mt-3 text-xs text-muted-foreground text-center animate-fade-in">
              Start a voice conversation with our AI health assistant.
              <br />
              <span className="text-amber-600">Microphone access required</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceInterface;