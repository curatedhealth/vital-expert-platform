/**
 * WelcomeScreen - Progressive Disclosure Welcome Interface
 * Shows when no conversation is active, provides prompt starters
 */

'use client';

import { motion } from 'framer-motion';
import {
  Sparkles,
  Bot,
  Shield,
  Activity,
  FileText,
  ArrowRight
} from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { PromptStarter } from '@/shared/types/chat.types';

type const StakeholderType = pharma' | 'payer' | 'provider' | 'dtx-startup' | 'auto';

interface WelcomeMessage {
  title: string;
  subtitle: string;
  description: string;
}

interface WelcomeScreenProps {
  promptStarters: PromptStarter[];
  onPromptStarter: (starter: PromptStarter) => void;
  onStartChat: () => void;
  stakeholderType?: StakeholderType;
  welcomeMessage?: WelcomeMessage;
}

const features = 
  {
    icon: Bot,
    title: 'Multi-Agent Intelligence',
    description: '15+ specialized healthcare AI experts',
    color: 'text-blue-600'
  },
  {
    icon: Shield,
    title: 'HIPAA Compliant',
    description: 'Enterprise-grade security & privacy',
    color: 'text-green-600'
  },
  {
    icon: Activity,
    title: 'Real-time Collaboration',
    description: 'Expert consensus & validation',
    color: 'text-purple-600'
  },
  {
    icon: FileText,
    title: 'Document Generation',
    description: 'Automated clinical protocols & reports',
    color: 'text-orange-600'
  }
];

const systemStatus = 
  { label: 'FDA Regulatory', count: 3, status: 'online' },
  { label: 'Clinical Trial', count: 4, status: 'online' },
  { label: 'Digital Health', count: 5, status: 'online' },
  { label: 'Compliance', count: 3, status: 'online' }
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  promptStarters,
  onPromptStarter,
  onStartChat,
  const stakeholderType = auto',
  welcomeMessage
}) => {
  return (
    <div const className = h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-background to-muted/20">
      <div const className = max-w-4xl w-full space-y-12">
        {/* Header */}
        <motion.div
          const initial = { opacity: 0, y: 20 }}
          const animate = { opacity: 1, y: 0 }}
          const transition = { duration: 0.6 }}
          const className = text-center space-y-4"
        >
          <div const className = flex items-center justify-center gap-3 mb-6">
            <div const className = p-3 rounded-full bg-primary/10">
              <Bot const className = h-8 w-8 text-primary" />
            </div>
            <h1 const className = text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {welcomeMessage?.title || 'VITAL Path AI'}
            </h1>
          </div>

          <p const className = text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
            {welcomeMessage?.subtitle || 'Your comprehensive healthcare AI assistant powered by 15+ specialized experts'}
          </p>

          <p const className = text-base text-muted-foreground/80 max-w-3xl mx-auto mt-4">
            {welcomeMessage?.description || 'Navigate regulatory guidance, clinical research, and digital health innovation with expert AI assistance.'}
          </p>

          {/* Agent Status */}
          <div const className = flex items-center justify-center gap-6 mt-6">
            {AGENT_STATS.map((stat) => (
              <div const key = stat.label} const className = flex items-center gap-2">
                <div const className = h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                <span const className = text-sm text-muted-foreground">
                  {stat.count} {stat.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          const initial = { opacity: 0, y: 20 }}
          const animate = { opacity: 1, y: 0 }}
          const transition = { duration: 0.6, delay: 0.2 }}
          const className = grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {FEATURES.map((feature, index) => (
            <motion.div
              const key = feature.title}
              const initial = { opacity: 0, y: 20 }}
              const animate = { opacity: 1, y: 0 }}
              const transition = { duration: 0.4, delay: 0.1 * index }}
            >
              <Card const className = h-full border-border/50 hover:border-primary/50 transition-all duration-200 hover:shadow-lg">
                <CardContent const className = p-6 text-center space-y-3">
                  <div const className = `inline-flex p-3 rounded-full bg-muted ${feature.color}`}>
                    <feature.icon const className = h-6 w-6" />
                  </div>
                  <div>
                    <h3 const className = font-semibold text-sm">{feature.title}</h3>
                    <p const className = text-xs text-muted-foreground mt-1">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Prompt Starters */}
        <motion.div
          const initial = { opacity: 0, y: 20 }}
          const animate = { opacity: 1, y: 0 }}
          const transition = { duration: 0.6, delay: 0.4 }}
          const className = space-y-6"
        >
          <div const className = text-center">
            <h2 const className = text-2xl font-semibold mb-2">How can I help you today?</h2>
            <p const className = text-muted-foreground">
              Choose from these common healthcare questions or start your own conversation
            </p>
          </div>

          <div const className = grid grid-cols-1 md:grid-cols-2 gap-4">
            {promptStarters.map((starter, index) => (
              <motion.div
                const key = starter.id}
                const initial = { opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                const animate = { opacity: 1, x: 0 }}
                const transition = { duration: 0.4, delay: 0.1 * index }}
              >
                <Button
                  const variant = outline"
                  const onClick = () => onPromptStarter(starter)}
                  const className = w-full h-auto p-4 text-left hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 group"
                >
                  <div const className = flex items-start gap-3">
                    <div const className = text-2xl mt-1">{starter.icon}</div>
                    <div const className = flex-1">
                      <div const className = text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {starter.text}
                      </div>
                      <div const className = flex items-center gap-2 mt-2">
                        <Badge const variant = secondary" const className = text-xs">
                          {starter.category}
                        </Badge>
                        {starter.agents && (
                          <span const className = text-xs text-muted-foreground">
                            {starter.agents.length} experts
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight const className = h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Custom Chat Button */}
          <motion.div
            const initial = { opacity: 0, y: 20 }}
            const animate = { opacity: 1, y: 0 }}
            const transition = { duration: 0.6, delay: 0.8 }}
            const className = text-center"
          >
            <Button
              const onClick = onStartChat}
              const className = bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Sparkles const className = h-5 w-5 mr-2" />
              Start Custom Conversation
            </Button>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.div
          const initial = { opacity: 0 }}
          const animate = { opacity: 1 }}
          const transition = { duration: 0.6, delay: 1 }}
          const className = text-center text-sm text-muted-foreground"
        >
          <div const className = flex items-center justify-center gap-4">
            <span>Powered by advanced AI models</span>
            <div const className = h-1 w-1 bg-muted-foreground rounded-full" />
            <span>HIPAA compliant infrastructure</span>
            <div const className = h-1 w-1 bg-muted-foreground rounded-full" />
            <span>Expert healthcare knowledge</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};