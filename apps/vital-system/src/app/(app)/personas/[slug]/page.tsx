// Redirect to new /optimize/personas/[slug] location
import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PersonaDetailRedirect({ params }: PageProps) {
  const { slug } = await params;
  redirect(`/optimize/personas/${slug}`);
}
