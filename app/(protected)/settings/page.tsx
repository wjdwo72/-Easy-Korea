'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, ChevronLeft, CheckCircle, Lock } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [step, setStep] = useState<'auth' | 'change' | 'done'>('auth');
  const [adminUser, setAdminUser] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminUser, currentPassword, newPassword: currentPassword, _authOnly: true }),
    });
    setLoading(false);
    // 401이면 인증 실패, 503이면 인증은 됐지만 Vercel 미설정 → 둘 다 change 단계로
    if (res.status === 401) {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
    } else {
      setStep('change');
    }
  };

  const handleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirm) { setError('새 비밀번호가 일치하지 않습니다.'); return; }
    if (newPassword.length < 4) { setError('4자 이상 입력하세요.'); return; }
    setLoading(true);
    setError('');
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminUser, currentPassword, newPassword }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || '오류가 발생했습니다.');
    } else {
      setStep('done');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 h-14 flex items-center px-4">
        <button onClick={() => router.push('/')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
          <ChevronLeft size={16} /> 메인으로
        </button>
        <span className="mx-auto font-semibold text-gray-800 flex items-center gap-2">
          <Settings size={16} /> 관리자 설정
        </span>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 pt-20">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">

          {step === 'auth' && (
            <>
              <div className="flex flex-col items-center gap-2 mb-6">
                <div className="bg-blue-50 p-3 rounded-full"><Lock size={28} className="text-blue-600" /></div>
                <h2 className="font-bold text-gray-800 text-lg">관리자 인증</h2>
                <p className="text-xs text-gray-400 text-center">관리자 아이디와 현재 접속 비밀번호를 입력하세요.</p>
              </div>
              <form onSubmit={handleAuth} className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="관리자 아이디"
                  value={adminUser}
                  onChange={e => setAdminUser(e.target.value)}
                  className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                />
                <input
                  type="password"
                  placeholder="현재 접속 비밀번호"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                />
                {error && <p className="text-xs text-red-500 text-center">{error}</p>}
                <button type="submit" disabled={loading}
                  className="w-full bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
                  {loading ? '확인 중...' : '인증하기'}
                </button>
              </form>
            </>
          )}

          {step === 'change' && (
            <>
              <div className="flex flex-col items-center gap-2 mb-6">
                <div className="bg-green-50 p-3 rounded-full"><Settings size={28} className="text-green-600" /></div>
                <h2 className="font-bold text-gray-800 text-lg">비밀번호 변경</h2>
                <p className="text-xs text-gray-400 text-center">새로운 접속 비밀번호를 입력하세요.<br/>변경 후 약 1분 내 적용됩니다.</p>
              </div>
              <form onSubmit={handleChange} className="flex flex-col gap-3">
                <input
                  type="password"
                  placeholder="새 비밀번호 (4자 이상)"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                />
                <input
                  type="password"
                  placeholder="새 비밀번호 확인"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                />
                {error && <p className="text-xs text-red-500 text-center">{error}</p>}
                <button type="submit" disabled={loading}
                  className="w-full bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
                  {loading ? '변경 중...' : '비밀번호 변경'}
                </button>
              </form>
            </>
          )}

          {step === 'done' && (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle size={52} className="text-green-500" />
              <h2 className="font-bold text-gray-800 text-lg">변경 완료!</h2>
              <p className="text-sm text-gray-500">Vercel 재배포 중입니다.<br/>약 1분 후 새 비밀번호가 적용됩니다.</p>
              <button onClick={() => router.push('/')}
                className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors">
                메인으로
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
