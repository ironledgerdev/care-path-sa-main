import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { X, MessageCircle, Activity } from 'lucide-react';

interface ChatMessage {
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const initialAssistantMessage = `Hello, I\'m Jay — your site assistant. I\'m not a medical practitioner and I don\'t provide medical advice. I can only help you navigate and use this site. How can I help you today?`;

const quickActions: { label: string; intent: string }[] = [
  { label: 'Find Doctors', intent: 'find_doctors' },
  { label: 'Book an Appointment', intent: 'book_appointment' },
  { label: 'My Profile', intent: 'show_profile' },
  { label: 'Memberships', intent: 'memberships' },
  { label: 'Contact Support', intent: 'contact_support' },
  { label: 'How to use search', intent: 'how_search' },
];

const VoiceInterface: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{
    type: 'assistant',
    content: initialAssistantMessage,
    timestamp: new Date()
  }]);
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // scroll to bottom on new messages
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isExpanded]);

  const toggleExpanded = () => setIsExpanded(v => !v);

  const pushMessage = (msg: ChatMessage) => setMessages(prev => [...prev, msg]);

  const dispatchOpenAuth = (tab: 'login' | 'signup' = 'login') => {
    window.dispatchEvent(new CustomEvent('openAuthModal', { detail: { tab } }));
  };

  const parseIntent = (text: string) => {
    const t = text.toLowerCase();

    // Navigation intents
    if (t.includes('find') && t.includes('doctor')) return { type: 'navigate', path: '/search', reply: 'Sure — I can help you find doctors.' };
    if (t.includes('search') && t.includes('doctor')) return { type: 'navigate', path: '/search', reply: 'Opening the doctor search for you.' };
    if (t.includes('book') && (t.includes('appointment') || t.includes('consult'))) return { type: 'navigate', path: '/search', reply: 'To book an appointment, find a doctor first. I\'m taking you to the search page.' };
    if (t.includes('profile') || t.includes('my profile')) return { type: 'navigate', path: '/profile', reply: 'Opening your profile.' };
    if (t.includes('membership') || t.includes('memberships')) return { type: 'navigate', path: '/memberships', reply: 'Showing memberships.' };
    if (t.includes('team') || t.includes('meet')) return { type: 'navigate', path: '/team', reply: 'Here is the team page.' };
    if (t.includes('about')) return { type: 'navigate', path: '/about', reply: 'Opening About page.' };
    if (t.includes('legal')) return { type: 'navigate', path: '/legal', reply: 'Opening Legal page.' };
    if (t.includes('admin')) return { type: 'navigate', path: '/admin-mashau-permits', reply: 'Opening the admin panel.' };

    // Actions
    if (t.includes('log in') || t.includes('login') || t.includes('sign in')) return { type: 'action', action: 'open_auth', tab: 'login', reply: 'I\'ll open the login dialog for you.' };
    if (t.includes('sign up') || t.includes('signup') || t.includes('register')) return { type: 'action', action: 'open_auth', tab: 'signup', reply: 'I\'ll open the sign up dialog for you.' };
    if (t.includes('contact') || t.includes('support')) return { type: 'navigate', path: '/contact', reply: 'Opening contact/support page.' };

    // Help text
    if (t.includes('how') && t.includes('search')) return { type: 'info', reply: 'Use the Find Doctors page to search by specialty, city, or name. Apply filters to narrow results, then click a doctor card to view profile and book.' };
    if (t.includes('how') && t.includes('book')) return { type: 'info', reply: 'To book: go to Find Doctors, open a doctor profile, choose a time and follow the booking flow.' };

    // Short friendly replies
    if (t === 'hi' || t === 'hello' || t === 'hey') return { type: 'info', reply: 'Hi! I\'m Jay. I can help you find doctors, book appointments, or navigate the site. Try: "Find doctors" or use the buttons.' };

    return { type: 'fallback', reply: 'I\'m not sure I understood. Try one of the quick actions or type what you want to do (e.g. "Find doctors", "My profile", "Book an appointment").' };
  };

  const handleIntentResult = async (intent: any) => {
    if (intent.type === 'navigate' && intent.path) {
      pushMessage({ type: 'assistant', content: intent.reply, timestamp: new Date() });
      // small delay so user sees message
      setTimeout(() => navigate(intent.path), 300);
      return;
    }
    if (intent.type === 'action' && intent.action === 'open_auth') {
      pushMessage({ type: 'assistant', content: intent.reply, timestamp: new Date() });
      setTimeout(() => dispatchOpenAuth(intent.tab), 200);
      return;
    }
    if (intent.type === 'info') {
      pushMessage({ type: 'assistant', content: intent.reply, timestamp: new Date() });
      return;
    }
    // fallback
    pushMessage({ type: 'assistant', content: intent.reply, timestamp: new Date() });
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    pushMessage({ type: 'user', content: trimmed, timestamp: new Date() });
    setInput('');
    const intent = parseIntent(trimmed);
    await handleIntentResult(intent);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    sendMessage(input);
  };

  // UI
  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <Button
          onClick={toggleExpanded}
          className="w-14 h-14 rounded-full shadow-2xl transition-all duration-300 bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <MessageCircle className="h-5 w-5 text-white" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 animate-scale-in">
      <Card className="medical-hero-card w-96 shadow-2xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Jay — Site Assistant</span>
              <Badge variant="secondary" className="text-xs ml-2">
                <Activity className="h-3 w-3 mr-1" /> ready
              </Badge>
            </div>
            <div>
              <Button variant="ghost" size="sm" onClick={toggleExpanded} className="h-6 w-6 p-0">
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div ref={listRef} className="max-h-56 overflow-y-auto mb-3 space-y-2">
            {messages.map((m, i) => (
              <div key={i} className={`p-2 rounded-lg text-xs ${m.type === 'user' ? 'bg-primary/10 text-primary text-right' : 'bg-muted text-muted-foreground text-left'}`}>
                <div className="font-medium mb-1">{m.type === 'user' ? 'You' : 'Jay'}</div>
                <div>{m.content}</div>
              </div>
            ))}
          </div>

          <div className="mb-3">
            <div className="flex flex-wrap gap-2">
              {quickActions.map((q) => (
                <Button key={q.intent} size="sm" variant="outline" onClick={() => { sendMessage(q.label); }}>
                  {q.label}
                </Button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me to find doctors, book, or open pages..."
              className="flex-1 border rounded px-3 py-2 text-sm"
              aria-label="Chat input"
            />
            <Button type="submit" className="btn-medical-primary">Send</Button>
          </form>

        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceInterface;
