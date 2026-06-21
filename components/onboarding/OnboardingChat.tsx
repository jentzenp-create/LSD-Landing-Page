import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { OnboardingClient } from '../../lib/onboardingClients';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  /** Hidden kickoff/control messages are sent to the AI but not rendered in the chat. */
  hidden?: boolean;
}

interface SpeechRecognitionResultLike {
  resultIndex: number;
  results: { [index: number]: { 0: { transcript: string }; isFinal: boolean }; length: number };
}

const KICKOFF_MESSAGE = '(The interview is starting now. Greet me warmly by name and ask your first question.)';
const WRAP_UP_MESSAGE = '(Please wrap up the interview now and produce your summary, even if some topics were not fully covered.)';

function getSpeechRecognition(): any {
  if (typeof window === 'undefined') return null;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
}

const OnboardingChat: React.FC<{ client: OnboardingClient }> = ({ client }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedSummary, setCompletedSummary] = useState<Record<string, unknown> | null>(null);

  const sessionIdRef = useRef<string>(crypto.randomUUID());
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const speechSupported = !!getSpeechRecognition();
  const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Kick off the conversation on mount.
  useEffect(() => {
    sendToAI([{ role: 'user', content: KICKOFF_MESSAGE, hidden: true }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isThinking]);

  async function sendToAI(history: ChatMessage[]) {
    setIsThinking(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/onboarding-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientSlug: client.slug,
          messages: history.map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${res.status})`);
      }

      const data: { reply: string; done: boolean; summary?: Record<string, unknown> } = await res.json();
      const nextMessages: ChatMessage[] = [...history, { role: 'assistant', content: data.reply }];
      setMessages(nextMessages);
      speak(data.reply);
      persistSession(nextMessages, data.summary, data.done);

      if (data.done) {
        setCompletedSummary(data.summary ?? {});
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(
        err instanceof Error ? err.message : 'Something went wrong reaching the AI. Please try again.'
      );
    } finally {
      setIsThinking(false);
    }
  }

  async function persistSession(history: ChatMessage[], summary: Record<string, unknown> | undefined, completed: boolean) {
    try {
      await supabase.from('onboarding_sessions').upsert({
        id: sessionIdRef.current,
        client_slug: client.slug,
        business_name: client.businessName,
        contact_name: client.contactName,
        transcript: history.filter((m) => !m.hidden),
        summary: summary ?? null,
        completed,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      // Non-fatal: the conversation continues even if the save fails (e.g. Supabase not configured yet).
      console.warn('Could not save onboarding session:', err);
    }
  }

  function speak(text: string) {
    if (!voiceOutputEnabled || !ttsSupported) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  }

  function handleSend(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isThinking || completedSummary) return;
    const nextHistory: ChatMessage[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(nextHistory);
    setInput('');
    stopListening();
    sendToAI(nextHistory);
  }

  function handleWrapUp() {
    if (isThinking || completedSummary) return;
    const nextHistory: ChatMessage[] = [...messages, { role: 'user', content: WRAP_UP_MESSAGE, hidden: true }];
    setMessages(nextHistory);
    stopListening();
    sendToAI(nextHistory);
  }

  function startListening() {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition || isListening) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let baseText = input ? input + ' ' : '';

    recognition.onresult = (event: SpeechRecognitionResultLike) => {
      let finalChunk = '';
      let interimChunk = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalChunk += result[0].transcript;
        } else {
          interimChunk += result[0].transcript;
        }
      }
      if (finalChunk) {
        baseText = baseText + finalChunk + ' ';
      }
      setInput(baseText + interimChunk);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setIsListening(false);
  }

  function toggleListening() {
    if (isListening) stopListening();
    else startListening();
  }

  if (completedSummary) {
    return <OnboardingSummary client={client} summary={completedSummary} />;
  }

  return (
    <div className="flex flex-col h-screen bg-offWhite">
      <header className="bg-white border-b border-black/5 px-4 sm:px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary">Website Onboarding</p>
          <h1 className="text-lg sm:text-xl font-bold text-black">{client.businessName}</h1>
        </div>
        {ttsSupported && (
          <button
            onClick={() => setVoiceOutputEnabled((v) => !v)}
            className={`text-xs font-bold px-3 py-2 rounded-full border transition-colors ${
              voiceOutputEnabled
                ? 'bg-primary/10 border-primary text-charcoal'
                : 'bg-white border-black/10 text-charcoal/50'
            }`}
          >
            {voiceOutputEnabled ? '🔊 Reading aloud' : '🔈 Read aloud off'}
          </button>
        )}
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4 max-w-2xl mx-auto w-full">
        {messages
          .filter((m) => !m.hidden)
          .map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-3xl px-5 py-3 whitespace-pre-wrap leading-relaxed ${
                  m.role === 'user' ? 'bg-black text-white' : 'bg-white text-black shadow-sm'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-white rounded-3xl px-5 py-4 shadow-sm flex gap-1.5 items-center">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-3 text-sm">
            {errorMessage}
          </div>
        )}
      </div>

      <div className="bg-white border-t border-black/5 px-4 sm:px-6 py-4 shrink-0">
        <div className="max-w-2xl mx-auto flex items-end gap-2">
          {speechSupported && (
            <button
              onClick={toggleListening}
              aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
              className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-offWhite text-charcoal hover:bg-primary/10'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14a3 3 0 003-3V5a3 3 0 10-6 0v6a3 3 0 003 3z" />
                <path d="M19 11a1 1 0 10-2 0 5 5 0 01-10 0 1 1 0 10-2 0 7 7 0 006 6.92V20H9a1 1 0 100 2h6a1 1 0 100-2h-2v-2.08A7 7 0 0019 11z" />
              </svg>
            </button>
          )}

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(input);
              }
            }}
            placeholder={isListening ? 'Listening… keep talking' : 'Type your answer, or tap the mic to talk'}
            rows={1}
            className="flex-1 resize-none bg-offWhite border border-black/10 rounded-2xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 max-h-32"
          />

          <button
            onClick={() => handleSend(input)}
            disabled={isThinking || !input.trim()}
            className="shrink-0 w-12 h-12 rounded-full bg-black text-white flex items-center justify-center disabled:opacity-30 hover:scale-105 active:scale-95 transition-transform"
            aria-label="Send"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>

        <div className="max-w-2xl mx-auto mt-2 text-right">
          <button onClick={handleWrapUp} disabled={isThinking} className="text-xs font-semibold text-charcoal/40 hover:text-primary transition-colors">
            I've covered everything — wrap it up
          </button>
        </div>
      </div>
    </div>
  );
};

const SUMMARY_LABELS: Record<string, string> = {
  businessName: 'Business Name',
  contactName: 'Contact',
  serviceAreas: 'Service Areas',
  servicesOffered: 'Services Offered',
  priorityServices: 'Priority Services',
  targetCustomers: 'Target Customers',
  differentiators: 'Differentiators',
  designPreferences: 'Design Preferences',
  mustHaveFeatures: 'Must-Have Features',
  existingAssets: 'Existing Assets',
  testimonialsAndProof: 'Testimonials & Proof',
  callToActionPreference: 'Primary Call to Action',
  timelineAndBudget: 'Timeline & Budget',
  additionalNotes: 'Additional Notes',
};

const OnboardingSummary: React.FC<{ client: OnboardingClient; summary: Record<string, unknown> }> = ({
  client,
  summary,
}) => (
  <div className="min-h-screen bg-offWhite py-12 px-4 sm:px-6">
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2">Thanks, {client.contactName}!</h1>
        <p className="text-charcoal/60">
          We've got everything we need to start designing the {client.businessName} website. We'll be in touch soon.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 space-y-6">
        {Object.entries(SUMMARY_LABELS).map(([key, label]) => {
          const value = summary[key];
          if (!value || (Array.isArray(value) && value.length === 0)) return null;
          return (
            <div key={key}>
              <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">{label}</p>
              {Array.isArray(value) ? (
                <ul className="list-disc list-inside text-black space-y-0.5">
                  {value.map((item, i) => (
                    <li key={i}>{String(item)}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-black leading-relaxed">{String(value)}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

export default OnboardingChat;
