// Redirect to new /discover/tools location
import { redirect } from 'next/navigation';

export default function ToolsRedirect() {
  redirect('/discover/tools');
}

// Original page moved to /discover/tools/page.tsx
// This redirect ensures existing links continue to work
