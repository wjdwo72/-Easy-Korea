import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { adminUser, currentPassword, newPassword, _authOnly } = await req.json();

  const expectedAdmin = process.env.ADMIN_USER || 'wjdwo72';
  const expectedPassword = process.env.SITE_PASSWORD || '4545';

  if (adminUser !== expectedAdmin || currentPassword !== expectedPassword) {
    return NextResponse.json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 });
  }

  // 인증만 확인하는 경우
  if (_authOnly) {
    return NextResponse.json({ ok: true });
  }

  if (!newPassword || newPassword.length < 4) {
    return NextResponse.json({ error: '비밀번호는 4자 이상이어야 합니다.' }, { status: 400 });
  }

  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;

  if (!token || !projectId) {
    return NextResponse.json({ error: 'Vercel API 설정이 필요합니다. VERCEL_TOKEN과 VERCEL_PROJECT_ID를 환경변수에 추가해주세요.' }, { status: 503 });
  }

  // SITE_PASSWORD env var ID 조회
  const listRes = await fetch(
    `https://api.vercel.com/v9/projects/${projectId}/env`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const listData = await listRes.json();
  const envVar = listData.envs?.find((e: { key: string }) => e.key === 'SITE_PASSWORD');

  if (!envVar) {
    return NextResponse.json({ error: 'SITE_PASSWORD 환경변수를 찾을 수 없습니다.' }, { status: 404 });
  }

  // 환경변수 업데이트
  const updateRes = await fetch(
    `https://api.vercel.com/v9/projects/${projectId}/env/${envVar.id}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ value: newPassword }),
    }
  );

  if (!updateRes.ok) {
    const err = await updateRes.json();
    return NextResponse.json({ error: err.error?.message || '업데이트 실패' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
