'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import LuggageForm from '@/components/booking/LuggageForm';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export default function LuggagePage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header user={user} />
      <main className="flex-1 pt-20 pb-12 px-4">
        <LuggageForm />
      </main>
    </div>
  );
}
