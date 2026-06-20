'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, MessageCircle, User, LogOut, ChevronDown } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n/config';
import { supabase } from '@/lib/supabase';

interface HeaderProps {
  user?: { email?: string } | null;
}

export default function Header({ user }: HeaderProps) {
  const { t, i18n } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const currentLang = (mounted
    ? SUPPORTED_LANGUAGES.find(l => l.code === i18n.language)
    : null) ?? SUPPORTED_LANGUAGES[0];

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    }).catch(() => alert('Supabase가 아직 설정되지 않았습니다.'));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut().catch(() => {});
    setUserOpen(false);
    window.location.reload();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <span className="text-blue-600 font-bold text-xl tracking-tight">Easy</span>
          <span className="text-gray-800 font-bold text-xl tracking-tight">Korea</span>
        </a>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Language selector */}
          <div className="relative">
            <button
              onClick={() => { setLangOpen(!langOpen); setUserOpen(false); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Globe size={16} />
              <span>{currentLang.flag} {currentLang.code.toUpperCase()}</span>
              <ChevronDown size={14} />
            </button>
            {langOpen && (
              <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[150px]">
                {SUPPORTED_LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => { i18n.changeLanguage(lang.code); setLangOpen(false); }}
                    className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors ${
                      i18n.language === lang.code ? 'text-blue-600 font-medium' : 'text-gray-700'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Contact */}
          <a
            href="https://t.me/easykoreachat"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <MessageCircle size={16} />
            <span className="hidden sm:inline">{t('nav.contact')}</span>
          </a>

          {/* Auth */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => { setUserOpen(!userOpen); setLangOpen(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
              >
                <User size={16} />
                <span className="hidden sm:inline max-w-[100px] truncate">{user.email?.split('@')[0]}</span>
              </button>
              {userOpen && (
                <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[140px]">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-500 flex items-center gap-2 hover:bg-gray-50 transition-colors"
                  >
                    <LogOut size={14} />
                    {t('nav.logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleGoogleLogin}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>{t('nav.login')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Close dropdowns on outside click */}
      {(langOpen || userOpen) && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => { setLangOpen(false); setUserOpen(false); }}
        />
      )}
    </header>
  );
}
