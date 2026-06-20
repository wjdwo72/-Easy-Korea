import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { triggerMakeWebhook } from '@/lib/make-webhook';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      service_type: 'luggage',
      status: 'pending',
      payment_amount: body.total_amount,
      details: body,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await triggerMakeWebhook({ ...body, booking_id: booking.id }).catch(() => {});

  return NextResponse.json({ booking_id: booking.id });
}
