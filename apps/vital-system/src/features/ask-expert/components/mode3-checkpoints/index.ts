/**
 * Mode 3 HITL Checkpoint Components
 *
 * These components implement the canonical 4-checkpoint Human-in-the-Loop journey:
 *
 * 1. GoalConfirmationCheckpoint - Review/edit AI-parsed mission goals
 * 2. PlanConfirmationCheckpoint - Review/edit execution plan phases
 * 3. MissionValidationCheckpoint - Final review before launch
 * 4. DeliverableConfirmationCheckpoint - Accept or request revision
 */

export { GoalConfirmationCheckpoint } from './GoalConfirmationCheckpoint';
export { PlanConfirmationCheckpoint } from './PlanConfirmationCheckpoint';
export { MissionValidationCheckpoint } from './MissionValidationCheckpoint';
export { DeliverableConfirmationCheckpoint } from './DeliverableConfirmationCheckpoint';
