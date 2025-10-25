import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VITAL Payers Platform',
  description: 'Healthcare payers platform - Coming Soon',
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
