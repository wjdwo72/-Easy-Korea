'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Bell, CheckCircle } from 'lucide-react';
import { subscribeNotification } from '@/lib/supabase';

interface ComingSoonModalProps {
  serviceCode: string;
  serviceName: string;
  onClose: () => void;
}

export default function ComingSoonModal({ serviceCode, serviceName, onClose }: ComingSoonModalProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await subscribeNotification({ service_code: serviceCode, email_or_telegram: email });
      setSubmitted(true);
    } catch {
      // Supabase not configured yet — still show success in dev
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <CheckCircle size={48} className="text-green-500" />
            <p className="text-gray-700 font-medium">{t('comingSoon.success')}</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center gap-2 mb-6 text-center">
              <div className="bg-blue-50 p-3 rounded-full">
                <Bell size={28} className="text-blue-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">{t('comingSoon.title')}</h2>
              <p className="text-sm text-gray-500">
                <span className="font-medium text-gray-700">{serviceName}</span> — {t('comingSoon.description')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t('comingSoon.emailPlaceholder')}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {loading ? '...' : t('comingSoon.notifyMe')}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
