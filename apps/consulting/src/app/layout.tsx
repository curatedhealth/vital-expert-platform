import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VITAL Consulting Platform',
  description: 'Healthcare consulting platform - Coming Soon',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
