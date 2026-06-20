export interface BookingWebhookPayload {
  booking_id: string;
  service_type: string;
  customer_email?: string;
  customer_telegram?: string;
  pickup_date: string;
  pickup_time: string;
  flight_number: string;
  from_location: string;
  to_location: string;
  luggage_size: string;
  quantity: number;
  total_amount: number;
  notes?: string;
}

export async function triggerMakeWebhook(payload: BookingWebhookPayload) {
  const webhookUrl = process.env.MAKE_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn('MAKE_WEBHOOK_URL not configured');
    return;
  }

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Make webhook failed: ${res.status}`);
  }
}
