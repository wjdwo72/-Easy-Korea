'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Luggage, MapPin, Calendar, Clock, Plane, Package, CheckCircle, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createBooking } from '@/lib/supabase';
import { triggerMakeWebhook } from '@/lib/make-webhook';

type LuggageSize = 'small' | 'medium' | 'large';

const PRICES: Record<LuggageSize, number> = {
  small: 15000,
  medium: 25000,
  large: 35000,
};

const SIZE_ICONS: Record<LuggageSize, string> = {
  small: '🧳',
  medium: '🧳🧳',
  large: '🧳🧳🧳',
};

export default function LuggageForm() {
  const { t } = useTranslation();
  const router = useRouter();

  const [form, setForm] = useState({
    date: '',
    time: '',
    flight: '',
    from: '',
    to: '',
    size: 'medium' as LuggageSize,
    quantity: 1,
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const set = (key: string, value: string | number) =>
    setForm(f => ({ ...f, [key]: value }));

  const total = PRICES[form.size] * form.quantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let bookingId = 'dev-' + Date.now();

      try {
        const booking = await createBooking({
          service_type: 'luggage',
          status: 'pending',
          payment_amount: total,
          details: {
            date: form.date,
            time: form.time,
            flight: form.flight,
            from: form.from,
            to: form.to,
            size: form.size,
            quantity: form.quantity,
            notes: form.notes,
          },
        });
        bookingId = booking.id;
      } catch {
        // Supabase not configured yet — continue
      }

      try {
        await triggerMakeWebhook({
          booking_id: bookingId,
          service_type: 'luggage',
          pickup_date: form.date,
          pickup_time: form.time,
          flight_number: form.flight,
          from_location: form.from,
          to_location: form.to,
          luggage_size: form.size,
          quantity: form.quantity,
          total_amount: total,
          notes: form.notes,
        });
      } catch {
        // Make not configured yet — continue
      }

      setSuccess(true);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <CheckCircle size={64} className="text-green-500" />
        <h2 className="text-2xl font-semibold text-gray-800">{t('booking.success')}</h2>
        <button
          onClick={() => router.push('/')}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          ← Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => router.push('/')}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        <ChevronLeft size={16} />
        Back
      </button>

      <div className="flex items-center gap-3 mb-8">
        <div className="bg-blue-50 p-3 rounded-xl">
          <Luggage size={28} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('booking.title')}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <Calendar size={14} className="text-gray-400" />
              {t('booking.date')}
            </label>
            <input
              type="date"
              required
              value={form.date}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => set('date', e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <Clock size={14} className="text-gray-400" />
              {t('booking.time')}
            </label>
            <input
              type="time"
              required
              value={form.time}
              onChange={e => set('time', e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition"
            />
          </div>
        </div>

        {/* Flight */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
            <Plane size={14} className="text-gray-400" />
            {t('booking.flight')}
          </label>
          <input
            type="text"
            value={form.flight}
            onChange={e => set('flight', e.target.value.toUpperCase())}
            placeholder={t('booking.flightPlaceholder')}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition"
          />
        </div>

        {/* From / To */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <MapPin size={14} className="text-green-500" />
              {t('booking.from')}
            </label>
            <input
              type="text"
              required
              value={form.from}
              onChange={e => set('from', e.target.value)}
              placeholder={t('booking.fromPlaceholder')}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <MapPin size={14} className="text-red-500" />
              {t('booking.to')}
            </label>
            <input
              type="text"
              required
              value={form.to}
              onChange={e => set('to', e.target.value)}
              placeholder={t('booking.toPlaceholder')}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition"
            />
          </div>
        </div>

        {/* Luggage size */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
            <Package size={14} className="text-gray-400" />
            {t('booking.luggageSize')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['small', 'medium', 'large'] as LuggageSize[]).map(size => (
              <button
                key={size}
                type="button"
                onClick={() => set('size', size)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                  form.size === size
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <span className="text-xl">{SIZE_ICONS[size]}</span>
                <span className="text-xs font-semibold text-gray-700">{t(`booking.sizes.${size}.label`)}</span>
                <span className="text-[10px] text-gray-400 text-center leading-tight">{t(`booking.sizes.${size}.desc`)}</span>
                <span className="text-xs font-bold text-blue-600">
                  ₩{PRICES[size].toLocaleString()}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">{t('booking.quantity')}</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => set('quantity', Math.max(1, form.quantity - 1))}
              className="w-9 h-9 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-lg flex items-center justify-center transition-colors"
            >
              −
            </button>
            <span className="w-8 text-center font-semibold text-gray-800">{form.quantity}</span>
            <button
              type="button"
              onClick={() => set('quantity', Math.min(10, form.quantity + 1))}
              className="w-9 h-9 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-lg flex items-center justify-center transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">{t('booking.notes')}</label>
          <textarea
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            placeholder={t('booking.notesPlaceholder')}
            rows={3}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition resize-none"
          />
        </div>

        {/* Price summary */}
        <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{t('booking.price')}</p>
            <p className="text-xs text-gray-400">
              ₩{PRICES[form.size].toLocaleString()} × {form.quantity} {t('booking.perBag')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">{t('booking.total')}</p>
            <p className="text-2xl font-bold text-blue-600">₩{total.toLocaleString()}</p>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded-xl py-3.5 font-semibold text-base hover:bg-blue-700 transition-colors disabled:opacity-60 shadow-sm"
        >
          {loading ? '...' : t('booking.confirm')}
        </button>
      </form>
    </div>
  );
}
