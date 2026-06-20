import { NextRequest, NextResponse } from 'next/server';

async function updateVercelEnv(token: string, projectId: string, key: string, value: string) {
  const listRes = await fetch(
    `https://api.vercel.com/v9/projects/${projectId}/env`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const listData = await listRes.json();
  const envVar = listData.envs?.find((e: { key: string }) => e.key === key);

  if (!envVar) return false;

  const updateRes = await fetch(
    `https://api.vercel.com/v9/projects/${projectId}/env/${envVar.id}`,
    {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
    }
  );
  return updateRes.ok;
}

export async function POST(req: NextRequest) {
  const { adminUser, currentPassword, newPassword, persist, _authOnly } = await req.json();

  const expectedAdmin = process.env.ADMIN_USER || 'wjdwo72';
  const expectedPassword = process.env.SITE_PASSWORD || '4545';

  if (adminUser !== expectedAdmin || currentPassword !== expectedPassword) {
    return NextResponse.json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 });
  }

  if (_authOnly) {
    const currentPersist = process.env.PASSWORD_PERSIST === 'true';
    return NextResponse.json({ ok: true, persist: currentPersist });
  }

  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;

  if (!token || !projectId) {
    return NextResponse.json({ error: 'Vercel API 설정이 필요합니다.' }, { status: 503 });
  }

  // 비밀번호 변경
  if (newPassword) {
    if (newPassword.length < 4) {
      return NextResponse.json({ error: '비밀번호는 4자 이상이어야 합니다.' }, { status: 400 });
    }
    const ok = await updateVercelEnv(token, projectId, 'SITE_PASSWORD', newPassword);
    if (!ok) return NextResponse.json({ error: '비밀번호 업데이트 실패' }, { status: 500 });
  }

  // persist 설정 변경
  if (typeof persist === 'boolean') {
    const ok = await updateVercelEnv(token, projectId, 'PASSWORD_PERSIST', String(persist));
    if (!ok) return NextResponse.json({ error: 'persist 설정 업데이트 실패' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
