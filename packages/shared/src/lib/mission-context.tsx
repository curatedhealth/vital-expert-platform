import React, { createContext, useContext, useMemo, useState } from 'react';

interface MissionContextValue {
  missionId: string | null;
  setMissionId: (missionId: string | null) => void;
  missionData: Record<string, unknown> | null;
  setMissionData: (data: Record<string, unknown> | null) => void;
}

const MissionContext = createContext<MissionContextValue | undefined>(undefined);

interface MissionProviderProps {
  children: React.ReactNode;
  initialMissionId?: string;
  initialMissionData?: Record<string, unknown>;
}

export function MissionProvider({
  children,
  initialMissionId = null,
  initialMissionData = null,
}: MissionProviderProps) {
  const [missionId, setMissionId] = useState<string | null>(initialMissionId);
  const [missionData, setMissionData] = useState<Record<string, unknown> | null>(initialMissionData);

  const value = useMemo(
    () => ({
      missionId,
      setMissionId,
      missionData,
      setMissionData,
    }),
    [missionId, missionData]
  );

  return <MissionContext.Provider value={value}>{children}</MissionContext.Provider>;
}

export function useMission() {
  const context = useContext(MissionContext);
  if (!context) {
    throw new Error('useMission must be used within a MissionProvider');
  }
  return context;
}
