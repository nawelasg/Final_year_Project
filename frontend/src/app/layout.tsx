import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { Toaster } from '~/components/ui/sonner';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'AI Legal Document Generator',
  description: 'Project ID: SKIT/CSE/2022-2026/123',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={GeistSans.className}>
        <Providers attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
