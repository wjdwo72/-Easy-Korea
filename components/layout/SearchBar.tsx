'use client';

/// <reference types="@types/dom-speech-recognition" />
import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Mic, MicOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
  const { t } = useTranslation();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const q = query.toLowerCase();
    if (q.includes('luggage') || q.includes('bag') || q.includes('carry') || q.includes('캐리어') || q.includes('짐')) {
      router.push('/booking/luggage');
    }
  };

  const handleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice search not supported in this browser.');
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const SR = (window as typeof window & { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition || SpeechRecognition;
    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = e.results[0][0].transcript;
      setQuery(transcript);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto">
      <div className="flex items-center bg-white border border-gray-300 rounded-full shadow-md hover:shadow-lg focus-within:shadow-lg transition-shadow px-5 py-3 gap-3">
        <Search size={20} className="text-gray-400 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={t('search.placeholder')}
          className="flex-1 outline-none text-gray-800 text-base bg-transparent placeholder:text-gray-400"
        />
        <button
          type="button"
          onClick={handleVoice}
          aria-label={t('search.voice')}
          className={`shrink-0 p-1 rounded-full transition-colors ${
            listening ? 'text-red-500 animate-pulse' : 'text-blue-500 hover:text-blue-600'
          }`}
        >
          {listening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
      </div>
    </form>
  );
}
