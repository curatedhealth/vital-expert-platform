'use client';

import { useState } from 'react';
import { ConsultationForm } from '@/features/expert-consultation/components/ConsultationForm';
import { LiveReasoningView } from '@/features/expert-consultation/components/LiveReasoningView';
import { ExecutionControlPanel } from '@/features/expert-consultation/components/ExecutionControlPanel';
import { CostTracker } from '@/features/expert-consultation/components/CostTracker';
import { SessionHistory } from '@/features/expert-consultation/components/SessionHistory';

export default function AutonomousExpertPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Expert Consultation - Autonomous Mode
        </h1>
        <p className="text-gray-600">
          Get comprehensive expert analysis with full reasoning transparency and real-time cost tracking.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Consultation Form & History */}
        <div className="lg:col-span-1 space-y-6">
          <ConsultationForm 
            onStart={(id) => {
              setSessionId(id);
              setIsExecuting(true);
            }}
            onComplete={() => setIsExecuting(false)}
          />
          
          <SessionHistory userId="current-user" />
        </div>
        
        {/* Center: Live Reasoning & Controls */}
        <div className="lg:col-span-2 space-y-6">
          {sessionId && (
            <>
              <ExecutionControlPanel 
                sessionId={sessionId}
                isExecuting={isExecuting}
                onStatusChange={(status) => {
                  if (status === 'completed' || status === 'failed') {
                    setIsExecuting(false);
                  }
                }}
              />
              
              <LiveReasoningView sessionId={sessionId} />
              
              <CostTracker sessionId={sessionId} />
            </>
          )}
          
          {!sessionId && (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Start Your Expert Consultation
              </h3>
              <p className="text-gray-600">
                Submit your query to begin autonomous analysis with real-time reasoning transparency.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
