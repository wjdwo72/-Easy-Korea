import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import I18nProvider from '@/lib/i18n/I18nProvider';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });

export const metadata: Metadata = {
  title: 'Easy Korea — Travel Services for Visitors',
  description: 'All-in-one travel services for foreigners visiting Korea. Luggage transfer, tours, hotel, medical, and more.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="min-h-screen bg-white antialiased">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
