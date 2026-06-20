import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const isConfigured =
  supabaseUrl !== 'https://placeholder.supabase.co' &&
  supabaseAnonKey !== 'placeholder-anon-key';

export { isConfigured };

export type BookingStatus = 'pending' | 'complete' | 'cancel';

export interface Booking {
  id?: string;
  user_id?: string;
  service_type: string;
  status: BookingStatus;
  payment_amount: number;
  details: Record<string, unknown>;
  created_at?: string;
}

export interface NotificationSubscription {
  service_code: string;
  email_or_telegram: string;
}

export async function createBooking(booking: Omit<Booking, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('bookings')
    .insert(booking)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function subscribeNotification(sub: NotificationSubscription) {
  const { error } = await supabase.from('notifications').insert(sub);
  if (error) throw error;
}
