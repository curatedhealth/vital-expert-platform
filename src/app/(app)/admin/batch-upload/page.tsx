import { Metadata } from 'next';
import BatchUploadPanel from '@/components/admin/batch-upload-panel';

export const metadata: Metadata = {
  title: 'Batch Upload | VITAL Path Admin',
  description: 'Bulk upload agents, capabilities, and prompts to your VITAL Path platform',
};

export default function BatchUploadPage() {
  return <BatchUploadPanel />;
}