/**
 * Global Medical Strategy Page
 *
 * Evidence-based decision making hub for Global Medical Strategy teams.
 * Features:
 * - Strategic evidence synthesis
 * - Competitive intelligence dashboard
 * - KOL network analysis
 * - Publication strategy planning
 * - Cross-functional alignment tools
 * - AI-powered value insights
 */

import { Metadata } from "next";
import MedicalStrategyDashboard from "./medical-strategy-dashboard";

export const metadata: Metadata = {
  title: "Medical Strategy | VITAL",
  description:
    "Evidence-based decision making hub for Global Medical Strategy - synthesize evidence, analyze competitive landscape, and align cross-functional teams.",
};

export default function MedicalStrategyPage() {
  return <MedicalStrategyDashboard />;
}
