'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';

export default function AccessPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const res = await fetch('/api/access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.replace('/');
    } else {
      setError(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="bg-blue-50 p-4 rounded-full">
            <Lock size={32} className="text-blue-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Easy Korea</h1>
          <p className="text-sm text-gray-400 text-center">테스트 기간 중입니다.<br />접속 비밀번호를 입력해주세요.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(false); }}
            placeholder="비밀번호"
            autoFocus
            className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition focus:ring-2 ${
              error
                ? 'border-red-400 focus:ring-red-100'
                : 'border-gray-200 focus:border-blue-400 focus:ring-blue-50'
            }`}
          />
          {error && (
            <p className="text-xs text-red-500 text-center">비밀번호가 올바르지 않습니다.</p>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-blue-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? '확인 중...' : '입장하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
