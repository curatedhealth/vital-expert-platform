import { LandingPageServer } from '../components/landing/landing-page-server';

/**
 * Home page - now using React Server Components
 * All content is server-rendered except mobile menu toggle
 */
export default function Home() {
  return <LandingPageServer />;
}