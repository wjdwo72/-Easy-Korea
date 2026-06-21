'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Lock, BarChart2, Globe, Users, Clock, RefreshCw } from 'lucide-react';

interface VisitRow {
  id: string;
  created_at: string;
  country: string;
  path: string;
  session_id: string;
  user_agent: string;
}

interface Stats {
  total: number;
  unique: number;
  byCountry: { country: string; count: number }[];
  byDate: { date: string; count: number }[];
  byHour: { hour: number; count: number }[];
  recent: VisitRow[];
}

function deviceType(ua: string) {
  if (/mobile/i.test(ua)) return '📱 모바일';
  if (/tablet|ipad/i.test(ua)) return '📲 태블릿';
  return '💻 데스크톱';
}

const COUNTRY_EMOJI: Record<string, string> = {
  KR: '🇰🇷', US: '🇺🇸', JP: '🇯🇵', CN: '🇨🇳', GB: '🇬🇧',
  DE: '🇩🇪', FR: '🇫🇷', AU: '🇦🇺', CA: '🇨🇦', SG: '🇸🇬',
  TH: '🇹🇭', VN: '🇻🇳', PH: '🇵🇭', MY: '🇲🇾', HK: '🇭🇰',
  TW: '🇹🇼', IN: '🇮🇳', Unknown: '🌐',
};

