import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VITAL Pharma Platform',
  description: 'Pharmaceutical platform - Coming Soon',
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
