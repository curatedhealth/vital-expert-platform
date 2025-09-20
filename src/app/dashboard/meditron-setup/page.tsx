import { Metadata } from 'next';
import MeditronSetup from '@/components/llm/MeditronSetup';

export const metadata: Metadata = {
  title: 'Meditron Setup | VITALpath',
  description: 'Configure and manage Meditron medical AI models',
};

export default function MeditronSetupPage() {
  return (
    <div className="container mx-auto py-6">
      <MeditronSetup />
    </div>
  );
}