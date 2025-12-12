'use client';

/**
 * VitalNode - React Flow Node Component
 * 
 * A composable, Card-based node for React Flow canvases. Built on shadcn/ui
 * Card components with support for connection handles and structured layouts.
 * 
 * Features:
 * - Built on shadcn/ui Card components for consistent styling
 * - Automatic handle placement (left for target, right for source)
 * - Composable sub-components (Header, Title, Description, Action, Content, Footer)
 * - Semantic structure for organizing node information
 * - Pre-styled sections with borders and backgrounds
 * - Responsive sizing with fixed small width
 * - Full TypeScript support with proper type definitions
 * - Compatible with React Flow's node system
 * 
 * @see https://reactflow.dev/api-reference/components/handle
 * 
 * @example
 * ```tsx
 * import { 
 *   VitalNode, 
 *   VitalNodeHeader, 
 *   VitalNodeTitle, 
 *   VitalNodeDescription,
 *   VitalNodeContent,
 *   VitalNodeFooter,
 *   VitalNodeAction 
 * } from '@vital/ai-ui';
 * 
 * function CustomNode({ data }) {
 *   return (
 *     <VitalNode handles={{ target: true, source: true }}>
 *       <VitalNodeHeader>
 *         <VitalNodeTitle>{data.label}</VitalNodeTitle>
 *         <VitalNodeDescription>L2 Expert Agent</VitalNodeDescription>
 *         <VitalNodeAction onClick={handleConfig}>
 *           <SettingsIcon />
 *         </VitalNodeAction>
 *       </VitalNodeHeader>
 *       <VitalNodeContent>
 *         {data.content}
 *       </VitalNodeContent>
 *       <VitalNodeFooter>
 *         <span>Status: Active</span>
 *       </VitalNodeFooter>
 *     </VitalNode>
 *   );
 * }
 * ```
 */

import { cn } from '../lib/utils';
import { Handle, Position } from '@xyflow/react';
import type { ComponentProps } from 'react';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@vital/ui';

// ============================================================================
// Types
// ============================================================================

export type HandleConfig = {
  /** Show target handle on the left */
  target: boolean;
  /** Show source handle on the right */
  source: boolean;
};

export type VitalNodeProps = ComponentProps<typeof Card> & {
  /** Configuration for connection handles */
  handles: HandleConfig;
};

export type VitalNodeHeaderProps = ComponentProps<typeof CardHeader>;
export type VitalNodeTitleProps = ComponentProps<typeof CardTitle>;
export type VitalNodeDescriptionProps = ComponentProps<typeof CardDescription>;
export type VitalNodeActionProps = ComponentProps<typeof CardAction>;
export type VitalNodeContentProps = ComponentProps<typeof CardContent>;
export type VitalNodeFooterProps = ComponentProps<typeof CardFooter>;

// ============================================================================
// Main Component
// ============================================================================

/**
 * Card-based node container with React Flow handles
 */
export const VitalNode = ({ 
  handles, 
  className, 
  children,
  ...props 
}: VitalNodeProps) => (
  <Card
    className={cn(
      'node-container relative size-full h-auto w-sm gap-0 rounded-md p-0',
      className
    )}
    {...props}
  >
    {handles.target && <Handle position={Position.Left} type="target" />}
    {handles.source && <Handle position={Position.Right} type="source" />}
    {children}
  </Card>
);

VitalNode.displayName = 'VitalNode';

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Node header section with secondary background
 */
export const VitalNodeHeader = ({ className, ...props }: VitalNodeHeaderProps) => (
  <CardHeader
    className={cn('gap-0.5 rounded-t-md border-b bg-secondary p-3!', className)}
    {...props}
  />
);

VitalNodeHeader.displayName = 'VitalNodeHeader';

/**
 * Node title text
 */
export const VitalNodeTitle = (props: VitalNodeTitleProps) => (
  <CardTitle {...props} />
);

VitalNodeTitle.displayName = 'VitalNodeTitle';

/**
 * Node description text
 */
export const VitalNodeDescription = (props: VitalNodeDescriptionProps) => (
  <CardDescription {...props} />
);

VitalNodeDescription.displayName = 'VitalNodeDescription';

/**
 * Node action button/element
 */
export const VitalNodeAction = (props: VitalNodeActionProps) => (
  <CardAction {...props} />
);

VitalNodeAction.displayName = 'VitalNodeAction';

/**
 * Node content section
 */
export const VitalNodeContent = ({ className, ...props }: VitalNodeContentProps) => (
  <CardContent className={cn('p-3', className)} {...props} />
);

VitalNodeContent.displayName = 'VitalNodeContent';

/**
 * Node footer section with secondary background
 */
export const VitalNodeFooter = ({ className, ...props }: VitalNodeFooterProps) => (
  <CardFooter
    className={cn('rounded-b-md border-t bg-secondary p-3!', className)}
    {...props}
  />
);

VitalNodeFooter.displayName = 'VitalNodeFooter';

// ============================================================================
// Aliases (ai-elements compatibility)
// ============================================================================

/** @alias VitalNode */
export const Node = VitalNode;
export const NodeHeader = VitalNodeHeader;
export const NodeTitle = VitalNodeTitle;
export const NodeDescription = VitalNodeDescription;
export const NodeAction = VitalNodeAction;
export const NodeContent = VitalNodeContent;
export const NodeFooter = VitalNodeFooter;

export default VitalNode;
