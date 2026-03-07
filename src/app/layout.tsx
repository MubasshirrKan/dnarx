import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DNA Rx - AI-Powered Clinical Precision',
  description: 'AI-Powered Clinical Precision',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
