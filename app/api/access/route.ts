import { NextRequest, NextResponse } from 'next/server';

const COOKIE = 'ek_access';

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const PASSWORD = process.env.SITE_PASSWORD || '4545';
  const persist = process.env.PASSWORD_PERSIST === 'true';

  if (password !== PASSWORD) {
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, PASSWORD, {
    httpOnly: true,
    sameSite: 'lax',
    // persist=true면 30일, false면 세션 쿠키 (브라우저 닫으면 삭제)
    ...(persist ? { maxAge: 60 * 60 * 24 * 30 } : {}),
    path: '/',
  });
  return res;
}

// 현재 persist 설정 조회
export async function GET() {
  const persist = process.env.PASSWORD_PERSIST === 'true';
  return NextResponse.json({ persist });
}
