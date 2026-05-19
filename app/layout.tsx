import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import './globals.css';
import CustomerChat from '@/components/CustomerChat';

export const metadata: Metadata = {
  title: 'LogiTrust | Premium Logistics & Consignment',
  description: 'Delivering more than packages, we deliver trust. Fast, secure, and reliable logistics solutions worldwide.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body>
        {children}
        <CustomerChat />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}