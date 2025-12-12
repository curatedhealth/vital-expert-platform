// Redirect to new /optimize/personas location
import { redirect } from 'next/navigation';

export default function PersonasRedirect() {
  redirect('/optimize/personas');
}