export default function AdminPage() {
  const router = useRouter();
  const [step, setStep] = useState<'auth' | 'dashboard'>('auth');
  const [adminUser, setAdminUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [range, setRange] = useState(7);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminUser, currentPassword: password, _authOnly: true }),
    });
    setLoading(false);
    if (!res.ok) { setError('아이디 또는 비밀번호가 올바르지 않습니다.'); return; }
    setStep('dashboard');
    fetchStats(range);
  };

  const fetchStats = async (days: number) => {
    setLoading(true);
    const res = await fetch(`/api/admin/visits?days=${days}`, {
      headers: {
        'x-admin-user': adminUser,
        'x-admin-pass': password,
      },
    });
    setLoading(false);
    if (res.ok) setStats(await res.json());
  };

  const changeRange = (days: number) => {
    setRange(days);
    fetchStats(days);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 h-14 flex items-center px-4">
        <button onClick={() => router.push('/')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
          <ChevronLeft size={16} /> 메인으로
        </button>
        <span className="mx-auto font-semibold text-gray-800 flex items-center gap-2">
          <BarChart2 size={16} /> 방문자 분석
        </span>
      </header>

      <main className="flex-1 px-4 pt-20 pb-12 max-w-3xl mx-auto w-full">

        {step === 'auth' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm mx-auto mt-8">
            <div className="flex flex-col items-center gap-2 mb-6">
              <div className="bg-blue-50 p-3 rounded-full"><Lock size={28} className="text-blue-600" /></div>
              <h2 className="font-bold text-gray-800 text-lg">관리자 인증</h2>
            </div>
            <form onSubmit={handleAuth} className="flex flex-col gap-3">
              <input type="text" placeholder="관리자 아이디" value={adminUser}
                onChange={e => setAdminUser(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400" />
              <input type="password" placeholder="접속 비밀번호" value={password}
                onChange={e => setPassword(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400" />
              {error && <p className="text-xs text-red-500 text-center">{error}</p>}
              <button type="submit" disabled={loading || !adminUser || !password}
                className="w-full bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
                {loading ? '확인 중...' : '입장'}
              </button>
            </form>
          </div>
        )}

        {step === 'dashboard' && (
          <div className="flex flex-col gap-5 mt-4">
            {/* Range selector */}
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-800 text-lg">방문자 현황</h2>
              <div className="flex gap-2 items-center">
                {[7, 14, 30].map(d => (
                  <button key={d} onClick={() => changeRange(d)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${range === d ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {d}일
                  </button>
                ))}
                <button onClick={() => fetchStats(range)} className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600">
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>

            {!stats && loading && (
              <div className="text-center py-12 text-gray-400">데이터 불러오는 중...</div>
            )}

            {stats && !stats.total && (
              <div className="text-center py-12 text-gray-400 bg-white rounded-2xl shadow-sm">
                <p className="text-sm">아직 방문 데이터가 없습니다.</p>
                <p className="text-xs mt-1 text-gray-300">Supabase visits 테이블을 생성했는지 확인하세요.</p>
              </div>
            )}

            {stats && stats.total > 0 && (
              <>
                {/* Summary cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-xs text-gray-400"><Users size={14} />총 방문</div>
                    <p className="text-3xl font-bold text-gray-800">{stats.total.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">최근 {range}일</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-xs text-gray-400"><Users size={14} />유니크 방문자</div>
                    <p className="text-3xl font-bold text-blue-600">{stats.unique.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">세션 기준</p>
                  </div>
                </div>

                {/* By country */}
                <div className="bg-white rounded-2xl shadow-sm p-5">
                  <h3 className="font-semibold text-gray-700 text-sm mb-4 flex items-center gap-2"><Globe size={14} />국가별 방문</h3>
                  <div className="flex flex-col gap-2">
                    {stats.byCountry.map(c => {
                      const pct = Math.round((c.count / stats.total) * 100);
                      return (
                        <div key={c.country} className="flex items-center gap-3">
                          <span className="text-lg w-7 text-center">{COUNTRY_EMOJI[c.country] ?? '🌐'}</span>
                          <span className="text-sm text-gray-600 w-12">{c.country}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-sm font-medium text-gray-700 w-8 text-right">{c.count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* By date */}
                <div className="bg-white rounded-2xl shadow-sm p-5">
                  <h3 className="font-semibold text-gray-700 text-sm mb-4 flex items-center gap-2"><Clock size={14} />일자별 방문</h3>
                  <div className="flex flex-col gap-2">
                    {stats.byDate.slice(-14).map(d => {
                      const max = Math.max(...stats.byDate.map(x => x.count));
                      const pct = Math.round((d.count / max) * 100);
                      return (
                        <div key={d.date} className="flex items-center gap-3">
                          <span className="text-xs text-gray-400 w-20 shrink-0">{d.date}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-sm font-medium text-gray-700 w-8 text-right">{d.count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* By hour */}
                <div className="bg-white rounded-2xl shadow-sm p-5">
                  <h3 className="font-semibold text-gray-700 text-sm mb-4">시간대별 방문 (KST)</h3>
                  <div className="flex items-end gap-1 h-24">
                    {Array.from({ length: 24 }, (_, h) => {
                      const found = stats.byHour.find(x => x.hour === h);
                      const count = found?.count ?? 0;
                      const max = Math.max(...stats.byHour.map(x => x.count), 1);
                      const pct = Math.round((count / max) * 100);
                      return (
                        <div key={h} className="flex flex-col items-center flex-1 gap-1">
                          <div className="w-full bg-blue-100 rounded-sm" style={{ height: `${pct}%`, minHeight: count ? 2 : 0 }} />
                          {h % 6 === 0 && <span className="text-[9px] text-gray-300">{h}시</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent visits */}
                <div className="bg-white rounded-2xl shadow-sm p-5">
                  <h3 className="font-semibold text-gray-700 text-sm mb-4">최근 방문 20건</h3>
                  <div className="flex flex-col gap-2">
                    {stats.recent.map(v => (
                      <div key={v.id} className="flex items-center gap-2 text-xs text-gray-500 border-b border-gray-50 pb-2">
                        <span>{COUNTRY_EMOJI[v.country] ?? '🌐'} {v.country}</span>
                        <span className="text-gray-300">|</span>
                        <span>{deviceType(v.user_agent)}</span>
                        <span className="text-gray-300">|</span>
                        <span className="text-gray-400">{new Date(v.created_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}</span>
                        <span className="text-gray-300">|</span>
                        <span className="font-mono">{v.path}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
