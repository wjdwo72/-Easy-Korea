'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import SearchBar from '@/components/layout/SearchBar';
import ServiceGrid from '@/components/home/ServiceGrid';
import { supabase } from '@/lib/supabase';
import { Settings } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null)).catch(() => {});
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header user={user} />

      <main className="flex-1 flex flex-col items-center justify-center gap-10 px-4 pt-20 pb-12">
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
            Easy <span className="text-blue-600">Korea</span>
          </h1>
          <p className="text-gray-500 text-base">Your travel companion in Korea 🇰🇷</p>
        </div>

        <SearchBar />

        <ServiceGrid />
      </main>

      <footer className="relative text-center py-6 text-xs text-gray-400">
        © 2024 Easy Korea. All rights reserved.
        <button
          onClick={() => router.push('/settings')}
          className="absolute right-4 bottom-5 p-2 text-gray-300 hover:text-gray-500 transition-colors"
          title="관리자 설정"
        >
          <Settings size={16} />
        </button>
      </footer>
    </div>
  );
}
