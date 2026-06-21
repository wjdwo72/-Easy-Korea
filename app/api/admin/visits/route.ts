import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  // Admin auth check
  const adminUser = req.headers.get('x-admin-user');
  const adminPass = req.headers.get('x-admin-pass');
  const expectedAdmin = process.env.ADMIN_USER || 'wjdwo72';
  const expectedPass = process.env.SITE_PASSWORD || '4545';

  if (adminUser !== expectedAdmin || adminPass !== expectedPass) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || url.includes('YOUR_PROJECT') || !key || key.includes('YOUR')) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const supabase = createClient(url, key);
  const days = Number(req.nextUrl.searchParams.get('days') || 7);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('visits')
    .select('*')
    .gte('created_at', since)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = data ?? [];

  // Total & unique
  const total = rows.length;
  const unique = new Set(rows.map(r => r.session_id).filter(Boolean)).size;

  // By country
  const countryMap: Record<string, number> = {};
  for (const r of rows) {
    const c = r.country || 'Unknown';
    countryMap[c] = (countryMap[c] ?? 0) + 1;
  }
  const byCountry = Object.entries(countryMap)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count);

  // By date (KST)
  const dateMap: Record<string, number> = {};
  for (const r of rows) {
    const d = new Date(r.created_at).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul', month: '2-digit', day: '2-digit' });
    dateMap[d] = (dateMap[d] ?? 0) + 1;
  }
  const byDate = Object.entries(dateMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // By hour (KST)
  const hourMap: Record<number, number> = {};
  for (const r of rows) {
    const h = new Date(r.created_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', hour: 'numeric', hour12: false });
    const hour = parseInt(h);
    hourMap[hour] = (hourMap[hour] ?? 0) + 1;
  }
  const byHour = Object.entries(hourMap)
    .map(([hour, count]) => ({ hour: Number(hour), count }))
    .sort((a, b) => a.hour - b.hour);

  return NextResponse.json({
    total,
    unique,
    byCountry,
    byDate,
    byHour,
    recent: rows.slice(0, 20),
  });
}
