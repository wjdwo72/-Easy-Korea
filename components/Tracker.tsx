'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

function getSessionId() {
  try {
    let id = localStorage.getItem('ek_session');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('ek_session', id);
    }
    return id;
  } catch {
    return null;
  }
}

export default function Tracker() {
  const pathname = usePathname();

  useEffect(() => {
    const sessionId = getSessionId();
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname, sessionId }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
