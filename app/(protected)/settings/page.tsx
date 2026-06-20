'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, ChevronLeft, CheckCircle, Lock, RefreshCw, Clock } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [step, setStep] = useState<'auth' | 'change' | 'done'>('auth');
  const [adminUser, setAdminUser] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [persist, setPersist] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [doneMsg, setDoneMsg] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminUser, currentPassword, _authOnly: true }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.status === 401) {
      setError(data.error || '인증 실패');
    } else {
      setPersist(data.persist ?? false);
      setStep('change');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirm) {
      setError('새 비밀번호가 일치하지 않습니다.'); return;
    }
    if (newPassword && newPassword.length < 4) {
      setError('4자 이상 입력하세요.'); return;
    }
    setLoading(true);
    setError('');

    const body: Record<string, unknown> = { adminUser, currentPassword, persist };
    if (newPassword) body.newPassword = newPassword;

    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || '오류가 발생했습니다.');
    } else {
      const msgs = [];
      if (newPassword) msgs.push('비밀번호가 변경됐습니다.');
      msgs.push(`접속 유지: ${persist ? '30일' : '매번 입력'}`);
      setDoneMsg(msgs.join(' · '));
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

      <main className="flex-1 flex items-center justify-center px-4 pt-20 pb-12">
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
                <button type="submit" disabled={loading || !adminUser || !currentPassword}
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
                <h2 className="font-bold text-gray-800 text-lg">설정 변경</h2>
              </div>
              <form onSubmit={handleSave} className="flex flex-col gap-4">

                {/* 접속 비밀번호 변경 */}
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <Lock size={14} className="text-gray-400" /> 접속 비밀번호 변경
                  </p>
                  <input
                    type="password"
                    placeholder="새 비밀번호 (비울 경우 유지)"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                  />
                  {newPassword && (
                    <input
                      type="password"
                      placeholder="새 비밀번호 확인"
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                    />
                  )}
                </div>

                {/* 로그인 유지 설정 */}
                <div className="border border-gray-100 rounded-xl p-4 flex flex-col gap-3">
                  <p className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <Clock size={14} className="text-gray-400" /> 접속 유지 설정
                  </p>
                  <div className="flex flex-col gap-2">
                    <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${!persist ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                      <input type="radio" name="persist" checked={!persist} onChange={() => setPersist(false)} className="accent-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">매번 입력</p>
                        <p className="text-xs text-gray-400">브라우저 닫으면 다시 입력</p>
                      </div>
                    </label>
                    <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${persist ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                      <input type="radio" name="persist" checked={persist} onChange={() => setPersist(true)} className="accent-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">30일 유지</p>
                        <p className="text-xs text-gray-400">한 번 입력하면 30일간 유지</p>
                      </div>
                    </label>
                  </div>
                </div>

                {error && <p className="text-xs text-red-500 text-center">{error}</p>}

                <button type="submit" disabled={loading}
                  className="w-full bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? <><RefreshCw size={14} className="animate-spin" /> 저장 중...</> : '설정 저장'}
                </button>
              </form>
            </>
          )}

          {step === 'done' && (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle size={52} className="text-green-500" />
              <h2 className="font-bold text-gray-800 text-lg">저장 완료!</h2>
              <p className="text-sm text-gray-500">{doneMsg}</p>
              <p className="text-xs text-gray-400">Vercel 재배포 후 약 1분 내 적용됩니다.</p>
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
