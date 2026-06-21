import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { path, sessionId } = await req.json();

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || url.includes('YOUR_PROJECT') || !key || key.includes('YOUR')) {
      return NextResponse.json({ ok: false, reason: 'supabase not configured' });
    }

    const supabase = createClient(url, key);

    const country =
      req.headers.get('x-vercel-ip-country') ||
      req.headers.get('cf-ipcountry') ||
      'Unknown';
    const userAgent = req.headers.get('user-agent') || '';

    await supabase.from('visits').insert({
      path: path || '/',
      session_id: sessionId || null,
      country,
      user_agent: userAgent,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
