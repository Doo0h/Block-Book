import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BlockBook',
  description: 'Blockchain-based campus textbook marketplace UI',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
