'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export interface Feature {
  category: string;
  title: string;
  details: string;
  tutorialLink: string;
  image?: React.ReactNode;
}

interface Features06Props {
  title?: string;
  subtitle?: string;
  features?: Feature[];
}

const defaultFeatures: Feature[] = [
  {
    category: 'Ask Expert',
    title: 'Instant access to domain expertise',
    details:
      'Get immediate answers from specialized AI agents trained on millions of healthcare documents. No scheduling, no waiting—just expert-level insights on demand.',
    tutorialLink: '/ask-expert',
    image: <img src="/assets/vital/illustrations/ask-expert.svg" alt="Ask Expert" />,
  },
  {
    category: 'Expert Panel',
    title: 'Multi-perspective analysis at scale',
    details:
      'Assemble virtual advisory boards for complex decisions. Multiple AI experts debate, validate, and synthesize recommendations with full transparency.',
    tutorialLink: '/ask-panel',
    image: <img src="/assets/vital/illustrations/expert-panel.svg" alt="Expert Panel" />,
  },
  {
    category: 'Intelligent Workflows',
    title: 'Automate complex research processes',
    details:
      'Design and deploy multi-step workflows that orchestrate agents, tools, and data sources. From literature review to regulatory analysis—all automated.',
    tutorialLink: '/workflows',
    image: <img src="/assets/vital/illustrations/intelligent-workflows.svg" alt="Intelligent Workflows" />,
  },
  {
    category: 'Solution Builder',
    title: 'Custom AI solutions for your challenges',
    details:
      'Build tailored intelligence solutions combining agents, knowledge bases, and integrations. Your unique workflows, amplified by AI.',
    tutorialLink: '/solution-builder',
    image: <img src="/assets/vital/illustrations/solution-builder.svg" alt="Solution Builder" />,
  },
  {
    category: 'Knowledge Compound',
    title: 'Intelligence that grows with you',
    details:
      "Unlike traditional consultants, VITAL never forgets. Every insight compounds into your organization's permanent intelligence layer, accessible forever.",
    tutorialLink: '/knowledge',
    image: <img src="/assets/vital/illustrations/knowledge-compound.svg" alt="Knowledge Compound" />,
  },
];

export function Features06({
  title = 'Strengthen Your Strategy',
  subtitle = 'Enhance your strategy with intelligent tools designed for success.',
  features = defaultFeatures,
}: Features06Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-5xl w-full py-10 px-6">
        <h2 className="text-4xl md:text-[2.75rem] md:leading-[1.2] font-semibold tracking-[-0.03em] sm:max-w-xl text-pretty sm:mx-auto sm:text-center text-stone-800">
          {title}
        </h2>
        <p className="mt-2 text-muted-foreground text-lg sm:text-xl sm:text-center">
          {subtitle}
        </p>
        <div className="mt-8 md:mt-16 w-full mx-auto space-y-20">
          {features.map((feature, index) => (
            <div
              key={feature.category}
              className={`flex flex-col md:flex-row items-center gap-x-12 gap-y-6 ${
                index % 2 === 1 ? 'md:flex-row-reverse' : ''
              }`}
            >
              {/* Image placeholder - can be customized with feature.image */}
              <div className="w-full aspect-[4/3] bg-stone-100 rounded-xl border border-stone-200/50 basis-1/2 flex items-center justify-center">
                {feature.image || (
                  <div className="text-stone-400 text-sm">
                    {feature.category} Visual
                  </div>
                )}
              </div>
              <div className="basis-1/2 shrink-0">
                <span className="uppercase font-medium text-sm text-purple-600">
                  {feature.category}
                </span>
                <h4 className="my-3 text-3xl font-semibold tracking-[-0.02em] text-stone-800">
                  {feature.title}
                </h4>
                <p className="text-muted-foreground">{feature.details}</p>
                <Button asChild size="lg" className="mt-6 rounded-full gap-3 bg-purple-600 hover:bg-purple-700">
                  <Link href={feature.tutorialLink}>
                    Learn More <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Features06;
