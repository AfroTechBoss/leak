import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LEAK — Anonymous Civic Whistleblowing',
  description: 'A secure, anonymous submission pipeline connecting whistleblowers with verified investigative journalists in Nigeria.',
  robots: 'noindex, nofollow',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
