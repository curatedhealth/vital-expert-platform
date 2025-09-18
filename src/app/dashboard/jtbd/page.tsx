'use client';

import React, { useState } from 'react';
import { JTBDExplorer } from '@/components/jtbd/jtbd-explorer';
import { JTBDDetailModal } from '@/components/jtbd/jtbd-detail-modal';
import { JTBDExecutionModal } from '@/components/jtbd/jtbd-execution-modal';
import { MA001ConfigModal } from '@/components/jtbd/ma001-config-modal';
import type { JTBD, DetailedJTBD } from '@/lib/jtbd/jtbd-service';

export default function JTBDPage() {
  const [selectedJTBD, setSelectedJTBD] = useState<JTBD | null>(null);
  const [executingJTBD, setExecutingJTBD] = useState<JTBD | DetailedJTBD | null>(null);
  const [executionId, setExecutionId] = useState<number | null>(null);
  const [ma001ConfigOpen, setMA001ConfigOpen] = useState(false);
  const [pendingMA001, setPendingMA001] = useState<JTBD | DetailedJTBD | null>(null);

  const handleJTBDSelect = (jtbd: JTBD) => {
    setSelectedJTBD(jtbd);
  };

  const handleJTBDExecute = async (jtbd: JTBD | DetailedJTBD) => {
    console.log('🚀 Starting JTBD execution:', jtbd.id, jtbd.title);

    // Special handling for MA001 - show configuration modal
    if (jtbd.id === 'MA001') {
      setPendingMA001(jtbd);
      setMA001ConfigOpen(true);
      return;
    }

    // For other JTBDs, execute directly
    await executeJTBD(jtbd);
  };

  const executeJTBD = async (jtbd: JTBD | DetailedJTBD, config?: any) => {
    setExecutingJTBD(jtbd);

    try {
      const payload: any = {
        jtbd_id: jtbd.id,
        user_id: '550e8400-e29b-41d4-a716-446655440000', // Demo user UUID
        execution_mode: 'Automated',
        input_data: {
          initiated_from: 'dashboard',
          timestamp: new Date().toISOString(),
          ...config
        }
      };

      // Add agent assignments if provided
      if (config?.stepAgents) {
        payload.agent_assignments = {
          1: config.stepAgents.step1,
          2: config.stepAgents.step2,
          3: config.stepAgents.step3
        };
      }

      const response = await fetch('/api/jtbd/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        setExecutionId(data.data.execution_id);
        console.log(`✅ Execution started with ID: ${data.data.execution_id}`);
      } else {
        console.error('❌ Failed to start execution:', data.error);
        alert(`Failed to start execution: ${data.error}`);
        setExecutingJTBD(null);
      }
    } catch (error) {
      console.error('❌ Execution request failed:', error);
      alert('Failed to start execution. Please try again.');
      setExecutingJTBD(null);
    }
  };

  const handleCloseModal = () => {
    setSelectedJTBD(null);
  };

  const handleCloseExecution = () => {
    setExecutingJTBD(null);
    setExecutionId(null);
  };

  const handleMA001Launch = async (config: any) => {
    setMA001ConfigOpen(false);
    if (pendingMA001) {
      await executeJTBD(pendingMA001, config);
      setPendingMA001(null);
    }
  };

  const handleMA001Close = () => {
    setMA001ConfigOpen(false);
    setPendingMA001(null);
  };

  return (
    <div className="container mx-auto p-6">
      <JTBDExplorer
        onJTBDSelect={handleJTBDSelect}
        onJTBDExecute={handleJTBDExecute}
      />

      {selectedJTBD && (
        <JTBDDetailModal
          jtbdId={selectedJTBD.id}
          isOpen={!!selectedJTBD}
          onClose={handleCloseModal}
          onExecute={handleJTBDExecute}
        />
      )}

      {executingJTBD && executionId && (
        <JTBDExecutionModal
          jtbd={executingJTBD}
          executionId={executionId}
          isOpen={!!executingJTBD}
          onClose={handleCloseExecution}
        />
      )}

      {pendingMA001 && (
        <MA001ConfigModal
          isOpen={ma001ConfigOpen}
          onClose={handleMA001Close}
          onLaunch={handleMA001Launch}
        />
      )}
    </div>
  );
}