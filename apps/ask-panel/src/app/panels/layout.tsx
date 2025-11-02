/**
 * Panels Layout - Force Dynamic Rendering
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function PanelsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

