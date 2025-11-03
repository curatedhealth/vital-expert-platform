/**
 * Workflow API Service
 * 
 * Client-side service for interacting with workflow APIs
 */

import type { 
  WorkflowDefinition, 
  Workflow,
  WorkflowVersion,
  WorkflowExecution,
} from '../types/workflow';

const API_BASE = '/api/workflows';

export class WorkflowService {
  /**
   * List all workflows for the current user
   */
  async listWorkflows(filters?: {
    framework?: string;
    tags?: string[];
    search?: string;
  }): Promise<Workflow[]> {
    const params = new URLSearchParams();
    if (filters?.framework) params.append('framework', filters.framework);
    if (filters?.tags) params.append('tags', filters.tags.join(','));
    if (filters?.search) params.append('search', filters.search);

    const response = await fetch(`${API_BASE}?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch workflows');
    return response.json();
  }

  /**
   * Get a specific workflow by ID
   */
  async getWorkflow(id: string): Promise<Workflow> {
    const response = await fetch(`${API_BASE}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch workflow');
    return response.json();
  }

  /**
   * Create a new workflow
   */
  async createWorkflow(workflow: WorkflowDefinition): Promise<Workflow> {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workflow }),
    });
    if (!response.ok) throw new Error('Failed to create workflow');
    return response.json();
  }

  /**
   * Update an existing workflow
   */
  async updateWorkflow(id: string, workflow: WorkflowDefinition): Promise<Workflow> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workflow }),
    });
    if (!response.ok) throw new Error('Failed to update workflow');
    return response.json();
  }

  /**
   * Delete a workflow
   */
  async deleteWorkflow(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete workflow');
  }

  /**
   * Get workflow versions
   */
  async getVersions(workflowId: string): Promise<WorkflowVersion[]> {
    const response = await fetch(`${API_BASE}/${workflowId}/versions`);
    if (!response.ok) throw new Error('Failed to fetch versions');
    return response.json();
  }

  /**
   * Create a new version
   */
  async createVersion(
    workflowId: string,
    workflow: WorkflowDefinition,
    commitMessage?: string
  ): Promise<WorkflowVersion> {
    const response = await fetch(`${API_BASE}/${workflowId}/versions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workflow, commitMessage }),
    });
    if (!response.ok) throw new Error('Failed to create version');
    return response.json();
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(
    workflowId: string,
    inputs: Record<string, any>,
    options?: {
      streaming?: boolean;
      debug?: boolean;
      breakpoints?: string[];
    }
  ): Promise<Response> {
    const response = await fetch(`${API_BASE}/${workflowId}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs, ...options }),
    });
    if (!response.ok) throw new Error('Failed to execute workflow');
    return response;
  }

  /**
   * Get execution history
   */
  async getExecutions(workflowId: string): Promise<WorkflowExecution[]> {
    const response = await fetch(`${API_BASE}/${workflowId}/executions`);
    if (!response.ok) throw new Error('Failed to fetch executions');
    return response.json();
  }

  /**
   * Get specific execution
   */
  async getExecution(executionId: string): Promise<WorkflowExecution> {
    const response = await fetch(`${API_BASE}/executions/${executionId}`);
    if (!response.ok) throw new Error('Failed to fetch execution');
    return response.json();
  }
}

export const workflowService = new WorkflowService();

